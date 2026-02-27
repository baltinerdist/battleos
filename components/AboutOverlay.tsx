import React from 'react';
import { X, Info, MessageSquare, Heart, Shield } from 'lucide-react';
import { APP_VERSION } from '../types';

interface AboutOverlayProps {
  onClose: () => void;
}

const AboutOverlay: React.FC<AboutOverlayProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-2xl transition-all duration-700" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900/90 border-2 border-zinc-200 dark:border-sky-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 transition-colors">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all z-10"><X className="w-6 h-6" /></button>
        <div className="p-8 sm:p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 border border-sky-200 dark:border-sky-500/20 shadow-sm"><Info className="w-8 h-8 text-sky-600 dark:text-sky-500" /></div>
          <h2 className="text-3xl font-medieval text-zinc-900 dark:text-white uppercase tracking-widest mb-2">Battle<span className="text-sky-600 dark:text-sky-400">OS</span></h2>
          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.4em] mb-8">System Provenance</p>
          <div className="space-y-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">
            <div className="bg-zinc-50 dark:bg-zinc-950/50 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 relative group shadow-inner">
              <Shield className="absolute -top-3 -left-3 w-8 h-8 text-sky-600/10 dark:text-sky-500/20 group-hover:text-sky-500/40 transition-colors" />
              <p>BattleOS is a project from <span className="text-sky-600 dark:text-sky-400 font-bold">Brother Tobias of Heraldsbridge</span>, mundanely known as Avery W. Krouse. <span className="text-zinc-400 dark:text-zinc-500">&copy; 2025-2026.</span></p>
            </div>
            <div className="flex items-start gap-4 text-left p-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg shrink-0 shadow-sm"><MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
              <div><p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-widest mb-1">Feedback & Support</p><p className="text-zinc-500 dark:text-zinc-400 text-xs">Find a bug or want a new feature? Reach Tobias on Discord: <span className="text-sky-600 dark:text-sky-400 font-mono select-all font-bold">"baltinerdist"</span></p></div>
            </div>
            <div className="flex items-start gap-4 text-left p-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg shrink-0 shadow-sm"><Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
              <div><p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-widest mb-1">Open Protocol</p><p className="text-zinc-500 dark:text-zinc-400 text-xs">BattleOS is free for use. If you use this app for your tournament, please let me know how it went!</p></div>
            </div>
          </div>
          <button onClick={onClose} className="mt-10 w-full py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 font-bold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-widest text-[10px] shadow-sm">Return to Command</button>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 text-[8px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] text-center border-t border-zinc-100 dark:border-transparent transition-colors">Unified Tactical Hub :: Protocol V{APP_VERSION}</div>
      </div>
    </div>
  );
};

export default AboutOverlay;