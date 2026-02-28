'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRecords } from '@/lib/storage';

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [view, setView] = useState('all'); // all | game | player
  const [gameSearch, setGameSearch] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setRecords(getRecords());
  }, []);

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // All unique game titles
  const allGames = [...new Set(records.map(r => r.title))];

  // All unique player names across all records
  const allPlayers = [...new Set(
    records.flatMap(r => (r.players || []).map(p => p.name))
  )];

  // Records for selected game
  const gameRecords = selectedGame ? records.filter(r => r.title === selectedGame) : [];

  // Game leaderboard stats
  const gameLeaderboard = () => {
    if (!selectedGame) return { avgScores: [], winRates: [] };
    const playerStats = {};
    gameRecords.forEach(r => {
      (r.players || []).forEach((p, i) => {
        if (!playerStats[p.name]) playerStats[p.name] = { name: p.name, animal: p.animal_id, scores: [], wins: 0, games: 0 };
        playerStats[p.name].scores.push(p.score || 0);
        playerStats[p.name].games++;
        if (i === 0) playerStats[p.name].wins++;
      });
    });
    const stats = Object.values(playerStats);
    const avgScores = [...stats].sort((a, b) => {
      const avgA = a.scores.reduce((s, x) => s + x, 0) / a.scores.length;
      const avgB = b.scores.reduce((s, x) => s + x, 0) / b.scores.length;
      return avgB - avgA;
    }).map(p => ({ ...p, avg: (p.scores.reduce((s, x) => s + x, 0) / p.scores.length).toFixed(1) }));
    const winRates = [...stats].sort((a, b) => (b.wins / b.games) - (a.wins / a.games))
      .map(p => ({ ...p, pct: Math.round((p.wins / p.games) * 100) }));
    return { avgScores, winRates };
  };

  // Records for selected player
  const playerRecords = selectedPlayer
    ? records.filter(r => (r.players || []).some(p => p.name === selectedPlayer))
    : [];

  const filteredGames = allGames.filter(g => g.toLowerCase().includes(gameSearch.toLowerCase()));
  const filteredPlayers = allPlayers.filter(p => p.toLowerCase().includes(playerSearch.toLowerCase()));

  const { avgScores, winRates } = gameLeaderboard();

  const MEDAL = ['🥇', '🥈', '🥉'];

  return (
    <div className="screen" style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--navy)', padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => { if (selectedGame || selectedPlayer) { setSelectedGame(null); setSelectedPlayer(null); setView('all'); } else { router.push('/'); } }}
          style={{ background: 'none', border: 'none', color: 'var(--cream)', fontSize: '1.4rem', cursor: 'pointer', padding: 0 }}>←</button>
        <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--cream)', fontSize: '1.6rem' }}>
          {selectedGame || selectedPlayer || 'Records'}
        </div>
      </div>

      <div style={{ background: 'var(--gold)', borderBottom: '3px solid var(--navy)', padding: '12px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '1.5rem' }}>🏆</span>
        <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--navy)', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Hall of Champions</div>
      </div>

      {records.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎲</div>
          <div style={{ fontFamily: 'Abril Fatface, serif', fontSize: '1.3rem', color: 'var(--navy)', marginBottom: '8px' }}>No games yet!</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--navy)', opacity: 0.5 }}>Play your first game to see records here.</div>
        </div>
      )}

      {records.length > 0 && !selectedGame && !selectedPlayer && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Search by Game */}
          <div className="card-retro" style={{ padding: '0', overflow: 'hidden' }}>
            <button onClick={() => setView(view === 'game' ? 'all' : 'game')}
              style={{ width: '100%', padding: '14px 16px', background: view === 'game' ? 'var(--navy)' : 'var(--paper)', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.3rem' }}>🎲</span>
                <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1rem', color: view === 'game' ? 'var(--cream)' : 'var(--navy)', letterSpacing: '0.5px' }}>Search by Game</span>
              </div>
              <span style={{ color: view === 'game' ? 'var(--gold)' : 'var(--navy)', opacity: 0.5 }}>{view === 'game' ? '▲' : '▼'}</span>
            </button>

            {view === 'game' && (
              <div style={{ padding: '12px', borderTop: '2px solid var(--navy)', background: 'white' }}>
                <input autoFocus type="text" value={gameSearch} onChange={e => setGameSearch(e.target.value)}
                  placeholder="Type game name..."
                  style={{ width: '100%', padding: '10px 12px', border: '2px solid var(--navy)', borderRadius: '6px', fontFamily: 'Nunito, sans-serif', fontSize: '1rem', outline: 'none', background: 'var(--cream)', marginBottom: '8px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {filteredGames.map(g => (
                    <button key={g} onClick={() => setSelectedGame(g)}
                      style={{ padding: '10px 12px', background: 'var(--paper)', border: '2px solid var(--navy)', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem', color: 'var(--navy)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🎲 {g}</span>
                      <span style={{ opacity: 0.4, fontSize: '0.8rem', fontFamily: 'Fredoka One, cursive' }}>{records.filter(r => r.title === g).length} games</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search by Player */}
          <div className="card-retro" style={{ padding: '0', overflow: 'hidden' }}>
            <button onClick={() => setView(view === 'player' ? 'all' : 'player')}
              style={{ width: '100%', padding: '14px 16px', background: view === 'player' ? 'var(--navy)' : 'var(--paper)', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.3rem' }}>👤</span>
                <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1rem', color: view === 'player' ? 'var(--cream)' : 'var(--navy)', letterSpacing: '0.5px' }}>Search by Player</span>
              </div>
              <span style={{ color: view === 'player' ? 'var(--gold)' : 'var(--navy)', opacity: 0.5 }}>{view === 'player' ? '▲' : '▼'}</span>
            </button>

            {view === 'player' && (
              <div style={{ padding: '12px', borderTop: '2px solid var(--navy)', background: 'white' }}>
                <input autoFocus type="text" value={playerSearch} onChange={e => setPlayerSearch(e.target.value)}
                  placeholder="Type player name..."
                  style={{ width: '100%', padding: '10px 12px', border: '2px solid var(--navy)', borderRadius: '6px', fontFamily: 'Nunito, sans-serif', fontSize: '1rem', outline: 'none', background: 'var(--cream)', marginBottom: '8px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {filteredPlayers.map(p => (
                    <button key={p} onClick={() => setSelectedPlayer(p)}
                      style={{ padding: '10px 12px', background: 'var(--paper)', border: '2px solid var(--navy)', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem', color: 'var(--navy)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>👤 {p}</span>
                      <span style={{ opacity: 0.4, fontSize: '0.8rem', fontFamily: 'Fredoka One, cursive' }}>{records.filter(r => r.players?.some(pl => pl.name === p)).length} games</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent games */}
          <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.75rem', color: 'var(--navy)', opacity: 0.5, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>Recent Games</div>
          {records.slice(0, 10).map(record => {
            const players = record.players || [];
            const winner = players[0];
            const others = players.slice(1);
            return (
              <div key={record.id} onClick={() => setExpanded(expanded === record.id ? null : record.id)} className="card-retro" style={{ overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontFamily: 'Abril Fatface, serif', fontSize: '1.05rem', color: 'var(--navy)' }}>{record.title}</div>
                    <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: 'var(--navy)', opacity: 0.5 }}>{formatDate(record.played_at)}</div>
                  </div>
                  <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.85rem', color: 'var(--red)' }}>
                    {winner && `🥇 ${winner.name} beat ${others.map(p => p.name).join(', ')}`}
                  </div>
                </div>
                {expanded === record.id && (
                  <div style={{ borderTop: '2px solid var(--navy)', padding: '12px 16px', background: 'var(--paper)' }}>
                    {players.map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < players.length - 1 ? '1px dashed rgba(27,42,74,0.2)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.9rem' }}>{MEDAL[i] || `#${i+1}`}</span>
                          <span style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--navy)' }}>{p.name}</span>
                        </div>
                        <span style={{ fontFamily: 'Abril Fatface, serif', color: i === 0 ? 'var(--red)' : 'var(--navy)', fontSize: '1.1rem' }}>{p.score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Game detail view */}
      {selectedGame && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--navy)', opacity: 0.5, fontSize: '0.85rem' }}>{gameRecords.length} games played</div>

          {/* Highest Average Score */}
          {avgScores.length > 0 && (
            <div className="card-retro" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ background: 'var(--navy)', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>📊</span>
                <span style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Highest Average Score</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                {avgScores.map((p, i) => (
                  <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: i === 0 ? 'rgba(212,168,67,0.1)' : 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1rem' }}>{MEDAL[i] || `#${i+1}`}</span>
                      <span style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--navy)', fontSize: '0.95rem' }}>{p.name}</span>
                      <span style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--navy)', opacity: 0.4, fontSize: '0.75rem' }}>{p.games} games</span>
                    </div>
                    <span style={{ fontFamily: 'Abril Fatface, serif', color: i === 0 ? 'var(--red)' : 'var(--navy)', fontSize: '1.2rem' }}>{p.avg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Winniest Winners */}
          {winRates.length > 0 && (
            <div className="card-retro" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ background: 'var(--navy)', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>👑</span>
                <span style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Winniest Winners</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                {winRates.map((p, i) => (
                  <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: i === 0 ? 'rgba(212,168,67,0.1)' : 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1rem' }}>{MEDAL[i] || `#${i+1}`}</span>
                      <span style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--navy)', fontSize: '0.95rem' }}>{p.name}</span>
                      <span style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--navy)', opacity: 0.4, fontSize: '0.75rem' }}>{p.wins}W / {p.games}G</span>
                    </div>
                    <span style={{ fontFamily: 'Abril Fatface, serif', color: i === 0 ? 'var(--red)' : 'var(--navy)', fontSize: '1.2rem' }}>{p.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game history */}
          <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.75rem', color: 'var(--navy)', opacity: 0.5, letterSpacing: '2px', textTransform: 'uppercase' }}>All Sessions</div>
          {gameRecords.map(record => {
            const players = record.players || [];
            const winner = players[0];
            return (
              <div key={record.id} onClick={() => setExpanded(expanded === record.id ? null : record.id)} className="card-retro" style={{ overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--red)', fontSize: '0.9rem' }}>🥇 {winner?.name}</div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: 'var(--navy)', opacity: 0.5 }}>{formatDate(record.played_at)}</div>
                </div>
                {expanded === record.id && (
                  <div style={{ borderTop: '2px solid var(--navy)', padding: '12px 16px', background: 'var(--paper)' }}>
                    {players.map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < players.length - 1 ? '1px dashed rgba(27,42,74,0.15)' : 'none' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span>{MEDAL[i] || `#${i+1}`}</span>
                          <span style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--navy)' }}>{p.name}</span>
                        </div>
                        <span style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--navy)' }}>{p.score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Player detail view */}
      {selectedPlayer && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(() => {
            const wins = playerRecords.filter(r => r.players?.[0]?.name === selectedPlayer).length;
            const pct = Math.round((wins / playerRecords.length) * 100);
            const scores = playerRecords.flatMap(r => (r.players || []).filter(p => p.name === selectedPlayer).map(p => p.score || 0));
            const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
            return (
              <div className="card-retro" style={{ background: 'var(--navy)', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--gold)', fontSize: '1.8rem' }}>{playerRecords.length}</div>
                  <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--cream)', fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Games</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--gold)', fontSize: '1.8rem' }}>{pct}%</div>
                  <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--cream)', fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Win Rate</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--gold)', fontSize: '1.8rem' }}>{avg}</div>
                  <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--cream)', fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Avg Score</div>
                </div>
              </div>
            );
          })()}

          <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.75rem', color: 'var(--navy)', opacity: 0.5, letterSpacing: '2px', textTransform: 'uppercase' }}>Game History</div>
          {playerRecords.map(record => {
            const playerInGame = (record.players || []).find(p => p.name === selectedPlayer);
            const rank = (record.players || []).findIndex(p => p.name === selectedPlayer);
            const won = rank === 0;
            return (
              <div key={record.id} onClick={() => setExpanded(expanded === record.id ? null : record.id)} className="card-retro" style={{ overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--navy)', fontSize: '1rem' }}>{record.title}</div>
                    <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.8rem', color: won ? 'var(--green)' : 'var(--navy)', opacity: won ? 1 : 0.5 }}>
                      {won ? '🥇 Won' : `#${rank + 1} place`} · {playerInGame?.score ?? 0} pts
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: 'var(--navy)', opacity: 0.5 }}>{formatDate(record.played_at)}</div>
                </div>
                {expanded === record.id && (
                  <div style={{ borderTop: '2px solid var(--navy)', padding: '12px 16px', background: 'var(--paper)' }}>
                    {(record.players || []).map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < record.players.length - 1 ? '1px dashed rgba(27,42,74,0.15)' : 'none', background: p.name === selectedPlayer ? 'rgba(212,168,67,0.1)' : 'transparent', borderRadius: '4px', paddingLeft: p.name === selectedPlayer ? '6px' : 0 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span>{MEDAL[i] || `#${i+1}`}</span>
                          <span style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--navy)', fontWeight: p.name === selectedPlayer ? 'bold' : 'normal' }}>{p.name}</span>
                        </div>
                        <span style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--navy)' }}>{p.score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
