
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Judge, Player } from '../types';
import { UserPlus, Gavel, Trash2, Zap, Search } from 'lucide-react';

interface JudgesRosterProps {
  judges: Judge[];
  masterPlayers?: Player[];
  onImportPlayer?: (player: Player) => void;
  onAdd: (name: string) => void;
  onRemove: (id: number) => void;
  onAddBulk?: (count: number) => void;
  disabled: boolean;
}

const JudgesRoster: React.FC<JudgesRosterProps> = ({ 
  judges, masterPlayers = [], onImportPlayer, onAdd, onRemove, onAddBulk, disabled 
}) => {
  const [name, setName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !disabled) {
      onAdd(name.trim());
      setName('');
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (!name.trim() || !masterPlayers) return [];
    const query = name.toLowerCase();
    return masterPlayers.filter(p => 
      p.roles.includes('judge') && 
      p.name.toLowerCase().includes(query) &&
      !judges.some(j => j.name.toLowerCase() === p.name.toLowerCase())
    ).slice(0, 5);
  }, [name, masterPlayers, judges]);

  const handleSelectSuggestion = (player: Player) => {
    if (onImportPlayer) {
      onImportPlayer(player);
    } else {
      onAdd(player.name);
    }
    setName('');
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-950/30 rounded-lg"><Gavel className="w-5 h-5 text-violet-600 dark:text-violet-400" /></div>
          <h3 className="text-lg font-medieval text-app-text uppercase tracking-wider">High Judges</h3>
        </div>
        <div className="flex items-center gap-1.5">
           <Zap className="w-3.5 h-3.5 text-app-text-muted/30 fill-current" />
           {[3, 5].map(count => (
             <button key={count} onClick={() => onAddBulk?.(count)} className="px-2 py-1 bg-app-surface border border-app-border rounded-lg text-[9px] font-black text-app-text-muted hover:text-app-text transition-colors">+{count}</button>
           ))}
        </div>
      </div>

      {!disabled && (
        <div className="relative z-40">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
              type="text" 
              value={name} 
              onChange={(e) => {
                setName(e.target.value);
                setShowSuggestions(true);
              }} 
              onFocus={() => setShowSuggestions(true)}
              placeholder="Entry name..." 
              className="flex-1 bg-app-surface border-2 border-app-border rounded-xl px-4 py-2.5 text-sm text-app-text placeholder:text-app-text-muted focus:outline-none focus:border-violet-500/50 transition-all shadow-inner" 
            />
            <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white p-2.5 rounded-xl transition-all shadow-lg active:scale-95"><UserPlus className="w-5 h-5" /></button>
          </form>

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 bg-app-surface border-2 border-app-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="p-2 border-b border-app-border bg-app-surface-muted flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-app-text-muted">Registry Matches</span>
                <Search className="w-3 h-3 text-app-text-muted opacity-30" />
              </div>
              {filteredSuggestions.map(player => (
                <button 
                  key={player.id} 
                  onClick={() => handleSelectSuggestion(player)}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-violet-500/10 text-left group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-[8px] font-black text-white shadow-sm" style={{ backgroundColor: player.color }}>{player.name.charAt(0)}</div>
                    <span className="text-xs font-bold text-app-text group-hover:text-violet-600">{player.name}</span>
                  </div>
                  <UserPlus className="w-3 h-3 text-app-text-muted group-hover:text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1.5 custom-scrollbar">
        {judges.length === 0 ? (
          <p className="text-[10px] text-app-text-muted font-black uppercase tracking-widest py-8 text-center opacity-40 italic">No officials enlisted</p>
        ) : (
          judges.map(j => (
            <div key={j.id} className="flex items-center justify-between bg-app-surface border border-app-border rounded-xl px-3 py-2.5 group transition-all hover:border-violet-500/30">
              <div className="flex items-center gap-3">
                 <div className="w-6 h-6 bg-violet-100 dark:bg-violet-950/50 rounded-lg flex items-center justify-center text-[10px] font-black text-violet-600 dark:text-violet-400">{j.id}</div>
                 <span className="text-xs font-bold text-app-text">{j.name}</span>
              </div>
              {!disabled && (
                <button onClick={() => onRemove(j.id)} className="text-app-text-muted/30 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JudgesRoster;
