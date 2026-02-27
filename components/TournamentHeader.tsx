import React, { useState, useMemo } from 'react';
import { Sword, ChevronDown, Home, Trash2, Trophy, Users, HelpCircle, Activity, Clock, History, Settings, Palette, Save, LogOut, Plus, Play, Zap } from 'lucide-react';
import { Tournament } from '../types';
import ThemeSwitcher from './ThemeSwitcher';
import { WEAPON_CLASSES, TOURNAMENT_FORMATS } from './TournamentSetup';

interface TournamentHeaderProps {
  eventName: string;
  tournaments: Tournament[];
  activeTournament: Tournament | null;
  onSwitchTournament: (id: string) => void;
  onStartTournament: (id: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
  onToggleRoster: () => void;
  onShowHelp: () => void;
  onSimulate: () => void;
  isRosterOpen: boolean;
  dataManagerSlot: React.ReactNode;
  isAutoSaving?: boolean;
}

const TournamentHeader: React.FC<TournamentHeaderProps> = ({
  eventName, tournaments, activeTournament,
  onSwitchTournament, onStartTournament, onCreateNew, onDelete, 
  onToggleRoster, onShowHelp, onSimulate, isRosterOpen,
  dataManagerSlot, isAutoSaving = false
}) => {
  const [showList, setShowList] = useState(false);

  const isArtsMode = activeTournament?.config.eventType === 'arts';

  const groupedTournaments = useMemo(() => {
    return {
      active: tournaments.filter(t => t.status === 'active'),
      pending: tournaments.filter(t => t.status === 'preparation' || t.status === 'draft'),
      completed: tournaments.filter(t => t.status === 'completed')
    };
  }, [tournaments]);

  const getWeaponIcon = (weaponClassId?: string, isArts?: boolean, className: string = "w-3.5 h-3.5") => {
    const list = isArts ? TOURNAMENT_FORMATS : WEAPON_CLASSES;
    const wc = list.find(w => w.id === weaponClassId);
    if (!wc) return isArts ? <Palette className={className} /> : <Settings className={className} />;
    const IconComponent = wc.icon;
    return <IconComponent className={className} />;
  };

  const renderTournamentItem = (t: Tournament) => {
    const isArts = t.config.eventType === 'arts';
    const isActive = t.id === activeTournament?.id;
    return (
      <div key={t.id} className="flex group">
        <button 
          onClick={() => { onSwitchTournament(t.id); setShowList(false); }} 
          className={`flex-1 text-left px-4 py-3 text-[11px] hover:bg-app-surface-muted flex items-center justify-between transition-colors ${isActive ? 'bg-app-primary-muted text-app-primary font-bold' : 'text-app-text-muted hover:text-app-text'}`}
        >
          <div className="flex items-center gap-3 truncate">
            <div className={`p-1.5 rounded-lg border ${isActive ? 'bg-app-surface border-app-primary/30' : 'bg-app-surface-muted border-app-border'}`}>
              {getWeaponIcon(t.config.weaponClass, isArts, "w-3 h-3")}
            </div>
            <span className="truncate">{t.name}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {t.status === 'completed' && <Trophy className="w-3 h-3 text-app-accent" />}
            {t.status === 'active' && <Activity className={`w-3 h-3 ${isArts ? 'text-violet-500' : 'text-app-primary'} animate-pulse`} />}
          </div>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} 
          className="px-3 hover:bg-rose-500/10 text-app-text-muted/30 hover:text-rose-500 transition-colors border-l border-app-border"
          title="Delete record"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <header className="bg-app-surface border-b border-app-border px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 z-50 shadow-sm gap-3 sm:gap-6 transition-all duration-300">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-app-primary rounded-xl shadow-lg shadow-app-primary/20`}>
            {isArtsMode ? <Palette className="w-6 h-6 text-white" /> : <Sword className="w-6 h-6 text-white" />}
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-xl sm:text-2xl font-medieval tracking-widest leading-none text-app-text">
              Battle<span className="text-app-primary">OS</span>
            </h1>
            <span className="text-[9px] font-bold uppercase tracking-widest text-app-text-muted mt-1">{eventName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="relative">
              <button 
                onClick={() => setShowList(!showList)} 
                className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all text-[11px] font-black uppercase tracking-widest ${showList ? 'bg-app-surface border-app-primary text-app-primary' : 'bg-app-surface-muted border-app-border text-app-text-muted hover:text-app-text hover:border-app-text-muted'}`}
              >
                <div className="flex items-center gap-2.5">
                  {getWeaponIcon(activeTournament?.config.weaponClass, activeTournament?.config.eventType === 'arts', "w-3.5 h-3.5")}
                  <span className="max-w-[140px] truncate">{activeTournament?.name || "Tournament Selection"}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showList ? 'rotate-180' : ''}`} />
              </button>

              {showList && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowList(false)} />
                  <div className="absolute top-full left-0 mt-2 w-72 bg-app-surface border border-app-border rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 bg-app-surface-muted border-b border-app-border flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">Tournaments</span>
                      <button onClick={() => { onCreateNew(); setShowList(false); }} className="p-2 hover:bg-app-primary-muted text-app-primary rounded-lg transition-colors" title="Add New Tournament"><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-app-surface">
                      {tournaments.length === 0 ? (
                        <div className="p-8 text-center text-[10px] text-app-text-muted italic uppercase font-bold tracking-widest opacity-50">No tournaments drafted</div>
                      ) : (
                        <div className="flex flex-col">
                          {groupedTournaments.active.length > 0 && (
                            <div>
                              <div className="px-4 py-2 bg-app-surface-muted/50 text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em] border-y border-app-border flex items-center gap-2"><Activity className="w-2.5 h-2.5" />Active Tournaments</div>
                              {groupedTournaments.active.map(renderTournamentItem)}
                            </div>
                          )}
                          {groupedTournaments.pending.length > 0 && (
                            <div>
                              <div className="px-4 py-2 bg-app-surface-muted/50 text-[8px] font-black text-app-text-muted uppercase tracking-[0.2em] border-y border-app-border flex items-center gap-2"><Clock className="w-2.5 h-2.5" />In Planning</div>
                              {groupedTournaments.pending.map(renderTournamentItem)}
                            </div>
                          )}
                          {groupedTournaments.completed.length > 0 && (
                            <div>
                              <div className="px-4 py-2 bg-app-surface-muted/50 text-[8px] font-black text-app-accent uppercase tracking-[0.2em] border-y border-app-border flex items-center gap-2"><History className="w-2.5 h-2.5" />Final Standings</div>
                              {groupedTournaments.completed.map(renderTournamentItem)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
           </div>

           {activeTournament?.status === 'preparation' && (
             <button 
               onClick={() => onStartTournament(activeTournament.id)}
               className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all active:scale-95 animate-in slide-in-from-left-4 duration-500"
             >
               <Play className="w-4 h-4 fill-current" />
               <span className="hidden md:inline">Commence Fighting</span>
             </button>
           )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-4">
        {isAutoSaving && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-app-primary-muted border border-app-primary/20 rounded-full animate-pulse transition-all">
            <Save className="w-3.5 h-3.5 text-app-primary" />
            <span className="hidden lg:inline text-[8px] font-black text-app-primary uppercase tracking-widest">Saving...</span>
          </div>
        )}

        <ThemeSwitcher />

        <button 
          onClick={onCreateNew}
          className="p-2.5 text-app-text-muted hover:text-app-primary hover:bg-app-surface-muted rounded-xl transition-all"
          title="Return to Hub"
        >
          <Home className="w-5 h-5" />
        </button>

        {activeTournament && activeTournament.status === 'active' && !isArtsMode && (
          <button 
            onClick={onSimulate}
            className="p-2.5 text-app-text-muted hover:text-app-primary hover:bg-app-surface-muted rounded-xl transition-all group relative"
            title="Simulate Tournament"
          >
            <Zap className="w-5 h-5" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-app-surface border border-app-border rounded-xl text-[9px] font-black uppercase tracking-widest text-app-text whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-75 z-[60]">
               Simulate Tournament
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-app-border" />
            </div>
          </button>
        )}
        
        {dataManagerSlot}
        
        <button 
          onClick={onShowHelp} 
          className="p-2.5 text-app-text-muted hover:text-app-text hover:bg-app-surface-muted rounded-xl transition-all"
          title="Marshal's Manual"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        
        <button 
          onClick={onToggleRoster} 
          className={`p-2.5 rounded-xl border-2 transition-all flex items-center justify-center ${isRosterOpen ? 'bg-app-primary-muted border-app-primary text-app-primary' : 'bg-app-surface-muted border-app-border text-app-text-muted hover:text-app-text'}`}
          title={isRosterOpen ? 'Hide Roster' : 'View Roster'}
        >
          <Users className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default TournamentHeader;