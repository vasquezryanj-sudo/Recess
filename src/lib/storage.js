// Storage layer — reads/writes to Neon via API
// Falls back to localStorage if API is unavailable

const LOCAL_KEY = 'recess_games_cache';
const QUEUE_KEY = 'recess_save_queue';
const PLAYERS_KEY = 'recess_players';

function getCache() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; }
}

function setCache(games) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(games)); } catch {}
}

export async function saveGame({ title, players, scores }) {
  try {
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, players, scores }),
    });
    if (!res.ok) throw new Error('API error');
    const game = await res.json();
    const cache = getCache();
    setCache([game, ...cache]);
    return game;
  } catch (e) {
    console.error('saveGame failed, using localStorage fallback', e);
    const cache = getCache();
    const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
    const record = {
      id: Date.now().toString(),
      title,
      played_at: new Date().toISOString(),
      players: sorted.map(p => ({ name: p.name, animal_id: p.animal?.id || p.animal_id, score: scores[p.id] || 0 })),
      scores,
    };
    setCache([record, ...cache]);
    // Queue for retry when back online
    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      queue.push({ title, players: sorted.map(p => ({ name: p.name, animal_id: p.animal?.id || p.animal_id, score: scores[p.id] || 0 })), scores });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {}
    return record;
  }
}

export async function getRecords() {
  try {
    const res = await fetch('/api/games');
    if (!res.ok) throw new Error('API error');
    const games = await res.json();
    setCache(games);
    return games;
  } catch (e) {
    console.error('getRecords failed, using localStorage cache', e);
    return getCache();
  }
}

export function getRecordsSync() {
  return getCache();
}

export async function flushSaveQueue() {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    if (queue.length === 0) return;
    const remaining = [];
    for (const item of queue) {
      try {
        const res = await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('API error');
      } catch {
        remaining.push(item);
      }
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } catch {}
}

export function savePlayers(players) {
  try { localStorage.setItem(PLAYERS_KEY, JSON.stringify(players)); } catch {}
}

export function getPlayers() {
  try { return JSON.parse(localStorage.getItem(PLAYERS_KEY) || '[]'); } catch { return []; }
}
