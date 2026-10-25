import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Settings,
  Crown,
  UserX,
  Play,
  Share2,
  Clock,
  X,
} from 'lucide-react';
import { RoomClientState } from '../types';
import { CATEGORIES, CategoryId } from '../game/questions';
import { AdPlacement } from './AdPlacement';

interface LobbyViewProps {
  room: RoomClientState;
  currentUserId: string;
  isHost: boolean;
  onStartGame: (force?: boolean) => void;
  onUpdateSettings: (settings: { category?: CategoryId; timerDuration?: number }) => void;
  onKickPlayer: (playerId: string) => void;
  onLeaveRoom: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  currentUserId,
  isHost,
  onStartGame,
  onUpdateSettings,
  onKickPlayer,
  onLeaveRoom,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?room=${room.code}`
    : `https://whosmostlikely.party?room=${room.code}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Who's Most Likely? Party Game",
          text: `Join our party room with code ${room.code}! Who's most likely to do what? Let's vote!`,
          url: inviteUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const currentCategory = CATEGORIES[room.category as CategoryId] || CATEGORIES.friends;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
      {/* Top Banner: Room Code & Quick Invites */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-indigo-400 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>GAME LOBBY ACTIVE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Room Code:{' '}
            <span className="font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300">
              {room.code}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Send this 4-letter code or invite link to friends in group chats
          </p>
        </div>

        {/* Share actions */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={handleCopyCode}
            className="h-11 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 active:scale-95 transition-all"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="h-11 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={() => setShowQr(true)}
            className="h-11 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 active:scale-95 transition-all"
            aria-label="Show QR Code"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR Code</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Participants & Room Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Participants (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">
                Party Players ({room.players.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {room.players.length >= 2 ? 'Ready to play!' : 'Waiting for friends...'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[160px]">
            {room.players.map((player) => {
              const isMe = player.id === currentUserId;
              return (
                <div
                  key={player.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    isMe
                      ? 'bg-indigo-950/40 border-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0">
                      {player.avatar}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white truncate">{player.name}</span>
                        {isMe && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                            You
                          </span>
                        )}
                        {player.isHost && (
                          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {player.connected ? 'Connected' : 'Reconnecting...'}
                      </p>
                    </div>
                  </div>

                  {/* Kick button (host only, cannot kick self) */}
                  {isHost && !isMe && (
                    <button
                      onClick={() => onKickPlayer(player.id)}
                      title={`Remove ${player.name}`}
                      aria-label={`Remove ${player.name}`}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {room.players.length === 1 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-xs text-amber-300 font-medium">
                Party games are best with 2 or more players! Share the invite link with friends, or you can force-start to test the questions.
              </p>
            </div>
          )}

          {/* Start Button / Waiting indicator */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onLeaveRoom}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Leave Room
            </button>

            {isHost ? (
              <button
                onClick={() => onStartGame(room.players.length < 2)}
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-transform"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Party Round</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Waiting for host to start the game...</span>
              </div>
            )}
          </div>
        </div>

        {/* Room Info & Host Settings (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span>Round Settings</span>
              </h3>
              {isHost && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {showSettings ? 'Done' : 'Edit'}
                </button>
              )}
            </div>

            {/* Category badge */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Selected Category
              </span>
              <p className="text-sm font-bold text-white">{currentCategory.name}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{currentCategory.description}</p>
            </div>

            {/* Timer badge */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Round Timer:</span>
              </div>
              <span className="text-xs font-mono font-bold text-white">
                {room.timerDuration > 0 ? `${room.timerDuration} Seconds` : 'Untimed'}
              </span>
            </div>

            {/* Host settings modification accordion */}
            {isHost && showSettings && (
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Change Category
                  </label>
                  <select
                    value={room.category}
                    onChange={(e) => onUpdateSettings({ category: e.target.value as CategoryId })}
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {Object.values(CATEGORIES).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Change Timer
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[15, 20, 30, 0].map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => onUpdateSettings({ timerDuration: t })}
                        className={`py-1.5 text-xs font-medium rounded-lg border text-center ${
                          room.timerDuration === t
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {t === 0 ? 'None' : `${t}s`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reserved Ad Placement */}
          <AdPlacement id="lobby-ad-slot" format="banner" />
        </div>
      </div>

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center relative shadow-2xl">
            <button
              onClick={() => setShowQr(false)}
              aria-label="Close QR Modal"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-display text-white mb-1">
              Scan with Phone Camera
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Room Code: <span className="font-mono font-bold text-white">{room.code}</span>
            </p>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mb-4">
              {/* Dynamic QR Code via clean SVG generator */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteUrl)}`}
                alt={`QR code to join room ${room.code}`}
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-[11px] text-slate-400 break-all">{inviteUrl}</p>

            <button
              onClick={handleCopyLink}
              className="w-full mt-4 h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Direct Invite Link</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
