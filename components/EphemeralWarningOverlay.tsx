
import React from 'react';
import { AlertTriangle, ShieldAlert, ChevronRight, Info, Save } from 'lucide-react';

interface EphemeralWarningOverlayProps {
  onDismiss: () => void;
}

const EphemeralWarningOverlay: React.FC<EphemeralWarningOverlayProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-3xl transition-all duration-700" />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900/90 border-2 border-amber-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 transition-colors">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
        
        <div className="p-8 sm:p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20 shadow-sm">
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-500" />
          </div>
          
          <h2 className="text-2xl font-medieval text-zinc-900 dark:text-white uppercase tracking-widest mb-6">
            Data Persistence Warning
          </h2>
          
          <div className="space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium text-left">
            <p className="bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 shadow-inner">
              BattleOS runs in your browser on device. This means your tournament data is only saved to your browser. If you clear browsing data, you will lose your stored data.
            </p>

            <div className="bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/10 p-4 rounded-2xl flex items-center gap-4 text-left shadow-sm">
              <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-sky-200 dark:border-sky-500/30 shadow-sm">
                <Save className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <p className="text-[11px] text-sky-700 dark:text-sky-200/70 leading-tight">
                When you see this icon pulse in the corner, BattleOS is automatically committing your tournament progress to the local cache.
              </p>
            </div>
            
            <p>
              At periodic intervals, your tourney code will be exported to your clipboard. You can resume your tourney at any time by using the loading option on start.
            </p>
            
            <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10 p-4 rounded-2xl text-amber-700 dark:text-amber-200/80 text-xs">
              By clicking Begin below, you acknowledge that you <strong>should export your tourney code regularly</strong> to ensure no data loss.
            </div>
          </div>

          <button 
            onClick={onDismiss}
            className="mt-8 w-full group flex items-center justify-center gap-3 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-xl shadow-amber-900/20 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
          >
            <span>Begin Recording</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        
        <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 flex items-center justify-center gap-3 text-[8px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] transition-colors border-t border-zinc-100 dark:border-transparent">
          <ShieldAlert className="w-3 h-3" />
          <span>LOCAL PROTOCOL :: ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default EphemeralWarningOverlay;
