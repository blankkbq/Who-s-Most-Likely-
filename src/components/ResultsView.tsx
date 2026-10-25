import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Share2,
  Copy,
  Check,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { RoomClientState } from '../types';
import { GAME_IMAGES } from '../assets/images';
import { AdPlacement } from './AdPlacement';
import { sounds } from '../services/sound';

interface ResultsViewProps {
  room: RoomClientState;
  currentUserId: string;
  isHost: boolean;
  onNextQuestion: () => void;
  onPlayAgain: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  room,
  currentUserId,
  isHost,
  onNextQuestion,
  onPlayAgain,
}) => {
  const [showVoterDetails, setShowVoterDetails] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const tally = room.lastTally;
  const question = room.currentQuestion;
  const isLastQuestion = room.currentQuestionIndex + 1 >= (room.totalQuestions || 10);

  // Trigger celebration confetti and audio on mount
  useEffect(() => {
    sounds.playFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#ec4899', '#f59e0b', '#10b981'],
      });
    } catch {
      // Safe catch
    }
  }, []);

  // Determine winning players
  const winningPlayers = (tally?.winners || [])
    .map((id) => room.players.find((p) => p.id === id))
    .filter(Boolean);

  const primaryWinner = winningPlayers[0];
  const winnerPercentage = primaryWinner && tally ? tally.percentages[primaryWinner.id] || 0 : 0;

  // Generate shareable message
  const shareText = primaryWinner
    ? `🏆 "${question?.text}"\n\nThe verdict is in: ${primaryWinner.avatar} ${primaryWinner.name} was voted most likely with ${winnerPercentage}% of the votes!\n\nPlay with friends at https://whosmostlikely.party`
    : `Check out our party game results on Who's Most Likely!`;

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'share_triggered' }),
      }).catch(() => {});
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Who's Most Likely? - Round Results",
          text: shareText,
        });
        fetch('/api/analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'share_triggered' }),
        }).catch(() => {});
      } catch {
        handleCopyShare();
      }
    } else {
      handleCopyShare();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
      {/* Question Refresher Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ROUND {room.currentQuestionIndex + 1} VERDICT</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
          "{question ? question.text : 'Who is most likely...'}"
        </h1>
      </div>

      {/* Main Winner Result Card (Social-Ready Layout) */}
      <div className="relative rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/40 p-7 sm:p-10 shadow-2xl overflow-hidden text-center flex flex-col items-center gap-6">
        {/* Glow backdrop */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />

        {/* Winner Badge and Avatar */}
        <div className="relative">
          <img
            src={GAME_IMAGES.trophyBadge}
            alt="Trophy Crown Badge"
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto drop-shadow-xl"
            referrerPolicy="no-referrer"
          />
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-800/90 border-2 border-amber-400 flex items-center justify-center text-5xl sm:text-6xl mx-auto mt-2 shadow-2xl">
            {primaryWinner ? primaryWinner.avatar : '👑'}
          </div>
        </div>

        {/* Winner Name & Percentage */}
        <div className="space-y-2 max-w-lg">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            {tally?.isUnanimous ? '⭐ Unanimous Verdict' : tally?.isTie ? '🤝 Dead Heat Tie' : '👑 Most Likely Winner'}
          </div>

          <h2 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
            {winningPlayers.map((p) => p?.name).join(' & ') || 'No Votes Cast'}
          </h2>

          <p className="text-sm sm:text-base text-indigo-200 font-medium">
            {room.commentary || 'The room has rendered its verdict!'}
          </p>
        </div>

        {/* Share Result Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleNativeShare}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-pink-600/30 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Result to Story / Chat</span>
          </button>

          <button
            onClick={handleCopyShare}
            className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 border border-slate-700 active:scale-95 transition-all"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedShare ? 'Copied to Clipboard!' : 'Copy Result Card'}</span>
          </button>
        </div>
      </div>

      {/* Vote Breakdown & Transparency */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Full Vote Breakdown</h3>
          <button
            onClick={() => setShowVoterDetails(!showVoterDetails)}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium"
          >
            {showVoterDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showVoterDetails ? 'Hide Who Voted' : 'Reveal Who Voted for Whom'}</span>
          </button>
        </div>

        {/* Progress bar list of votes for each player */}
        <div className="space-y-3">
          {room.players.map((player) => {
            const votesForPlayer = tally?.voteCounts[player.id] || 0;
            const percentage = tally?.percentages[player.id] || 0;
            const isWinner = tally?.winners.includes(player.id);

            // Find voters who voted for this player
            const voters = Object.entries(room.votes)
              .filter(([_, targetId]) => targetId === player.id)
              .map(([voterId]) => room.players.find((p) => p.id === voterId)?.name)
              .filter(Boolean);

            return (
              <div key={player.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{player.avatar}</span>
                    <span className={`font-bold ${isWinner ? 'text-amber-400' : 'text-slate-200'}`}>
                      {player.name}
                    </span>
                    {isWinner && <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                  </div>
                  <span className="font-mono text-slate-400">
                    {votesForPlayer} {votesForPlayer === 1 ? 'vote' : 'votes'} ({percentage}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isWinner
                        ? 'bg-gradient-to-r from-amber-400 to-pink-500'
                        : 'bg-indigo-600/70'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Voter details (revealed on toggle) */}
                {showVoterDetails && voters.length > 0 && (
                  <p className="text-[11px] text-slate-400 pl-6 animate-in fade-in">
                    Voted by: <span className="text-slate-300 font-medium">{voters.join(', ')}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            {isLastQuestion ? 'End of game deck reached' : `Next: Question ${room.currentQuestionIndex + 2} of ${room.totalQuestions}`}
          </p>

          {isHost ? (
            isLastQuestion ? (
              <button
                onClick={onPlayAgain}
                className="w-full sm:w-auto h-12 px-7 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Another Game Deck</span>
              </button>
            ) : (
              <button
                onClick={onNextQuestion}
                className="w-full sm:w-auto h-12 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          ) : (
            <div className="text-xs text-indigo-400 font-medium flex items-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Waiting for host to load next question...</span>
            </div>
          )}
        </div>
      </div>

      {/* Reserved Ad Placement */}
      <AdPlacement id="results-ad-slot" format="leaderboard" />
    </div>
  );
};
