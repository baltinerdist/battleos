import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { useAppState } from './hooks/useAppState';
import SetupHeader from './components/SetupHeader';
import TournamentHeader from './components/TournamentHeader';
import HelpSystem from './components/HelpSystem';
import ParticipantRoster from './components/ParticipantRoster';
import BracketView from './components/BracketView';
import IronmanView from './components/IronmanView';
import RoundRobinView from './components/RoundRobinView';
import SwissView from './components/SwissView';
import ArtsListingView from './components/ArtsListingView';
import TournamentSetup from './components/TournamentSetup';
import PlayerManagement from './components/PlayerManagement';
import WelcomeOverlay from './components/WelcomeOverlay';
import EphemeralWarningOverlay from './components/EphemeralWarningOverlay';
import AboutOverlay from './components/AboutOverlay';
import TournamentReport from './components/TournamentReport';
import PrintableBracketOverlay from './components/PrintableBracketOverlay';
import DataManager, { DataManagerHandle } from './components/DataManager';
import ParticipantNotesOverlay from './components/ParticipantNotesOverlay';
import Toast from './components/Toast';
import { Play, Swords, Trophy, Loader2, X, AlertTriangle } from 'lucide-react';
import { Match, Tournament, LocalTournamentConfig, Participant } from './types';
import { generateBracket, generateSwissRound } from './utils/bracketGenerator';

type AppView = 'welcome' | 'setup' | 'active' | 'players';

