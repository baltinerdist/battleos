
import { Participant, Match, Tournament, TournamentConfig } from '../types';

/**
 * Generates a seeded list of indices for a given power of 2 size.
 */
function getSeededOrder(size: number): number[] {
  let order = [1, 2];
  while (order.length < size) {
    const nextOrder = [];
    const currentMax = order.length * 2;
    for (let i = 0; i < order.length; i++) {
      const p = order[i];
      nextOrder.push(p);
      nextOrder.push(currentMax + 1 - p);
    }
    order = nextOrder;
  }
  return order;
}

export const generateBracket = (
  participants: Participant[], 
  type: 'single-elimination' | 'double-elimination' | 'ironman' | 'round-robin' | 'swiss' | 'listing' = 'single-elimination',
  includeThirdPlace: boolean = false,
  isSeeded: boolean = false,
  maxRounds?: number,
  requiredWins: number = 2,
  config?: TournamentConfig
) => {
  const n = participants.length;
  if (n < 1 && type === 'listing') return { rounds: [], loserRounds: [], grandFinal: null, grandFinalReset: null, thirdPlaceMatch: null };
  if (n < 2 && type !== 'listing') return { rounds: [], loserRounds: [], grandFinal: null, grandFinalReset: null, thirdPlaceMatch: null };

  if (type === 'round-robin') {
    return { rounds: generateRoundRobin(participants, maxRounds, isSeeded), loserRounds: [], grandFinal: null, grandFinalReset: null, thirdPlaceMatch: null };
  }

  if (type === 'swiss') {
    const round1 = generateSwissRound(participants, [], 0, isSeeded, requiredWins, config?.swissTiebreak);
    return { rounds: [round1], loserRounds: [], grandFinal: null, grandFinalReset: null, thirdPlaceMatch: null };
  }

  if (type === 'listing') {
    const roundMatches: Match[] = participants.map((p, pIdx) => ({
      id: `listing-m${pIdx}`,
      roundIndex: 0,
      matchIndex: pIdx,
      participant1Id: p.id,
      participant2Id: null,
      participant1Wins: 0,
      participant2Wins: 0,
      winnerId: null,
      nextMatchId: null,
      bracketType: 'arts-listing'
    }));
    return { rounds: [roundMatches], loserRounds: [], grandFinal: null, grandFinalReset: null, thirdPlaceMatch: null };
  }

  const roundsCount = Math.ceil(Math.log2(n));
  const powerOfTwo = Math.pow(2, roundsCount);
  
  const primaryRounds: Match[][] = [];
  for (let r = 0; r < roundsCount; r++) {
    const matchesInRound = Math.pow(2, roundsCount - r - 1);
    const roundMatches: Match[] = [];
    for (let m = 0; m < matchesInRound; m++) {
      roundMatches.push({
        id: `primary-r${r}-m${m}`,
        roundIndex: r,
        matchIndex: m,
        participant1Id: null,
        participant2Id: null,
        participant1Wins: 0,
        participant2Wins: 0,
        winnerId: null,
        nextMatchId: r < roundsCount - 1 ? `primary-r${r + 1}-m${Math.floor(m / 2)}` : (type === 'double-elimination' ? 'grand-final' : null),
        bracketType: 'primary'
      });
    }
    primaryRounds.push(roundMatches);
  }

  let orderedList: (Participant | null)[];
  
  if (isSeeded) {
    const seedOrder = getSeededOrder(powerOfTwo);
    orderedList = new Array(powerOfTwo).fill(null);
    participants.forEach((p, i) => {
      const seedPos = seedOrder.indexOf(i + 1);
      orderedList[seedPos] = p;
    });
  } else {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const matchesInR1 = n - Math.pow(2, roundsCount - 1);
    const r1Participants = shuffled.slice(0, matchesInR1 * 2);
    const byeParticipants = shuffled.slice(matchesInR1 * 2);
    
    orderedList = new Array(powerOfTwo).fill(null);
    let r1Idx = 0;
    let byeIdx = 0;
    for (let m = 0; m < Math.pow(2, roundsCount - 1); m++) {
        if (m < matchesInR1) {
            orderedList[m * 2] = r1Participants[r1Idx++];
            orderedList[m * 2 + 1] = r1Participants[r1Idx++];
        } else {
            orderedList[m * 2] = byeParticipants[byeIdx++];
            orderedList[m * 2 + 1] = null;
        }
    }
  }

  for (let m = 0; m < primaryRounds[0].length; m++) {
    const p1 = orderedList[m * 2];
    const p2 = orderedList[m * 2 + 1];
    
    if (p1 && p2) {
      primaryRounds[0][m].participant1Id = p1.id;
      primaryRounds[0][m].participant2Id = p2.id;
    } else if (p1 || p2) {
      const winner = p1 || p2;
      const nextMatchId = primaryRounds[0][m].nextMatchId;
      if (nextMatchId && roundsCount > 1) {
        const nextMatch = primaryRounds[1].find(nm => nm.id === nextMatchId);
        if (nextMatch) {
          if (m % 2 === 0) nextMatch.participant1Id = winner!.id;
          else nextMatch.participant2Id = winner!.id;
        }
      }
    }
  }

  let thirdPlaceMatch: Match | null = null;
  if (type === 'single-elimination' && includeThirdPlace && roundsCount >= 2) {
    thirdPlaceMatch = {
      id: 'third-place-match',
      roundIndex: 0,
      matchIndex: 0,
      participant1Id: null,
      participant2Id: null,
      participant1Wins: 0,
      participant2Wins: 0,
      winnerId: null,
      nextMatchId: null,
      bracketType: 'third-place'
    };
  }

  if (type === 'single-elimination') {
    return { rounds: primaryRounds, loserRounds: [], grandFinal: null, grandFinalReset: null, thirdPlaceMatch };
  }

  const secondaryRounds: Match[][] = [];
  const lbRoundsCount = Math.max(1, (roundsCount - 1) * 2);
  
  for (let r = 0; r < lbRoundsCount; r++) {
    const wbRoundEquivalent = Math.floor(r / 2) + 1;
    const matchesInRound = Math.pow(2, roundsCount - wbRoundEquivalent - (r % 2 === 0 ? 1 : 1));
    const roundMatches: Match[] = [];
    
    for (let m = 0; m < Math.max(1, matchesInRound); m++) {
      roundMatches.push({
        id: `secondary-r${r}-m${m}`,
        roundIndex: r,
        matchIndex: m,
        participant1Id: null,
        participant2Id: null,
        participant1Wins: 0,
        participant2Wins: 0,
        winnerId: null,
        nextMatchId: r < lbRoundsCount - 1 ? `secondary-r${r + 1}-m${r % 2 === 0 ? m : Math.floor(m / 2)}` : 'grand-final',
        bracketType: 'secondary'
      });
    }
    secondaryRounds.push(roundMatches);
  }

  primaryRounds.forEach((round, rIdx) => {
    round.forEach((match, mIdx) => {
      if (rIdx === 0) {
        match.loserNextMatchId = `secondary-r0-m${Math.floor(mIdx / 2)}`;
        match.loserNextMatchSlot = (mIdx % 2 === 0 ? 1 : 2);
      } else {
        const lbRoundIdx = (rIdx * 2) - 1;
        if (lbRoundIdx < secondaryRounds.length) {
          match.loserNextMatchId = `secondary-r${lbRoundIdx}-m${mIdx}`;
          match.loserNextMatchSlot = 2;
        }
      }
    });
  });

  const grandFinal: Match = {
    id: 'grand-final',
    roundIndex: 0,
    matchIndex: 0,
    participant1Id: null,
    participant2Id: null,
    participant1Wins: 0,
    participant2Wins: 0,
    winnerId: null,
    nextMatchId: null,
    bracketType: 'final'
  };

  return { rounds: primaryRounds, loserRounds: secondaryRounds, grandFinal, grandFinalReset: null, thirdPlaceMatch: null };
};

