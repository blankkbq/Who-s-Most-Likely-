import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, RotateCcw, ArrowRight, Share2, Copy, Check, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CategoryId, CATEGORIES, Question } from '../game/questions';
import { selectQuestions, generateCommentary } from '../game/rules';
import { sounds } from '../services/sound';
import { GAME_IMAGES } from '../assets/images';
import { AdPlacement } from './AdPlacement';

interface QuickPlayViewProps {
  onBackToHome: () => void;
}

const DEFAULT_ARCHETYPES = [
  { id: 'a1', name: 'You (The Player)', avatar: '😎' },
  { id: 'a2', name: 'The Wild Card', avatar: '🔥' },
  { id: 'a3', name: 'The Group Mom', avatar: '🥑' },
  { id: 'a4', name: 'The Overthinker', avatar: '🦄' },
  { id: 'a5', name: 'The Night Owl', avatar: '🎧' },
];

export const QuickPlayView: React.FC<QuickPlayViewProps> = ({ onBackToHome }) => {
  const [category, setCategory] = useState<CategoryId>('friends');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [players, setPlayers] = useState(DEFAULT_ARCHETYPES);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    const qList = selectQuestions(category, 5);
    setQuestions(qList);
    setCurrentIndex(0);
    setSelectedVote(null);
    setShowResult(false);
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'quick_play_started' }),
    }).catch(() => {});
  }, [category]);

  const currentQ = questions[currentIndex];

  const handleVote = (targetId: string) => {
    setSelectedVote(targetId);
    sounds.playVote();

    // Simulated votes from archetypes to create an authentic voting outcome
    const votes: Record<string, string> = {
      a1: targetId,
    };

    players.forEach((p) => {
      if (p.id !== 'a1') {
        // Bias slightly towards target or random
        const pickTarget = Math.random() < 0.6 ? targetId : players[Math.floor(Math.random() * players.length)].id;
        votes[p.id] = pickTarget;
      }
    });

    // Update scores
    const updated = { ...scores };
    Object.values(votes).forEach((v) => {
      updated[v] = (updated[v] || 0) + 1;
    });
    setScores(updated);

    setShowResult(true);
    sounds.playFanfare();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Safe
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedVote(null);
      setShowResult(false);
    } else {
      // Restart deck
      const qList = selectQuestions(category, 5);
      setQuestions(qList);
      setCurrentIndex(0);
      setSelectedVote(null);
      setShowResult(false);
    }
  };

  const winner = selectedVote ? players.find((p) => p.id === selectedVote) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Category selector strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Quick Play Solo
          </span>
          <span className="text-xs text-slate-400">· Question {currentIndex + 1} of {questions.length}</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['friends', 'party', 'couples', 'work', 'random'] as CategoryId[]).map((catId) => (
            <button
              key={catId}
              onClick={() => setCategory(catId)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                category === catId
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              {CATEGORIES[catId].name}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="p-7 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-center relative overflow-hidden">
        <p className="text-xs uppercase tracking-wider font-semibold text-indigo-400 mb-2">
          Who's Most Likely To...
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white max-w-xl mx-auto leading-snug">
          {currentQ ? currentQ.text.replace(/^Who's most likely to /i, '') : 'Loading...'}
        </h1>
      </div>

      {/* Interactive Options / Result State */}
      {!showResult ? (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            Cast your vote for who fits this best:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((p) => (
              <button
                key={p.id}
                onClick={() => handleVote(p.id)}
                className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/60 flex items-center justify-between gap-3 text-left transition-all active:scale-98 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                    {p.avatar}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400">Total votes: {scores[p.id] || 0}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  Vote →
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-7 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950/40 border border-amber-400/30 text-center flex flex-col items-center gap-4 animate-in fade-in">
          <img
            src={GAME_IMAGES.trophyBadge}
            alt="Trophy Badge"
            className="w-16 h-16 drop-shadow-md"
            referrerPolicy="no-referrer"
          />

          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Selected by You & Friends
            </span>
            <h3 className="text-2xl font-black font-display text-white">
              {winner?.avatar} {winner?.name}
            </h3>
            <p className="text-xs text-slate-300 max-w-md">
              "An undeniable match! Even in an alternate timeline, {winner?.name} would be guilty."
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleNext}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-2 active:scale-95"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Play Again'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBackToHome}
              className="h-11 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700 active:scale-95"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* Reserved Ad Placement */}
      <AdPlacement id="quickplay-ad-slot" format="banner" />
    </div>
  );
};
