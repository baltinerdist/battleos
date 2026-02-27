
import React, { useMemo, useState } from 'react';
import { Match, Participant, Tournament, Judge } from '../types';
import StandingsBoard, { StandingEntry } from './StandingsBoard';
import { DIVISIONS } from './TournamentSetup';
import { 
  Palette, Brush, Trophy, Award, BookOpen, Scissors, 
  PlusCircle, Trash2, Gavel, User, 
  LayoutList, Swords, ChevronDown, ChevronRight, 
  Maximize2, Minimize2, Sword, Shield, 
  ShieldCheck, Wrench, Shirt, Gem, Feather, PenTool, 
  Utensils, Music, Scroll, GraduationCap, MessageSquareText,
  StickyNote, X, CheckCircle2, FilterX
} from 'lucide-react';

interface ArtsListingViewProps {
  tournament: Tournament;
  onUpdateMatch: (matchId: string, updates: Partial<Match>) => void;
  onAddEntry: () => void;
  onDeleteEntry: (matchId: string) => void;
  highlightedParticipantId?: number | string | null;
}

const getContrastColor = (bgColor: string) => {
  const blackTextColors = ['#facc15', '#84cc16'];
  return blackTextColors.includes(bgColor) ? '#000000' : '#ffffff';
};

export const calculateEntryScore = (scores: Record<number, number> | undefined, passes: Record<number, boolean> | undefined, protocol: string = 'full'): number => {
  if (!scores) return 0;
  const values = Object.entries(scores).filter(([judgeId, val]) => { const jId = parseInt(judgeId); const isPass = passes?.[jId]; return !isPass && val !== undefined && val !== null; }).map(([_, val]) => val);
  if (values.length === 0) return 0;
  let processed = [...values];
  if (protocol !== 'count-zeros') processed = processed.filter(v => v !== 0);
  if (processed.length === 0) return 0;
  if (protocol === 'drop-lowest' && processed.length > 1) { processed.sort((a, b) => a - b).shift(); } else if (protocol === 'drop-highest' && processed.length > 1) { processed.sort((a, b) => b - a).shift(); } else if (protocol === 'outliers' && processed.length > 2) { processed.sort((a, b) => a - b); processed.shift(); processed.pop(); }
  const sum = processed.reduce((acc, val) => acc + val, 0);
  return Number((sum / processed.length).toFixed(2));
};

interface FeedbackModalProps {
  match: Match | null;
  judges: Judge[];
  artisanName: string;
  onClose: () => void;
  onUpdateMatch: (matchId: string, updates: Partial<Match>) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ match, judges, artisanName, onClose, onUpdateMatch }) => {
  if (!match) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950/40 dark:bg-zinc-950/90 backdrop-blur-xl transition-all" onClick={onClose} />
      <div className="relative w-full max-w-5xl h-full max-h-[85vh] bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 transition-colors">
        <div className="px-10 py-8 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl"><StickyNote className="w-8 h-8 text-violet-600 dark:text-violet-400" /></div>
            <div>
              <h2 className="text-2xl font-medieval text-zinc-900 dark:text-white uppercase tracking-wider leading-none mb-2">Exhibition Feedback</h2>
              <div className="flex items-center gap-3"><span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{artisanName}</span><span className="text-[10px] text-zinc-300 dark:text-zinc-700 font-black uppercase tracking-widest">/</span><span className="text-[10px] text-violet-600 dark:text-violet-400 font-black uppercase tracking-widest">{match.title || 'Untitled Exhibition'}</span></div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-400 rounded-2xl transition-all shadow-lg active:scale-95"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white dark:bg-zinc-900">
          <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {judges.map(judge => {
              const noteValue = match.judgeNotes?.[judge.id] || '';
              return (
                <div key={judge.id} className="space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50 pb-1"><div className="flex items-center gap-3"><Gavel className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" /><h3 className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Feedback from {judge.name}</h3></div></div>
                  <textarea value={noteValue} rows={1} onChange={(e) => { const nextNotes = { ...(match.judgeNotes || {}), [judge.id]: e.target.value }; onUpdateMatch(match.id, { judgeNotes: nextNotes }); }} placeholder={`Enter specific feedback and critique from ${judge.name}...`} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-zinc-900 dark:text-zinc-300 focus:outline-none focus:border-violet-500/30 transition-all resize-none shadow-inner" />
                </div>
              );
            })}
            {judges.length === 0 && <div className="text-center py-20 text-zinc-500 italic">No judges were assigned during exhibition programming.</div>}
          </div>
        </div>
        <div className="px-10 py-6 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest"><span>Autosave Protocol Active</span></div>
           <button onClick={onClose} className="flex items-center gap-3 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-violet-900/20"><CheckCircle2 className="w-5 h-5" />Complete Review</button>
        </div>
      </div>
    </div>
  );
};

