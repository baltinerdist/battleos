
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Participant, Tournament, ParticipantStats, Match, Judge, Reeve, LocalTournamentConfig, Team, Player } from '../types';
import { generateBracket } from '../utils/bracketGenerator';
import { decodeState } from '../utils/codec';
import { 
  saveEventSession, 
  loadEventSession, 
  getRecentEventsMetadata, 
  clearAllPersistence,
  EventMetadata 
} from '../utils/persistence';

const COLOR_PALETTE = [
  { bg: '#e11d48', text: '#ffffff' }, { bg: '#2563eb', text: '#ffffff' },
  { bg: '#16a34a', text: '#ffffff' }, { bg: '#facc15', text: '#000000' },
  { bg: '#ea580c', text: '#ffffff' }, { bg: '#9333ea', text: '#ffffff' },
  { bg: '#0d9488', text: '#ffffff' }, { bg: '#4f46e5', text: '#ffffff' },
  { bg: '#db2777', text: '#ffffff' }, { bg: '#0891b2', text: '#ffffff' },
  { bg: '#84cc16', text: '#000000' }, { bg: '#d97706', text: '#ffffff' },
  { bg: '#7c3aed', text: '#ffffff' }, { bg: '#059669', text: '#ffffff' },
  { bg: '#475569', text: '#ffffff' }, { bg: '#92400e', text: '#ffffff' },
];

const generateFantasyName = () => {
  const first = ["Alaric", "Boran", "Cedric", "Doran", "Elowen", "Fiora", "Gawain", "Hilda", "Ivor", "Jora", "Kaelen", "Luthien", "Morgaine", "Njal", "Oryn", "Pippin", "Quinn", "Rowan", "Sildar", "Thrain", "Ulfric", "Valerius", "Wren", "Xander", "Yara", "Zephyr", "Balthazar", "Cassian", "Dante", "Elara"][Math.floor(Math.random() * 30)];
  const last = ["Brightstar", "Shadowstep", "Ironfoot", "Stormborn", "Oakshield", "Wolfbane", "Swiftblade", "Goldhand", "Silverleaf", "Doombringer"][Math.floor(Math.random() * 10)];
  return `${first} ${last}`;
};

