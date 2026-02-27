
import React, { useState, useMemo } from 'react';
import { Sword, Layers, ChevronDown, Home, Plus, Trash2, Trophy, Users, HelpCircle, Activity, Clock, History, Settings, Palette, Brush, LogOut } from 'lucide-react';
import { Tournament } from '../types';
import HelpSystem from './HelpSystem';
import { WEAPON_CLASSES, TOURNAMENT_FORMATS } from './TournamentSetup';

interface AppHeaderProps {
  eventName: string;
  eventDate: string;
  tournaments: Tournament[];
  activeTournament: Tournament | null;
  onSwitchTournament: (id: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
  onToggleRoster: () => void;
  onLeaveEvent: () => void;
  isRosterOpen: boolean;
  isSetupMode: boolean;
  dataManagerSlot: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  eventName, eventDate, tournaments, activeTournament,
  onSwitchTournament, onCreateNew, onDelete, 
  onToggleRoster, onLeaveEvent, isRosterOpen, isSetupMode,
  dataManagerSlot
}) => {
  const [showList, setShowList] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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
    return (
      <div key={t.id} className="flex group">
        <button 
          onClick={() => { onSwitchTournament(t.id); setShowList(false); }} 
          className={`flex-1 text-left px-4 py-3 text-xs hover:bg-zinc-950 flex items-center justify-between transition-colors ${t.id === activeTournament?.id ? 'bg-sky-950/20 text-sky-400 font-bold' : 'text-zinc-400'}`}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="opacity-60">{getWeaponIcon(t.config.weaponClass, isArts, "w-3 h-3")}</span>
            <span className="truncate w-32">{t.name}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {t.status === 'completed' && <Trophy className="w-3 h-3 text-amber-500" />}
            {t.status === 'active' && <Activity className={`w-3 h-3 ${isArts ? 'text-violet-500' : 'text-sky-500'} animate-pulse`} />}
          </div>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} 
          className="px-3 hover:bg-red-950/20 text-zinc-600 hover:text-red-500 transition-colors border-l border-zinc-800"
          title="Delete entry"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <>
      <header className="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${activeTournament?.config.eventType === 'arts' ? 'bg-violet-500' : 'bg-sky-500'} rounded-lg shadow-lg`}>
              {activeTournament?.config.eventType === 'arts' ? <Palette className="w-6 h-6 text-white" /> : <Sword className="w-6 h-6 text-white" />}
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-medieval tracking-widest leading-none text-white">
                Battle<span className={activeTournament?.config.eventType === 'arts' ? 'text-violet-400' : 'text-sky-400'}>OS</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">{eventName}</span>
            </div>
          </div>

          {!isSetupMode && (
            <div className="flex items-center gap-2">
              <button 
                onClick={onCreateNew}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition-all"
                title="Back to Home"
              >
                <Home className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline">Home</span>
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowList(!showList)} 
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-bold transition-all ${showList ? 'bg-zinc-800' : 'bg-zinc-900/50 hover:bg-zinc-800'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={activeTournament?.config.eventType === 'arts' ? 'text-violet-400' : 'text-sky-400'}>
                      {getWeaponIcon(activeTournament?.config.weaponClass, activeTournament?.config.eventType === 'arts', "w-3.5 h-3.5")}
                    </span>
                    <span className="max-w-[120px] truncate text-zinc-300">{activeTournament?.name || "Program Entry"}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${showList ? 'rotate-180' : ''}`} />
                </button>
                
                {showList && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowList(false)} />
                    <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col">
                      <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Operation Hub</span>
                        <button 
                          onClick={() => { onCreateNew(); setShowList(false); }} 
                          className="p-1 hover:text-sky-400 text-zinc-400 transition-colors"
                          title="Back to Home / New Entry"
                        >
                          <Home className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {tournaments.length === 0 ? (
                          <div className="p-4 text-center text-[10px] text-zinc-600 italic">No entries programmed.</div>
                        ) : (
                          <div className="flex flex-col">
                            {groupedTournaments.active.length > 0 && (
                              <div className="flex flex-col">
                                <div className="px-4 py-2 bg-zinc-950/50 text-[9px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-2 border-y border-zinc-800/50">
                                  <Activity className="w-3 h-3" />
                                  Active Exhibits
                                </div>
                                {groupedTournaments.active.map(renderTournamentItem)}
                              </div>
                            )}
                            {groupedTournaments.pending.length > 0 && (
                              <div className="flex flex-col">
                                <div className="px-4 py-2 bg-zinc-950/50 text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-y border-zinc-800/50">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </div>
                                {groupedTournaments.pending.map(renderTournamentItem)}
                              </div>
                            )}
                            {groupedTournaments.completed.length > 0 && (
                              <div className="flex flex-col">
                                <div className="px-4 py-2 bg-zinc-950/50 text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 border-y border-zinc-800/50">
                                  <History className="w-3 h-3" />
                                  Completed
                                </div>
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
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={onLeaveEvent}
            className="p-2 text-zinc-500 hover:text-sky-400 transition-colors opacity-60 hover:opacity-100"
            title="Leave Event"
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          {dataManagerSlot}
          
          <button 
            onClick={() => setShowHelp(true)} 
            className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Marshal's Manual"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          
          {!isSetupMode && (
            <button 
              onClick={onToggleRoster} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${isRosterOpen ? 'bg-sky-500 border-sky-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">{isRosterOpen ? 'Close Roster' : 'Open Roster'}</span>
            </button>
          )}
        </div>
      </header>
      {showHelp && <HelpSystem onClose={() => setShowHelp(false)} />}
    </>
  );
};

export default AppHeader;
