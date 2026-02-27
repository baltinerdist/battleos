
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Participant, Tournament, ParticipantStats } from '../types';
import IronmanScoringPanel from './IronmanScoringPanel';
import IronmanTimer from './IronmanTimer';
import Toast from './Toast';
import { Zap, Crown, Award, Plus, Minus, Sword, Lock, Unlock, ShieldAlert, Trophy, ArrowRight, Settings as SettingsIcon } from 'lucide-react';

interface IronmanViewProps {
  tournament: Tournament;
  onWin: (ringIdx: number, participantId: number | string) => void;
  onUpdateRings: (count: number) => void;
  onComplete: () => void;
  highlightedParticipantId?: number | string | null;
}

type SizeLevel = 0 | 1 | 2 | 3;

const SIZE_CONFIGS = [
  { label: 'SM', height: 'h-16 sm:h-20', gridCols: 'grid-cols-5 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10', nameSize: 'text-[8px] sm:text-[10px]', badgeSize: 'w-4 h-4 sm:w-6 sm:h-6 text-[8px] sm:text-[9px]' },
  { label: 'MD', height: 'h-18 sm:h-24', gridCols: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8', nameSize: 'text-[9px] sm:text-xs', badgeSize: 'w-5 h-5 sm:w-7 sm:h-7 text-[9px] sm:text-[10px]' },
  { label: 'LG', height: 'h-24 sm:h-32', gridCols: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6', nameSize: 'text-xs sm:text-sm', badgeSize: 'w-6 h-6 sm:w-8 sm:h-8 text-[10px] sm:text-xs' },
  { label: 'XL', height: 'h-32 sm:h-40', gridCols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', nameSize: 'text-sm sm:text-lg', badgeSize: 'w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm' }
];

const RING_COLORS = [
  { border: 'border-sky-500', bg: 'bg-sky-500/5', ringName: 'Sky Ring' },
  { border: 'border-emerald-500', bg: 'bg-emerald-500/5', ringName: 'Emerald Ring' },
  { border: 'border-rose-500', bg: 'bg-rose-500/5', ringName: 'Rose Ring' },
  { border: 'border-amber-500', bg: 'bg-amber-500/5', ringName: 'Amber Ring' },
  { border: 'border-violet-500', bg: 'bg-violet-500/5', ringName: 'Violet Ring' },
  { border: 'border-teal-500', bg: 'bg-teal-500/5', ringName: 'Teal Ring' },
];

const getContrastColor = (bgColor: string) => {
  const blackTextColors = ['#facc15', '#84cc16'];
  return blackTextColors.includes(bgColor) ? '#000000' : '#ffffff';
};

const IronmanView: React.FC<IronmanViewProps> = ({ tournament, onWin, onUpdateRings, onComplete, highlightedParticipantId }) => {
  const [sizeLevel, setSizeLevel] = useState<SizeLevel>(1);
  const [lockedRings, setLockedRings] = useState<boolean[]>([]);
  const [isStandingsExpanded, setIsStandingsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: 'info' | 'success' }>({ isVisible: false, message: '', type: 'info' });
  
  const rings = tournament.ironmanRings || [null];
  const lastStatus = useRef(tournament.status);
  const progressedCount = tournament.progressedIds?.length || 0;
  const finalistTarget = tournament.config.finalistCount || 8;

  useEffect(() => {
    setLockedRings(prev => {
      const next = [...prev];
      while (next.length < rings.length) next.push(false);
      return next.slice(0, rings.length);
    });
  }, [rings.length]);

  const checkProgression = useCallback(() => {
    if (tournament.stage !== 'pools' || tournament.config.poolType !== 'ironman') return;
    const stats: Record<string, ParticipantStats> = tournament.ironmanStats as any || {};
    const winsReq = tournament.config.autoProgressionWins || 999;
    const streakReq = tournament.config.autoProgressionStreak || 999;
    const currentProgressed = new Set((tournament.progressedIds || []).map(String));
    let newlyProgressedName = '';
    Object.entries(stats).forEach(([pId, s]) => {
      if (currentProgressed.has(pId)) return;
      if (s.wins >= winsReq || s.maxStreak >= streakReq) {
        const p = tournament.participants.find(part => String(part.id) === pId);
        newlyProgressedName = p?.name || 'A fighter';
      }
    });
    if (newlyProgressedName) {
      setToast({ isVisible: true, message: `${newlyProgressedName} has secured a spot in the bracket!`, type: 'success' });
    }
  }, [tournament]);

  useEffect(() => { checkProgression(); }, [tournament.ironmanStats, checkProgression]);

  useEffect(() => {
    if (tournament.status === 'completed' && lastStatus.current !== 'completed') {
      setToast({ isVisible: true, message: "Match entry will lock in 10 seconds. Finalize scores now.", type: 'info' });
      const timer = setTimeout(() => { setLockedRings(new Array(rings.length).fill(true)); }, 10000);
      return () => clearTimeout(timer);
    }
    lastStatus.current = tournament.status;
  }, [tournament.status, rings.length]);

  const config = SIZE_CONFIGS[sizeLevel];
  const getOccupiedRingIndex = useCallback((pId: number | string) => rings.indexOf(pId), [rings]);

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-app-bg transition-colors">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="bg-app-surface/90 backdrop-blur-xl py-4 px-4 sm:px-6 border-b border-app-border flex items-center justify-between gap-4 relative sm:sticky top-0 z-40 shadow-sm transition-colors">
            <div className="flex items-center gap-3 sm:gap-6">
              <IronmanTimer durationMinutes={tournament.config.duration || 15} onComplete={onComplete} status={tournament.status} />
              {tournament.stage === 'pools' && (
                <div className="hidden sm:flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-app-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                     <span className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Pool Progress</span>
                  </div>
                  <div className="flex items-center gap-2 bg-app-surface-muted border border-app-border px-3 py-1 rounded-lg transition-colors">
                     <span className="text-xs font-bold text-app-primary">{progressedCount}</span>
                     <ArrowRight className="w-3 h-3 text-app-text-muted" />
                     <span className="text-xs font-bold text-app-text">{finalistTarget} finalists</span>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setShowSettings(!showSettings)} className={`p-3 rounded-2xl border transition-all shadow-lg active:scale-95 ${showSettings ? 'bg-app-primary border-app-primary text-white' : 'bg-app-surface border-app-border text-app-text-muted hover:text-app-text'}`}>
                <SettingsIcon className="w-5 h-5" />
              </button>
              {showSettings && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setShowSettings(false)} />
                  <div className="absolute top-full right-0 mt-3 w-64 bg-app-surface border-2 border-app-border rounded-[2rem] shadow-2xl z-[70] p-6 animate-in zoom-in-95 duration-200 transition-colors">
                    <div className="space-y-6">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-app-text-muted block mb-3">Engagement Zones</span>
                        <div className="flex items-center justify-between bg-app-surface-muted p-2 rounded-xl border border-app-border shadow-inner transition-colors">
                          <button onClick={() => onUpdateRings(Math.max(1, rings.length - 1))} className="w-10 h-10 flex items-center justify-center bg-app-surface hover:bg-app-surface-muted rounded-lg text-app-text-muted border border-app-border disabled:opacity-20 shadow-sm" disabled={rings.length <= 1}><Minus className="w-4 h-4" /></button>
                          <div className="text-center"><span className="text-sm font-black text-app-text block leading-none">{rings.length}</span><span className="text-[7px] text-app-text-muted uppercase font-black">Rings</span></div>
                          <button onClick={() => onUpdateRings(Math.min(RING_COLORS.length, rings.length + 1))} className="w-10 h-10 flex items-center justify-center bg-app-surface hover:bg-app-surface-muted rounded-lg text-app-text-muted border border-app-border disabled:opacity-20 shadow-sm" disabled={rings.length >= RING_COLORS.length}><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-app-text-muted block mb-3">Interface Density</span>
                        <div className="flex items-center justify-between bg-app-surface-muted p-2 rounded-xl border border-app-border shadow-inner transition-colors">
                          <button onClick={() => setSizeLevel(p => Math.max(0, p - 1) as SizeLevel)} className="w-10 h-10 flex items-center justify-center bg-app-surface hover:bg-app-surface-muted rounded-lg text-app-text-muted border border-app-border disabled:opacity-20 shadow-sm" disabled={sizeLevel === 0}><Minus className="w-4 h-4" /></button>
                          <div className="text-center"><span className="text-sm font-black text-app-text block leading-none">{config.label}</span><span className="text-[7px] text-app-text-muted uppercase font-black">Scale</span></div>
                          <button onClick={() => setSizeLevel(p => Math.min(3, p + 1) as SizeLevel)} className="w-10 h-10 flex items-center justify-center bg-app-surface hover:bg-app-surface-muted rounded-lg text-app-text-muted border border-app-border disabled:opacity-20 shadow-sm" disabled={sizeLevel === 3}><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-2 sm:p-6 transition-all duration-500">
            <div className="max-w-7xl mx-auto space-y-2 sm:space-y-4 pb-24 transition-all duration-500">
              {rings.map((occId, rIdx) => {
                const ringTheme = RING_COLORS[rIdx % RING_COLORS.length];
                const occupant = tournament.participants.find(p => p.id === occId);
                const isRingLocked = lockedRings[rIdx];
                const canRingAction = (tournament.status === 'active' || tournament.status === 'completed') && !isRingLocked;

                return (
                  <div key={rIdx} className={`relative p-3 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 sm:border-4 ${ringTheme.border} ${ringTheme.bg} transition-all duration-700 shadow-xl ${isRingLocked ? 'grayscale-[0.8] opacity-80' : ''}`}>
                    <div className="hidden sm:flex items-center justify-between mb-8 px-2">
                      <div className="flex items-center gap-4">
                         <button onClick={() => setLockedRings(prev => { const next = [...prev]; next[rIdx] = !next[rIdx]; return next; })} className={`p-2 rounded-xl transition-all shadow-lg border relative group ${isRingLocked ? 'bg-rose-500/10 border-rose-500' : `bg-app-surface border-app-border hover:border-app-text-muted`}`}>
                           {isRingLocked ? <Lock className="w-6 h-6 text-rose-500 group-hover:hidden" /> : <Sword className={`w-6 h-6 ${ringTheme.border.replace('border-', 'text-')}`} />}
                           {isRingLocked && <Unlock className="w-6 h-6 text-emerald-500 hidden group-hover:block" />}
                         </button>
                         <div>
                           <h2 className="text-2xl font-medieval text-app-text uppercase tracking-wider leading-none mb-1 flex items-center gap-2">{ringTheme.ringName}{isRingLocked && <ShieldAlert className="w-4 h-4 text-rose-500" />}</h2>
                           <p className="text-[9px] font-black text-app-text-muted uppercase tracking-widest opacity-60">Engagement Zone {rIdx + 1}</p>
                         </div>
                      </div>
                      {occupant && (
                        <div className="flex items-center gap-4 bg-app-surface/90 px-6 py-3 rounded-2xl border border-app-border animate-in fade-in slide-in-from-right-4 shadow-xl transition-colors">
                          <div className="text-right"><p className="text-[9px] font-black text-app-text-muted uppercase tracking-widest mb-1">Current King</p><p className="text-lg font-bold text-app-text leading-none">{occupant.name}</p></div>
                          <div className="flex flex-col items-center"><Crown className={`w-6 h-6 mb-1 ${ringTheme.border.replace('border-', 'text-')} fill-current drop-shadow-sm`} /><span className="text-[10px] font-black text-app-primary">STREAK: {tournament.ironmanStats?.[occupant.id]?.currentStreak || 0}</span></div>
                        </div>
                      )}
                    </div>

                    <div className={`grid ${config.gridCols} gap-1 sm:gap-4 transition-all duration-500`}>
                      {tournament.participants.map(p => {
                        const occIdx = getOccupiedRingIndex(p.id);
                        const isOccThis = occIdx === rIdx;
                        const isOccOther = occIdx !== -1 && !isOccThis;
                        const stats = tournament.ironmanStats?.[p.id];
                        const isProg = (tournament.progressedIds || []).map(String).includes(String(p.id));

                        return (
                          <button key={p.id} disabled={!canRingAction || isOccOther} onClick={() => onWin(rIdx, p.id)} className={`relative group ${config.height} rounded-2xl border-2 transition-all transform active:scale-95 flex flex-col items-center justify-center gap-1 overflow-hidden shadow-sm ${!canRingAction ? 'grayscale opacity-40 cursor-not-allowed' : 'hover:shadow-2xl'} ${isOccThis ? `${ringTheme.border} ring-4 ${ringTheme.border.replace('border-', 'ring-')}/10 bg-app-surface z-10 scale-105 shadow-xl` : 'border-app-border bg-app-surface hover:border-app-text-muted'} ${isOccOther ? 'opacity-20 grayscale pointer-events-none' : ''} ${highlightedParticipantId === p.id ? 'ring-2 ring-app-accent border-app-accent shadow-[0_0_15px_rgba(var(--accent),0.2)]' : ''} ${isProg ? 'border-app-accent bg-app-accent/5 ring-4 ring-app-accent/10 shadow-[0_0_15px_rgba(var(--accent),0.2)]' : ''}`}>
                            <div className={`${config.badgeSize} rounded-lg flex items-center justify-center font-bold shadow-md transition-transform group-hover:scale-110`} style={{ backgroundColor: p.color, color: getContrastColor(p.color) }}><span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">{p.id}</span></div>
                            {isOccThis && <div className="absolute top-0.5 sm:top-2 right-0.5 sm:right-2"><Crown className={`w-3 h-3 sm:w-6 h-6 ${ringTheme.border.replace('border-', 'text-')} fill-current animate-in zoom-in duration-300`} /></div>}
                            {isProg && <div className="absolute top-0.5 sm:top-2 left-0.5 sm:left-2"><Trophy className="w-2 h-2 sm:w-4 h-4 text-app-accent fill-current animate-in slide-in-from-top-2 duration-500" /></div>}
                            <div className="flex flex-col items-center gap-0 w-full px-1 overflow-hidden">
                              <div className={`${config.nameSize} font-bold uppercase tracking-widest text-app-text text-center truncate w-full leading-tight ${isProg ? 'text-app-accent' : ''}`}>{p.name}</div>
                              <div className="flex items-center gap-2 opacity-60 text-[7px] sm:text-[10px] font-black uppercase text-app-text-muted mt-0.5 sm:mt-1">
                                  <div className="flex items-center gap-0.5"><Award className="w-2.5 h-2.5" />{stats?.wins || 0}</div>
                                  {stats?.currentStreak && isOccThis ? <div className={`flex items-center gap-0.5 ${ringTheme.border.replace('border-', 'text-')}`}><Zap className="w-2.5 h-2.5 fill-current" />{stats.currentStreak}</div> : null}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <IronmanScoringPanel 
        tournament={tournament}
        highlightedParticipantId={highlightedParticipantId}
        isExpanded={isStandingsExpanded}
        onToggleExpand={() => setIsStandingsExpanded(!isStandingsExpanded)}
      />
      <Toast isVisible={toast.isVisible} message={toast.message} duration={toast.type === 'success' ? 5000 : 8000} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </div>
  );
};

export default IronmanView;
