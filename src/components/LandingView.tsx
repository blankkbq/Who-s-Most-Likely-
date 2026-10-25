import React from 'react';
import {
  Users,
  Play,
  Share2,
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
  Award,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { CATEGORIES, CategoryId } from '../game/questions';
import { GAME_IMAGES } from '../assets/images';
import { AdPlacement } from './AdPlacement';

interface LandingViewProps {
  onHostGame: () => void;
  onJoinGame: () => void;
  onQuickPlay: () => void;
  onSelectCategory: (category: CategoryId) => void;
  onViewRules: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onHostGame,
  onJoinGame,
  onQuickPlay,
  onSelectCategory,
  onViewRules,
}) => {
  return (
    <div className="flex flex-col gap-16 sm:gap-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 sm:pt-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline, CTAs, Trust */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Real-Time Social Party Game</span>
              <span aria-hidden="true">·</span>
              <span>100% Free · No App Download</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white text-balance leading-[1.1]">
              The Party Game Where <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Secrets & Laughter</span> Come Out.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Find out who your friends <em className="italic font-medium text-white">really</em> think would survive the apocalypse, text their ex at 3 AM, or accidentally become a viral meme.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-2">
              <button
                onClick={onHostGame}
                className="h-13 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <Sparkles className="w-5 h-5" />
                <span>Play Now — Host Room</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={onJoinGame}
                className="h-13 px-6 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Join with Code</span>
              </button>

              <button
                onClick={onQuickPlay}
                className="h-13 px-5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Quick Play Solo</span>
              </button>
            </div>

            {/* Quick Benefits metadata */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400 pt-3">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                No login or password needed
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>130+ original questions</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Shareable result cards</span>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
              <img
                src={GAME_IMAGES.hero}
                alt="Friends laughing playing Who's Most Likely on smartphones"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Floating Live Sample Question Preview */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg">
                <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-pink-500" />
                    LIVE ROUND SAMPLE
                  </span>
                  <span className="text-slate-400">Round 4 of 10</span>
                </div>
                <p className="text-sm font-bold text-white leading-snug">
                  "Who's most likely to text 'I'm outside' when they haven't even left their bed yet?"
                </p>
                <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <span className="inline-block w-6 h-6 rounded-full bg-indigo-600 text-[11px] text-center leading-6 ring-2 ring-slate-900">😎</span>
                    <span className="inline-block w-6 h-6 rounded-full bg-pink-600 text-[11px] text-center leading-6 ring-2 ring-slate-900">👑</span>
                    <span className="inline-block w-6 h-6 rounded-full bg-amber-600 text-[11px] text-center leading-6 ring-2 ring-slate-900">🚀</span>
                    <span className="inline-block w-6 h-6 rounded-full bg-emerald-600 text-[11px] text-center leading-6 ring-2 ring-slate-900">🦄</span>
                  </div>
                  <span className="text-indigo-400 font-medium">Voting in progress · 8s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Strip */}
      <section className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              How It Works in 30 Seconds
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Designed for effortless group entertainment on mobile or desktop
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-display font-extrabold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Create a Room & Share</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                One player hits Host and shares the link or 4-letter code in WhatsApp, Discord, or group chats. Friends join on their own phones instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center font-display font-extrabold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Vote on Your Friends</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Read hilarious, original "Who's most likely to..." questions. Everyone locks in their vote anonymously before the countdown ends.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-display font-extrabold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Reveal Results & Share</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                See who got convicted by the jury, read funny commentary, and post branded result cards to TikTok, Instagram, or WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reserved Monetization Placement */}
      <section className="px-4 sm:px-6">
        <AdPlacement id="landing-leaderboard-ad" format="leaderboard" />
      </section>

      {/* Categories Showcase */}
      <section className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                Choose Your Vibe
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                6 curated decks with 130+ tailored questions for every crowd
              </p>
            </div>
            <button
              onClick={onViewRules}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View all categories & rules</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.values(CATEGORIES).map((cat) => (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelectCategory(cat.id);
                }}
                className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/60 transition-all text-left flex flex-col justify-between gap-4 cursor-pointer hover:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">20+ Questions</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{cat.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-semibold text-indigo-400">
                  <span>Explore Questions</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Sharing & Viral Proof */}
      <section className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-pink-950/40 border border-slate-800 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-pink-600/20 text-pink-400 flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white text-balance">
              Made for Group Chats, TikTok & Story Highlights
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every round generates a custom, high-contrast result card ready to screenshot or post to your WhatsApp group, Instagram Stories, or TikTok with 1 tap.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onHostGame}
                className="h-12 px-6 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg active:scale-95"
              >
                Start a Game Night Room
              </button>
              <button
                onClick={onQuickPlay}
                className="h-12 px-6 rounded-xl bg-slate-800/80 text-white font-semibold text-sm hover:bg-slate-800 border border-slate-700 transition-colors active:scale-95"
              >
                Try Solo Quick Play
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
