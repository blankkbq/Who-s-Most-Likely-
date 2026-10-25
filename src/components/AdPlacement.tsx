import React from 'react';
import { Info } from 'lucide-react';

interface AdPlacementProps {
  id: string;
  format: 'leaderboard' | 'rectangle' | 'banner';
  className?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({ id, format, className = '' }) => {
  // Configured for future Google AdSense or programmatic advertising integration
  return (
    <div
      id={id}
      aria-label="Advertising Placement Space"
      className={`mx-auto flex flex-col items-center justify-center border border-dashed border-slate-800 bg-slate-900/40 rounded-xl p-3 text-center ${
        format === 'leaderboard'
          ? 'w-full max-w-3xl min-h-[90px]'
          : format === 'rectangle'
          ? 'w-full max-w-[300px] min-h-[250px]'
          : 'w-full max-w-md min-h-[60px]'
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Info className="w-3.5 h-3.5" />
        <span>Reserved Sponsored Placement</span>
      </div>
      <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
        Standard IAB non-intrusive slot. Monetization ready for approved ad networks.
      </p>
    </div>
  );
};
