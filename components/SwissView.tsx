
import React, { useState } from 'react';
import { Match, Participant, Tournament } from '../types';
import MatchNode from './MatchNode';
import SwissScoringPanel from './SwissScoringPanel';
import { FastForward, CheckCircle2 } from 'lucide-react';

interface SwissViewProps {
  tournament: Tournament;
  participants: Participant[];
  onBoutWin: (matchId: string, participantId: number | string, value?: number) => void;
  onResetMatch: (matchId: string) => void;
  onFinalizeMatch: (matchId: string) => void;
  onGenerateNextRound: () => void;
  onSimulateMatches?: (matchIds: string[]) => void;
  canResetCheck: (matchId: string) => boolean;
  requiredWins: number;
  winMode: 'rounds' | 'points';
  status: 'active' | 'completed' | 'preparation' | 'draft';
  highlightedParticipantId?: number | string | null;
}

const SwissView: React.FC<SwissViewProps> = ({
  tournament, participants, onBoutWin, onResetMatch, onFinalizeMatch,
  onGenerateNextRound, onSimulateMatches, canResetCheck, requiredWins, winMode, status, highlightedParticipantId
}) => {
  const [isStandingsExpanded, setIsStandingsExpanded] = useState(false);
  const currentRoundIdx = tournament.currentSwissRound || 0;
  const currentRound = tournament.rounds[currentRoundIdx] || [];
  const totalSwissRounds = tournament.config.swissRounds || 3;

  const allInRoundDone = currentRound.length > 0 && currentRound.every(m => m.winnerId !== null);
  const isLastRound = currentRoundIdx + 1 >= totalSwissRounds;

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-app-bg transition-colors">
      <SwissScoringPanel 
        tournament={tournament}
        participants={participants}
        highlightedParticipantId={highlightedParticipantId}
        isExpanded={isStandingsExpanded}
        onToggleExpand={() => setIsStandingsExpanded(!isStandingsExpanded)}
        status={status}
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar transition-colors">
        <div className="max-w-6xl mx-auto space-y-12 pb-32">
          <div className="flex items-center justify-between sticky top-0 z-40 bg-app-bg/80 backdrop-blur-md py-4 border-b border-app-border transition-colors">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-app-text-muted">Active Matches</h3>
              <p className="text-2xl font-medieval text-app-primary uppercase tracking-widest">Round {currentRoundIdx + 1} of {totalSwissRounds}</p>
            </div>
            {allInRoundDone && status === 'active' && !isLastRound && (
              <button 
                onClick={onGenerateNextRound} 
                className="group flex items-center gap-3 px-8 py-4 bg-app-primary hover:bg-sky-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-95 animate-bounce transition-all"
              >
                <FastForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                Generate Next Round
              </button>
            )}
            {allInRoundDone && isLastRound && (
              <div className="flex items-center gap-3 px-6 py-3 bg-app-surface border-2 border-emerald-500/30 text-emerald-500 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                <CheckCircle2 className="w-4 h-4" />
                Tournament Concluded
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
            {currentRound.map(match => (
              <MatchNode 
                key={match.id} 
                match={match} 
                participants={participants} 
                onBoutWin={onBoutWin} 
                onResetMatch={onResetMatch} 
                onFinalizeMatch={onFinalizeMatch} 
                canReset={canResetCheck(match.id)} 
                requiredWins={requiredWins} 
                winMode={winMode} 
                isClickable={status === 'active' || status === 'completed'} 
                accentColor="sky" 
                highlightedParticipantId={highlightedParticipantId} 
              />
            ))}
          </div>
          
          {currentRoundIdx > 0 && (
             <div className="pt-12 border-t border-app-border">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-app-text-muted mb-8 text-center opacity-50">Past Rounds</h4>
               <div className="space-y-16">
                 {tournament.rounds.slice(0, currentRoundIdx).map((round, rIdx) => (
                   <div key={rIdx} className="space-y-6">
                     <div className="flex items-center gap-4 opacity-40">
                        <div className="h-px flex-1 bg-app-border"></div>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Round {rIdx + 1} Record</span>
                        <div className="h-px flex-1 bg-app-border"></div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                       {round.map(match => (
                         <MatchNode key={match.id} match={match} participants={participants} onBoutWin={() => {}} onResetMatch={() => {}} onFinalizeMatch={() => {}} canReset={false} requiredWins={requiredWins} winMode={winMode} isClickable={false} accentColor="sky" />
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SwissView;