const ArtsListingView: React.FC<ArtsListingViewProps> = ({ tournament, onUpdateMatch, onAddEntry, onDeleteEntry, highlightedParticipantId }) => {
  const [viewMode, setViewMode] = useState<'entry' | 'artisan'>('entry');
  const [filterDivision, setFilterDivision] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [feedbackMatchId, setFeedbackMatchId] = useState<string | null>(null);
  const entries = tournament.rounds?.[0] || [];
  const draftedJudges = (tournament.config as any)?.draftedJudges as Judge[] || [];
  const isAnonymous = tournament.config.isAnonymous;
  const enabledSubcategories = tournament.config.enabledSubcategories || [];
  const filteredDivisions = useMemo(() => { return DIVISIONS.map(div => { const filteredSubs = div.subcategories.filter(s => enabledSubcategories.includes(s.id)); if (filteredSubs.length === 0) return null; return { ...div, subcategories: filteredSubs }; }).filter(Boolean) as typeof DIVISIONS; }, [enabledSubcategories]);
  const entriesWithScores = useMemo(() => { return entries.map(e => ({ ...e, calculatedScore: calculateEntryScore(e.judgeScores, e.judgePasses, tournament.config.scoringCondition) })); }, [entries, tournament.config.scoringCondition]);
  const activeFeedbackMatch = useMemo(() => entries.find(e => e.id === feedbackMatchId) || null, [entries, feedbackMatchId]);
  const standingsData = useMemo(() => {
    const dataToProcess = filterDivision ? entriesWithScores.filter(e => e.division === filterDivision) : entriesWithScores;
    if (viewMode === 'entry') {
      return [...dataToProcess].sort((a, b) => b.calculatedScore - a.calculatedScore || String(a.participant1Id).localeCompare(String(b.participant1Id))).map((entry, idx) => {
          const p = tournament.participants.find(part => part.id === entry.participant1Id);
          if (!p) return null;
          const divisionInfo = DIVISIONS.find(d => d.id === entry.division);
          const Icon = divisionInfo?.icon || LayoutList;
          const displayParticipant = isAnonymous ? { ...p, name: `Artisan #${p.id}` } : p;
          return { participant: displayParticipant, rank: idx + 1, primaryStat: { label: 'Score', value: entry.calculatedScore }, secondaryStat: { label: <Icon className="w-3 h-3" />, value: entry.title || 'Untitled' }, isWinner: idx === 0 && entry.calculatedScore > 0, isHighlighted: highlightedParticipantId === p.id } as StandingEntry;
        }).filter(Boolean) as StandingEntry[];
    } else {
      const artisanGroups: Record<string, { sum: number; count: number; participant: Participant }> = {};
      dataToProcess.forEach(entry => { if (entry.participant1Id === null) return; const p = tournament.participants.find(part => part.id === entry.participant1Id); if (!p) return; const pIdStr = String(entry.participant1Id); if (!artisanGroups[pIdStr]) { artisanGroups[pIdStr] = { sum: 0, count: 0, participant: p }; } artisanGroups[pIdStr].sum += entry.calculatedScore; artisanGroups[pIdStr].count += 1; });
      return Object.values(artisanGroups).map(group => ({ participant: group.participant, average: Number((group.sum / group.count).toFixed(2)), count: group.count })).sort((a, b) => b.average - a.average || String(a.participant.id).localeCompare(String(b.participant.id))).map((data, idx) => { const displayParticipant = isAnonymous ? { ...data.participant, name: `Artisan #${data.participant.id}` } : data.participant; return { participant: displayParticipant, rank: idx + 1, primaryStat: { label: 'Avg Score', value: data.average }, secondaryStat: { label: <User className="w-3 h-3" />, value: `${data.count} ${data.count === 1 ? 'Entry' : 'Entries'}` }, isWinner: idx === 0 && data.average > 0, isHighlighted: highlightedParticipantId === data.participant.id } as StandingEntry; });
    }
  }, [entriesWithScores, tournament.participants, highlightedParticipantId, viewMode, isAnonymous, filterDivision]);

  const topScore = standingsData[0]?.primaryStat.value || 0;
  const artisanForFeedback = useMemo(() => { if (!activeFeedbackMatch) return ''; const p = tournament.participants.find(p => p.id === activeFeedbackMatch.participant1Id); return isAnonymous ? `Artisan #${p?.id}` : (p?.name || 'Unassigned'); }, [activeFeedbackMatch, tournament.participants, isAnonymous]);

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <StandingsBoard 
        entries={standingsData} title="Hall of Fame" subtitle={`Judging: ${tournament.config.scoringCondition?.toUpperCase().replace('-', ' ')}`} icon={<Trophy className="w-6 h-6 text-violet-500" />} className="w-full md:w-80 border-r border-zinc-200 dark:border-zinc-800"
        headerActions={
          <div className="flex flex-col gap-3 w-full">
            <div className="flex bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 w-full">
              <button onClick={() => setViewMode('entry')} className={`flex-1 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'entry' ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400'}`}>Entry</button>
              <button onClick={() => setViewMode('artisan')} className={`flex-1 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'artisan' ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-400'}`}>Artisan</button>
            </div>
            <div className="flex flex-col gap-1.5 px-0.5">
              <div className="flex items-center justify-between px-1"><span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Division Filter</span>{filterDivision && <button onClick={() => setFilterDivision(null)} className="text-[7px] font-black text-violet-600 dark:text-violet-500 uppercase tracking-widest hover:text-violet-400 flex items-center gap-1"><FilterX className="w-2 h-2" /> Clear</button>}</div>
              <div className="grid grid-cols-4 gap-1">{DIVISIONS.map(div => { const Icon = div.icon; const isActive = filterDivision === div.id; return (<button key={div.id} onClick={() => setFilterDivision(isActive ? null : div.id)} className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${isActive ? `bg-violet-50 dark:bg-violet-500/10 border-violet-500 ${div.color}` : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-400'}`} title={div.label}><Icon className="w-3.5 h-3.5" /><span className="text-[6px] font-black uppercase mt-0.5 tracking-tighter">{div.label}</span></button>); })}</div>
            </div>
          </div>
        }
        footer={<div className="flex items-center gap-2 text-[9px] text-zinc-500 uppercase font-bold"><Award className="w-3.5 h-3.5" /><span>Live Judging Active</span></div>}
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar relative bg-zinc-50 dark:bg-zinc-950 transition-colors">
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-100 dark:bg-violet-500/10 rounded-2xl border border-violet-200 dark:border-violet-500/20"><Palette className="w-8 h-8 text-violet-600 dark:text-violet-400" /></div>
              <div><h2 className="text-3xl font-medieval text-zinc-900 dark:text-white uppercase tracking-widest">{tournament.name}</h2><p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Artisan Registration</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 gap-1 shadow-sm">
                 <button onClick={() => setCollapsedIds(new Set())} title="Expand All" className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-lg"><Maximize2 className="w-4 h-4" /></button>
                 <button onClick={() => setCollapsedIds(new Set(entries.map(e => e.id)))} title="Collapse All" className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-lg"><Minimize2 className="w-4 h-4" /></button>
              </div>
              <button onClick={onAddEntry} className="flex items-center gap-3 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-violet-900/20"><PlusCircle className="w-5 h-5" /> Log New Entry</button>
            </div>
          </div>
          <div className="space-y-4">
            {entriesWithScores.length === 0 ? (
              <div className="text-center py-32 space-y-6"><LayoutList className="w-16 h-16 text-zinc-300 dark:text-zinc-800 mx-auto" /><p className="text-zinc-500 font-medieval italic text-xl">The exhibition halls are silent. Add an entry to begin the judging.</p></div>
            ) : (
              entriesWithScores.map((entry) => {
                const artisan = tournament.participants.find(p => p.id === entry.participant1Id);
                const isLeading = entry.calculatedScore > 0 && entry.calculatedScore === topScore;
                const isCollapsed = collapsedIds.has(entry.id);
                const isComplete = (Object.keys(entry.judgeScores || {}).length + Object.keys(entry.judgePasses || {}).filter(id => entry.judgePasses![parseInt(id)]).length) >= draftedJudges.length;
                const activeDivision = filteredDivisions.find(d => d.id === entry.division);
                const hasFeedback = entry.judgeNotes && Object.values(entry.judgeNotes).some(n => (n as string)?.trim().length > 0);
                return (
                  <div key={entry.id} className={`relative bg-white dark:bg-zinc-900/40 border-2 rounded-[2.5rem] transition-all duration-300 shadow-sm ${isLeading ? 'border-violet-500/50 bg-violet-50/30 dark:bg-violet-950/5' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'} ${isCollapsed ? 'p-4' : 'p-6'}`}>
                    <div className={`${isCollapsed ? 'flex items-center justify-between' : 'grid grid-cols-1 lg:grid-cols-12 gap-8'}`}>
                      <div className={`${isCollapsed ? 'flex items-center gap-4 flex-1' : 'lg:col-span-4 space-y-6'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <button onClick={() => setCollapsedIds(prev => { const next = new Set(prev); if (next.has(entry.id)) next.delete(entry.id); else next.add(entry.id); return next; })} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 dark:text-zinc-600 transition-colors">{isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</button>
                            <div className={`${isCollapsed ? 'w-8 h-8 rounded-lg text-xs' : 'w-12 h-12 rounded-2xl text-lg'} flex-shrink-0 flex items-center justify-center font-bold shadow-lg`} style={{ backgroundColor: artisan?.color || '#333', color: artisan ? getContrastColor(artisan.color) : '#fff' }}>{artisan?.id || '?'}</div>
                            <div className="flex-1 min-w-[120px]">
                              {isCollapsed ? (<div className="flex items-center gap-3"><span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest truncate max-w-[150px]">{isAnonymous ? `Artisan #${artisan?.id}` : (artisan?.name || 'Unassigned')}</span><span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">/ {entry.title || 'Untitled'}</span>{isComplete && <div className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20">Complete</div>}</div>) : (<><select value={entry.participant1Id || ''} onChange={(e) => onUpdateMatch(entry.id, { participant1Id: isNaN(parseInt(e.target.value)) ? e.target.value : parseInt(e.target.value) })} className="w-full bg-transparent text-xl font-bold text-zinc-900 dark:text-white focus:outline-none appearance-none cursor-pointer hover:text-violet-600 dark:hover:text-violet-400"><option value="" disabled className="bg-white dark:bg-zinc-900 text-zinc-400">Select Artisan...</option>{tournament.participants.map(p => (<option key={p.id} value={p.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-300">{isAnonymous ? `Artisan #${p.id}` : p.name}</option>))}</select><div className="flex items-center gap-2 mt-1"><span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Entry #{entry.matchIndex + 1}</span>{isComplete && <div className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20">Complete</div>}</div></>)}
                            </div>
                          </div>
                          {!isCollapsed && <button onClick={() => onDeleteEntry(entry.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                        </div>
                        {!isCollapsed && (<div className="space-y-4"><input type="text" placeholder="Exhibition Title..." value={entry.title || ''} onChange={(e) => onUpdateMatch(entry.id, { title: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-violet-500/30 transition-all shadow-inner" /><div className="space-y-2"><div className="grid grid-cols-4 gap-2">{filteredDivisions.map(div => (<button key={div.id} onClick={() => onUpdateMatch(entry.id, { division: div.id as any, subcategory: undefined })} className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all group shadow-sm ${entry.division === div.id ? `bg-white dark:bg-zinc-950 border-violet-500 ${div.color}` : 'bg-transparent border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300'}`}><div.icon className="w-6 h-6 mb-1" /><span className="text-[7px] font-black uppercase tracking-widest">{div.label}</span></button>))}</div>{activeDivision && (<div className="p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl animate-in zoom-in-95 fade-in duration-300 shadow-inner"><p className="text-[8px] text-zinc-400 dark:text-zinc-600 uppercase font-black tracking-widest mb-2 px-1">Enabled Subcategory</p><div className="flex flex-wrap gap-2">{activeDivision.subcategories.map(sub => (<button key={sub.id} onClick={() => onUpdateMatch(entry.id, { subcategory: sub.id })} className={`p-2 rounded-xl border-2 transition-all group relative shadow-sm ${entry.subcategory === sub.id ? 'bg-white dark:bg-zinc-900 border-violet-500 text-violet-600 dark:text-violet-400' : 'bg-transparent border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-500'}`} title={sub.label}><sub.icon className="w-5 h-5" /></button>))}</div></div>)}</div></div>)}
                      </div>
                      {isCollapsed ? (<div className="flex items-center gap-6 pr-4"><div className="flex flex-col items-end"><span className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Entry Mean</span><span className="text-xl font-medieval text-zinc-900 dark:text-white leading-none">{entry.calculatedScore}</span></div><button onClick={() => setFeedbackMatchId(entry.id)} className={`p-2 transition-colors rounded-xl ${hasFeedback ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400' : 'text-zinc-300 dark:text-zinc-700 hover:text-violet-500'}`} title="Judging Feedback"><MessageSquareText className="w-4 h-4" /></button></div>) : (<div className="lg:col-span-8 flex flex-col gap-6"><div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800/50 flex flex-col shadow-inner"><div className="flex items-center justify-between mb-6"><div className="flex items-center gap-4"><div className="flex items-center gap-2"><Gavel className="w-4 h-4 text-zinc-400 dark:text-zinc-600" /><span className="text-[10px] font-black text-zinc-500 dark:text-zinc-600 uppercase tracking-widest">Judging Panel</span></div><button onClick={() => setFeedbackMatchId(entry.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest shadow-sm ${hasFeedback ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}><StickyNote className="w-4 h-4" /> {hasFeedback ? 'Edit Feedback' : 'Add Feedback'}</button></div><div className="flex items-center gap-2"><span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Final Mean:</span><span className="text-2xl font-medieval text-zinc-900 dark:text-white">{entry.calculatedScore}</span></div></div><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">{draftedJudges.map(judge => { const isPassed = entry.judgePasses?.[judge.id]; const scoreValue = entry.judgeScores?.[judge.id]; return (<div key={judge.id} className="relative group/judge flex flex-col gap-2"><div className={`flex flex-col items-center gap-2 p-3 bg-white dark:bg-zinc-900 border transition-all rounded-2xl w-full shadow-sm ${isPassed ? 'opacity-30' : 'border-zinc-200 dark:border-zinc-800'}`}><span className="text-[8px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest truncate w-full text-center leading-none">{judge.name}</span><div className="relative w-full">{isPassed ? (<div className="w-full h-8 flex items-center justify-center text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-600 tracking-widest">Pass</div>) : (<input type="number" value={scoreValue ?? ''} step="0.01" onChange={(e) => { const val = parseFloat(e.target.value); const nextScores = { ...(entry.judgeScores || {}), [judge.id]: isNaN(val) ? 0 : val }; onUpdateMatch(entry.id, { judgeScores: nextScores }); }} placeholder="0" className="w-full bg-zinc-50 dark:bg-zinc-950 text-center text-lg font-medieval text-violet-600 dark:text-violet-400 focus:outline-none rounded-lg py-0.5 border border-zinc-200 dark:border-zinc-800 shadow-inner" />)}</div></div><button onClick={() => { const nextPasses = { ...(entry.judgePasses || {}), [judge.id]: !isPassed }; onUpdateMatch(entry.id, { judgePasses: nextPasses }); }} className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-[7px] font-black uppercase opacity-0 group-hover/judge:opacity-100 transition-all z-20 shadow-lg text-zinc-500 dark:text-zinc-300">{isPassed ? 'Undo Pass' : 'Pass Scoring'}</button></div>); })}</div></div></div>)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
      <FeedbackModal key={feedbackMatchId || 'none'} match={activeFeedbackMatch} judges={draftedJudges} artisanName={artisanForFeedback} onClose={() => setFeedbackMatchId(null)} onUpdateMatch={onUpdateMatch} />
    </div>
  );
};

export default ArtsListingView;