function generateRoundRobin(participants: Participant[], maxRounds?: number, isSeeded: boolean = false): Match[][] {
  const n = participants.length;
  // If seeded, we use the provided order. If not, we shuffle once.
  const pList = isSeeded ? [...participants] : [...participants].sort(() => Math.random() - 0.5);
  const matches: Match[][] = [];
  
  const pool = [...pList];
  if (n % 2 !== 0) {
    pool.push(null as any);
  }
  
  const numRounds = pool.length - 1;
  const matchesPerRound = pool.length / 2;
  
  let globalMatchCount = 0;
  
  for (let r = 0; r < numRounds; r++) {
    const roundMatches: Match[] = [];
    for (let m = 0; m < matchesPerRound; m++) {
      const p1 = pool[m];
      const p2 = pool[pool.length - 1 - m];
      
      if (p1 && p2) {
        roundMatches.push({
          id: `rr-r${r}-m${m}`,
          roundIndex: r,
          matchIndex: globalMatchCount++,
          participant1Id: p1.id,
          participant2Id: p2.id,
          participant1Wins: 0,
          participant2Wins: 0,
          winnerId: null,
          nextMatchId: null,
          bracketType: 'round-robin'
        });
      }
    }
    matches.push(roundMatches);
    pool.splice(1, 0, pool.pop()!);
  }

  if (maxRounds && maxRounds > 0) {
    return matches.slice(0, maxRounds);
  }
  
  return matches;
}

