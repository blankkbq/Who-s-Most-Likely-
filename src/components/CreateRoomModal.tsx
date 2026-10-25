import React, { useState } from 'react';
import { X, Sparkles, Clock, Users, ArrowRight } from 'lucide-react';
import { CategoryId, CATEGORIES } from '../game/questions';
import { EMOJI_AVATARS } from '../types';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: { name: string; avatar: string; category: CategoryId; timerDuration: number }) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('😎');
  const [category, setCategory] = useState<CategoryId>('friends');
  const [timerDuration, setTimerDuration] = useState<number>(20);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please choose a nickname to enter the room');
      return;
    }
    onCreate({
      name: cleanName,
      avatar,
      category,
      timerDuration,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="create-room-title"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 id="create-room-title" className="text-xl font-bold font-display text-white">
              Create a Game Room
            </h2>
            <p className="text-xs text-slate-400">Invite friends with a simple link — no login needed</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nickname */}
          <div>
            <label htmlFor="host-nickname" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Your Nickname
            </label>
            <input
              id="host-nickname"
              type="text"
              required
              maxLength={16}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Alex, Sam, Captain"
              className="w-full h-11 px-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pick Your Party Avatar
            </label>
            <div className="grid grid-cols-8 gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl max-h-32 overflow-y-auto">
              {EMOJI_AVATARS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`h-9 flex items-center justify-center text-xl rounded-lg transition-transform active:scale-95 ${
                    avatar === emoji
                      ? 'bg-indigo-600 ring-2 ring-indigo-400 text-white scale-110'
                      : 'hover:bg-slate-800'
                  }`}
                  aria-label={`Select avatar ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Question Category</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(CATEGORIES).map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    category === cat.id
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-white">{cat.name}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Timer selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Voting Timer</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '15s (Fast)', val: 15 },
                { label: '20s (Normal)', val: 20 },
                { label: '30s (Chill)', val: 30 },
                { label: 'Untimed', val: 0 },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setTimerDuration(opt.val)}
                  className={`py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                    timerDuration === opt.val
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-transform"
          >
            <span>Create Room & Get Invite Link</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
