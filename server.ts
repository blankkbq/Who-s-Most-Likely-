import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  generateRoomCode,
  sanitizeNickname,
  tallyVotes,
  generateCommentary,
  selectQuestions,
  Player,
  VoteTally,
} from './src/game/rules';
import { CategoryId, Question } from './src/game/questions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Anonymous aggregated analytics
interface AnalyticsCounters {
  roomsCreated: number;
  gamesStarted: number;
  roundsCompleted: number;
  votesSubmitted: number;
  sharesTriggered: number;
  quickPlayStarted: number;
}

const analytics: AnalyticsCounters = {
  roomsCreated: 0,
  gamesStarted: 0,
  roundsCompleted: 0,
  votesSubmitted: 0,
  sharesTriggered: 0,
  quickPlayStarted: 0,
};

export interface RoomState {
  code: string;
  hostId: string;
  category: CategoryId | 'random';
  timerDuration: number; // in seconds (0 = untimed)
  status: 'lobby' | 'voting' | 'results' | 'ended';
  players: Player[];
  currentQuestionIndex: number;
  questions: Question[];
  votes: Record<string, string>; // voterId -> targetPlayerId
  roundEndTime: number | null;
  lastTally: VoteTally | null;
  commentary: string | null;
  roundTimerHandle?: NodeJS.Timeout;
  createdAt: number;
  lastActivity: number;
}

const rooms = new Map<string, RoomState>();
const clientSockets = new Map<WebSocket, { roomCode: string; playerId: string }>();

