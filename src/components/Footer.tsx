import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'rules' | 'categories' | 'privacy' | 'terms' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 mt-auto py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-semibold text-slate-200 text-sm">Who's Most Likely?</p>
            <p className="text-slate-500">The free multiplayer party game for honest friends</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-5 sm:gap-7">
          <button
            onClick={() => onNavigate('categories')}
            className="hover:text-slate-200 transition-colors whitespace-nowrap"
          >
            Categories
          </button>
          <button
            onClick={() => onNavigate('rules')}
            className="hover:text-slate-200 transition-colors whitespace-nowrap"
          >
            Rules & FAQs
          </button>
          <button
            onClick={() => onNavigate('privacy')}
            className="hover:text-slate-200 transition-colors whitespace-nowrap"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => onNavigate('terms')}
            className="hover:text-slate-200 transition-colors whitespace-nowrap"
          >
            Terms of Use
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className="hover:text-slate-200 transition-colors whitespace-nowrap"
          >
            Contact & Feedback
          </button>
        </nav>

        <div className="flex items-center gap-1.5 text-slate-500">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for game nights everywhere</span>
        </div>
      </div>
    </footer>
  );
};