const AppContent: React.FC = () => {
  const {
    isInitialized, isAutoSaving, recentEvents,
    eventName, setEventName, eventDate, setEventDate, kingdom, setKingdom, parkTitle, setParkTitle, parkName, setParkName,
    participants, judges, reeves, masterPlayers, tournaments, activeTournamentId, nextParticipantId,
    setActiveTournamentId, addParticipant, addBulkParticipants, addJudge, addBulkJudges, addReeve, addBulkReeves, 
    addMasterPlayer, removeMasterPlayer, updateMasterPlayer, importPlayer,
    updateParticipantName, updateParticipantWarriorRank,
    updateParticipantNotes, updateParticipantNotes: updateParticipantMartialNotes, updateParticipantRecommendations,
    createTournaments, deleteTournament, updateTournament,
    setParticipants, setJudges, setReeves, importEventData, loadSessionById, wipeAllData,
    pendingTournaments, setPendingTournaments, runImmediateSave
  } = useAppState();

  const [view, setView] = useState<AppView>('welcome');
  const [eventType, setEventType] = useState<'martial' | 'arts'>('martial');
  const [showEphemeralWarning, setShowEphemeralWarning] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showPrintableBracket, setShowPrintableBracket] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(window.innerWidth >= 1024);
  const [highlightedParticipantId, setHighlightedParticipantId] = useState<number | string | null>(null);
  const [notesTarget, setNotesTarget] = useState<Participant | null>(null);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string }>({ isVisible: false, message: "" });
  const [bracketTab, setBracketTab] = useState<'winners' | 'losers'>('winners');

  const dataManagerRef = useRef<DataManagerHandle>(null);

  useEffect(() => {
    if (isInitialized && tournaments.length > 0 && activeTournamentId) {
      setView('active');
    }
  }, [isInitialized, tournaments.length, activeTournamentId]);

  useEffect(() => {
    setBracketTab('winners');
  }, [activeTournamentId]);

  const activeTournament = useMemo(() => 
    tournaments.find(t => t.id === activeTournamentId) || null, 
    [tournaments, activeTournamentId]
  );

  const handleStartEvent = useCallback((configs: any[]) => {
    createTournaments(configs);
    setView('active');
    if (configs.length > 0) setShowEphemeralWarning(true);
  }, [createTournaments]);

  const handleStartTournament = useCallback((id: string) => {
    updateTournament(id, (t) => ({ ...t, status: 'active' }));
    setToast({ isVisible: true, message: "Tournament protocols initialized. Combat is now live." });
  }, [updateTournament]);

  const propagateMatchResults = (allMatches: Match[], match: Match, winnerId: number | string, loserId: number | string | null) => {
    // Handle winners moving forward
    if (match.nextMatchId) {
      const next = allMatches.find(m => m.id === match.nextMatchId);
      if (next) {
        let slotNum: 1 | 2 = 1;
        // Specific routing for the Grand Final
        if (match.nextMatchId === 'grand-final') {
          slotNum = match.bracketType === 'primary' ? 1 : 2;
        } else if (match.bracketType === 'primary') {
          slotNum = match.matchIndex % 2 === 0 ? 1 : 2;
        } else if (match.bracketType === 'secondary') {
          // Even rounds are minor (LB Winner vs WB Loser), Odd are major (LB Winners pair up)
          slotNum = match.roundIndex % 2 === 0 ? 1 : (match.matchIndex % 2 === 0 ? 1 : 2);
        }
        
        if (slotNum === 1) next.participant1Id = winnerId; else next.participant2Id = winnerId;
      }
    }

    // Handle losers moving to the Underworld (Losers Bracket)
    if (match.loserNextMatchId && loserId) {
      const nextL = allMatches.find(m => m.id === match.loserNextMatchId);
      if (nextL) {
        if (match.loserNextMatchSlot === 1) nextL.participant1Id = loserId; else nextL.participant2Id = loserId;
      }
    }
  };

  const handleBoutWin = useCallback((matchId: string, pId: number | string, value?: number) => {
    if (!activeTournamentId) return;
    updateTournament(activeTournamentId, (t) => {
      const deepCloneRounds = (rounds: Match[][]) => rounds.map(r => r.map(m => ({ ...m })));
      
      const newRounds = deepCloneRounds(t.rounds);
      const newLoserRounds = deepCloneRounds(t.loserRounds);
      const newGrandFinal = t.grandFinal ? { ...t.grandFinal } : null;
      const newThirdPlaceMatch = t.thirdPlaceMatch ? { ...t.thirdPlaceMatch } : null;
      let newGrandFinalReset = t.grandFinalReset ? { ...t.grandFinalReset } : null;

      const allMatches = [...newRounds.flat(), ...newLoserRounds.flat(), newGrandFinal, newThirdPlaceMatch, newGrandFinalReset].filter(Boolean) as Match[];
      const match = allMatches.find(m => m.id === matchId);
      
      if (!match || match.winnerId) return t;

      if (t.config.winMode === 'rounds') {
        if (match.participant1Id === pId) match.participant1Wins++;
        else if (match.participant2Id === pId) match.participant2Wins++;
        
        if (match.participant1Wins >= t.config.requiredWins) match.winnerId = match.participant1Id;
        else if (match.participant2Wins >= t.config.requiredWins) match.winnerId = match.participant2Id;
      } else {
        const val = value ?? 0;
        if (match.participant1Id === pId) match.participant1Wins = val;
        else if (match.participant2Id === pId) match.participant2Wins = val;
      }

      if (match.winnerId) {
        const loserId = match.winnerId === match.participant1Id ? match.participant2Id : match.participant1Id;
        
        // Reset Trigger: If Loser (P2) wins the Grand Final in Double-Elim
        if (match.id === 'grand-final' && match.winnerId === match.participant2Id) {
          newGrandFinalReset = {
            id: 'grand-final-reset',
            roundIndex: 1,
            matchIndex: 0,
            participant1Id: match.participant1Id,
            participant2Id: match.participant2Id,
            participant1Wins: 0,
            participant2Wins: 0,
            winnerId: null,
            nextMatchId: null,
            bracketType: 'final'
          };
        }

        propagateMatchResults(allMatches, match, match.winnerId, loserId);
      }

      return { 
        ...t, 
        rounds: newRounds, 
        loserRounds: newLoserRounds, 
        grandFinal: newGrandFinal, 
        thirdPlaceMatch: newThirdPlaceMatch, 
        grandFinalReset: newGrandFinalReset 
      };
    });
  }, [activeTournamentId, updateTournament]);

  const handleSimulateTournament = useCallback(() => {
    if (!activeTournamentId || !activeTournament) return;
    
    updateTournament(activeTournamentId, (t) => {
      const deepCloneRounds = (rounds: Match[][]) => rounds.map(r => r.map(m => ({ ...m })));
      
      let newRounds = deepCloneRounds(t.rounds);
      let newLoserRounds = deepCloneRounds(t.loserRounds);
      let newGrandFinal = t.grandFinal ? { ...t.grandFinal } : null;
      let newThirdPlaceMatch = t.thirdPlaceMatch ? { ...t.thirdPlaceMatch } : null;
      let newGrandFinalReset = t.grandFinalReset ? { ...t.grandFinalReset } : null;

      const getMatches = () => [...newRounds.flat(), ...newLoserRounds.flat(), newGrandFinal, newThirdPlaceMatch, newGrandFinalReset].filter(Boolean) as Match[];
      
      let changed = true;
      while (changed) {
        changed = false;
        const allMatches = getMatches();
        
        // Find playable matches where both participants are ready
        const playable = allMatches.find(m => !m.winnerId && m.participant1Id !== null && m.participant2Id !== null);
        
        if (playable) {
          const p1Wins = t.config.winMode === 'rounds' ? t.config.requiredWins : Math.floor(Math.random() * 5) + 1;
          const p2Wins = t.config.winMode === 'rounds' ? Math.floor(Math.random() * t.config.requiredWins) : Math.floor(Math.random() * 5) + 1;
          
          let winnerSlot = Math.random() > 0.5 ? 1 : 2;
          
          // User Instruction Override: Assume the Winner's Bracket champion wins the finals in simulation
          if (playable.id === 'grand-final') {
            winnerSlot = 1;
          }

          if (winnerSlot === 1) {
            playable.participant1Wins = p1Wins;
            playable.participant2Wins = p2Wins;
            playable.winnerId = playable.participant1Id;
          } else {
            playable.participant2Wins = p1Wins;
            playable.participant1Wins = p2Wins;
            playable.winnerId = playable.participant2Id;
          }

          const loserId = playable.winnerId === playable.participant1Id ? playable.participant2Id : playable.participant1Id;

          // Note: Reset Match is ignored here as winnerSlot is forced to 1 for the Grand Final
          propagateMatchResults(allMatches, playable, playable.winnerId!, loserId);
          changed = true;
        }
      }

      setToast({ isVisible: true, message: "Battle simulations completed. Grand record populated." });

      return { 
        ...t, 
        rounds: newRounds, 
        loserRounds: newLoserRounds, 
        grandFinal: newGrandFinal, 
        thirdPlaceMatch: newThirdPlaceMatch, 
        grandFinalReset: newGrandFinalReset,
        status: 'completed'
      };
    });
  }, [activeTournamentId, activeTournament, updateTournament]);

  const handleFinalizeMatch = useCallback((matchId: string) => {
    if (!activeTournamentId) return;
    updateTournament(activeTournamentId, (t) => {
      const deepCloneRounds = (rounds: Match[][]) => rounds.map(r => r.map(m => ({ ...m })));
      const newRounds = deepCloneRounds(t.rounds);
      const newLoserRounds = deepCloneRounds(t.loserRounds);
      const newGrandFinal = t.grandFinal ? { ...t.grandFinal } : null;
      const newThirdPlaceMatch = t.thirdPlaceMatch ? { ...t.thirdPlaceMatch } : null;
      let newGrandFinalReset = t.grandFinalReset ? { ...t.grandFinalReset } : null;

      const allMatches = [...newRounds.flat(), ...newLoserRounds.flat(), newGrandFinal, newThirdPlaceMatch, newGrandFinalReset].filter(Boolean) as Match[];
      const match = allMatches.find(m => m.id === matchId);
      
      if (!match || match.winnerId) return t;

      if (match.participant1Wins > match.participant2Wins) {
        match.winnerId = match.participant1Id;
      } else if (match.participant2Wins > match.participant1Wins) {
        match.winnerId = match.participant2Id;
      } else {
        match.winnerId = match.participant1Id;
      }

      if (match.winnerId) {
        const loserId = match.winnerId === match.participant1Id ? match.participant2Id : match.participant1Id;
        
        if (match.id === 'grand-final' && match.winnerId === match.participant2Id) {
          newGrandFinalReset = {
            id: 'grand-final-reset',
            roundIndex: 1,
            matchIndex: 0,
            participant1Id: match.participant1Id,
            participant2Id: match.participant2Id,
            participant1Wins: 0,
            participant2Wins: 0,
            winnerId: null,
            nextMatchId: null,
            bracketType: 'final'
          };
        }

        propagateMatchResults(allMatches, match, match.winnerId, loserId);
      }

      return { 
        ...t, 
        rounds: newRounds, 
        loserRounds: newLoserRounds, 
        grandFinal: newGrandFinal, 
        thirdPlaceMatch: newThirdPlaceMatch, 
        grandFinalReset: newGrandFinalReset 
      };
    });
  }, [activeTournamentId, updateTournament]);

  const handleResetMatch = useCallback((matchId: string) => {
    if (!activeTournamentId) return;
    updateTournament(activeTournamentId, (t) => {
      const deepCloneRounds = (rounds: Match[][]) => rounds.map(r => r.map(m => ({ ...m })));
      const newRounds = deepCloneRounds(t.rounds);
      const newLoserRounds = deepCloneRounds(t.loserRounds);
      const newGrandFinal = t.grandFinal ? { ...t.grandFinal } : null;
      const newThirdPlaceMatch = t.thirdPlaceMatch ? { ...t.thirdPlaceMatch } : null;
      const newGrandFinalReset = t.grandFinalReset ? { ...t.grandFinalReset } : null;

      const allMatches = [...newRounds.flat(), ...newLoserRounds.flat(), newGrandFinal, newThirdPlaceMatch, newGrandFinalReset].filter(Boolean) as Match[];
      const match = allMatches.find(m => m.id === matchId);
      
      if (!match) return t;
      match.winnerId = null;
      match.participant1Wins = 0;
      match.participant2Wins = 0;

      return { 
        ...t, 
        rounds: newRounds, 
        loserRounds: newLoserRounds, 
        grandFinal: newGrandFinal, 
        thirdPlaceMatch: newThirdPlaceMatch, 
        grandFinalReset: newGrandFinalReset 
      };
    });
  }, [activeTournamentId, updateTournament]);

  const handleGenerateSwissNextRound = useCallback(() => {
    if (!activeTournamentId) return;
    updateTournament(activeTournamentId, (t) => {
      if (t.config.type !== 'swiss') return t;
      const currentRoundIdx = t.currentSwissRound || 0;
      const nextRoundIdx = currentRoundIdx + 1;
      const targetRounds = t.config.swissRounds || 3;
      
      if (nextRoundIdx >= targetRounds) return t;

      const history = t.rounds.flat();
      const nextRoundMatches = generateSwissRound(t.participants, history, nextRoundIdx, t.config.isSeeded, t.config.requiredWins);
      
      setToast({ isVisible: true, message: `Swiss Phase ${nextRoundIdx + 1} deployment matches generated.` });

      return {
        ...t,
        rounds: [...t.rounds, nextRoundMatches],
        currentSwissRound: nextRoundIdx
      };
    });
  }, [activeTournamentId, updateTournament]);

  const renderView = () => {
    switch (view) {
      case 'players':
        return (
          <PlayerManagement 
            players={masterPlayers} 
            onAdd={addMasterPlayer} 
            onRemove={removeMasterPlayer} 
            onUpdate={updateMasterPlayer} 
            onBack={() => setView('welcome')}
          />
        );
      case 'setup':
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            <SetupHeader 
              eventName={eventName} 
              onLeaveEvent={() => setView('welcome')} 
              onShowHelp={() => setShowHelp(true)} 
              dataManagerSlot={<DataManager ref={dataManagerRef} data={{ eventName, eventDate, kingdom, parkTitle, parkName, tournaments, participants, activeTournamentId, nextParticipantId }} onImport={importEventData} isSetupMode={true} onWipeData={wipeAllData} onOpenReport={() => setShowReport(true)} />} 
              isAutoSaving={isAutoSaving} 
            />
            <TournamentSetup 
              masterParticipants={participants} judges={judges} reeves={reeves} 
              masterPlayers={masterPlayers} onImportPlayer={importPlayer}
              onAddParticipant={addParticipant} onRemoveParticipant={(id) => setParticipants(p => p.filter(x => x.id !== id))} 
              onAddJudge={addJudge} onRemoveJudge={(id) => setJudges(j => j.filter(x => x.id !== id))} onAddBulkJudges={addBulkJudges} 
              onAddReeve={addReeve} onRemoveReeve={(id) => setReeves(r => r.filter(x => x.id !== id))} onAddBulkReeves={addBulkReeves} 
              onUpdateParticipantName={updateParticipantName} onUpdateWarriorRank={updateParticipantWarriorRank} onOpenNotes={setNotesTarget} 
              onReorderParticipants={setParticipants} onAddBulk={addBulkParticipants} onHighlight={setHighlightedParticipantId} 
              rankings={new Map()} onStart={handleStartEvent} eventName={eventName} onEventNameChange={setEventName} eventDate={eventDate} onEventDateChange={setEventDate} 
              kingdom={kingdom} onKingdomChange={setKingdom} parkTitle={parkTitle} onParkTitleChange={setParkTitle} parkName={parkName} onParkNameChange={setParkName} 
              pendingTournaments={pendingTournaments} onPendingTournamentsChange={setPendingTournaments} activeTournaments={tournaments} 
              onDeleteActiveTournament={deleteTournament} onReopenActiveTournament={(id) => { setActiveTournamentId(id); setView('active'); }} 
              eventType={eventType} onEventTypeChange={setEventType} 
            />
          </div>
        );
      case 'active':
        return (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <TournamentHeader 
              eventName={eventName} tournaments={tournaments} activeTournament={activeTournament} 
              onSwitchTournament={setActiveTournamentId} onCreateNew={() => setView('setup')} onDelete={deleteTournament} 
              onToggleRoster={() => setIsRosterOpen(!isRosterOpen)} onShowHelp={() => setShowHelp(true)} isRosterOpen={isRosterOpen} 
              onStartTournament={handleStartTournament} onSimulate={handleSimulateTournament}
              dataManagerSlot={<DataManager ref={dataManagerRef} data={{ eventName, eventDate, kingdom, parkTitle, parkName, tournaments, participants, activeTournamentId, nextParticipantId }} onImport={importEventData} isSetupMode={false} onWipeData={wipeAllData} onOpenReport={() => setShowReport(true)} onPrintBracket={() => setShowPrintableBracket(true)} />} 
              isAutoSaving={isAutoSaving} 
            />
            <div className="flex-1 flex overflow-hidden">
              {isRosterOpen && (
                <div className="w-80 h-full border-r border-app-border flex-shrink-0 animate-in slide-in-from-left duration-300">
                  <ParticipantRoster 
                    participants={activeTournament?.participants || []} onAdd={() => {}} onRemove={() => {}} 
                    onOpenNotes={setNotesTarget} disabled={true} isOpen={true} onToggle={null} artsMode={activeTournament?.config.eventType === 'arts'} 
                  />
                </div>
              )}
              <div className="flex-1 overflow-hidden flex flex-col bg-app-bg transition-colors duration-300">
                {activeTournament && (
                  <>
                    {activeTournament.config.type === 'ironman' && (
                      <IronmanView tournament={activeTournament} onWin={(rid, pid) => {
                        updateTournament(activeTournament.id, t => {
                          const rings = [...(t.ironmanRings || [])];
                          rings[rid] = pid;
                          return { ...t, ironmanRings: rings };
                        });
                      }} onUpdateRings={(c) => updateTournament(activeTournament.id, t => ({ ...t, ironmanRings: Array(c).fill(null) }))} onComplete={() => {}} />
                    )}
                    {(activeTournament.config.type === 'single-elimination' || activeTournament.config.type === 'double-elimination') && (
                      <BracketView 
                        rounds={bracketTab === 'winners' ? activeTournament.rounds : activeTournament.loserRounds} 
                        participants={activeTournament.participants} 
                        onBoutWin={handleBoutWin} onResetMatch={handleResetMatch} onFinalizeMatch={handleFinalizeMatch} 
                        canResetCheck={() => true} requiredWins={activeTournament.config.requiredWins} 
                        winMode={activeTournament.config.winMode} status={activeTournament.status} 
                        grandFinal={bracketTab === 'winners' ? activeTournament.grandFinal : null}
                        grandFinalReset={bracketTab === 'winners' ? activeTournament.grandFinalReset : null}
                        thirdPlaceMatch={bracketTab === 'winners' ? activeTournament.thirdPlaceMatch : null}
                        hasLoserBracket={activeTournament.config.type === 'double-elimination'}
                        activeTab={bracketTab}
                        onTabChange={setBracketTab}
                        allTournamentMatches={[...activeTournament.rounds.flat(), ...activeTournament.loserRounds.flat(), activeTournament.grandFinal, activeTournament.grandFinalReset, activeTournament.thirdPlaceMatch].filter(Boolean) as Match[]}
                      />
                    )}
                    {activeTournament.config.type === 'round-robin' && (
                      <RoundRobinView 
                        rounds={activeTournament.rounds} participants={activeTournament.participants} 
                        onBoutWin={handleBoutWin} onResetMatch={handleResetMatch} onFinalizeMatch={handleFinalizeMatch} 
                        canResetCheck={() => true} requiredWins={activeTournament.config.requiredWins} 
                        winMode={activeTournament.config.winMode} status={activeTournament.status} 
                      />
                    )}
                    {activeTournament.config.type === 'swiss' && (
                      <SwissView 
                        tournament={activeTournament} participants={activeTournament.participants} 
                        onBoutWin={handleBoutWin} onResetMatch={handleResetMatch} onFinalizeMatch={handleFinalizeMatch} 
                        onGenerateNextRound={handleGenerateSwissNextRound} canResetCheck={() => true} 
                        requiredWins={activeTournament.config.requiredWins} winMode={activeTournament.config.winMode} 
                        status={activeTournament.status} 
                      />
                    )}
                    {activeTournament.config.eventType === 'arts' && (
                      <ArtsListingView 
                        tournament={activeTournament} onAddEntry={() => {}} onDeleteEntry={() => {}}
                        onUpdateMatch={(mid, up) => updateTournament(activeTournament.id, t => {
                          const rounds = [...t.rounds];
                          rounds[0] = rounds[0].map(m => m.id === mid ? { ...m, ...up } : m);
                          return { ...t, rounds };
                        })}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      case 'welcome':
      default:
        return <WelcomeOverlay onStartNew={() => { setView('setup'); }} onImport={importEventData} onResume={loadSessionById} onOpenPlayerManagement={() => setView('players')} recentEvents={recentEvents} onClose={() => setView('welcome')} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-app-bg text-app-text overflow-hidden transition-colors duration-300">
      {renderView()}
      {notesTarget && <ParticipantNotesOverlay participant={notesTarget} isArts={activeTournament?.config.eventType === 'arts'} onSave={(n, r) => { updateParticipantNotes(notesTarget.id, n, activeTournament?.config.eventType === 'arts' ? 'arts' : 'martial'); updateParticipantRecommendations(notesTarget.id, r, activeTournament?.config.eventType === 'arts' ? 'arts' : 'martial'); setNotesTarget(null); }} onClose={() => setNotesTarget(null)} />}
      {showReport && <TournamentReport data={{ eventName, eventDate, kingdom, parkTitle, parkName, tournaments, participants }} onClose={() => setShowReport(false)} />}
      {showPrintableBracket && activeTournament && <PrintableBracketOverlay tournament={activeTournament} participants={participants} onClose={() => setShowPrintableBracket(false)} eventDate={eventDate} kingdom={kingdom} parkName={parkName} allReeves={reeves} />}
      {showEphemeralWarning && <EphemeralWarningOverlay onDismiss={() => setShowEphemeralWarning(false)} />}
      {showHelp && <HelpSystem onClose={() => setShowHelp(false)} />}
      <Toast isVisible={toast.isVisible} message={toast.message} onClose={() => setToast(p => ({ ...p, isVisible: false }))} />
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;