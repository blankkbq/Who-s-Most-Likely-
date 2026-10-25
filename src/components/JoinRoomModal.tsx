import React, { useState, useEffect } from 'react';
import { X, Users, ArrowRight } from 'lucide-react';
import { EMOJI_AVATARS } from '../types';

interface JoinRoomModalProps {
  isOpen: boolean;
  initialCode?: string;
  onClose: () => void;
  onJoin: (config: { code: string; name: string; avatar: string }) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  initialCode = '',
  onClose,
  onJoin,
}) => {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('😎');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode.toUpperCase());
    }
  }, [initialCode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.toUpperCase().trim();
    const cleanName = name.trim();

    if (!cleanCode || cleanCode.length < 3) {
      setError('Please enter a valid room code (e.g. WOLF)');
      return;
    }
    if (!cleanName) {
      setError('Please choose a nickname');
      return;
    }

    onJoin({
      code: cleanCode,
      name: cleanName,
      avatar,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl relative"
        role="dialog"
        aria-labelledby="join-room-title"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center text-white">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 id="join-room-title" className="text-xl font-bold font-display text-white">
              Join Party Room
            </h2>
            <p className="text-xs text-slate-400">Enter the 4-letter room code from your friend</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Code */}
          <div>
            <label htmlFor="join-room-code" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Room Code
            </label>
            <input
              id="join-room-code"
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              placeholder="e.g. WOLF"
              className="w-full h-12 px-3.5 bg-slate-950 border border-slate-700 rounded-xl text-center font-mono text-lg font-bold tracking-widest text-white uppercase placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Nickname */}
          <div>
            <label htmlFor="join-player-nickname" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Your Nickname
            </label>
            <input
              id="join-player-nickname"
              type="text"
              required
              maxLength={16}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Jordan, Riley, Sam"
              className="w-full h-11 px-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pick Your Avatar
            </label>
            <div className="grid grid-cols-8 gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl max-h-28 overflow-y-auto">
              {EMOJI_AVATARS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`h-9 flex items-center justify-center text-xl rounded-lg transition-transform active:scale-95 ${
                    avatar === emoji
                      ? 'bg-pink-600 ring-2 ring-pink-400 text-white scale-110'
                      : 'hover:bg-slate-800'
                  }`}
                  aria-label={`Select avatar ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-transform"
          >
            <span>Enter Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