export const useAppState = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(() => Date.now());
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [recentEvents, setRecentEvents] = useState<EventMetadata[]>([]);
  
  // Theme state initialization: User Choice > System Preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('battleos_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    // Default to system if no user preference is stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [eventId, setEventId] = useState<string>(() => Math.random().toString(36).substring(2, 15));
  const [eventName, setEventName] = useState('Winter Siege 2024');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [kingdom, setKingdom] = useState('Crystal Groves');
  const [parkTitle, setParkTitle] = useState('Freehold of');
  const [parkName, setParkName] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [reeves, setReeves] = useState<Reeve[]>([]);
  const [masterPlayers, setMasterPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  const [nextParticipantId, setNextParticipantId] = useState(1);
  const [nextJudgeId, setNextJudgeId] = useState(1);
  const [nextReeveId, setNextReeveId] = useState(1);
  const [pendingTournaments, setPendingTournaments] = useState<LocalTournamentConfig[]>([]);

  const saveTimeoutRef = useRef<any>(null);
  const isHydratingRef = useRef(true);

  const getCurrentState = useCallback(() => {
    return {
      eventId, eventName, eventDate, kingdom, parkTitle, parkName, participants, judges, reeves, masterPlayers, tournaments, 
      activeTournamentId, nextParticipantId, nextJudgeId, nextReeveId, lastUpdated,
      pendingTournaments
    };
  }, [eventId, eventName, eventDate, kingdom, parkTitle, parkName, participants, judges, reeves, masterPlayers, tournaments, activeTournamentId, nextParticipantId, nextJudgeId, nextReeveId, lastUpdated, pendingTournaments]);

  const refreshHistory = useCallback(() => {
    setRecentEvents(getRecentEventsMetadata());
  }, []);

  const runImmediateSave = useCallback(() => {
    const now = Date.now();
    const currentState = getCurrentState();
    const fullState = { ...currentState, lastUpdated: now };
    
    const newIndex = saveEventSession(fullState);
    if (newIndex) {
      setRecentEvents(newIndex);
      setLastSaved(now);
      setLastUpdated(now);
      setIsAutoSaving(true);
      setTimeout(() => setIsAutoSaving(false), 1500);
    }
  }, [getCurrentState]);

  const triggerSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      runImmediateSave();
    }, 10000); 
  }, [runImmediateSave]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('battleos_theme', next ? 'dark' : 'light');
      // Update DOM immediately for better responsiveness
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const data = loadEventSession();
    if (data) {
      setEventId(data.eventId || Math.random().toString(36).substring(2, 15));
      setEventName(data.eventName || 'Winter Siege 2024');
      setEventDate(data.eventDate || new Date().toISOString().split('T')[0]);
      setKingdom(data.kingdom || 'Crystal Groves');
      setParkTitle(data.parkTitle || 'Freehold of');
      setParkName(data.parkName || '');
      setParticipants(data.participants || []);
      setJudges(data.judges || []);
      setReeves(data.reeves || []);
      setMasterPlayers(data.masterPlayers || []);
      setTournaments(data.tournaments || []);
      setActiveTournamentId(data.activeTournamentId || null);
      setNextParticipantId(data.nextParticipantId || 1);
      setNextJudgeId(data.nextJudgeId || 1);
      setNextReeveId(data.nextReeveId || 1);
      setPendingTournaments(data.pendingTournaments || []);
      setLastUpdated(data.lastUpdated || Date.now());
    }
    refreshHistory();
    setIsInitialized(true);
    setTimeout(() => { isHydratingRef.current = false; }, 500);
  }, [refreshHistory]);

  useEffect(() => {
    if (!isInitialized || isHydratingRef.current) return;
    triggerSave();
  }, [
    isInitialized, 
    eventName, 
    eventDate, 
    kingdom,
    parkTitle,
    parkName,
    participants, 
    judges, 
    reeves, 
    masterPlayers,
    tournaments, 
    activeTournamentId, 
    pendingTournaments,
    triggerSave
  ]);

  const applyStateObject = useCallback((data: any) => {
    if (!data) return false;
    setEventId(data.eventId || Math.random().toString(36).substring(2, 15));
    setEventName(data.eventName || 'Winter Siege 2024');
    setEventDate(data.eventDate || new Date().toISOString().split('T')[0]);
    setKingdom(data.kingdom || 'Crystal Groves');
    setParkTitle(data.parkTitle || 'Freehold of');
    setParkName(data.parkName || '');
    setParticipants(data.participants || []);
    setJudges(data.judges || []);
    setReeves(data.reeves || []);
    setMasterPlayers(data.masterPlayers || []);
    setTournaments(data.tournaments || []);
    setActiveTournamentId(data.activeTournamentId || (data.tournaments?.[0]?.id || null));
    setNextParticipantId(data.nextParticipantId || 1);
    setNextJudgeId(data.nextJudgeId || 1);
    setNextReeveId(data.nextReeveId || 1);
    setPendingTournaments(data.pendingTournaments || []);
    setLastUpdated(data.lastUpdated || Date.now());
    return true;
  }, []);

  const addParticipant = useCallback((name: string) => {
    setNextParticipantId(prevId => {
      const colorIdx = (prevId - 1) % COLOR_PALETTE.length;
      const newParticipant = {
        id: prevId,
        name,
        color: COLOR_PALETTE[colorIdx].bg,
        createdAt: Date.now(),
        warriorRank: 0,
      };
      setParticipants(prev => [...prev, newParticipant]);
      return prevId + 1;
    });
  }, []);

  const addBulkParticipants = useCallback((count: number) => {
    setNextParticipantId(prevId => {
      const newOnes: Participant[] = [];
      let currentId = prevId;
      for (let i = 0; i < count; i++) {
        const name = generateFantasyName();
        newOnes.push({
          id: currentId++,
          name,
          color: COLOR_PALETTE[(currentId - 2) % COLOR_PALETTE.length].bg,
          createdAt: Date.now(),
          warriorRank: 0,
        });
      }
      setParticipants(prev => [...prev, ...newOnes]);
      setPendingTournaments(prevPending => prevPending.map(t => ({
        ...t,
        selectedFighterIds: [...t.selectedFighterIds, ...newOnes.map(p => p.id as number)]
      })));
      return currentId;
    });
  }, []);

  const addJudge = useCallback((name: string) => {
    setNextJudgeId(prev => {
      setJudges(current => [...current, { id: prev, name }]);
      return prev + 1;
    });
  }, []);

  const addBulkJudges = useCallback((count: number) => {
    setNextJudgeId(prev => {
      const newOnes: Judge[] = [];
      let currentId = prev;
      for (let i = 0; i < count; i++) {
        newOnes.push({ id: currentId++, name: generateFantasyName() });
      }
      setJudges(current => [...current, ...newOnes]);
      setPendingTournaments(prevPending => prevPending.map(t => ({
        ...t,
        selectedJudgeIds: t.eventType === 'arts' ? [...t.selectedJudgeIds, ...newOnes.map(j => j.id)] : t.selectedJudgeIds
      })));
      return currentId;
    });
  }, []);

  const addReeve = useCallback((name: string) => {
    setNextReeveId(prev => {
      setReeves(current => [...current, { id: prev, name }]);
      return prev + 1;
    });
  }, []);

  const addBulkReeves = useCallback((count: number) => {
    setNextReeveId(prev => {
      const newOnes: Reeve[] = [];
      let currentId = prev;
      for (let i = 0; i < count; i++) {
        newOnes.push({ id: currentId++, name: generateFantasyName() });
      }
      setReeves(current => [...current, ...newOnes]);
      return currentId;
    });
  }, []);

  const importPlayer = useCallback((player: Player, target: 'participant' | 'judge' | 'reeve') => {
    if (target === 'participant') {
      if (participants.some(p => p.name.toLowerCase() === player.name.toLowerCase())) return;
      setNextParticipantId(prevId => {
        const newParticipant = {
          id: prevId,
          name: player.name,
          color: player.color,
          createdAt: Date.now(),
          warriorRank: player.warriorRank,
          martialNotes: player.recentPerformance
        };
        setParticipants(prev => [...prev, newParticipant]);
        return prevId + 1;
      });
    } else if (target === 'judge') {
      if (judges.some(j => j.name.toLowerCase() === player.name.toLowerCase())) return;
      setNextJudgeId(prev => {
        setJudges(current => [...current, { id: prev, name: player.name }]);
        return prev + 1;
      });
    } else if (target === 'reeve') {
      if (reeves.some(r => r.name.toLowerCase() === player.name.toLowerCase())) return;
      setNextReeveId(prev => {
        setReeves(current => [...current, { id: prev, name: player.name }]);
        return prev + 1;
      });
    }
  }, [participants, judges, reeves]);

  const createTournaments = useCallback((configs: any[]) => {
    const newTournaments: Tournament[] = configs.map((config, idx) => {
      const id = config.id || Math.random().toString(36).substr(2, 9);
      const name = config.name?.trim() || (config.eventType === 'arts' ? `Exhibition ${tournaments.length + idx + 1}` : `Tournament ${tournaments.length + idx + 1}`);
      
      let competingUnits: Participant[];
      if (config.isTeams && config.teams) {
        competingUnits = config.teams.map((team: Team) => {
          const teamFighters = team.fighterIds.map(fid => participants.find(p => p.id === fid));
          const totalPoints = teamFighters.reduce((sum, p) => sum + (p?.warriorRank || 0), 0);
          
          return {
            id: team.id,
            name: team.name,
            color: team.color,
            createdAt: Date.now(),
            warriorRank: totalPoints
          };
        });
      } else {
        competingUnits = config.draftedFighters;
      }

      let t: Tournament;
      if (config.eventType === 'arts') {
        t = { id, name, date: eventDate, participants: competingUnits, rounds: [[]], loserRounds: [], grandFinal: null, thirdPlaceMatch: null, status: 'preparation', config } as Tournament;
      } else if (config.type === 'ironman' || (config.isPoolsToBracket && config.poolType === 'ironman')) {
        const stats: Record<number | string, ParticipantStats> = {};
        competingUnits.forEach((p: Participant) => stats[p.id] = { participantId: p.id, wins: 0, currentStreak: 0, maxStreak: 0 });
        t = { id, name, date: eventDate, participants: competingUnits, rounds: [], loserRounds: [], grandFinal: null, thirdPlaceMatch: null, status: 'preparation', stage: config.isPoolsToBracket ? 'pools' : undefined, config, ironmanStats: stats, lastWinnerId: null, ironmanRings: [null], progressedIds: [] } as Tournament;
      } else if (config.type === 'round-robin' || (config.isPoolsToBracket && config.poolType === 'round-robin')) {
        const { rounds } = generateBracket(competingUnits, 'round-robin', false, false, config.isPartialRounds ? config.maxRounds : undefined);
        t = { id, name, date: eventDate, participants: competingUnits, rounds, loserRounds: [], grandFinal: null, thirdPlaceMatch: null, status: 'preparation', stage: config.isPoolsToBracket ? 'pools' : undefined, config } as Tournament;
      } else {
        const bracket = generateBracket(competingUnits, config.type, config.includeThirdPlaceMatch, config.isSeeded);
        t = { id, name, date: eventDate, participants: competingUnits, ...bracket, status: 'preparation', config } as Tournament;
      }
      return t;
    });

    setTournaments(prev => {
        const filteredOld = prev.filter(p => !newTournaments.some(n => n.id === p.id));
        return [...filteredOld, ...newTournaments];
    });
    setActiveTournamentId(newTournaments[0]?.id || activeTournamentId);
    setPendingTournaments([]);
    
    setTimeout(runImmediateSave, 100);
  }, [eventDate, tournaments.length, activeTournamentId, participants, runImmediateSave]);

  const deleteTournament = useCallback((id: string) => {
    setTournaments(prev => prev.filter(t => t.id !== id));
    setActiveTournamentId(prev => prev === id ? null : prev);
    setTimeout(runImmediateSave, 100);
  }, [runImmediateSave]);

  const updateTournament = useCallback((id: string, updater: (t: Tournament) => Tournament) => {
    setTournaments(prev => {
      const next = prev.map(t => {
        if (t.id !== id) return t;
        const updated = updater(t);
        
        // Automatic Progression logic hook for Ironman Pools
        if (updated.stage === 'pools' && updated.config.poolType === 'ironman' && updated.ironmanStats) {
           const streakReq = updated.config.autoProgressionStreak || 999;
           const winsReq = updated.config.autoProgressionWins || 999;
           const finalistTarget = updated.config.finalistCount || 8;
           const currentProgressed = new Set((updated.progressedIds || []).map(String));
           
           if (currentProgressed.size < finalistTarget) {
             Object.entries(updated.ironmanStats).forEach(([pId, s]) => {
                if (!currentProgressed.has(String(pId))) {
                   if (s.wins >= winsReq || s.maxStreak >= streakReq) {
                      updated.progressedIds = [...(updated.progressedIds || []), isNaN(Number(pId)) ? pId : Number(pId)];
                   }
                }
             });
           }
        }
        
        return updated;
      });
      return next;
    });
  }, []);

  const importEventData = useCallback((code: string): boolean => {
    const data = decodeState(code);
    if (!data || !Array.isArray(data.participants)) return false;
    
    isHydratingRef.current = true;
    try {
      const success = applyStateObject(data);
      if (success) {
        saveEventSession(data);
        refreshHistory();
      }
      setTimeout(() => { isHydratingRef.current = false; }, 500);
      return success;
    } catch (e) {
      console.error(e);
      isHydratingRef.current = false;
      return false;
    }
  }, [refreshHistory, applyStateObject]);

  const loadSessionById = useCallback((id: string): boolean => {
    const data = loadEventSession(id);
    if (!data) return false;
    isHydratingRef.current = true;
    const success = applyStateObject(data);
    if (success) {
      localStorage.setItem('battleos_last_active_id', id);
      refreshHistory();
    }
    setTimeout(() => { isHydratingRef.current = false; }, 500);
    return success;
  }, [refreshHistory, applyStateObject]);

  const updateParticipantNotes = useCallback((id: number | string, notes: string, type: 'martial' | 'arts') => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, [type === 'arts' ? 'artsNotes' : 'martialNotes']: notes } : p));
  }, []);

  const updateParticipantRecommendations = useCallback((id: number | string, recommendations: string[], type: 'martial' | 'arts') => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, [type === 'arts' ? 'artsRecommendations' : 'martialRecommendations']: recommendations } : p));
  }, []);

  const addMasterPlayer = useCallback((player: Omit<Player, 'id' | 'color' | 'createdAt'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const color = COLOR_PALETTE[masterPlayers.length % COLOR_PALETTE.length].bg;
    const newPlayer: Player = {
      ...player,
      id,
      color,
      createdAt: Date.now()
    };
    setMasterPlayers(prev => [...prev, newPlayer]);
  }, [masterPlayers]);

  const removeMasterPlayer = useCallback((id: string) => {
    setMasterPlayers(prev => prev.filter(p => p.id !== id));
  }, []);

  const updateMasterPlayer = useCallback((id: string, updates: Partial<Player>) => {
    setMasterPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const wipeAllData = useCallback(() => {
    if (window.confirm("ARE YOU SURE? This will permanently erase the local storage ledger for all events on this device.")) {
      clearAllPersistence();
      window.location.reload();
    }
  }, []);

  return {
    isInitialized, lastSaved, lastUpdated, isAutoSaving, recentEvents, isDarkMode, toggleTheme,
    eventName, setEventName, eventDate, setEventDate, kingdom, setKingdom, parkTitle, setParkTitle, parkName, setParkName,
    participants, setParticipants, judges, setJudges, reeves, setReeves, masterPlayers, tournaments, activeTournamentId,
    setActiveTournamentId, nextParticipantId, nextJudgeId, nextReeveId,
    pendingTournaments, setPendingTournaments, runImmediateSave,
    addParticipant, addBulkParticipants, addJudge, addBulkJudges, addReeve, addBulkReeves, 
    addMasterPlayer, removeMasterPlayer, updateMasterPlayer, importPlayer,
    updateParticipantName: (id: number | string, name: string) => {
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    }, 
    updateParticipantWarriorRank: (id: number | string, rank: number) => {
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, warriorRank: rank } : p));
    }, 
    updateParticipantNotes,
    updateParticipantRecommendations,
    createTournaments, deleteTournament, updateTournament, importEventData, loadSessionById, wipeAllData
  };
};
