import React, { useState } from 'react';
import { Sword, FileCode, PlusCircle, LogIn, ChevronRight, X, AlertCircle, History, Calendar, Clock, Users } from 'lucide-react';
import { APP_VERSION } from '../types';

interface RecentEvent {
  id: string;
  name: string;
  date: string;
  lastUpdated: number;
}

interface WelcomeOverlayProps {
  onStartNew: () => void;
  onImport: (code: string) => boolean;
  onResume: (id: string) => boolean;
  onOpenPlayerManagement?: () => void;
  recentEvents: RecentEvent[];
  initialMode?: 'selection' | 'import';
  onClose?: () => void;
}

const formatDistanceToNow = (timestamp: number) => {
  if (!timestamp) return 'Unknown';
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ 
  onStartNew, onImport, onResume, onOpenPlayerManagement, recentEvents, initialMode = 'selection', onClose 
}) => {
  const [mode, setMode] = useState<'selection' | 'import'>(initialMode);
  const [importCode, setImportCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleImportSubmit = (e?: React.FormEvent, code?: string) => {
    if (e) e.preventDefault();
    const finalCode = code || importCode.trim();
    setError(null);
    if (!finalCode) { setError("Please provide an event code."); return; }
    const success = onImport(finalCode);
    if (!success) { setError("Invalid event code. Please ensure you copied the full code."); }
  };

  const handleResumeRecent = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setError(null);
    const success = onResume(id);
    if (!success) { setError("Failed to load local session. The record might be corrupted."); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-app-bg/80 backdrop-blur-2xl transition-all duration-700" />
      <div className="relative w-full max-w-xl bg-app-surface border border-app-border rounded-[3rem] shadow-2xl animate-in fade-in zoom-in-95 duration-500 transition-colors">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-app-primary/50 to-transparent" />
        {onClose && (<button onClick={onClose} className="absolute top-8 right-8 p-2 text-app-text-muted hover:text-app-text hover:bg-app-surface-muted rounded-xl transition-all"><X className="w-6 h-6" /></button>)}

        <div className="p-8 sm:p-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-app-primary rounded-2xl shadow-2xl shadow-app-primary/40 flex items-center justify-center mb-8 transform hover:rotate-12 transition-transform duration-500"><Sword className="w-10 h-10 text-white" /></div>
          <h1 className="text-4xl sm:text-5xl font-medieval text-app-text uppercase tracking-widest mb-4">Battle<span className="text-app-primary">OS</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-app-text-muted mb-12">Tournament Management System</p>
          
          {mode === 'selection' ? (
            <div className="grid grid-cols-1 gap-4 w-full">
              <button onClick={onStartNew} className="group flex items-center justify-between p-6 bg-app-surface-muted hover:bg-app-primary-muted border-2 border-app-border hover:border-app-primary/50 rounded-2xl transition-all text-left shadow-sm">
                <div className="flex items-center gap-4"><div className="p-3 bg-app-surface rounded-xl border border-app-border group-hover:bg-app-primary transition-colors shadow-sm"><PlusCircle className="w-6 h-6 text-app-primary group-hover:text-white" /></div><div><h3 className="text-lg font-bold text-app-text leading-none mb-1">Begin New Event</h3><p className="text-xs text-app-text-muted font-medium">Recruit fighters and prepare brackets</p></div></div>
                <ChevronRight className="w-5 h-5 text-app-text-muted group-hover:text-app-primary" />
              </button>

              {onOpenPlayerManagement && (
                <button onClick={onOpenPlayerManagement} className="group flex items-center justify-between p-6 bg-app-surface-muted hover:bg-sky-500/10 border-2 border-app-border hover:border-sky-500/50 rounded-2xl transition-all text-left shadow-sm">
                  <div className="flex items-center gap-4"><div className="p-3 bg-app-surface rounded-xl border border-app-border transition-colors shadow-sm group-hover:bg-sky-500"><Users className="w-6 h-6 text-sky-500 group-hover:text-white" /></div><div><h3 className="text-lg font-bold text-app-text leading-none mb-1">Manage Players</h3><p className="text-xs text-app-text-muted font-medium">Registry of fighters, reeves, and judges</p></div></div>
                  <ChevronRight className="w-5 h-5 text-app-text-muted group-hover:text-sky-500" />
                </button>
              )}

              {recentEvents.length > 0 && (
                <div className="w-full relative">
                    <button onClick={() => setShowHistory(!showHistory)} className="w-full group flex items-center justify-between p-6 bg-app-surface-muted border-2 border-app-border hover:border-app-text-muted rounded-2xl transition-all text-left shadow-sm">
                      <div className="flex items-center gap-4"><div className="p-3 bg-app-surface rounded-xl border border-app-border transition-colors shadow-sm"><History className="w-6 h-6 text-app-text-muted group-hover:text-app-text" /></div><div><h3 className="text-lg font-bold text-app-text leading-none mb-1">Continue Tournament</h3><p className="text-xs text-app-text-muted font-medium">Resume {recentEvents.length} Recent Session{recentEvents.length !== 1 ? 's' : ''}</p></div></div>
                      <ChevronRight className={`w-5 h-5 text-app-text-muted transition-transform ${showHistory ? 'rotate-90' : ''}`} />
                    </button>
                    {showHistory && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-app-surface border border-app-border rounded-2xl shadow-2xl z-[150] max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
                        {recentEvents.map((event) => (
                          <button key={event.id} onClick={(e) => handleResumeRecent(e, event.id)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-app-primary-muted text-left border-b border-app-border last:border-0 group transition-colors">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-bold text-app-text group-hover:text-app-primary truncate max-w-[200px]">{event.name}</span>
                              <div className="flex items-center gap-3 text-[8px] text-app-text-muted font-black uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Calendar className="w-2 h-2" /> {event.date}</span>
                                <span className="flex items-center gap-1"><Clock className="w-2 h-2" /> {formatDistanceToNow(event.lastUpdated)}</span>
                              </div>
                            </div>
                            <LogIn className="w-3.5 h-3.5 text-app-text-muted group-hover:text-app-primary" />
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              )}

              <button onClick={mode === 'selection' ? () => setMode('import') : () => handleImportSubmit()} className="group flex items-center justify-between p-6 bg-app-surface-muted hover:bg-app-accent/10 border-2 border-app-border hover:border-app-accent/50 rounded-2xl transition-all text-left shadow-sm">
                <div className="flex items-center gap-4"><div className="p-3 bg-app-surface rounded-xl border border-app-border group-hover:bg-app-accent transition-colors shadow-sm"><FileCode className="w-6 h-6 text-app-accent group-hover:text-white" /></div><div><h3 className="text-lg font-bold text-app-text leading-none mb-1">Import Event by Code</h3><p className="text-xs text-app-text-muted font-medium">Paste record code from previous session</p></div></div>
                <ChevronRight className="w-5 h-5 text-app-text-muted group-hover:text-app-accent" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleImportSubmit} className="w-full space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="relative">
                <textarea value={importCode} onChange={(e) => setImportCode(e.target.value)} placeholder="Paste your encoded event data here..." className="w-full h-40 bg-app-surface-muted border-2 border-app-border rounded-2xl p-4 text-xs font-mono text-app-text placeholder:text-app-text-muted focus:outline-none focus:border-app-accent/50 transition-all resize-none shadow-inner custom-scrollbar" />
                {error && (<div className="mt-3 flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 transition-colors"><AlertCircle className="w-3.5 h-3.5" />{error}</div>)}
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => { setMode('selection'); setError(null); }} className="flex-1 px-6 py-4 bg-app-surface-muted text-app-text-muted font-bold uppercase tracking-widest text-xs rounded-xl border border-app-border hover:bg-app-surface transition-all">Back</button>
                <button type="submit" className="flex-[2] px-6 py-4 bg-app-accent hover:bg-amber-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all active:scale-95">Load Event</button>
              </div>
            </form>
          )}
        </div>
        <div className="bg-app-surface-muted p-6 border-t border-app-border rounded-b-[3rem] flex items-center justify-center gap-4 text-[9px] font-mono text-app-text-muted uppercase tracking-[0.4em] transition-colors">
          <span>BattleOS Standard V{APP_VERSION}</span><span className="opacity-30">::</span><span>Grand Tournament Hub</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeOverlay;