import React, { useState } from 'react';
import { X, Sparkles, ChevronRight, Check } from 'lucide-react';
import { CATEGORIES, CategoryId, QUESTIONS_DATABASE } from '../game/questions';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (category: CategoryId) => void;
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
}) => {
  const [activeTab, setActiveTab] = useState<CategoryId>('friends');

  if (!isOpen) return null;

  const currentMeta = CATEGORIES[activeTab];
  const sampleQuestions = QUESTIONS_DATABASE.filter((q) => q.category === activeTab).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="categories-modal-title"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
          <Sparkles className="w-4 h-4" />
          <span>OFFICIAL DECKS & CATEGORIES</span>
        </div>
        <h2 id="categories-modal-title" className="text-2xl font-bold font-display text-white mb-6">
          Explore Party Game Decks
        </h2>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto mb-6">
          {Object.values(CATEGORIES).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Active Category Showcase */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{currentMeta.name}</h3>
            <span className="text-xs text-indigo-400 font-mono">20+ Curated Questions</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{currentMeta.description}</p>

          <div className="pt-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Sample Questions from this Deck:
            </p>
            <div className="space-y-2">
              {sampleQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-200"
                >
                  "{q.text}"
                </div>
              ))}
            </div>
          </div>

          {onSelectCategory && (
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  onSelectCategory(activeTab);
                  onClose();
                }}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2"
              >
                <span>Choose {currentMeta.name} for Next Game</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
