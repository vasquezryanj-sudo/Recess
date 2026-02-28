const STORAGE_KEY = 'recess_records';

export function saveGame({ title, bggGame, players, scores }) {
  const records = getRecords();
  const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  
  const record = {
    id: `game-${Date.now()}`,
    title,
    bgg_id: bggGame?.id || null,
    played_at: new Date().toISOString(),
    players: sorted.map(p => ({
      name: p.name,
      animal_id: p.animal.id,
      score: scores[p.id] || 0,
    })),
  };

  records.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return record;
}

export function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function deleteRecord(id) {
  const records = getRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