/**
 * Generates a single round of Swiss pairings based on current standings and history.
 */
export function generateSwissRound(
  participants: Participant[], 
  history: Match[], 
  roundIndex: number, 
  isSeeded: boolean = false, 
  requiredWins: number = 2,
  tiebreakRule: 'round-points' | 'buchholz' = 'round-points'
): Match[] {
  const matchPoints: Record<string, number> = {};
  const roundPoints: Record<string, number> = {};
  const playedOpponents: Record<string, Set<string>> = {};
  const opponentsList: Record<string, string[]> = {};
  const receivedBye: Set<string> = new Set();
  const playerOriginalIndex: Record<string, number> = {};

  participants.forEach((p, idx) => {
    const pidStr = String(p.id);
    matchPoints[pidStr] = 0;
    roundPoints[pidStr] = 0;
    playedOpponents[pidStr] = new Set();
    opponentsList[pidStr] = [];
    playerOriginalIndex[pidStr] = idx;
  });

  history.forEach(m => {
    // Record Match Points (Winners of the engagement)
    if (m.winnerId !== null) {
      const winIdStr = String(m.winnerId);
      matchPoints[winIdStr] = (matchPoints[winIdStr] || 0) + 1;
    }
    
    // Record Round Points (Individual pips won)
    if (m.participant1Id !== null) {
      const p1Str = String(m.participant1Id);
      roundPoints[p1Str] = (roundPoints[p1Str] || 0) + m.participant1Wins;
      if (m.participant2Id !== null) {
        playedOpponents[p1Str].add(String(m.participant2Id));
        opponentsList[p1Str].push(String(m.participant2Id));
      }
    }
    if (m.participant2Id !== null) {
      const p2Str = String(m.participant2Id);
      roundPoints[p2Str] = (roundPoints[p2Str] || 0) + m.participant2Wins;
      if (m.participant1Id !== null) {
        playedOpponents[p2Str].add(String(m.participant1Id));
        opponentsList[p2Str].push(String(m.participant1Id));
      }
    }

    // Handle Bye tracking
    if ((m.participant1Id !== null && m.participant2Id === null) || (m.participant1Id === null && m.participant2Id !== null)) {
      const pId = m.participant1Id || m.participant2Id;
      if (pId !== null) {
        receivedBye.add(String(pId));
      }
    }
  });

  // Calculate Buchholz for pairing if needed
  const buchholz: Record<string, number> = {};
  if (tiebreakRule === 'buchholz') {
    participants.forEach(p => {
      const pidStr = String(p.id);
      buchholz[pidStr] = opponentsList[pidStr].reduce((sum, oppId) => sum + (matchPoints[oppId] || 0), 0);
    });
  }

  // Ranking for Pairing: Match Points -> [Tiebreaker] -> [Secondary Tiebreaker] -> Seed/ID
  const sortedPlayers = [...participants].sort((a, b) => {
    const pidA = String(a.id);
    const pidB = String(b.id);
    
    const mP_A = matchPoints[pidA];
    const mP_B = matchPoints[pidB];
    if (mP_B !== mP_A) return mP_B - mP_A;
    
    if (tiebreakRule === 'buchholz') {
       if (buchholz[pidB] !== buchholz[pidA]) return buchholz[pidB] - buchholz[pidA];
       if (roundPoints[pidB] !== roundPoints[pidA]) return roundPoints[pidB] - roundPoints[pidA];
    } else {
       if (roundPoints[pidB] !== roundPoints[pidA]) return roundPoints[pidB] - roundPoints[pidA];
       const bA = opponentsList[pidA].reduce((sum, oppId) => sum + (matchPoints[oppId] || 0), 0);
       const bB = opponentsList[pidB].reduce((sum, oppId) => sum + (matchPoints[oppId] || 0), 0);
       if (bB !== bA) return bB - bA;
    }

    if (isSeeded) {
       return playerOriginalIndex[pidA] - playerOriginalIndex[pidB];
    }
    return pidA.localeCompare(pidB);
  });

  const matches: Match[] = [];
  const matched = new Set<string>();

  // Bye logic for odd number of players
  if (sortedPlayers.length % 2 !== 0) {
    for (let i = sortedPlayers.length - 1; i >= 0; i--) {
      const p = sortedPlayers[i];
      const pIdStr = String(p.id);
      if (!receivedBye.has(pIdStr)) {
        matches.push({
          id: `swiss-r${roundIndex}-m-bye`,
          roundIndex,
          matchIndex: 999,
          participant1Id: p.id,
          participant2Id: null,
          participant1Wins: requiredWins > 0 ? requiredWins : 1,
          participant2Wins: 0,
          winnerId: p.id,
          nextMatchId: null,
          bracketType: 'swiss'
        });
        matched.add(pIdStr);
        break;
      }
    }
  }

  // standard Pairing
  for (let i = 0; i < sortedPlayers.length; i++) {
    const p1 = sortedPlayers[i];
    const p1IdStr = String(p1.id);
    if (matched.has(p1IdStr)) continue;

    let found = false;
    for (let j = i + 1; j < sortedPlayers.length; j++) {
      const p2 = sortedPlayers[j];
      const p2IdStr = String(p2.id);
      if (matched.has(p2IdStr)) continue;

      if (!playedOpponents[p1IdStr].has(p2IdStr)) {
        matches.push({
          id: `swiss-r${roundIndex}-m${matches.length}`,
          roundIndex,
          matchIndex: matches.length,
          participant1Id: p1.id,
          participant2Id: p2.id,
          participant1Wins: 0,
          participant2Wins: 0,
          winnerId: null,
          nextMatchId: null,
          bracketType: 'swiss'
        });
        matched.add(p1IdStr);
        matched.add(p2IdStr);
        found = true;
        break;
      }
    }

    if (!found) {
      for (let j = i + 1; j < sortedPlayers.length; j++) {
        const p2 = sortedPlayers[j];
        const p2IdStr = String(p2.id);
        if (matched.has(p2IdStr)) continue;
        matches.push({
          id: `swiss-r${roundIndex}-m${matches.length}`,
          roundIndex,
          matchIndex: matches.length,
          participant1Id: p1.id,
          participant2Id: p2.id,
          participant1Wins: 0,
          participant2Wins: 0,
          winnerId: null,
          nextMatchId: null,
          bracketType: 'swiss'
        });
        matched.add(p1IdStr);
        matched.add(p2IdStr);
        break;
      }
    }
  }

  return matches;
}
