import React, { useState, useEffect } from 'react';
import { Clock, Check, Sparkles, AlertCircle } from 'lucide-react';
import { RoomClientState } from '../types';
import { CATEGORIES, CategoryId } from '../game/questions';
import { sounds } from '../services/sound';

interface VotingViewProps {
  room: RoomClientState;
  currentUserId: string;
  onSubmitVote: (targetPlayerId: string) => void;
}

export const VotingView: React.FC<VotingViewProps> = ({
  room,
  currentUserId,
  onSubmitVote,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const currentCategory = CATEGORIES[room.category as CategoryId] || CATEGORIES.friends;
  const hasVoted = Boolean(selectedTargetId);

  // Synchronized countdown timer based on server roundEndTime
  useEffect(() => {
    if (!room.roundEndTime) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const remainingMs = room.roundEndTime! - Date.now();
      const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
      setTimeLeft(seconds);

      // Audio tick during last 5 seconds
      if (seconds <= 5 && seconds > 0) {
        sounds.playTick();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [room.roundEndTime]);

  const handleVote = (targetPlayerId: string) => {
    setSelectedTargetId(targetPlayerId);
    sounds.playVote();
    onSubmitVote(targetPlayerId);
  };

  const question = room.currentQuestion;
  const questionNumber = room.currentQuestionIndex + 1;
  const totalQuestions = room.totalQuestions || 10;
  const votedCount = room.votedPlayerIds.length;
  const totalPlayers = room.players.filter((p) => p.connected).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
      {/* Question Header & Timer Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 font-mono">
              ROUND {questionNumber} / {totalQuestions}
            </span>
            <span className="hidden sm:inline-block">·</span>
            <span className="hidden sm:inline-block text-slate-300">{currentCategory.name}</span>
          </div>

          {timeLeft !== null && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-colors ${
                timeLeft <= 5
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-slate-900 text-slate-300 border border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Big Question Card */}
        <div className="p-7 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-2xl text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WHO IS MOST LIKELY TO...</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight leading-snug max-w-2xl mx-auto text-balance">
            {question ? question.text.replace(/^Who's most likely to /i, '') : 'Loading question...'}
          </h1>

          {/* Voted progress indicator */}
          <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {votedCount} of {totalPlayers} players voted
            </span>
          </div>
        </div>
      </div>

      {/* Player Vote Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-300">
            {hasVoted ? 'Your Vote is Locked In! (Tap to change)' : 'Tap a player to cast your vote:'}
          </h2>
          {hasVoted && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Vote recorded
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {room.players.map((player) => {
            const isSelected = selectedTargetId === player.id;
            const hasCastVote = room.votedPlayerIds.includes(player.id);
            const isMe = player.id === currentUserId;

            return (
              <button
                type="button"
                key={player.id}
                onClick={() => handleVote(player.id)}
                className={`relative p-5 rounded-2xl border text-center flex flex-col items-center justify-between gap-3 min-h-[140px] transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-900/60 to-pink-950/60 border-indigo-400 ring-2 ring-indigo-400 shadow-xl shadow-indigo-500/20'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                }`}
                aria-label={`Vote for ${player.name}`}
              >
                {/* Checkmark badge if selected */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Status indicator: if this player has already cast their vote */}
                {hasCastVote && !isSelected && (
                  <div className="absolute top-2.5 right-2.5 text-[10px] text-emerald-400 font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Voted
                  </div>
                )}

                <span className="text-4xl w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center shadow-inner">
                  {player.avatar}
                </span>

                <div className="w-full">
                  <p className="text-sm font-bold text-white truncate">
                    {player.name}
                  </p>
                  {isMe && (
                    <span className="text-[10px] text-indigo-300 font-semibold">
                      (You)
                    </span>
                  )}
                </div>

                <div className="w-full pt-1">
                  <span
                    className={`block w-full py-1 text-xs font-semibold rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800/60 text-slate-300 group-hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Vote'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
