'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const longPressTimers = useRef({});
  const longPressIntervals = useRef({});
  const reorderTimeout = useRef(null);

  // Timer state
  const [showTimer, setShowTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerSetMin, setTimerSetMin] = useState(5);
  const [timerSetSec, setTimerSetSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerUp, setTimerUp] = useState(false);
  const timerInterval = useRef(null);

  // Round counter state
  const [showRoundCounter, setShowRoundCounter] = useState(false);
  const [round, setRound] = useState(1);

  // Position tracking for smooth slide
  const [positions, setPositions] = useState({});
  const cardRefs = useRef({});

  useEffect(() => {
    if (game.players.length === 0) { router.push('/'); return; }
    setOrderedPlayers([...game.players]);
  }, []);

  // Capture positions before reorder
  const capturePositions = useCallback(() => {
    const pos = {};
    orderedPlayers.forEach(p => {
      const el = cardRefs.current[p.id];
      if (el) pos[p.id] = el.getBoundingClientRect().top;
    });
    return pos;
  }, [orderedPlayers]);

  // Delayed reorder with FLIP animation
  useEffect(() => {
    clearTimeout(reorderTimeout.current);
    reorderTimeout.current = setTimeout(() => {
      const sorted = [...game.players].sort((a, b) => (game.scores[b.id] || 0) - (game.scores[a.id] || 0));
      const hasChanged = sorted.some((p, i) => p.id !== orderedPlayers[i]?.id);
      if (hasChanged) {
        const oldPos = capturePositions();
        setPositions(oldPos);
        setOrderedPlayers(sorted);
      }
    }, 2000);
    return () => clearTimeout(reorderTimeout.current);
  }, [game.scores]);

  // FLIP: after reorder, animate from old position to new
  useEffect(() => {
    if (Object.keys(positions).length === 0) return;
    requestAnimationFrame(() => {
      orderedPlayers.forEach(p => {
        const el = cardRefs.current[p.id];
        if (!el || positions[p.id] === undefined) return;
        const newTop = el.getBoundingClientRect().top;
        const delta = positions[p.id] - newTop;
        if (delta !== 0) {
          el.style.transition = 'none';
          el.style.transform = `translateY(${delta}px)`;
          requestAnimationFrame(() => {
            el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            el.style.transform = 'translateY(0)';
          });
        }
      });
      setPositions({});
    });
  }, [orderedPlayers]);

  // Timer logic
  useEffect(() => {
    if (!timerRunning) return;
    timerInterval.current = setInterval(() => {
      setTimerMinutes(m => {
        setTimerSeconds(s => {
          if (m === 0 && s === 0) {
            clearInterval(timerInterval.current);
            setTimerRunning(false);
            setTimerUp(true);
            return 0;
          }
          if (s === 0) {
            setTimerMinutes(m - 1);
            return 59;
          }
          return s - 1;
        });
        return m;
      });
    }, 1000);
    return () => clearInterval(timerInterval.current);
  }, [timerRunning]);

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

  const handleStartTimer = () => {
    if (timerMinutes === 0 && timerSeconds === 0) return;
    setTimerSetMin(timerMinutes);
    setTimerSetSec(timerSeconds);
    setTimerUp(false);
    setTimerRunning(true);
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
    clearInterval(timerInterval.current);
  };

  const handleClearTimer = () => {
    setTimerRunning(false);
    setTimerUp(false);
    clearInterval(timerInterval.current);
    setTimerMinutes(timerSetMin);
    setTimerSeconds(timerSetSec);
  };

  const isFirstPlayer = (playerId) => game.firstPlayer && game.firstPlayer.id === playerId;

  return (
    <div className="screen" style={{ background: 'var(--cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--navy)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--cream)', fontSize: '1.3rem' }}>{game.title || 'Game'}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button onClick={() => setShowRoundCounter(!showRoundCounter)} style={{ background: 'rgba(255,255,255,0.12)', color: 'var(--cream)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '5px 8px', fontSize: '0.65rem', fontFamily: 'Fredoka One, cursive', cursor: 'pointer', letterSpacing: '0.5px' }}>
            R{round}
          </button>
          <button onClick={() => setShowTimer(!showTimer)} style={{ background: 'rgba(255,255,255,0.12)', color: timerUp ? 'var(--red)' : 'var(--cream)', border: `2px solid ${timerUp ? 'var(--red)' : 'rgba(255,255,255,0.2)'}`, borderRadius: '6px', padding: '5px 8px', fontSize: '0.65rem', fontFamily: 'Fredoka One, cursive', cursor: 'pointer', letterSpacing: '0.5px', animation: timerUp ? 'timerFlash 0.5s ease-in-out infinite' : 'none' }}>
            ⏱
          </button>
          <button onClick={() => setShowGameOver(true)} style={{ background: 'var(--red)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '6px', padding: '5px 10px', fontSize: '0.7rem', fontFamily: 'Fredoka One, cursive', cursor: 'pointer', opacity: 0.7 }}>
            END
          </button>
        </div>
      </div>

      {/* Round counter */}
      {showRoundCounter && (
        <div style={{ background: 'var(--paper)', borderBottom: '3px solid var(--navy)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <button onClick={() => setRound(r => Math.max(1, r - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--navy)', color: 'var(--cream)', border: 'none', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid var(--navy)', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Abril Fatface, serif', fontSize: '1.5rem', color: 'var(--navy)', lineHeight: 1 }}>{round}</div>
            <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.45rem', color: 'var(--navy)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Round</div>
          </div>
          <button onClick={() => setRound(r => r + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--navy)', color: 'var(--cream)', border: 'none', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
        </div>
      )}

      {/* Timer display */}
      {showTimer && (
        <div style={{ background: timerUp ? 'var(--red)' : 'var(--navy)', borderBottom: '3px solid var(--navy)', padding: '14px 20px', textAlign: 'center', transition: 'background 0.3s' }}>
          {timerUp ? (
            <div style={{ fontFamily: 'Abril Fatface, serif', fontSize: '1.6rem', color: 'white', animation: 'timerFlash 0.5s ease-in-out infinite' }}>TIME'S UP!</div>
          ) : (
            <div style={{ fontFamily: 'Abril Fatface, serif', fontSize: '2.2rem', color: 'var(--gold)', letterSpacing: '2px' }}>
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px', alignItems: 'center' }}>
            {!timerRunning && !timerUp && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginRight: '8px' }}>
                <input type="number" min="0" max="99" value={timerMinutes} onChange={e => setTimerMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{ width: '42px', padding: '6px 4px', border: '2px solid var(--gold)', borderRadius: '6px', fontFamily: 'Abril Fatface, serif', fontSize: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.1)', color: 'var(--cream)', outline: 'none' }} />
                <span style={{ color: 'var(--cream)', fontFamily: 'Fredoka One, cursive', fontSize: '0.7rem' }}>m</span>
                <input type="number" min="0" max="59" value={timerSeconds} onChange={e => setTimerSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  style={{ width: '42px', padding: '6px 4px', border: '2px solid var(--gold)', borderRadius: '6px', fontFamily: 'Abril Fatface, serif', fontSize: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.1)', color: 'var(--cream)', outline: 'none' }} />
                <span style={{ color: 'var(--cream)', fontFamily: 'Fredoka One, cursive', fontSize: '0.7rem' }}>s</span>
              </div>
            )}
            {!timerRunning ? (
              <button onClick={handleStartTimer} style={{ background: 'var(--green)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Fredoka One, cursive', fontSize: '0.8rem', cursor: 'pointer' }}>Start</button>
            ) : (
              <button onClick={handleStopTimer} style={{ background: 'var(--red)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Fredoka One, cursive', fontSize: '0.8rem', cursor: 'pointer' }}>Stop</button>
            )}
            <button onClick={handleClearTimer} style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--cream)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Fredoka One, cursive', fontSize: '0.8rem', cursor: 'pointer' }}>Clear</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
        {orderedPlayers.map((player, index) => {
          const score = game.scores[player.id] || 0;
          const flash = scoreFlash[player.id];
          const isLeading = index === 0;
          const isFirst = isFirstPlayer(player.id);

          return (
            <div key={player.id} ref={el => cardRefs.current[player.id] = el} className="card-retro" style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: isLeading ? 'var(--gold)' : 'var(--paper)',
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
              }}>
                {isLeading ? '★' : index + 1}
              </div>

              {/* Avatar with first-player badge */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
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
                }}>
                  {player.animal.emoji}
                </div>
                {isFirst && (
                  <div style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    background: 'var(--gold)', border: '2px solid var(--navy)', borderRadius: '50%',
                    width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontFamily: 'Fredoka One, cursive', color: 'var(--navy)', lineHeight: 1,
                  }}>
                    1st
                  </div>
                )}
              </div>

              {/* Name */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: isLeading ? '1.2rem' : '1rem', color: 'var(--navy)' }}>{player.name}</div>
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
        @keyframes timerFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
