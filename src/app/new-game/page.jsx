'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGame, ANIMALS } from '@/lib/GameContext';
import { getRecords } from '@/lib/storage';

export default function NewGamePage() {
  const router = useRouter();
  const { game, setGame, addPlayer, removePlayer } = useGame();
  const [showGameInput, setShowGameInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previousGames, setPreviousGames] = useState([]);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState(ANIMALS[0]);
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const records = getRecords();
    const unique = [...new Set(records.map(r => r.title))].slice(0, 8);
    setPreviousGames(unique);
  }, []);

  useEffect(() => {
    const ids = game.players.map(p => p.id);
    setBubbles(prev => {
      const existing = prev.filter(b => ids.includes(b.id));
      const newPlayers = game.players.filter(p => !prev.find(b => b.id === p.id));
      const newBubbles = newPlayers.map(p => ({
        ...p, x: Math.random() * 70 + 10, y: Math.random() * 60 + 10,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, bouncing: false,
      }));
      return [...existing, ...newBubbles];
    });
  }, [game.players]);

  useEffect(() => {
    if (bubbles.length === 0) return;
    const frame = requestAnimationFrame(() => {
      setBubbles(prev => prev.map(b => {
        let { x, y, vx, vy, bouncing } = b;
        if (bouncing) { vx *= 0.92; vy *= 0.92; if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) bouncing = false; }
        x += vx; y += vy;
        if (x < 5) { x = 5; vx = Math.abs(vx); }
        if (x > 85) { x = 85; vx = -Math.abs(vx); }
        if (y < 5) { y = 5; vy = Math.abs(vy); }
        if (y > 85) { y = 85; vy = -Math.abs(vy); }
        return { ...b, x, y, vx, vy, bouncing };
      }));
    });
    return () => cancelAnimationFrame(frame);
  }, [bubbles]);

  const handleBubbleClick = (id) => {
    setBubbles(prev => prev.map(b => b.id === id ? {
      ...b, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, bouncing: true,
    } : b));
  };

  const handleSelectGame = (title) => {
    setGame(prev => ({ ...prev, title, bggGame: null }));
    setShowGameInput(false);
    setSearchQuery('');
  };

  const handleAddPlayer = () => {
    if (!playerName.trim()) return;
    addPlayer(playerName.trim(), selectedAnimal);
    setPlayerName('');
    setSelectedAnimal(ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);
    setShowAddPlayer(false);
  };

  const canReady = game.title && game.players.length >= 1;
  const filteredPrevious = previousGames.filter(g => g.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="screen" style={{ background: 'var(--cream)', minHeight: '100vh', position: 'relative' }}>
      <div style={{ background: 'var(--navy)', padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--cream)', fontSize: '1.4rem', cursor: 'pointer', padding: 0 }}>←</button>
        <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--cream)', fontSize: '1.6rem' }}>New Game</div>
      </div>

      {game.players.length > 0 && (
        <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: 'var(--paper)', borderBottom: '3px solid var(--navy)' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle, var(--navy) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          {bubbles.map(b => (
            <button key={b.id} onClick={() => handleBubbleClick(b.id)} onDoubleClick={() => removePlayer(b.id)}
              style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)', width: '64px', height: '64px', borderRadius: '50%', background: b.animal.color, border: '3px solid var(--navy)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', cursor: 'pointer', boxShadow: '2px 2px 0px var(--navy)', padding: 0, userSelect: 'none' }}>
              {b.animal.emoji}
              <span style={{ fontSize: '0.5rem', color: 'white', fontFamily: 'Fredoka One, cursive', lineHeight: 1, maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
            </button>
          ))}
          <div style={{ position: 'absolute', bottom: '6px', right: '10px', fontSize: '0.6rem', color: 'var(--navy)', opacity: 0.4, fontFamily: 'Nunito, sans-serif' }}>tap to bounce · double tap to remove</div>
        </div>
      )}

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <button onClick={() => setShowGameInput(!showGameInput)} className="btn-retro btn-secondary"
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{game.title || 'What are we playing?'}</span>
            <span style={{ fontSize: '1.3rem' }}>🎲</span>
          </button>

          {showGameInput && (
            <div className="card-retro" style={{ marginTop: '8px', padding: '12px', background: 'white' }}>
              <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchQuery.trim() && handleSelectGame(searchQuery.trim())}
                placeholder="Type game name..."
                style={{ width: '100%', padding: '10px 12px', border: '2px solid var(--navy)', borderRadius: '6px', fontFamily: 'Nunito, sans-serif', fontSize: '1rem', outline: 'none', background: 'var(--cream)', marginBottom: '8px' }} />

              {searchQuery.trim() && (
                <button onClick={() => handleSelectGame(searchQuery.trim())}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--paper)', border: '2px dashed var(--navy)', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontFamily: 'Fredoka One, cursive', fontSize: '0.95rem', color: 'var(--navy)', marginBottom: '8px' }}>
                  ➕ Add "{searchQuery.trim()}"
                </button>
              )}

              {filteredPrevious.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.75rem', color: 'var(--navy)', opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Previously played</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {filteredPrevious.map(g => (
                      <button key={g} onClick={() => handleSelectGame(g)}
                        style={{ padding: '10px 12px', background: 'white', border: '2px solid var(--navy)', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem', color: 'var(--navy)' }}>
                        🎲 {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredPrevious.length === 0 && !searchQuery.trim() && (
                <div style={{ padding: '8px', opacity: 0.5, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem' }}>Type a game name above</div>
              )}
            </div>
          )}
        </div>

        <button onClick={() => setShowAddPlayer(!showAddPlayer)} className="btn-retro btn-navy"
          style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Add Players</span><span style={{ fontSize: '1.3rem' }}>+</span>
        </button>

        {showAddPlayer && (
          <div className="card-retro" style={{ padding: '16px' }}>
            <input autoFocus type="text" value={playerName} onChange={e => setPlayerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddPlayer()} placeholder="Player name..."
              style={{ width: '100%', padding: '10px 12px', border: '2px solid var(--navy)', borderRadius: '6px', fontFamily: 'Nunito, sans-serif', fontSize: '1rem', outline: 'none', background: 'var(--cream)', marginBottom: '12px' }} />
            <div style={{ marginBottom: '8px', fontFamily: 'Fredoka One, cursive', fontSize: '0.85rem', color: 'var(--navy)', letterSpacing: '1px', textTransform: 'uppercase' }}>Choose your animal:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {ANIMALS.map(a => (
                <button key={a.id} onClick={() => setSelectedAnimal(a)}
                  style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', background: selectedAnimal.id === a.id ? a.color : 'var(--paper)', border: `3px solid ${selectedAnimal.id === a.id ? 'var(--navy)' : 'transparent'}`, fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', boxShadow: selectedAnimal.id === a.id ? '2px 2px 0 var(--navy)' : 'none' }}>
                  {a.emoji}
                </button>
              ))}
            </div>
            <button onClick={handleAddPlayer} disabled={!playerName.trim()} className="btn-retro btn-green"
              style={{ width: '100%', padding: '12px', fontSize: '1rem', opacity: playerName.trim() ? 1 : 0.4 }}>
              Add {playerName.trim() ? playerName : 'Player'} {selectedAnimal.emoji}
            </button>
          </div>
        )}

        <button onClick={() => canReady && router.push('/draw')} className="btn-retro btn-primary"
          style={{ width: '100%', padding: '18px', fontSize: '1.3rem', marginTop: '8px', opacity: canReady ? 1 : 0.4, letterSpacing: '1px' }} disabled={!canReady}>
          READY ★
        </button>
        {!canReady && (
          <div style={{ textAlign: 'center', fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem', color: 'var(--navy)', opacity: 0.5 }}>
            {!game.title ? 'Pick a game first' : 'Add at least one player'}
          </div>
        )}
      </div>
    </div>
  );
}
