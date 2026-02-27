
import React from 'react';
import { Match, Participant } from '../types';
import { Trophy, Swords, Circle, RotateCcw, Plus, Minus, CheckCircle2 } from 'lucide-react';

interface MatchNodeProps {
  match: Match;
  participants: Participant[];
  onBoutWin: (matchId: string, participantId: number | string, value?: number) => void;
  onResetMatch: (matchId: string) => void;
  onFinalizeMatch: (matchId: string) => void;
  canReset: boolean;
  requiredWins: number;
  winMode: 'rounds' | 'points';
  isClickable: boolean;
  accentColor?: 'sky' | 'blue';
  highlightedParticipantId?: number | string | null;
  status?: 'draft' | 'preparation' | 'active' | 'completed';
  onParticipantSwap?: (matchId: string, slot: 1 | 2) => void;
  swapSource?: { matchId: string; slot: 1 | 2 } | null;
  isSeeded?: boolean;
  onHover?: (matchId: string | null) => void;
  isFocusHighlight?: boolean;
  inspectorCard?: React.ReactNode;
}

const getContrastColor = (bgColor: string) => {
  const blackTextColors = ['#facc15', '#84cc16'];
  return blackTextColors.includes(bgColor) ? '#000000' : '#ffffff';
};

const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const getProceduralId = (match: Match) => {
  if (match.bracketType === 'final') return 'GF';
  if (match.bracketType === 'third-place') return '3P';
  const prefix = match.bracketType === 'primary' ? 'WR' :
                 match.bracketType === 'secondary' ? 'LR' :
                 match.bracketType === 'round-robin' ? 'RR' :
                 match.bracketType === 'swiss' ? 'SW' :
                 match.bracketType === 'arts-listing' ? 'AR' : 'M';
  if (match.bracketType === 'arts-listing') return `${prefix}${match.matchIndex + 1}`;
  return `${prefix}${match.roundIndex + 1}M${match.matchIndex + 1}`;
};

