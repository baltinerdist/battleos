import React, { useState, useMemo, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { Match, Participant } from '../types';
import MatchNode, { getProceduralId } from './MatchNode';
import Podium from './Podium';
import { Maximize2, Minimize2, LayoutGrid, List, Clock, Trophy as TrophyIcon, Zap, ChevronLeft, ChevronRight, Plus, Minus, Search, Swords, Skull } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface BracketViewProps {
  rounds: Match[][];
  participants: Participant[];
  onBoutWin: (matchId: string, participantId: number | string, value?: number) => void;
  onResetMatch: (matchId: string) => void;
  onFinalizeMatch: (matchId: string) => void;
  onSimulateMatches?: (matchIds: string[]) => void;
  canResetCheck: (matchId: string) => boolean;
  requiredWins: number;
  winMode: 'rounds' | 'points';
  status: 'draft' | 'preparation' | 'active' | 'completed';
  accentColor?: 'sky' | 'blue';
  grandFinal?: Match | null;
  grandFinalReset?: Match | null;
  thirdPlaceMatch?: Match | null;
  highlightedParticipantId?: number | string | null;
  onParticipantSwap?: (matchId: string, slot: 1 | 2) => void;
  swapSource?: { matchId: string; slot: 1 | 2 } | null;
  isSeeded?: boolean;
  onTabChange?: (tab: 'winners' | 'losers') => void;
  activeTab?: 'winners' | 'losers';
  hasLoserBracket?: boolean;
  allTournamentMatches?: Match[];
}

const getRoundName = (roundIdx: number, totalRounds: number, isSecondary?: boolean): string => {
  if (isSecondary) return `Loser Round ${roundIdx + 1}`;
  const dist = totalRounds - 1 - roundIdx;
  if (dist === 0) return 'Finals';
  if (dist === 1) return 'Semi-Finals';
  if (dist === 2) return 'Quarter-Finals';
  return `Round ${roundIdx + 1}`;
};

const BracketView: React.FC<BracketViewProps> = ({ 
  rounds = [], participants, onBoutWin, onResetMatch, onFinalizeMatch, onSimulateMatches,
  canResetCheck, requiredWins, winMode, status, accentColor = 'sky',
  grandFinal, grandFinalReset, thirdPlaceMatch, highlightedParticipantId, 
  onParticipantSwap, swapSource, isSeeded, onTabChange, activeTab = 'winners', hasLoserBracket = false, allTournamentMatches
}) => {
  const { theme } = useTheme();
  const [manualCondensed, setManualCondensed] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'bracket' | 'timeline'>('bracket');
  const [isInspectorMode, setIsInspectorMode] = useState(false);
  const [hoveredMatchId, setHoveredMatchId] = useState<string | null>(null);
  const [focusMatchId, setFocusMatchId] = useState<string | null>(null);
  const [currentMobileRound, setCurrentMobileRound] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [connectors, setConnectors] = useState<{ path: string, isActive: boolean, key: string }[]>([]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  const isLoserBracket = rounds?.[0]?.[0]?.bracketType === 'secondary' || activeTab === 'losers';
  const accentText = 'text-app-primary';

  const isRoundCondensed = (round: Match[], rIdx: number) => {
    const roundKey = `${round[0]?.bracketType || 'primary'}-${rIdx}`;
    if (manualCondensed[roundKey] !== undefined) return manualCondensed[roundKey];
    if (rIdx === 0) return false;
    return round.length > 0 && round.every(m => m.winnerId !== null);
  };

  const handleToggleCondense = (round: Match[], rIdx: number) => {
    const roundKey = `${round[0]?.bracketType || 'primary'}-${rIdx}`;
    const current = isRoundCondensed(round, rIdx);
    setManualCondensed(prev => ({ ...prev, [roundKey]: !current }));
  };

  const totalPages = useMemo(() => {
    let count = rounds?.length || 0;
    if (grandFinal || thirdPlaceMatch) count += 1;
    count += 1; // Podium
    return count;
  }, [rounds, grandFinal, thirdPlaceMatch]);

  const winnerId = grandFinalReset ? grandFinalReset.winnerId : (grandFinal ? grandFinal.winnerId : (rounds && rounds.length > 0 ? (rounds[rounds.length - 1]?.[0]?.winnerId) : null));
  const winner = winnerId ? participants.find(p => p.id === winnerId) : null;

  const handleNext = () => setCurrentMobileRound(prev => Math.min(totalPages - 1, prev + 1));
  const handlePrev = () => setCurrentMobileRound(prev => Math.max(0, prev - 1));
  const handleZoomOut = () => setZoom(prev => Math.max(0.4, prev - 0.1));
  const handleZoomIn = () => setZoom(prev => Math.min(1.0, prev + 0.1));

  const updatePaths = useCallback(() => {
    if (viewMode !== 'bracket' || !canvasRef.current) return;

    const container = canvasRef.current;
    const containerRect = container.getBoundingClientRect();
    const paths: { path: string, isActive: boolean, key: string }[] = [];

    const matchElements = Array.from(container.querySelectorAll('[data-match-id]')) as HTMLElement[];
    const rectById = new Map<string, DOMRect>();
    matchElements.forEach(el => {
      const id = el.getAttribute('data-match-id');
      if (id) rectById.set(id, el.getBoundingClientRect());
    });

    const allMatchesData = [...(rounds?.flat() || []), grandFinal, grandFinalReset, thirdPlaceMatch].filter(Boolean) as Match[];

    allMatchesData.forEach(match => {
      const srcRect = rectById.get(match.id);
      
      // Handle normal advancement path
      if (match.nextMatchId) {
        const destRect = rectById.get(match.nextMatchId);
        if (srcRect && destRect) {
          const startX = (srcRect.right - containerRect.left) / zoom;
          const startY = (srcRect.top + srcRect.height / 2 - containerRect.top) / zoom;
          const endX = (destRect.left - containerRect.left) / zoom;
          const endY = (destRect.top + destRect.height / 2 - containerRect.top) / zoom;

          // The robust printable geometry: minLeg prevents overlapping horizontal lines
          const minLeg = 20;
          const rawMidX = startX + (endX - startX) / 2;
          const midX = Math.max(startX + minLeg, Math.min(rawMidX, endX - minLeg));

          paths.push({
            path: `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`,
            isActive: !!match.winnerId,
            key: `next-${match.id}-${match.nextMatchId}`
          });
        }
      }

      // Handle loser bracket entry path
      if (match.loserNextMatchId) {
        const destRect = rectById.get(match.loserNextMatchId);
        if (srcRect && destRect) {
          const startX = (srcRect.right - containerRect.left) / zoom;
          const startY = (srcRect.top + srcRect.height / 2 - containerRect.top) / zoom;
          const endX = (destRect.left - containerRect.left) / zoom;
          const endY = (destRect.top + destRect.height / 2 - containerRect.top) / zoom;

          const minLeg = 20;
          const rawMidX = startX + (endX - startX) / 2;
          const midX = Math.max(startX + minLeg, Math.min(rawMidX, endX - minLeg));

          paths.push({
            path: `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`,
            isActive: false, // Loser paths are typically muted
            key: `loser-${match.id}-${match.loserNextMatchId}`
          });
        }
      }
    });

    setConnectors(paths);
  }, [rounds, grandFinal, grandFinalReset, thirdPlaceMatch, zoom, viewMode, manualCondensed]);

  const queueRecalc = useCallback(() => {
    if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      updatePaths();
    });
  }, [updatePaths]);

  useLayoutEffect(() => {
    queueRecalc();

    const scroller = scrollContainerRef.current;
    const canvas = canvasRef.current;
    if (!scroller || !canvas) return;

    const onScroll = () => queueRecalc();
    const onResize = () => queueRecalc();

    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(() => queueRecalc());
    ro.observe(scroller);
    ro.observe(canvas);

    // Initial triggers for late-rendering content
    const t1 = setTimeout(queueRecalc, 100);
    const t2 = setTimeout(queueRecalc, 500);

    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [queueRecalc, zoom, viewMode, manualCondensed, rounds]);

  const findMatchData = (id: string) => {
    return allTournamentMatches?.find(m => m.id === id) || 
           rounds.flat().find(m => m.id === id) || 
           (grandFinal?.id === id ? grandFinal : null) || 
           (grandFinalReset?.id === id ? grandFinalReset : null) ||
           (thirdPlaceMatch?.id === id ? thirdPlaceMatch : null);
  };

  const handleInspectorNavigation = (targetMatchId: string) => {
    setFocusMatchId(targetMatchId);
    setHoveredMatchId(null);
    const match = findMatchData(targetMatchId);
    if (match) {
      if (match.bracketType === 'secondary' && onTabChange) onTabChange('losers');
      else if (match.bracketType === 'primary' && onTabChange) onTabChange('winners');
    }
    setTimeout(() => {
        const targetEl = document.querySelector(`[data-match-id="${targetMatchId}"]`);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }, 100);
    setTimeout(() => setFocusMatchId(null), 3000);
  };

  const renderInspectorHoverCard = (mId: string) => {
    if (!isInspectorMode || hoveredMatchId !== mId) return null;
    const match = findMatchData(mId);
    if (!match) return null;
    const nextMatch = match.nextMatchId ? findMatchData(match.nextMatchId) : null;
    const loserMatch = match.loserNextMatchId ? findMatchData(match.loserNextMatchId) : null;

    return (
      <div className="absolute z-[100] bg-app-surface border-2 border-app-primary/50 rounded-2xl p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-auto min-w-[200px] ml-1 top-1/2 -translate-y-1/2 left-full">
        <div className="absolute inset-y-0 -left-6 w-8 bg-transparent" />
        <div className="space-y-3 relative z-10">
          <div>
            <div className="text-[10px] font-black text-app-text-muted uppercase tracking-widest mb-1">Winner advances</div>
            {nextMatch ? (
              <button onClick={(e) => { e.stopPropagation(); handleInspectorNavigation(nextMatch.id); }} className="flex items-center gap-2 text-app-primary hover:opacity-80 font-bold transition-all group text-xs text-left w-full">
                <span>Win to {getProceduralId(nextMatch)}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ml-auto" />
              </button>
            ) : (<div className="text-emerald-500 font-black uppercase text-[10px]">Victory / Champions</div>)}
          </div>
          <div className="h-px bg-app-border" />
          <div>
            <div className="text-[10px] font-black text-app-text-muted uppercase tracking-widest mb-1">Loser outcome</div>
            {loserMatch ? (
              <button onClick={(e) => { e.stopPropagation(); handleInspectorNavigation(loserMatch.id); }} className="flex items-center gap-2 text-rose-500 hover:opacity-80 font-bold transition-all group text-xs text-left w-full">
                <span>Lose to {getProceduralId(loserMatch)}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ml-auto" />
              </button>
            ) : (<div className="text-app-text-muted font-black uppercase text-[10px] italic">Lose Eliminated</div>)}
          </div>
        </div>
        <div className="absolute left-0 top-1/2 -translate-x-[9px] -translate-y-1/2 w-4 h-4 bg-app-surface border-l-2 border-b-2 border-app-primary/50 rotate-45" />
      </div>
    );
  };

  if (!rounds || rounds.length === 0) return null;

  return (
    <div className="h-full w-full flex flex-col relative bg-app-bg overflow-hidden transition-colors">
      <div className="sticky left-0 top-0 w-full px-4 sm:px-6 py-4 flex flex-wrap items-center justify-end z-40 pointer-events-none gap-3">
        {hasLoserBracket && onTabChange && (
          <div className="flex bg-app-surface/90 backdrop-blur-md rounded-xl p-1 shadow-lg border border-app-border pointer-events-auto transition-colors">
            <button 
              onClick={() => onTabChange('winners')} 
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'winners' ? 'bg-app-primary text-white shadow-sm' : 'text-app-text-muted hover:text-app-text'}`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Winners</span>
            </button>
            <button 
              onClick={() => onTabChange('losers')} 
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'losers' ? 'bg-rose-600 text-white shadow-sm' : 'text-app-text-muted hover:text-app-text'}`}
            >
              <Skull className="w-3.5 h-3.5" />
              <span>Underworld</span>
            </button>
          </div>
        )}

        {viewMode === 'bracket' && (
          <div className="hidden sm:flex bg-app-surface/90 backdrop-blur-md rounded-xl p-1 shadow-lg border border-app-border pointer-events-auto items-center gap-1 transition-colors">
            <button onClick={handleZoomOut} className="p-1.5 rounded-lg hover:bg-app-surface-muted text-app-text-muted hover:text-app-primary transition-colors" title="Zoom Out"><Minus className="w-3.5 h-3.5" /></button>
            <div className="flex items-center gap-1.5 px-1 min-w-[50px] justify-center">
              <Search className="w-3 h-3 text-app-text-muted" />
              <span className="text-[10px] font-black text-app-text-muted tabular-nums">{Math.round(zoom * 100)}%</span>
            </div>
            <button onClick={handleZoomIn} className="p-1.5 rounded-lg hover:bg-app-surface-muted text-app-text-muted hover:text-app-primary transition-colors" title="Zoom In"><Plus className="w-3.5 h-3.5" /></button>
          </div>
        )}
        <div className="flex bg-app-surface/90 backdrop-blur-md rounded-xl p-1 shadow-lg border border-app-border pointer-events-auto transition-colors">
          <button onClick={() => setViewMode('bracket')} className={`p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${viewMode === 'bracket' ? 'bg-app-primary-muted text-app-primary shadow-sm' : 'text-app-text-muted hover:text-app-text'}`}>
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bracket</span>
          </button>
          <button onClick={() => setViewMode('timeline')} className={`p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${viewMode === 'timeline' ? 'bg-app-primary-muted text-app-primary shadow-sm' : 'text-app-text-muted hover:text-app-text'}`}>
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timeline</span>
          </button>
          <button onClick={() => setIsInspectorMode(!isInspectorMode)} className={`p-2 ml-1 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border-l border-app-border ${isInspectorMode ? 'bg-app-primary text-white shadow-lg' : 'text-app-text-muted hover:text-app-primary'}`} title="Toggle Bracket Inspector">
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {viewMode === 'bracket' ? (
        <div className="flex-1 relative flex flex-col overflow-hidden">
          <div className="absolute inset-y-0 left-0 lg:hidden flex items-center z-30 px-2 pointer-events-none">
            {currentMobileRound > 0 && (
              <button onClick={handlePrev} className="p-3 bg-app-surface/80 backdrop-blur border border-app-border text-app-text-muted rounded-full shadow-2xl pointer-events-auto active:scale-90 hover:text-app-primary transition-all"><ChevronLeft className="w-6 h-6" /></button>
            )}
          </div>
          <div className="absolute inset-y-0 right-0 lg:hidden flex items-center z-30 px-2 pointer-events-none">
            {currentMobileRound < totalPages - 1 && (
              <button onClick={handleNext} className="p-3 bg-app-surface/80 backdrop-blur border border-app-border text-app-text-muted rounded-full shadow-2xl pointer-events-auto active:scale-90 hover:text-app-primary transition-all"><ChevronRight className="w-6 h-6" /></button>
            )}
          </div>
          <div ref={scrollContainerRef} className="flex-1 overflow-auto custom-scrollbar relative">
            <div ref={canvasRef} className="flex min-w-max min-h-max px-12 pt-2 pb-16 gap-x-0 relative transition-transform duration-300 ease-out origin-top-left" style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%`, height: `${100 / zoom}%` }}>
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                {connectors.map(conn => (<path key={conn.key} d={conn.path} fill="none" stroke={conn.isActive ? 'var(--primary)' : 'var(--border)'} strokeOpacity={conn.isActive ? 0.7 : 0.4} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-500" />))}
              </svg>
              {rounds.map((round, rIdx) => {
                const isMobileActive = currentMobileRound === rIdx;
                const condensed = isRoundCondensed(round, rIdx);
                if (round.length === 0 && rIdx > 0) return null;
                return (
                  <div key={rIdx} className={`flex flex-col transition-all duration-500 lg:min-w-[400px] ${condensed ? 'lg:w-20 lg:min-w-[80px]' : ''} ${isMobileActive ? 'block' : 'hidden lg:flex'}`}>
                    {condensed ? (
                      <div onClick={() => handleToggleCondense(round, rIdx)} className="flex-1 flex flex-col items-center justify-start pt-24 cursor-pointer hover:bg-app-surface-muted group transition-all">
                        <div className="rotate-180 [writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-[0.6em] text-app-text-muted group-hover:text-app-primary transition-colors py-8">{getRoundName(rIdx, rounds.length, isLoserBracket)}</div>
                        <div className="mt-4 p-2 bg-app-surface border border-app-border rounded-lg group-hover:bg-app-surface-muted shadow-sm transition-colors"><Maximize2 className="w-4 h-4 text-app-text-muted group-hover:text-app-primary" /></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-center mb-2 h-12 flex flex-col items-center justify-end relative group/header">
                          <h3 className={`text-xl font-medieval uppercase tracking-[0.4em] ${accentText} border-b-2 border-app-border px-8 pb-1 font-bold`}>{getRoundName(rIdx, rounds.length, isLoserBracket)}</h3>
                          {round.length > 0 && round.every(m => m.winnerId !== null) && (
                            <button onClick={() => handleToggleCondense(round, rIdx)} className="absolute -right-4 bottom-1 p-1.5 bg-app-surface border border-app-border rounded-lg opacity-0 group-hover/header:opacity-100 transition-opacity hover:text-app-primary hover:bg-app-surface-muted shadow-xl z-20" title="Collapse Round"><Minimize2 className="w-3" /></button>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col">{round.map((match) => (<div key={match.id} className="flex-1 flex items-center justify-center relative py-4 min-h-[120px]"><MatchNode match={match} participants={participants} onBoutWin={onBoutWin} onResetMatch={onResetMatch} onFinalizeMatch={onFinalizeMatch} canReset={canResetCheck(match.id)} requiredWins={requiredWins} winMode={winMode} isClickable={status === 'active' || status === 'completed'} accentColor={accentColor} highlightedParticipantId={highlightedParticipantId} status={status} onParticipantSwap={onParticipantSwap} swapSource={swapSource} isSeeded={isSeeded} onHover={setHoveredMatchId} isFocusHighlight={focusMatchId === match.id} inspectorCard={renderInspectorHoverCard(match.id)} /></div>))}</div>
                      </>
                    )}
                  </div>
                );
              })}
              {(grandFinal || thirdPlaceMatch) && (
                <div className={`flex flex-col lg:min-w-[400px] ${currentMobileRound === rounds.length ? 'block' : 'hidden lg:flex'}`}>
                  <div className="text-center mb-2 h-12 flex flex-col items-center justify-end"><h3 className={`text-xl font-medieval uppercase tracking-[0.5em] ${accentText} border-b-2 border-app-border px-10 pb-1 font-bold`}>Finals</h3></div>
                  <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
                    {grandFinal && (
                      <div className="flex flex-col items-center gap-4">
                        <MatchNode match={grandFinal} participants={participants} onBoutWin={onBoutWin} onResetMatch={onResetMatch} onFinalizeMatch={onFinalizeMatch} canReset={canResetCheck(grandFinal.id)} requiredWins={requiredWins} winMode={winMode} isClickable={status === 'active' || status === 'completed'} accentColor={accentColor} highlightedParticipantId={highlightedParticipantId} status={status} onParticipantSwap={onParticipantSwap} swapSource={swapSource} isSeeded={isSeeded} onHover={setHoveredMatchId} isFocusHighlight={focusMatchId === grandFinal.id} inspectorCard={renderInspectorHoverCard(grandFinal.id)} />
                        {grandFinalReset && (
                          <div className="animate-in slide-in-from-top-4 duration-500">
                             <div className="text-[10px] font-black text-app-primary uppercase tracking-[0.4em] mb-2 text-center">Grand Final Reset</div>
                             <MatchNode match={grandFinalReset} participants={participants} onBoutWin={onBoutWin} onResetMatch={onResetMatch} onFinalizeMatch={onFinalizeMatch} canReset={canResetCheck(grandFinalReset.id)} requiredWins={requiredWins} winMode={winMode} isClickable={status === 'active' || status === 'completed'} accentColor={accentColor} highlightedParticipantId={highlightedParticipantId} status={status} onParticipantSwap={onParticipantSwap} swapSource={swapSource} isSeeded={isSeeded} onHover={setHoveredMatchId} isFocusHighlight={focusMatchId === grandFinalReset.id} inspectorCard={renderInspectorHoverCard(grandFinalReset.id)} />
                          </div>
                        )}
                      </div>
                    )}
                    {thirdPlaceMatch && (
                      <div className="flex flex-col items-center gap-3 py-6 border-t-2 border-app-border w-full relative">
                        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-app-text-muted absolute -top-4 px-4 bg-app-bg">Match for 3rd Place</span>
                        <MatchNode match={thirdPlaceMatch} participants={participants} onBoutWin={onBoutWin} onResetMatch={onResetMatch} onFinalizeMatch={onFinalizeMatch} canReset={canResetCheck(thirdPlaceMatch.id)} requiredWins={requiredWins} winMode={winMode} isClickable={status === 'active' || status === 'completed'} accentColor={accentColor} highlightedParticipantId={highlightedParticipantId} status={status} onParticipantSwap={onParticipantSwap} swapSource={swapSource} isSeeded={isSeeded} onHover={setHoveredMatchId} isFocusHighlight={focusMatchId === thirdPlaceMatch.id} inspectorCard={renderInspectorHoverCard(thirdPlaceMatch.id)} />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className={`flex flex-col lg:min-w-[400px] ${currentMobileRound === totalPages - 1 ? 'block' : 'hidden lg:flex'}`}>
                  <div className="h-12 mb-2 opacity-0" /><div className="flex-1 flex flex-col justify-center items-center lg:pl-24 px-4"><Podium winner={winner} accentColor={accentColor} /></div>
              </div>
            </div>
          </div>
          <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-app-surface/50 backdrop-blur-md rounded-full border border-app-border z-30 shadow-xl transition-colors">
            {Array.from({ length: totalPages }).map((_, i) => (<button key={i} onClick={() => setCurrentMobileRound(i)} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentMobileRound ? 'bg-app-primary w-4 shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'bg-app-border hover:bg-app-text-muted'}`} />))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-40 pt-4 space-y-16">
          <div className="max-w-4xl mx-auto flex flex-col gap-16">
            {rounds.map((round, rIdx) => {
              if (round.length === 0 && rIdx > 0) return null;
              return (
                <div key={rIdx} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className={`w-4 h-4 ${accentText}`} /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text-muted">Sequence Phase {rIdx + 1}</span>
                      </div>
                      <h3 className={`text-3xl sm:text-4xl font-medieval uppercase tracking-[0.2em] ${accentText} leading-none`}>{getRoundName(rIdx, rounds.length, isLoserBracket)}</h3>
                    </div>
                    <div className="h-px flex-1 bg-app-border"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-items-center">
                    {round.map((match) => (<MatchNode key={match.id} match={match} participants={participants} onBoutWin={onBoutWin} onResetMatch={onResetMatch} onFinalizeMatch={onFinalizeMatch} canReset={canResetCheck(match.id)} requiredWins={requiredWins} winMode={winMode} isClickable={status === 'active' || status === 'completed'} accentColor={accentColor} highlightedParticipantId={highlightedParticipantId} status={status} onParticipantSwap={onParticipantSwap} swapSource={swapSource} isSeeded={isSeeded} onHover={setHoveredMatchId} isFocusHighlight={focusMatchId === match.id} inspectorCard={renderInspectorHoverCard(match.id)} />))}
                  </div>
                </div>
              );
            })}
            {(grandFinal || thirdPlaceMatch) && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <TrophyIcon className="w-4 h-4 text-app-accent" /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text-muted">The Grand Finals</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-medieval uppercase tracking-[0.2em] text-app-accent leading-none">Championship</h3>
                  </div>
                  <div className="h-px flex-1 bg-app-accent/20"></div>
                </div>
                <div className="flex flex-col items-center gap-16">
                   {grandFinal && (
                     <div className="flex flex-col items-center gap-8 w-full">
                       <MatchNode match={grandFinal} participants={participants} onBoutWin={onBoutWin} onResetMatch={onResetMatch} onFinalizeMatch={onFinalizeMatch} canReset={canResetCheck(grandFinal.id)} requiredWins={requiredWins} winMode={winMode} isClickable={status === 'active' || status === 'completed'} accentColor={accentColor} highlightedParticipantId={highlightedParticipantId} status={status} onParticipantSwap={onParticipantSwap} swapSource={swapSource} isSeeded={isSeeded} onHover={setHoveredMatchId} isFocusHighlight={focusMatchId === grandFinal.id} inspectorCard={renderInspectorHoverCard(grandFinal.id)} />
                       {grandFinalReset && (
                         <div className="w-full flex flex-col items-center gap-4 py-8 border-t border-app-border">
                           <span className="text-[10px] font-black text-app-primary uppercase tracking-[0.4em]">Final Reset Match</span>
                           <MatchNode match={grandFinalReset} participants={participants} onBoutWin={onBoutWin} onResetMatch={onResetMatch} onFinalizeMatch={onFinalizeMatch} canReset={canResetCheck(grandFinalReset.id)} requiredWins={requiredWins} winMode={winMode} isClickable={status === 'active' || status === 'completed'} accentColor={accentColor} highlightedParticipantId={highlightedParticipantId} status={status} onParticipantSwap={onParticipantSwap} swapSource={swapSource} isSeeded={isSeeded} onHover={setHoveredMatchId} isFocusHighlight={focusMatchId === grandFinalReset.id} inspectorCard={renderInspectorHoverCard(grandFinalReset.id)} />
                         </div>
                       )}
                     </div>
                   )}
                   {thirdPlaceMatch && (
                     <div className="w-full flex flex-col items-center gap-6 pt-12 border-t border-app-border">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-app-text-muted bg-app-bg px-4 -mt-9">Bronze Match</span>
                        <MatchNode match={thirdPlaceMatch} participants={participants} onBoutWin={onBoutWin} onResetMatch={onResetMatch} onFinalizeMatch={onFinalizeMatch} canReset={canResetCheck(thirdPlaceMatch.id)} requiredWins={requiredWins} winMode={winMode} isClickable={status === 'active' || status === 'completed'} accentColor={accentColor} highlightedParticipantId={highlightedParticipantId} status={status} onParticipantSwap={onParticipantSwap} swapSource={swapSource} isSeeded={isSeeded} onHover={setHoveredMatchId} isFocusHighlight={focusMatchId === thirdPlaceMatch.id} inspectorCard={renderInspectorHoverCard(thirdPlaceMatch.id)} />
                     </div>
                   )}
                </div>
              </div>
            )}
            <div className="py-20 flex flex-col items-center animate-in fade-in duration-1000"><Podium winner={winner} accentColor={accentColor} /></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BracketView;