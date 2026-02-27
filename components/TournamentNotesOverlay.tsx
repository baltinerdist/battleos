
import React, { useState, useEffect } from 'react';
import { X, StickyNote, Save, CheckCircle2 } from 'lucide-react';

interface TournamentNotesOverlayProps {
  initialNotes: string;
  tournamentName: string;
  onSave: (notes: string) => void;
  onClose: () => void;
}

const TournamentNotesOverlay: React.FC<TournamentNotesOverlayProps> = ({ 
  initialNotes, 
  tournamentName, 
  onSave, 
  onClose 
}) => {
  const [notes, setNotes] = useState(initialNotes);

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950/40 dark:bg-zinc-950/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 transition-colors">
        <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
              <StickyNote className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-medieval text-zinc-900 dark:text-white uppercase tracking-wider leading-none mb-1">Marshal's Log</h2>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{tournamentName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-400 rounded-xl transition-all shadow-md active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-8 bg-white dark:bg-zinc-900">
          <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-bold mb-3 block">Field Notes & Combat Commentary</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record significant events, equipment failures, or notable displays of prowess..."
            className="w-full h-64 bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-amber-500/30 transition-all resize-none shadow-inner custom-scrollbar"
            autoFocus
          />
        </div>

        <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
           <div className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
             Record will be archived in tournament report
           </div>
           <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-amber-900/20"
           >
             <CheckCircle2 className="w-4 h-4" />
             Seize Record
           </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentNotesOverlay;
