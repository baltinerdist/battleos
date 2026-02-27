
import React from 'react';
import { Participant, Judge } from '../types';
import { Brush, Trash2, ChevronUp, ChevronDown, CheckCircle2, Circle, Users, Palette, Gavel, AlertCircle, ShieldCheck, Layers } from 'lucide-react';
import { TOURNAMENT_FORMATS } from './TournamentSetup';

interface ArtsSetupCardProps {
  config: any;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
  masterParticipants: Participant[];
  judges: Judge[];
  index: number;
}

const ArtsSetupCard: React.FC<ArtsSetupCardProps> = ({ config, onUpdate, onRemove, masterParticipants, judges, index }) => {
  const selectedFighterIds = Array.isArray(config.selectedFighterIds) ? config.selectedFighterIds : [];
  const selectedJudgeIds = Array.isArray(config.selectedJudgeIds) ? config.selectedJudgeIds : [];
  const enabledSubcategories = Array.isArray(config.enabledSubcategories) ? config.enabledSubcategories : [];

  const toggleFighter = (id: number | string) => {
    const next = selectedFighterIds.includes(id) 
      ? selectedFighterIds.filter((fid: number | string) => fid !== id) 
      : [...selectedFighterIds, id];
    onUpdate({ selectedFighterIds: next });
  };

  const toggleJudge = (id: number) => {
    const next = selectedJudgeIds.includes(id) 
      ? selectedJudgeIds.filter((jid: number) => jid !== id) 
      : [...selectedJudgeIds, id];
    onUpdate({ selectedJudgeIds: next });
  };

  const hasNoJudges = selectedJudgeIds.length === 0;

  return (
    <div className={`bg-app-surface rounded-[2.5rem] border-2 shadow-xl overflow-hidden w-full transition-all duration-300 ${hasNoJudges ? 'border-rose-500/30' : 'border-app-border'}`}>
      <div className={`p-6 sm:p-8 flex items-center justify-between transition-colors ${!config.isExpanded ? 'hover:bg-app-surface-muted cursor-pointer' : ''}`} onClick={() => !config.isExpanded && onUpdate({ isExpanded: true })}>
        <div className="flex items-center gap-5">
          <div className={`p-3 rounded-2xl border ${hasNoJudges ? 'bg-rose-50 border-rose-200' : 'bg-violet-50 border-violet-200'}`}>
            <Brush className={`w-6 h-6 ${hasNoJudges ? 'text-rose-500' : 'text-violet-600'}`} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-medieval text-app-text uppercase tracking-wider">{config.name || `Exhibition ${index + 1}`}</h2>
              {hasNoJudges && <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full animate-pulse"><AlertCircle className="w-3 h-3 text-rose-500" /><span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Officials Required</span></div>}
            </div>
            {!config.isExpanded && (
              <div className="flex items-center gap-3 mt-1.5">
                 <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">Master Artisan Protocol</span>
                 <span className="text-[10px] text-app-text-muted font-black uppercase tracking-widest">{selectedFighterIds.length} Artisans • {selectedJudgeIds.length} Judges</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-3 text-app-text-muted hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 className="w-5 h-5" /></button>
          <button onClick={(e) => { e.stopPropagation(); onUpdate({ isExpanded: !config.isExpanded }); }} className="p-3 text-app-text-muted rounded-2xl transition-all">{config.isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}</button>
        </div>
      </div>

      {config.isExpanded && (
        <div className="p-8 sm:p-12 pt-0 space-y-10 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
               <label className="text-[11px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2 px-1"><Layers className="w-4 h-4" /> Exhibition Title</label>
               <input type="text" value={config.name} onChange={(e) => onUpdate({ name: e.target.value })} className="w-full bg-app-surface-muted border border-app-border rounded-2xl px-6 py-4 text-app-text focus:outline-none shadow-inner font-medieval tracking-wide" />
            </div>
            <div className="space-y-3">
               <label className="text-[11px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2 px-1"><Users className="w-4 h-4" /> Visibility Mode</label>
               <button onClick={() => onUpdate({ isAnonymous: !config.isAnonymous })} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${config.isAnonymous ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'bg-app-surface border-app-border text-app-text-muted hover:bg-app-surface-muted'}`}>
                  <span className="text-[11px] font-black uppercase tracking-widest">Anonymous Entry Evaluation</span>
                  {config.isAnonymous ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 opacity-30" />}
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2"><Palette className="w-4 h-4 text-violet-500" /> Artisans Enlisted ({selectedFighterIds.length})</label>
                <button onClick={() => onUpdate({ selectedFighterIds: masterParticipants.map(p => p.id) })} className="text-[10px] font-black text-violet-600 uppercase tracking-widest hover:underline">Select All</button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar p-2 bg-app-surface-muted border border-app-border rounded-[2rem] shadow-inner transition-colors">
                {masterParticipants.map(p => {
                  const isSelected = selectedFighterIds.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => toggleFighter(p.id)} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left shadow-sm ${isSelected ? 'bg-app-surface border-violet-500 text-app-text' : 'bg-app-surface border-transparent text-app-text-muted opacity-60 hover:opacity-100'}`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-violet-500' : 'text-app-border'}`} />
                      <span className="text-[11px] font-bold truncate uppercase">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <label className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${hasNoJudges ? 'text-rose-500' : 'text-app-text-muted'}`}><Gavel className={`w-4 h-4 ${hasNoJudges ? 'text-rose-500' : 'text-violet-500'}`} /> Active Jury ({selectedJudgeIds.length})</label>
                <button onClick={() => onUpdate({ selectedJudgeIds: judges.map(j => j.id) })} className="text-[10px] font-black text-violet-600 uppercase tracking-widest hover:underline">Select All</button>
              </div>
              <div className={`grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar p-2 bg-app-surface-muted border rounded-[2rem] shadow-inner transition-colors ${hasNoJudges ? 'border-rose-500/30' : 'border-app-border'}`}>
                {judges.map(j => {
                  const isSelected = selectedJudgeIds.includes(j.id);
                  return (
                    <button key={j.id} onClick={() => toggleJudge(j.id)} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left shadow-sm ${isSelected ? 'bg-app-surface border-violet-500 text-app-text' : 'bg-app-surface border-transparent text-app-text-muted opacity-60 hover:opacity-100'}`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-violet-500' : 'text-app-border'}`} />
                      <span className="text-[11px] font-bold truncate uppercase">{j.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtsSetupCard;
