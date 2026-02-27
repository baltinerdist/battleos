import React, { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Share2, FileDown, FileUp, FileText, Trash2, Clipboard, Download, FileSpreadsheet, Printer } from 'lucide-react';
import { encodeState } from '../utils/codec';
import Toast from './Toast';
import WelcomeOverlay from './WelcomeOverlay';
import { Match, Tournament, Participant, Judge } from '../types';
import { DIVISIONS } from './TournamentSetup';
import { calculateEntryScore } from './ArtsListingView';

export interface DataManagerHandle {
  exportWithToast: () => void;
  exportSilent: () => void;
}

interface DataManagerProps {
  data: {
    eventName: string;
    eventDate: string;
    kingdom: string;
    parkTitle: string;
    parkName: string;
    tournaments: Tournament[];
    participants: Participant[];
    activeTournamentId: string | null;
    nextParticipantId: number;
  };
  onImport: (code: string) => boolean;
  isSetupMode: boolean;
  onWipeData?: () => void;
  onOpenReport?: () => void;
  onPrintBracket?: () => void;
}

const DataManager = forwardRef<DataManagerHandle, DataManagerProps>(({ data, onImport, isSetupMode, onWipeData, onOpenReport, onPrintBracket }, ref) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '' });

  const activeTournament = data.tournaments.find(t => t.id === data.activeTournamentId);
  const isArtsActive = activeTournament?.config.eventType === 'arts';
  const isBracketActive = activeTournament && (activeTournament.config.type === 'single-elimination' || activeTournament.config.type === 'double-elimination');

  const performClipboardExport = useCallback(async (showToast = true) => {
    const code = encodeState(data);
    try {
      await navigator.clipboard.writeText(code);
      if (showToast) {
        setToast({
          isVisible: true,
          message: "Tactical record preserved to clipboard"
        });
      }
    } catch (err) {
      console.warn("Export failed: Clipboard access denied.", err);
    }
  }, [data]);

  const performFileExport = useCallback(() => {
    const code = encodeState(data);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const yy = now.getFullYear().toString().slice(-2);
    const dd = now.getDate().toString().padStart(2, '0');
    const hh = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    
    const filename = `battleos_${mm}_${yy}_${dd}_${hh}${min}${ss}.txt`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setToast({
      isVisible: true,
      message: `Tactical record saved as ${filename}`
    });
  }, [data]);

  const performArtsCSVExport = useCallback(() => {
    if (!activeTournament) return;
    
    const entries = activeTournament.rounds?.[0] || [];
    const draftedJudges = (activeTournament.config as any)?.draftedJudges as Judge[] || [];
    const isAnonymous = activeTournament.config.isAnonymous;
    const scoringCondition = activeTournament.config.scoringCondition;

    // Prepare Header
    const header = [
      'Entrant',
      'Entry',
      'Category',
      'Subcategory',
      'Final Mean Score',
      ...draftedJudges.map(j => `Judge ${j.name} Score`),
      ...draftedJudges.map(j => `Judge ${j.name} Feedback`)
    ];

    // Helper to escape CSV values
    const escape = (val: string | number) => {
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = entries.map(e => {
      const artisan = data.participants.find(p => p.id === e.participant1Id);
      const entrantName = isAnonymous ? `Artisan #${artisan?.id || e.participant1Id}` : (artisan?.name || 'Unassigned');
      const category = DIVISIONS.find(d => d.id === e.division)?.label || e.division || '';
      const subcategory = DIVISIONS.find(d => d.id === e.division)?.subcategories.find(s => s.id === e.subcategory)?.label || e.subcategory || '';
      const finalScore = calculateEntryScore(e.judgeScores, e.judgePasses, scoringCondition);

      const scores = draftedJudges.map(j => {
        if (e.judgePasses?.[j.id]) return 'PASS';
        return e.judgeScores?.[j.id] ?? '';
      });

      const feedbacks = draftedJudges.map(j => (e.judgeNotes?.[j.id] || ''));

      return [
        entrantName,
        e.title || 'Untitled',
        category,
        subcategory,
        finalScore,
        ...scores,
        ...feedbacks
      ].map(escape);
    });

    const csvContent = [
      header.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTournament.name.replace(/\s+/g, '_')}_AandS_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToast({
      isVisible: true,
      message: "Exhibition results exported to CSV"
    });
  }, [activeTournament, data.participants]);

  useImperativeHandle(ref, () => ({
    exportWithToast: () => performClipboardExport(true),
    exportSilent: () => performClipboardExport(false)
  }), [performClipboardExport]);

  useEffect(() => {
    if (data.tournaments.length === 0 || isSetupMode) return;
    const interval = setInterval(() => performClipboardExport(false), 1000 * 60 * 5);
    return () => clearInterval(interval);
  }, [data.tournaments.length, isSetupMode, performClipboardExport]);

  return (
    <>
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)} 
          className={`p-2 transition-all ${showDropdown ? 'text-app-primary bg-app-surface-muted rounded-lg' : 'text-app-text-muted hover:text-app-text'}`}
          aria-label="Share and Manage Data"
          title="Data Management"
        >
          <Share2 className="w-4 h-4" />
        </button>
        
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div className="absolute top-full right-0 mt-2 w-60 bg-app-surface border border-app-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-2 bg-app-surface-muted text-[9px] font-black text-app-text-muted uppercase tracking-widest border-b border-app-border">Export Protocols</div>
              <button onClick={() => { performClipboardExport(true); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-app-text-muted hover:bg-app-surface-muted hover:text-app-text transition-all text-left">
                <Clipboard className="w-4 h-4 text-app-primary" />
                <span>Export to Clipboard</span>
              </button>
              <button onClick={() => { performFileExport(); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-app-text-muted hover:bg-app-surface-muted hover:text-app-text transition-all text-left border-t border-app-border">
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Export to Text File</span>
              </button>

              {isArtsActive && (
                <button onClick={() => { performArtsCSVExport(); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-violet-500 hover:bg-app-surface-muted hover:text-app-text transition-all text-left border-t border-app-border">
                  <FileSpreadsheet className="w-4 h-4 text-violet-500" />
                  <span>Export A&S Results (CSV)</span>
                </button>
              )}
              
              <div className="px-4 py-2 bg-app-surface-muted text-[9px] font-black text-app-text-muted uppercase tracking-widest border-y border-app-border">Utilities</div>
              {isBracketActive && (
                <button onClick={() => { onPrintBracket?.(); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-app-text-muted hover:bg-app-surface-muted hover:text-app-text transition-all text-left">
                  <Printer className="w-4 h-4 text-emerald-500" />
                  <span>Printable Bracket</span>
                </button>
              )}
              <button onClick={() => { onOpenReport?.(); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-app-text-muted hover:bg-app-surface-muted hover:text-app-text transition-all text-left border-t border-app-border">
                <FileText className="w-4 h-4 text-violet-500" />
                <span>Tournament Report</span>
              </button>
              <button onClick={() => { setShowImportModal(true); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-app-text-muted hover:bg-app-surface-muted hover:text-app-text transition-all text-left border-t border-app-border">
                <FileUp className="w-4 h-4 text-app-accent" />
                <span>Import Tourney Code</span>
              </button>
              {onWipeData && (
                <button onClick={() => { onWipeData(); setShowDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all text-left border-t border-app-border">
                  <Trash2 className="w-4 h-4" />
                  <span>Wipe All Local Ledger</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {showImportModal && <WelcomeOverlay onStartNew={() => setShowImportModal(false)} onImport={(code) => { const success = onImport(code); if (success) setShowImportModal(false); return success; }} onResume={() => false} initialMode="import" onClose={() => setShowImportModal(false)} recentEvents={[]} />}
      <Toast message={toast.message} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </>
  );
});

export default DataManager;