// Helper: Broadcast state to all connected clients in a room
function broadcastRoom(room: RoomState, type: string = 'ROOM_UPDATE', extra: Record<string, unknown> = {}) {
  const payload = JSON.stringify({
    type,
    room: {
      code: room.code,
      hostId: room.hostId,
      category: room.category,
      timerDuration: room.timerDuration,
      status: room.status,
      players: room.players,
      currentQuestionIndex: room.currentQuestionIndex,
      currentQuestion: room.questions[room.currentQuestionIndex] || null,
      totalQuestions: room.questions.length,
      // In voting state, we only send who has voted (boolean), not who they voted for!
      votedPlayerIds: Object.keys(room.votes),
      // In results state, we send full votes and tally
      votes: room.status === 'results' || room.status === 'ended' ? room.votes : {},
      lastTally: room.lastTally,
      commentary: room.commentary,
      roundEndTime: room.roundEndTime,
    },
    ...extra,
  });

  for (const [ws, meta] of clientSockets.entries()) {
    if (meta.roomCode === room.code && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

// Complete round and calculate tally
function concludeRound(room: RoomState) {
  if (room.roundTimerHandle) {
    clearTimeout(room.roundTimerHandle);
    room.roundTimerHandle = undefined;
  }

  const tally = tallyVotes(room.players, room.votes);
  const commentary = generateCommentary(tally, room.players);

  // Award points to the players who received votes
  for (const [playerId, count] of Object.entries(tally.voteCounts)) {
    const p = room.players.find((pl) => pl.id === playerId);
    if (p) {
      p.score += count;
    }
  }

  room.status = 'results';
  room.lastTally = tally;
  room.commentary = commentary;
  room.roundEndTime = null;
  room.lastActivity = Date.now();

  analytics.roundsCompleted++;

  broadcastRoom(room, 'ROUND_RESULTS');
}

// Setup WebSocket message handlers
wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      const type = data.type;

      switch (type) {
        case 'JOIN_ROOM': {
          const roomCode = String(data.roomCode || '').toUpperCase().trim();
          const playerName = sanitizeNickname(String(data.playerName || 'Player'));
          const avatar = String(data.avatar || '😎');
          const isHost = Boolean(data.isHost);
          let playerId = data.playerId ? String(data.playerId) : undefined;

          let room = rooms.get(roomCode);
          if (!room) {
            if (isHost) {
              // Create room if host
              const questions = selectQuestions('friends', 10);
              room = {
                code: roomCode,
                hostId: '',
                category: 'friends',
                timerDuration: 20,
                status: 'lobby',
                players: [],
                currentQuestionIndex: 0,
                questions,
                votes: {},
                roundEndTime: null,
                lastTally: null,
                commentary: null,
                createdAt: Date.now(),
                lastActivity: Date.now(),
              };
              rooms.set(roomCode, room);
              analytics.roomsCreated++;
            } else {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found. Check code.' }));
              return;
            }
          }

          if (room.players.length >= 16) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full (max 16 players).' }));
            return;
          }

          // Generate or preserve player ID
          if (!playerId) {
            playerId = `p_${Math.random().toString(36).substring(2, 9)}`;
          }

          let player = room.players.find((p) => p.id === playerId);
          if (player) {
            player.name = playerName;
            player.avatar = avatar;
            player.connected = true;
          } else {
            // Check if name is taken by another connected player
            const nameTaken = room.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase() && p.connected);
            const finalName = nameTaken ? `${playerName} ${room.players.length + 1}` : playerName;

            player = {
              id: playerId,
              name: finalName,
              avatar,
              isHost: room.players.length === 0 || isHost,
              score: 0,
              connected: true,
            };
            room.players.push(player);
          }

          if (player.isHost || !room.hostId) {
            room.hostId = player.id;
          }

          room.lastActivity = Date.now();
          clientSockets.set(ws, { roomCode: room.code, playerId: player.id });

          ws.send(JSON.stringify({
            type: 'JOINED_SUCCESS',
            playerId: player.id,
            isHost: player.isHost,
            roomCode: room.code,
          }));

          broadcastRoom(room, 'PLAYER_JOINED', { joinedPlayer: player });
          break;
        }

        case 'UPDATE_SETTINGS': {
          const meta = clientSockets.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.roomCode);
          if (!room || room.hostId !== meta.playerId) return;

          if (data.category) {
            room.category = data.category;
            room.questions = selectQuestions(data.category, 10);
            room.currentQuestionIndex = 0;
          }
          if (typeof data.timerDuration === 'number') {
            room.timerDuration = Math.max(0, Math.min(60, data.timerDuration));
          }

          room.lastActivity = Date.now();
          broadcastRoom(room, 'SETTINGS_UPDATED');
          break;
        }

        case 'START_GAME': {
          const meta = clientSockets.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.roomCode);
          if (!room || room.hostId !== meta.playerId) return;

          if (room.players.length < 2 && !data.forceStart) {
            ws.send(JSON.stringify({
              type: 'NOTICE',
              message: 'Multiplayer is best with 2+ players! You can invite friends or Quick-Play.',
            }));
          }

          // Reset votes and state
          room.votes = {};
          room.currentQuestionIndex = 0;
          room.questions = selectQuestions(room.category, 10);
          room.status = 'voting';
          room.lastTally = null;
          room.commentary = null;

          if (room.timerDuration > 0) {
            room.roundEndTime = Date.now() + room.timerDuration * 1000;
            room.roundTimerHandle = setTimeout(() => {
              concludeRound(room);
            }, room.timerDuration * 1000);
          } else {
            room.roundEndTime = null;
          }

          room.lastActivity = Date.now();
          analytics.gamesStarted++;
          broadcastRoom(room, 'GAME_STARTED');
          break;
        }

        case 'SUBMIT_VOTE': {
          const meta = clientSockets.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.roomCode);
          if (!room || room.status !== 'voting') return;

          const targetPlayerId = String(data.targetPlayerId || '');
          const voterId = meta.playerId;

          // Verify target is valid player in room
          const targetValid = room.players.some((p) => p.id === targetPlayerId);
          if (!targetValid) return;

          room.votes[voterId] = targetPlayerId;
          analytics.votesSubmitted++;
          room.lastActivity = Date.now();

          // Check if all connected players have voted
          const connectedPlayers = room.players.filter((p) => p.connected);
          const allVoted = connectedPlayers.length > 0 && connectedPlayers.every((p) => room.votes[p.id]);

          if (allVoted) {
            concludeRound(room);
          } else {
            broadcastRoom(room, 'VOTE_RECORDED');
          }
          break;
        }

        case 'NEXT_QUESTION': {
          const meta = clientSockets.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.roomCode);
          if (!room || room.hostId !== meta.playerId) return;

          if (room.roundTimerHandle) {
            clearTimeout(room.roundTimerHandle);
            room.roundTimerHandle = undefined;
          }

          if (room.currentQuestionIndex + 1 >= room.questions.length) {
            room.status = 'ended';
            room.lastActivity = Date.now();
            broadcastRoom(room, 'GAME_ENDED');
          } else {
            room.currentQuestionIndex++;
            room.votes = {};
            room.status = 'voting';
            room.lastTally = null;
            room.commentary = null;

            if (room.timerDuration > 0) {
              room.roundEndTime = Date.now() + room.timerDuration * 1000;
              room.roundTimerHandle = setTimeout(() => {
                concludeRound(room);
              }, room.timerDuration * 1000);
            } else {
              room.roundEndTime = null;
            }

            room.lastActivity = Date.now();
            broadcastRoom(room, 'NEXT_ROUND');
          }
          break;
        }

        case 'PLAY_AGAIN': {
          const meta = clientSockets.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.roomCode);
          if (!room || room.hostId !== meta.playerId) return;

          // Reset player scores and start new question set
          room.players.forEach((p) => (p.score = 0));
          room.currentQuestionIndex = 0;
          room.votes = {};
          room.status = 'lobby';
          room.lastTally = null;
          room.commentary = null;
          room.questions = selectQuestions(room.category, 10);
          room.lastActivity = Date.now();

          broadcastRoom(room, 'PLAY_AGAIN');
          break;
        }

        case 'KICK_PLAYER': {
          const meta = clientSockets.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.roomCode);
          if (!room || room.hostId !== meta.playerId) return;

          const targetPlayerId = String(data.targetPlayerId);
          if (targetPlayerId === room.hostId) return; // Cannot kick host

          room.players = room.players.filter((p) => p.id !== targetPlayerId);
          delete room.votes[targetPlayerId];

          // Notify kicked player if connected
          for (const [clientWs, clientMeta] of clientSockets.entries()) {
            if (clientMeta.roomCode === room.code && clientMeta.playerId === targetPlayerId) {
              clientWs.send(JSON.stringify({ type: 'KICKED', message: 'You have been removed by the host.' }));
              clientSockets.delete(clientWs);
            }
          }

          room.lastActivity = Date.now();
          broadcastRoom(room, 'PLAYER_KICKED');
          break;
        }

        case 'PING': {
          ws.send(JSON.stringify({ type: 'PONG' }));
          break;
        }
      }
    } catch (err) {
      console.error('WS parse error:', err);
    }
  });

  ws.on('close', () => {
    const meta = clientSockets.get(ws);
    if (!meta) return;

    clientSockets.delete(ws);
    const room = rooms.get(meta.roomCode);
    if (!room) return;

    const player = room.players.find((p) => p.id === meta.playerId);
    if (player) {
      player.connected = false;

      // If the host disconnected and others remain, designate new host
      if (player.isHost) {
        player.isHost = false;
        const nextConnected = room.players.find((p) => p.connected);
        if (nextConnected) {
          nextConnected.isHost = true;
          room.hostId = nextConnected.id;
        }
      }

      room.lastActivity = Date.now();
      broadcastRoom(room, 'PLAYER_DISCONNECTED', { disconnectedPlayerId: meta.playerId });
    }
  });
});

