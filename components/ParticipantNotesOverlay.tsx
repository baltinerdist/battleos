
import React, { useState } from 'react';
import { X, StickyNote, CheckCircle2, Swords, Scissors, BookOpen, Brush, Trophy, Shield, Sword, Star } from 'lucide-react';
import { Participant } from '../types';

interface ParticipantNotesOverlayProps {
  participant: Participant;
  isArts: boolean;
  onSave: (notes: string, recommendations: string[]) => void;
  onClose: () => void;
}

const AWARD_ICONS: Record<string, { icon: React.ElementType, label: string, color: string }> = {
  griffon: { icon: Trophy, label: 'Griffon', color: 'text-amber-600' },
  warrior: { icon: Swords, label: 'Warrior', color: 'text-app-primary' },
  battle: { icon: Shield, label: 'Battle', color: 'text-rose-600' },
  owl: { icon: BookOpen, label: 'Owl', color: 'text-app-primary' },
  dragon: { icon: Brush, label: 'Dragon', color: 'text-orange-600' },
  garber: { icon: Scissors, label: 'Garber', color: 'text-emerald-600' },
  smith: { icon: Shield, label: 'Smith', color: 'text-app-text-muted' }
};

const ParticipantNotesOverlay: React.FC<ParticipantNotesOverlayProps> = ({ 
  participant, isArts, onSave, onClose 
}) => {
  const initialNotes = isArts ? participant.artsNotes : participant.martialNotes;
  const initialRecs = isArts ? participant.artsRecommendations : participant.martialRecommendations;
  const [notes, setNotes] = useState(initialNotes || '');
  const [recs, setRecs] = useState<string[]>(initialRecs || []);

  const toggleRec = (key: string) => {
    setRecs(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleSave = () => {
    onSave(notes, recs);
    onClose();
  };

  const awardsToShow = isArts 
    ? ['griffon', 'owl', 'dragon', 'garber', 'smith']
    : ['griffon', 'warrior', 'battle'];

  const themeAccent = isArts ? 'text-violet-600' : 'text-app-primary';
  const themeBg = isArts ? 'bg-violet-600' : 'bg-app-primary';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-app-bg/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-app-surface border-2 border-app-border rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 transition-colors">
        <div className="px-8 py-6 bg-app-surface-muted border-b border-app-border flex items-center justify-between shrink-0 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl shadow-sm bg-app-surface border border-app-border ${themeAccent}`}>
              <StickyNote className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-medieval text-app-text uppercase tracking-wider leading-none mb-1">Competitor Log</h2>
              <p className="text-[10px] text-app-text-muted font-black uppercase tracking-widest">{participant.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-app-surface hover:bg-app-surface-muted border border-app-border text-app-text-muted rounded-xl transition-all shadow-md active:scale-95"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 px-8 sm:px-16 py-8 space-y-10 overflow-y-auto custom-scrollbar bg-app-surface transition-colors">
          <div className="space-y-4">
             <div className="bg-app-surface-muted p-4 rounded-2xl border border-app-border text-[11px] text-app-text-muted leading-relaxed italic shadow-inner">
               "If you believe they demonstrated worthiness of receiving an award, tap icons below to note that they should be recommended."
             </div>
             <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={`${isArts ? 'Artisan' : 'Combatant'} observation log...`}
                className="w-full h-40 bg-app-surface-muted border-2 border-app-border rounded-2xl p-6 text-sm text-app-text focus:outline-none focus:border-app-primary/30 transition-all resize-none shadow-inner"
             />
          </div>

          <div className="space-y-4 px-4">
             <label className="text-[10px] uppercase tracking-[0.2em] text-app-text-muted font-bold block ml-1">Award Recommendations</label>
             <div className="flex flex-wrap gap-5 justify-start">
                {awardsToShow.map(key => {
                   const award = AWARD_ICONS[key];
                   if (!award) return null;
                   const { label, color } = award;
                   const isActive = recs.includes(key);
                   
                   const getDisplayIcon = () => {
                     if (key === 'griffon') return <span className="text-2xl font-black font-medieval tracking-tighter">Gr</span>;
                     if (key === 'warrior') return <span className="text-2xl font-black font-medieval">W</span>;
                     if (key === 'battle') return <span className="text-2xl font-black font-medieval">B</span>;
                     if (key === 'owl') return <span className="text-2xl font-black font-medieval">O</span>;
                     if (key === 'dragon') return <span className="text-2xl font-black font-medieval">D</span>;
                     if (key === 'garber') return <span className="text-2xl font-black font-medieval tracking-tighter">Ga</span>;
                     if (key === 'smith') return <span className="text-2xl font-black font-medieval">S</span>;
                     return null;
                   };

                   return (
                     <div key={key} className="relative group/rec">
                        <button 
                          onClick={() => toggleRec(key)}
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all shadow-lg active:scale-90
                            ${isActive ? `bg-app-surface border-app-accent ${color}` : 'bg-app-surface-muted border-app-border text-app-text-muted/30 hover:border-app-border hover:text-app-text-muted'}
                          `}
                        >
                           {getDisplayIcon()}
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/rec:block z-[500] pointer-events-none">
                           <div className="bg-app-surface-muted text-app-text text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-2 border-app-border whitespace-nowrap shadow-2xl">
                             Recommend for {label}
                             <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-app-border" />
                           </div>
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-app-surface-muted border-t border-app-border flex items-center justify-between shrink-0 transition-colors">
           <div className="text-[9px] font-mono text-app-text-muted uppercase tracking-widest">Type: {isArts ? 'Arts & Sciences' : 'Martial'} record</div>
           <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl ${themeBg} text-white`}
           >
             <CheckCircle2 className="w-4 h-4" /> Save Record
           </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantNotesOverlay;
