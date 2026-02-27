
import { encodeState, decodeState } from './codec';

const HISTORY_INDEX_KEY = 'battleos_history_index_v2';
const SESSION_PREFIX = 'battleos_session_';
const LAST_ACTIVE_KEY = 'battleos_last_active_id';

export interface EventMetadata {
  id: string;
  name: string;
  date: string;
  lastUpdated: number;
}

/**
 * Persists the current session to its own siloed localStorage key.
 * Also updates the central index for the "Recent Events" list.
 */
export const saveEventSession = (state: any) => {
  if (!state.eventId) return;

  try {
    const sessionKey = `${SESSION_PREFIX}${state.eventId}`;
    const stateString = JSON.stringify(state);
    
    // 1. Save the full state to a specific key
    localStorage.setItem(sessionKey, stateString);
    
    // 2. Track this as the last active session
    localStorage.setItem(LAST_ACTIVE_KEY, state.eventId);

    // 3. Update the metadata index
    const indexStr = localStorage.getItem(HISTORY_INDEX_KEY);
    let index: EventMetadata[] = indexStr ? JSON.parse(indexStr) : [];
    
    const meta: EventMetadata = {
      id: state.eventId,
      name: state.eventName,
      date: state.eventDate,
      lastUpdated: state.lastUpdated || Date.now()
    };

    // Remove old entry if exists and prepend new one
    index = [meta, ...index.filter(item => item.id !== state.eventId)].slice(0, 20); // Keep top 20
    localStorage.setItem(HISTORY_INDEX_KEY, JSON.stringify(index));
    
    return index;
  } catch (e) {
    console.error("Persistence Error:", e);
    return null;
  }
};

/**
 * Loads the last active session or a specific session by ID.
 */
export const loadEventSession = (id?: string) => {
  try {
    const targetId = id || localStorage.getItem(LAST_ACTIVE_KEY);
    if (!targetId) return null;
    
    const sessionKey = `${SESSION_PREFIX}${targetId}`;
    const data = localStorage.getItem(sessionKey);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Load Error:", e);
    return null;
  }
};

/**
 * Returns metadata for all known sessions without loading full tournament data.
 */
export const getRecentEventsMetadata = (): EventMetadata[] => {
  try {
    const indexStr = localStorage.getItem(HISTORY_INDEX_KEY);
    return indexStr ? JSON.parse(indexStr) : [];
  } catch (e) {
    console.error("Failed to load recent events index", e);
    return [];
  }
};

/**
 * Removes a specific session and its metadata.
 */
export const deleteEventSession = (id: string) => {
  localStorage.removeItem(`${SESSION_PREFIX}${id}`);
  const indexStr = localStorage.getItem(HISTORY_INDEX_KEY);
  if (indexStr) {
    try {
      let index: EventMetadata[] = JSON.parse(indexStr);
      index = index.filter(item => item.id !== id);
      localStorage.setItem(HISTORY_INDEX_KEY, JSON.stringify(index));
    } catch (e) {}
  }
};

/**
 * Wipes all BattleOS related data.
 */
export const clearAllPersistence = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('battleos_')) {
      localStorage.removeItem(key);
    }
  });
};
