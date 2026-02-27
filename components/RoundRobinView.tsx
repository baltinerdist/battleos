
import React, { useState } from 'react';
import { Match, Participant } from '../types';
import MatchNode from './MatchNode';
import RoundRobinScoringPanel from './RoundRobinScoringPanel';
import { Trophy } from 'lucide-react';

interface RoundRobinViewProps {
  rounds: Match[][];
  participants: Participant[];
  onBoutWin: (matchId: string, participantId: number | string, value?: number) => void;
  onResetMatch: (matchId: string) => void;
  onFinalizeMatch: (matchId: string) => void;
  onSimulateMatches?: (matchIds: string[]) => void;
  canResetCheck: (matchId: string) => boolean;
  requiredWins: number;
  winMode: 'rounds' | 'points';
  status: 'draft' | 'preparation' | 'active' | 'completed';
  highlightedParticipantId?: number | string | null;
}

const RoundRobinView: React.FC<RoundRobinViewProps> = ({
  rounds, participants, onBoutWin, onResetMatch, onFinalizeMatch, onSimulateMatches,
  canResetCheck, requiredWins, winMode, status, highlightedParticipantId
}) => {
  const [isStandingsExpanded, setIsStandingsExpanded] = useState(false);

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-app-bg transition-colors">
      <RoundRobinScoringPanel 
        rounds={rounds}
        participants={participants}
        highlightedParticipantId={highlightedParticipantId}
        isExpanded={isStandingsExpanded}
        onToggleExpand={() => setIsStandingsExpanded(!isStandingsExpanded)}
        status={status}
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar transition-colors">
        <div className="max-w-6xl mx-auto space-y-12 pb-32">
          {rounds.map((round, rIdx) => (
            <div key={rIdx} className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-app-border"></div>
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medieval uppercase tracking-[0.4em] text-app-text-muted font-bold px-4">Cycle {rIdx + 1}</h3>
                </div>
                <div className="h-px flex-1 bg-app-border"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
                {round.map(match => (
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
            </div>
          ))}
          
          {status === 'completed' && (
            <div className="flex flex-col items-center py-20 animate-in zoom-in-95 duration-1000">
              <div className="p-12 bg-app-surface border-4 border-app-accent/30 rounded-[3rem] flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden group transition-all hover:scale-105">
                <div className="absolute inset-0 bg-app-accent/5 animate-pulse pointer-events-none" />
                <Trophy className="w-32 h-32 text-app-accent drop-shadow-[0_0_15px_rgba(var(--accent),0.4)] animate-bounce" />
                <div className="text-center space-y-4 relative z-10">
                  <p className="text-xs uppercase tracking-[1em] text-app-accent font-black">Glorious Champion</p>
                  <h2 className="text-5xl font-medieval text-app-text leading-tight drop-shadow-sm">
                    Champion Declared
                  </h2>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoundRobinView;
