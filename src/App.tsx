/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingView } from './components/LandingView';
import { LobbyView } from './components/LobbyView';
import { VotingView } from './components/VotingView';
import { ResultsView } from './components/ResultsView';
import { QuickPlayView } from './components/QuickPlayView';
import { CreateRoomModal } from './components/CreateRoomModal';
import { JoinRoomModal } from './components/JoinRoomModal';
import { CategoriesModal } from './components/CategoriesModal';
import { LegalModal, LegalTab } from './components/LegalModal';
import { RoomClientState, ViewScreen } from './types';
import { CategoryId } from './game/questions';
import { sounds } from './services/sound';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewScreen>('landing');
  const [roomState, setRoomState] = useState<RoomClientState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [initialJoinCode, setInitialJoinCode] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [legalModalState, setLegalModalState] = useState<{ isOpen: boolean; tab: LegalTab }>({
    isOpen: false,
    tab: 'rules',
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Handle URL query parameters (?room=CODE or ?autostart=1)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const autoParam = params.get('autostart');

    if (autoParam === '1') {
      setCurrentView('quickplay');
    } else if (roomParam) {
      setInitialJoinCode(roomParam.toUpperCase());
      setIsJoinOpen(true);
    }
  }, []);

  // Setup WebSocket connection
  const connectWs = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Do not open a new socket if already open or connecting
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to party game WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'JOINED_SUCCESS':
            setPlayerId(data.playerId);
            setIsHost(data.isHost);
            break;

          case 'ROOM_UPDATE':
          case 'PLAYER_JOINED':
          case 'SETTINGS_UPDATED':
          case 'VOTE_RECORDED':
            if (data.room) {
              setRoomState(data.room);
              if (data.room.status === 'lobby') setCurrentView('lobby');
              else if (data.room.status === 'voting') setCurrentView('voting');
              else if (data.room.status === 'results' || data.room.status === 'ended') setCurrentView('results');
            }
            break;

          case 'GAME_STARTED':
          case 'NEXT_ROUND':
            if (data.room) {
              setRoomState(data.room);
              setCurrentView('voting');
              sounds.playStart();
            }
            break;

          case 'ROUND_RESULTS':
            if (data.room) {
              setRoomState(data.room);
              setCurrentView('results');
            }
            break;

          case 'PLAY_AGAIN':
            if (data.room) {
              setRoomState(data.room);
              setCurrentView('lobby');
            }
            break;

          case 'KICKED':
            showToast(data.message || 'You were removed from the room.');
            setRoomState(null);
            setCurrentView('landing');
            break;

          case 'NOTICE':
            showToast(data.message);
            break;

          case 'ERROR':
            showToast(data.message || 'An error occurred.');
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected.');
      // Attempt reconnect if socket closed unexpectedly
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWs();
      }, 2000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }, [showToast]);

  useEffect(() => {
    connectWs();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connectWs]);

  // Send message helper
  const sendWs = (payload: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      // Re-open and try
      connectWs();
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(payload));
        }
      }, 500);
    }
  };

  // Actions
  const handleCreateRoom = async (config: {
    name: string;
    avatar: string;
    category: CategoryId;
    timerDuration: number;
  }) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: config.category, timerDuration: config.timerDuration }),
      });
      const data = await res.json();
      const code = data.code;

      sendWs({
        type: 'JOIN_ROOM',
        roomCode: code,
        playerName: config.name,
        avatar: config.avatar,
        isHost: true,
      });

      setIsCreateOpen(false);
      setCurrentView('lobby');
    } catch {
      showToast('Could not create room. Please try again.');
    }
  };

  const handleJoinRoom = (config: { code: string; name: string; avatar: string }) => {
    sendWs({
      type: 'JOIN_ROOM',
      roomCode: config.code,
      playerName: config.name,
      avatar: config.avatar,
      isHost: false,
    });
    setIsJoinOpen(false);
  };

  const handleStartGame = (force?: boolean) => {
    sendWs({
      type: 'START_GAME',
      forceStart: force,
    });
  };

  const handleUpdateSettings = (settings: { category?: CategoryId; timerDuration?: number }) => {
    sendWs({
      type: 'UPDATE_SETTINGS',
      ...settings,
    });
  };

  const handleSubmitVote = (targetPlayerId: string) => {
    sendWs({
      type: 'SUBMIT_VOTE',
      targetPlayerId,
    });
  };

  const handleNextQuestion = () => {
    sendWs({
      type: 'NEXT_QUESTION',
    });
  };

  const handlePlayAgain = () => {
    sendWs({
      type: 'PLAY_AGAIN',
    });
  };

  const handleKickPlayer = (targetPlayerId: string) => {
    sendWs({
      type: 'KICK_PLAYER',
      targetPlayerId,
    });
  };

  const handleLeaveRoom = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setRoomState(null);
    setCurrentView('landing');
    // Clear URL param if present
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/50 text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        onNavigate={(view) => {
          if (view === 'landing') setCurrentView('landing');
          else if (view === 'quickplay') setCurrentView('quickplay');
          else if (view === 'categories') setIsCategoriesOpen(true);
          else if (view === 'rules') setLegalModalState({ isOpen: true, tab: 'rules' });
        }}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenJoin={() => setIsJoinOpen(true)}
        currentRoomCode={roomState?.code}
        onLeaveRoom={roomState?.code ? handleLeaveRoom : undefined}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {currentView === 'landing' && (
          <LandingView
            onHostGame={() => setIsCreateOpen(true)}
            onJoinGame={() => setIsJoinOpen(true)}
            onQuickPlay={() => setCurrentView('quickplay')}
            onSelectCategory={() => setIsCategoriesOpen(true)}
            onViewRules={() => setLegalModalState({ isOpen: true, tab: 'rules' })}
          />
        )}

        {currentView === 'quickplay' && (
          <QuickPlayView onBackToHome={() => setCurrentView('landing')} />
        )}

        {currentView === 'lobby' && roomState && (
          <LobbyView
            room={roomState}
            currentUserId={playerId}
            isHost={isHost}
            onStartGame={handleStartGame}
            onUpdateSettings={handleUpdateSettings}
            onKickPlayer={handleKickPlayer}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {currentView === 'voting' && roomState && (
          <VotingView
            room={roomState}
            currentUserId={playerId}
            onSubmitVote={handleSubmitVote}
          />
        )}

        {currentView === 'results' && roomState && (
          <ResultsView
            room={roomState}
            currentUserId={playerId}
            isHost={isHost}
            onNextQuestion={handleNextQuestion}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          if (tab === 'categories') {
            setIsCategoriesOpen(true);
          } else {
            setLegalModalState({ isOpen: true, tab });
          }
        }}
      />

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateRoom}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        initialCode={initialJoinCode}
        onClose={() => setIsJoinOpen(false)}
        onJoin={handleJoinRoom}
      />

      <CategoriesModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        onSelectCategory={(cat) => {
          if (roomState && isHost) {
            handleUpdateSettings({ category: cat });
          }
        }}
      />

      <LegalModal
        isOpen={legalModalState.isOpen}
        initialTab={legalModalState.tab}
        onClose={() => setLegalModalState({ isOpen: false, tab: 'rules' })}
      />
    </div>
  );
}
