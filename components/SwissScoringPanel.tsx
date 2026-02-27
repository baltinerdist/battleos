
import React, { useMemo } from 'react';
import { Participant, Tournament } from '../types';
import StandingsBoard, { StandingEntry } from './StandingsBoard';
import { ClipboardList, Info, Zap, Swords, ChevronUp, ChevronDown, Target } from 'lucide-react';

interface SwissScoringPanelProps {
  tournament: Tournament;
  participants: Participant[];
  highlightedParticipantId?: number | string | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  status: 'active' | 'completed' | 'preparation' | 'draft';
}

const SwissScoringPanel: React.FC<SwissScoringPanelProps> = ({
  tournament, participants, highlightedParticipantId, isExpanded, onToggleExpand, status
}) => {
  const currentRoundIdx = tournament.currentSwissRound || 0;
  const allMatches = tournament.rounds.flat();
  const totalRounds = tournament.config.swissRounds || 3;
  const tiebreakRule = tournament.config.swissTiebreak || 'round-points';

  const standingsData = useMemo(() => {
    const stats: Record<string, { 
      matchPoints: number; 
      roundPoints: number; 
      played: number; 
      p: Participant; 
      opponents: (number | string)[] 
    }> = {};
    
    participants.forEach(p => { 
      stats[String(p.id)] = { matchPoints: 0, roundPoints: 0, played: 0, p, opponents: [] }; 
    });
    
    allMatches.forEach(m => {
      const p1Id = m.participant1Id; 
      const p2Id = m.participant2Id;
      
      // Track Round Points (Pips)
      if (p1Id !== null && stats[String(p1Id)]) {
        stats[String(p1Id)].roundPoints += m.participant1Wins;
      }
      if (p2Id !== null && stats[String(p2Id)]) {
        stats[String(p2Id)].roundPoints += m.participant2Wins;
      }

      // Track Match Points (Victories)
      if (m.winnerId !== null && m.winnerId !== undefined) { 
        const winnerKey = String(m.winnerId); 
        if (stats[winnerKey]) { stats[winnerKey].matchPoints += 1; } 
        
        // Relationship tracking for Buchholz
        if (p1Id !== null && p2Id !== null) {
          const p1Key = String(p1Id); 
          const p2Key = String(p2Id);
          if (stats[p1Key]) { stats[p1Key].played += 1; stats[p1Key].opponents.push(p2Id); }
          if (stats[p2Key]) { stats[p2Key].played += 1; stats[p2Key].opponents.push(p1Id); }
        } else if (p1Id !== null) {
          // Bye
          if (stats[String(p1Id)]) stats[String(p1Id)].played += 1;
        } else if (p2Id !== null) {
          // Bye
          if (stats[String(p2Id)]) stats[String(p2Id)].played += 1;
        }
      }
    });

    // Buchholz calculation: Sum of all opponents' current Match Points
    const buchholz: Record<string, number> = {};
    participants.forEach(p => {
      const pidStr = String(p.id); 
      const stat = stats[pidStr];
      if (stat) { 
        let score = 0; 
        for (const oppId of stat.opponents) { 
          const oppStat = stats[String(oppId)]; 
          if (oppStat) { score += oppStat.matchPoints; } 
        } 
        buchholz[pidStr] = score; 
      }
    });

    // Ranking Algorithm: Match Points -> [Tiebreaker] -> [Secondary] -> ID
    const sorted = Object.values(stats).sort((a, b) => {
      if (b.matchPoints !== a.matchPoints) return b.matchPoints - a.matchPoints;
      
      if (tiebreakRule === 'buchholz') {
        const bB = buchholz[String(b.p.id)] || 0;
        const bA = buchholz[String(a.p.id)] || 0;
        if (bB !== bA) return bB - bA;
        if (b.roundPoints !== a.roundPoints) return b.roundPoints - a.roundPoints;
      } else {
        if (b.roundPoints !== a.roundPoints) return b.roundPoints - a.roundPoints;
        const bB = buchholz[String(b.p.id)] || 0;
        const bA = buchholz[String(a.p.id)] || 0;
        if (bB !== bA) return bB - bA;
      }
      
      return String(a.p.id).localeCompare(String(b.p.id));
    });

    return sorted.map((stat, idx) => {
      const bhVal = buchholz[String(stat.p.id)] || 0;
      return { 
        participant: stat.p, 
        rank: idx + 1, 
        primaryStat: { label: 'Matches', value: stat.matchPoints }, 
        secondaryStat: { 
          label: <Target className="w-2.5 h-2.5" />, 
          value: tiebreakRule === 'round-points' 
            ? `RP: ${stat.roundPoints} | BH: ${bhVal}` 
            : `BH: ${bhVal} | RP: ${stat.roundPoints}`
        }, 
        isWinner: idx === 0 && stat.matchPoints > 0 && status === 'completed', 
        isHighlighted: highlightedParticipantId === stat.p.id 
      } as StandingEntry;
    });
  }, [allMatches, participants, status, highlightedParticipantId, tiebreakRule]);

  return (
    <StandingsBoard 
      entries={standingsData} 
      title="Standings" 
      subtitle={`Swiss Round ${currentRoundIdx + 1} of ${totalRounds}`} 
      icon={<ClipboardList className="w-6 h-6 text-app-primary" />}
      headerActions={
        <button onClick={onToggleExpand} className="lg:hidden p-1.5 hover:bg-app-surface-muted rounded-lg text-app-text-muted transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      }
      footer={
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[9px] text-app-text-muted uppercase font-bold">
            <Info className="w-3.5 h-3.5" />
            <span>Tiebreaker: {tiebreakRule === 'round-points' ? 'Round Pts' : 'Buchholz'}</span>
          </div>
          <div className="flex items-center gap-2 text-[8px] text-app-text-muted uppercase font-black opacity-60">
            <span>RP: Round Points | BH: Buchholz</span>
          </div>
          {status === 'completed' && (
            <div className="flex items-center gap-2 text-[9px] text-emerald-500 uppercase font-black border-t border-app-border pt-2 mt-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Final Standings Locked</span>
            </div>
          )}
        </div>
      }
      className={`w-full lg:w-96 border-r border-app-border transition-all duration-300 ${isExpanded ? 'max-h-[60vh]' : 'max-h-[88px] lg:max-h-full overflow-hidden'}`}
    />
  );
};

export default SwissScoringPanel;
