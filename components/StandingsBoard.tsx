
import React from 'react';
import { Participant } from '../types';

export interface StandingEntry {
  participant: Participant;
  rank: number;
  primaryStat: { label: string; value: string | number };
  secondaryStat?: { label: React.ElementType | React.ReactNode; value: string | number };
  isWinner?: boolean;
  isHighlighted?: boolean;
}

interface StandingsBoardProps {
  entries: StandingEntry[];
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const getContrastColor = (bgColor: string) => {
  const blackTextColors = ['#facc15', '#84cc16'];
  return blackTextColors.includes(bgColor) ? '#000000' : '#ffffff';
};

const StandingsBoard: React.FC<StandingsBoardProps> = ({ 
  entries, title, subtitle, icon, headerActions, footer, className = "" 
}) => {
  return (
    <aside className={`flex flex-col bg-app-surface-muted border-app-border shadow-xl z-10 transition-colors ${className}`}>
      <div className="p-3.5 sm:p-6 border-b border-app-border shrink-0 bg-app-surface transition-colors">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          {icon && <div className="text-app-primary scale-75 sm:scale-100">{icon}</div>}
          <h2 className="text-base sm:text-2xl font-medieval uppercase tracking-wider text-app-text truncate">{title}</h2>
        </div>
        <div className="flex items-center justify-between gap-4">
          {subtitle && <p className="text-[7px] sm:text-[10px] text-app-text-muted font-black uppercase tracking-widest truncate">{subtitle}</p>}
          {headerActions}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 sm:space-y-2 custom-scrollbar transition-colors">
        {entries.map((entry, idx) => (
          <div 
            key={`${entry.participant.id}-${idx}`} 
            className={`
              flex items-center justify-between p-2 sm:p-3 rounded-xl border transition-all shadow-sm
              ${entry.isWinner ? 'bg-app-accent/10 border-app-accent' : 'bg-app-surface border-app-border'} 
              ${entry.isHighlighted ? 'ring-2 ring-app-accent ring-offset-2 ring-offset-app-bg' : ''}
            `}
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="text-[8px] sm:text-xs font-mono font-bold text-app-text-muted shrink-0">#{entry.rank}</div>
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-[7px] sm:text-[10px] shadow-sm shrink-0" style={{ backgroundColor: entry.participant.color, color: getContrastColor(entry.participant.color) }}>
                <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">{entry.participant.id}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] sm:text-sm font-bold truncate ${entry.isHighlighted ? 'text-app-accent' : 'text-app-text'}`}>
                  {entry.participant.name}
                </div>
                {entry.secondaryStat && (
                  <div className="flex items-center gap-1 text-[6px] sm:text-[9px] font-black uppercase tracking-tight text-app-text-muted truncate mt-0.5">
                    {typeof entry.secondaryStat.label === 'function' ? (
                      <entry.secondaryStat.label className="w-2.5 h-2.5 shrink-0" />
                    ) : (<span className="shrink-0 opacity-70">{entry.secondaryStat.label}</span>)}
                    <span className="truncate">{entry.secondaryStat.value}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className={`text-sm sm:text-xl font-medieval tabular-nums leading-none ${entry.isHighlighted ? 'text-app-accent' : 'text-app-text'}`}>
                {entry.primaryStat.value}
              </div>
              <div className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-app-text-muted mt-1">
                {entry.primaryStat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {footer && (
        <div className="p-2 sm:p-3 bg-app-surface border-t border-app-border shrink-0 transition-colors">
          {footer}
        </div>
      )}
    </aside>
  );
};

export default StandingsBoard;