const PlayerRow = ({ 
  player, isWinner, wins, slot, accentBgWins, accentText, highlightedParticipantId, swapSource, match, status, onParticipantSwap, isClickable, onBoutWin, requiredWins, winMode, participants, isSeeded
}: { 
  player?: Participant; isWinner: boolean; wins: number; slot: 1 | 2; accentBgWins: string; accentText: string; highlightedParticipantId?: number | string | null; swapSource?: { matchId: string; slot: 1 | 2 } | null; match: Match; status?: 'draft' | 'preparation' | 'active' | 'completed'; onParticipantSwap?: (matchId: string, slot: 1 | 2) => void; isClickable: boolean; onBoutWin: (matchId: string, participantId: number | string, value?: number) => void; requiredWins: number; winMode: 'rounds' | 'points'; participants: Participant[]; isSeeded?: boolean;
}) => {
  const isHighlighted = player && highlightedParticipantId === player.id;
  const isSwapSource = swapSource?.matchId === match.id && swapSource?.slot === slot;
  const inPreparation = status === 'preparation';
  const handleRowClick = () => { if (inPreparation && onParticipantSwap) onParticipantSwap(match.id, slot); };
  
  // Tactical restriction: In bracketed tournaments, pips are only clickable if both slots are filled (not pending)
  const isBracketedMatch = ['primary', 'secondary', 'final', 'third-place'].includes(match.bracketType);
  const bothParticipantsPresent = match.participant1Id !== null && match.participant2Id !== null;
  const canInteract = player && isClickable && !match.winnerId && (!isBracketedMatch || bothParticipantsPresent);
  
  const seed = player ? participants.findIndex(p => p.id === player.id) + 1 : null;

  return (
    <div 
      onClick={handleRowClick}
      data-slot={slot}
      className={`
        flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-xs transition-all relative
        ${isWinner ? `${accentBgWins} ${accentText} font-bold` : 'bg-app-surface text-app-text-muted'}
        ${!player ? 'italic opacity-30' : ''}
        ${isHighlighted ? 'bg-app-accent/10 border-app-accent z-10' : ''}
        ${inPreparation ? 'cursor-pointer hover:bg-app-surface-muted active:scale-[0.99]' : ''}
        ${isSwapSource ? 'ring-2 ring-inset ring-app-accent border-app-accent z-20 animate-pulse bg-app-accent/5' : ''}
      `}
    >
      <div className="flex items-center gap-2 sm:gap-3 truncate max-w-[55%]">
        {player ? (
          <>
            <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center rounded font-bold text-[9px] sm:text-[11px] shadow-sm transition-colors" style={{ backgroundColor: player.color, color: getContrastColor(player.color) }}>
              <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">{player.id}</span>
            </div>
            <div className="flex flex-col truncate">
              <span className={`truncate font-semibold text-[11px] sm:text-xs ${isHighlighted || isSwapSource ? 'text-app-accent' : 'text-app-text'}`}>{player.name}</span>
              {isSeeded && seed && <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-app-text-muted leading-none mt-0.5">{getOrdinal(seed)} Seed</span>}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 opacity-40">
             <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-app-surface-muted border border-dashed border-app-border transition-colors"></div>
             <span className="uppercase text-[8px] sm:text-[9px] font-bold tracking-widest">{inPreparation ? 'SWAP' : 'BYE'}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 ml-2">
        {player && winMode === 'rounds' && !inPreparation ? (
           Array.from({ length: requiredWins }).map((_, i) => (
              <button key={i} disabled={!canInteract} onClick={(e) => { e.stopPropagation(); onBoutWin(match.id, player.id); }} className={`p-2 sm:p-2.5 transition-all group/pip ${canInteract ? 'cursor-pointer hover:scale-125' : 'cursor-default opacity-40'}`}>
                <Circle className={`w-4 h-4 sm:w-5 h-5 ${i < wins ? 'fill-emerald-500 text-emerald-500' : 'text-app-text-muted/40'}`} />
              </button>
            ))
        ) : player && winMode === 'points' && !inPreparation ? (
            <div className="flex items-center gap-1 bg-app-surface-muted rounded-lg p-0.5 border border-app-border transition-colors">
                <button disabled={!canInteract} onClick={(e) => { e.stopPropagation(); onBoutWin(match.id, player.id, wins - 1); }} className={`p-1.5 rounded hover:bg-app-border transition-colors ${!canInteract ? 'opacity-20' : ''}`}><Minus className="w-4 h-4" /></button>
                <input type="number" value={wins} onChange={(e) => { e.stopPropagation(); onBoutWin(match.id, player.id, parseInt(e.target.value) || 0); }} disabled={!canInteract} onClick={(e) => e.stopPropagation()} className="w-8 sm:w-10 bg-transparent text-center font-bold text-xs sm:text-[11px] text-app-text focus:outline-none transition-colors" />
                <button disabled={!canInteract} onClick={(e) => { e.stopPropagation(); onBoutWin(match.id, player.id, wins + 1); }} className={`p-1.5 rounded hover:bg-app-border transition-colors ${!canInteract ? 'opacity-20' : ''}`}><Plus className="w-4 h-4" /></button>
            </div>
        ) : inPreparation ? (
          <div className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${isSwapSource ? 'text-app-accent' : 'text-app-text-muted'}`}>{isSwapSource ? 'Source' : 'Swap'}</div>
        ) : null}
        {isWinner && <Trophy className={`w-3.5 h-3.5 sm:w-4 h-4 ml-1 flex-shrink-0 ${accentText}`} />}
      </div>
    </div>
  );
};

const MatchNode: React.FC<MatchNodeProps> = ({ 
  match, participants, onBoutWin, onResetMatch, onFinalizeMatch, canReset, requiredWins, winMode, isClickable, accentColor = 'sky', highlightedParticipantId, status, onParticipantSwap, swapSource, isSeeded, onHover, isFocusHighlight, inspectorCard
}) => {
  const p1 = participants.find((p) => p.id === match.participant1Id);
  const p2 = participants.find((p) => p.id === match.participant2Id);

  const accentText = 'text-app-primary';
  const accentBorder = 'border-app-primary/30';
  const accentBgWins = 'bg-app-primary-muted';

  const showFinalize = winMode === 'points' && !match.winnerId && p1 && p2 && (match.participant1Wins > 0 || match.participant2Wins > 0);
  const proceduralId = getProceduralId(match);

  return (
    <div 
      className={`relative flex items-center group/match transition-all ${isFocusHighlight ? 'animate-focus-pulse ring-4 ring-app-primary/50 rounded-xl z-50' : 'z-10'}`} 
      data-match-id={match.id}
      onMouseEnter={() => onHover?.(match.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className={`
        w-72 sm:w-80 bg-app-surface border-2 rounded-xl overflow-hidden shadow-lg transition-all
        ${match.winnerId ? `${accentBorder} ring-2 ring-app-primary/10` : 'border-app-border group-hover/match:border-app-text-muted/30'}
        ${(p1?.id === highlightedParticipantId || p2?.id === highlightedParticipantId || swapSource?.matchId === match.id) ? 'ring-2 ring-app-accent/50 scale-105 shadow-xl' : ''}
      `}>
        <div className="bg-app-surface-muted px-3 py-1.5 sm:py-2 flex items-center justify-between border-b border-app-border shadow-sm transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-app-text-muted font-bold">Match {match.matchIndex + 1}</span>
            <span className="text-[12px] font-black text-app-primary font-mono tracking-tighter opacity-0 group-hover/match:opacity-100 transition-opacity duration-300">
              [{proceduralId}]
            </span>
          </div>
          <Swords className="w-3 h-3 sm:w-3.5 h-3.5 text-app-text-muted/30" />
        </div>
        <div className="divide-y divide-app-border transition-colors">
          <PlayerRow player={p1} isWinner={match.winnerId === p1?.id && !!p1} wins={match.participant1Wins} slot={1} accentBgWins={accentBgWins} accentText={accentText} highlightedParticipantId={highlightedParticipantId} swapSource={swapSource} match={match} status={status} onParticipantSwap={onParticipantSwap} isClickable={isClickable} onBoutWin={onBoutWin} requiredWins={requiredWins} winMode={winMode} participants={participants} isSeeded={isSeeded} />
          <PlayerRow player={p2} isWinner={match.winnerId === p2?.id && !!p2} wins={match.participant2Wins} slot={2} accentBgWins={accentBgWins} accentText={accentText} highlightedParticipantId={highlightedParticipantId} swapSource={swapSource} match={match} status={status} onParticipantSwap={onParticipantSwap} isClickable={isClickable} onBoutWin={onBoutWin} requiredWins={requiredWins} winMode={winMode} participants={participants} isSeeded={isSeeded} />
        </div>
      </div>
      {inspectorCard}
      {(match.winnerId || showFinalize) && canReset && (
        <button
          onClick={() => match.winnerId ? onResetMatch(match.id) : onFinalizeMatch(match.id)}
          className={`absolute -bottom-6 sm:-bottom-7 left-1/2 -translate-x-1/2 border rounded-b-lg px-3 sm:px-4 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover/match:opacity-100 group-hover/match:-bottom-8 transition-all z-0 shadow-lg 
            ${match.winnerId ? 'bg-app-surface border-app-border text-app-text-muted hover:bg-app-primary hover:text-white' : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'}
          `}
        >
          {match.winnerId ? <><RotateCcw className="w-3 h-3" />RESET</> : <><CheckCircle2 className="w-3 h-3" />SEAL SCORE</>}
        </button>
      )}
    </div>
  );
};

export default MatchNode;
