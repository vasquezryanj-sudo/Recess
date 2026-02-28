'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/GameContext';

export default function GameplayPage() {
  const router = useRouter();
  const { game, updateScore } = useGame();
  const [orderedPlayers, setOrderedPlayers] = useState([]);
  const [showInput, setShowInput] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [showGameOver, setShowGameOver] = useState(false);
  const [scoreFlash, setScoreFlash] = useState({});
  const [reordering, setReordering] = useState(false);
  const longPressTimers = useRef({});
  const longPressIntervals = useRef({});
  const reorderTimeout = useRef(null);

  useEffect(() => {
    if (game.players.length === 0) { router.push('/'); return; }
    setOrderedPlayers([...game.players]);
  }, []);

  // Delayed reorder — 2 second lag, with flash warning before
  useEffect(() => {
    clearTimeout(reorderTimeout.current);
    reorderTimeout.current = setTimeout(() => {
      const sorted = [...game.players].sort((a, b) => (game.scores[b.id] || 0) - (game.scores[a.id] || 0));
      const hasChanged = sorted.some((p, i) => p.id !== orderedPlayers[i]?.id);
      if (hasChanged) {
        setReordering(true);
        setTimeout(() => {
          setOrderedPlayers(sorted);
          setTimeout(() => setReordering(false), 600);
        }, 300);
      }
    }, 2000);
    return () => clearTimeout(reorderTimeout.current);
  }, [game.scores]);

  const flashScore = (playerId, direction) => {
    setScoreFlash(prev => ({ ...prev, [playerId]: direction }));
    setTimeout(() => setScoreFlash(prev => { const n = {...prev}; delete n[playerId]; return n; }), 500);
  };

  const handleQuickPress = (playerId, sign) => {
    updateScore(playerId, sign);
    flashScore(playerId, sign > 0 ? 'up' : 'down');
  };

  const startLongPress = (playerId, sign) => {
    let speed = 1;
    let count = 0;
    longPressTimers.current[playerId] = setTimeout(() => {
      longPressIntervals.current[playerId] = setInterval(() => {
        count++;
        if (count > 10) speed = 5;
        if (count > 25) speed = 10;
        updateScore(playerId, sign * speed);
        flashScore(playerId, sign > 0 ? 'up' : 'down');
      }, 100);
    }, 400);
  };

  const endLongPress = (playerId) => {
    clearTimeout(longPressTimers.current[playerId]);
    clearInterval(longPressIntervals.current[playerId]);
  };

  const handleInputSubmit = () => {
    if (!showInput || !inputVal) return;
    const n = parseFloat(inputVal);
    if (isNaN(n)) return;
    updateScore(showInput.playerId, showInput.sign * Math.abs(n));
    flashScore(showInput.playerId, showInput.sign > 0 ? 'up' : 'down');
    setShowInput(null);
    setInputVal('');
  };

  return (
    <div className="screen" style={{ background: 'var(--cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--navy)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--cream)', fontSize: '1.3rem' }}>{game.title || 'Game'}</div>
          {game.firstPlayer && (
            <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '1px' }}>
              {game.firstPlayer.animal.emoji} {game.firstPlayer.name} went first
            </div>
          )}
        </div>
        <button onClick={() => setShowGameOver(true)} style={{ background: 'var(--red)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.7rem', fontFamily: 'Fredoka One, cursive', cursor: 'pointer', opacity: 0.7 }}>
          END
        </button>
      </div>

      {/* Reorder warning banner */}
      {reordering && (
        <div style={{ background: 'var(--gold)', padding: '8px', textAlign: 'center', fontFamily: 'Fredoka One, cursive', fontSize: '0.85rem', color: 'var(--navy)', borderBottom: '2px solid var(--navy)', animation: 'slideDown 0.3s ease' }}>
          ⚡ Rankings are updating!
        </div>
      )}

      <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
        {orderedPlayers.map((player, index) => {
          const score = game.scores[player.id] || 0;
          const flash = scoreFlash[player.id];
          const isLeading = index === 0;

          return (
            <div key={player.id} className="card-retro" style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: isLeading ? 'var(--gold)' : 'var(--paper)',
              transform: reordering ? 'scale(0.98)' : 'scale(1)',
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: isLeading ? '5px 5px 0px var(--navy), 0 0 0 2px var(--red)' : '5px 5px 0px var(--navy)',
            }}>
              {/* Rank badge */}
              <div style={{
                fontFamily: 'Abril Fatface, serif',
                fontSize: isLeading ? '1.5rem' : '1rem',
                color: 'var(--navy)',
                opacity: isLeading ? 1 : 0.35,
                width: '28px',
                textAlign: 'center',
                transition: 'all 0.4s',
              }}>
                {isLeading ? '★' : index + 1}
              </div>

              {/* Avatar */}
              <div style={{
                width: isLeading ? '52px' : '44px',
                height: isLeading ? '52px' : '44px',
                borderRadius: '50%',
                background: player.animal.color,
                border: `${isLeading ? '4px' : '3px'} solid var(--navy)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isLeading ? '1.6rem' : '1.4rem',
                flexShrink: 0,
                transition: 'all 0.4s',
              }}>
                {player.animal.emoji}
              </div>

              {/* Name */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: isLeading ? '1.2rem' : '1rem', color: 'var(--navy)', transition: 'all 0.4s' }}>{player.name}</div>
              </div>

              {/* Score + controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onTouchStart={() => startLongPress(player.id, -1)} onTouchEnd={() => endLongPress(player.id)}
                  onMouseDown={() => startLongPress(player.id, -1)} onMouseUp={() => endLongPress(player.id)} onMouseLeave={() => endLongPress(player.id)}
                  onClick={() => handleQuickPress(player.id, -1)}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--red)', border: '2px solid var(--navy)', color: 'white', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', lineHeight: 1, flexShrink: 0 }}>−</button>

                <div onClick={() => setShowInput({ playerId: player.id, sign: 1 })} style={{
                  width: '64px',
                  textAlign: 'center',
                  fontFamily: 'Abril Fatface, serif',
                  fontSize: '1.7rem',
                  color: score < 0 ? 'var(--red)' : 'var(--navy)',
                  background: flash === 'up' ? 'rgba(45,106,79,0.25)' : flash === 'down' ? 'rgba(200,48,58,0.25)' : 'transparent',
                  borderRadius: '8px',
                  transition: 'background 0.4s',
                  cursor: 'pointer',
                  padding: '2px 0',
                }}>
                  {score}
                </div>

                <button
                  onTouchStart={() => startLongPress(player.id, 1)} onTouchEnd={() => endLongPress(player.id)}
                  onMouseDown={() => startLongPress(player.id, 1)} onMouseUp={() => endLongPress(player.id)} onMouseLeave={() => endLongPress(player.id)}
                  onClick={() => handleQuickPress(player.id, 1)}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--navy)', color: 'white', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none', lineHeight: 1, flexShrink: 0 }}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Score input modal */}
      {showInput && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,42,74,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowInput(null)}>
          <div className="card-retro" style={{ width: '100%', maxWidth: '430px', padding: '24px 20px', borderRadius: '20px 20px 0 0', background: 'var(--cream)' }}>
            <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1rem', color: 'var(--navy)', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.6 }}>
              {showInput.sign > 0 ? '➕ Add' : '➖ Subtract'} points for {orderedPlayers.find(p => p.id === showInput.playerId)?.name}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ fontFamily: 'Abril Fatface, serif', fontSize: '2rem', color: showInput.sign > 0 ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>{showInput.sign > 0 ? '+' : '−'}</div>
              <input autoFocus type="number" value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleInputSubmit()} placeholder="0"
                style={{ flex: 1, padding: '14px', border: '3px solid var(--navy)', borderRadius: '10px', fontFamily: 'Abril Fatface, serif', fontSize: '2rem', outline: 'none', textAlign: 'center', background: 'var(--paper)', color: 'var(--navy)' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => setShowInput(null)} className="btn-retro" style={{ flex: 1, padding: '14px', background: 'var(--paper)', color: 'var(--navy)' }}>Cancel</button>
              <button onClick={handleInputSubmit} className="btn-retro btn-primary" style={{ flex: 2, padding: '14px', fontSize: '1.1rem' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over confirm */}
      {showGameOver && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,42,74,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="card-retro" style={{ width: '100%', padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Abril Fatface, serif', fontSize: '1.8rem', color: 'var(--navy)', marginBottom: '8px' }}>Game Over?</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--navy)', opacity: 0.6, marginBottom: '24px', fontSize: '0.95rem' }}>This will end the game and show the winner.</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowGameOver(false)} className="btn-retro btn-navy" style={{ flex: 1, padding: '14px' }}>Keep Playing</button>
              <button onClick={() => router.push('/results')} className="btn-retro btn-primary" style={{ flex: 1, padding: '14px', fontSize: '1rem' }}>End Game 🏆</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
