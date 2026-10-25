import React, { useState } from 'react';
import { Sparkles, Volume2, VolumeX, LogOut } from 'lucide-react';
import { sounds } from '../services/sound';

interface NavbarProps {
  onNavigate: (view: 'landing' | 'quickplay' | 'categories' | 'rules') => void;
  onOpenCreate: () => void;
  onOpenJoin: () => void;
  currentRoomCode?: string | null;
  onLeaveRoom?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenCreate,
  onOpenJoin,
  currentRoomCode,
  onLeaveRoom,
}) => {
  const [muted, setMuted] = useState(sounds.isMuted());

  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setMuted(next);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single element) */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-left font-display text-lg sm:text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <span>Who's Most Likely?</span>
        </button>

        {/* Zone 2: Navigation Links (single line, unboxed) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('categories')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Categories
          </button>
          <button
            onClick={() => onNavigate('rules')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Rules
          </button>
          <button
            onClick={onOpenJoin}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Join Room
          </button>
          <button
            onClick={() => onNavigate('quickplay')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-amber-400"
          >
            Quick Play Solo
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Sound Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleSound}
            aria-label={muted ? 'Unmute game sounds' : 'Mute game sounds'}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/60"
          >
            {muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-indigo-400" />}
          </button>

          {currentRoomCode ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block px-2.5 py-1 text-xs font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 rounded-md">
                ROOM: {currentRoomCode}
              </span>
              {onLeaveRoom && (
                <button
                  onClick={onLeaveRoom}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/20 transition-colors whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Leave</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenCreate}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap shrink-0"
            >
              Host Room
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