// Periodic cleanup of inactive rooms (> 2 hours)
setInterval(() => {
  const now = Date.now();
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastActivity > TWO_HOURS) {
      if (room.roundTimerHandle) clearTimeout(room.roundTimerHandle);
      rooms.delete(code);
    }
  }
}, 10 * 60 * 1000);

// REST Endpoints
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    activeRooms: rooms.size,
    connectedSockets: clientSockets.size,
    timestamp: Date.now(),
  });
});

// Check room existence
app.get('/api/rooms/:code', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    res.status(404).json({ exists: false, error: 'Room not found' });
    return;
  }
  res.json({
    exists: true,
    code: room.code,
    status: room.status,
    playerCount: room.players.length,
    category: room.category,
  });
});

// Create room via HTTP if needed
app.post('/api/rooms', (req: Request, res: Response) => {
  let code = generateRoomCode();
  while (rooms.has(code)) {
    code = generateRoomCode();
  }

  const category = (req.body.category as CategoryId) || 'friends';
  const timerDuration = typeof req.body.timerDuration === 'number' ? req.body.timerDuration : 20;

  const room: RoomState = {
    code,
    hostId: '',
    category,
    timerDuration,
    status: 'lobby',
    players: [],
    currentQuestionIndex: 0,
    questions: selectQuestions(category, 10),
    votes: {},
    roundEndTime: null,
    lastTally: null,
    commentary: null,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };

  rooms.set(code, room);
  analytics.roomsCreated++;

  res.json({ code, category, timerDuration });
});

// Anonymous Analytics
app.get('/api/analytics', (_req: Request, res: Response) => {
  res.json(analytics);
});

app.post('/api/analytics/event', (req: Request, res: Response) => {
  const { event } = req.body;
  if (event === 'share_triggered') analytics.sharesTriggered++;
  if (event === 'quick_play_started') analytics.quickPlayStarted++;
  res.json({ success: true });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
