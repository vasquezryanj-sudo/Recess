'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/GameContext';
import { saveGame } from '@/lib/storage';

export default function ResultsPage() {
  const router = useRouter();
  const { game, resetGame } = useGame();
  const [phase, setPhase] = useState('bouncing'); // bouncing -> comet -> winner
  const [loserBubbles, setLoserBubbles] = useState([]);
  const [winnerVisible, setWinnerVisible] = useState(false);
  const [cometActive, setCometActive] = useState(false);
  const [scattered, setScattered] = useState(false);
  const animFrame = useRef(null);

  const sortedPlayers = [...game.players].sort((a, b) => (game.scores[b.id] || 0) - (game.scores[a.id] || 0));
  const winner = sortedPlayers[0];
  const losers = sortedPlayers.slice(1);

  useEffect(() => {
    if (!winner) { router.push('/'); return; }

    // Save game
    try { saveGame({ title: game.title, bggGame: game.bggGame, players: game.players, scores: game.scores }); } catch (e) { console.error(e); }

    // Initialize loser bubbles bouncing around
    const initialBubbles = losers.map((p, i) => ({
      ...p,
      x: 15 + (i * 25) % 70,
      y: 20 + (i * 30) % 55,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      scattered: false,
      scatterVx: 0,
      scatterVy: 0,
    }));
    setLoserBubbles(initialBubbles);

    // After 1.5s, fire the comet
    setTimeout(() => {
      setCometActive(true);
      setPhase('comet');
      // After comet hits, scatter losers
      setTimeout(() => {
        setScattered(true);
        setPhase('winner');
        setTimeout(() => setWinnerVisible(true), 400);
      }, 800);
    }, 1800);

  }, []);

  // Animate loser bubbles
  useEffect(() => {
    if (loserBubbles.length === 0) return;
    animFrame.current = requestAnimationFrame(() => {
      setLoserBubbles(prev => prev.map((b, i) => {
        if (scattered) {
          // Scatter outward from center
          const angle = (i / Math.max(losers.length, 1)) * Math.PI * 2;
          const scatterVx = b.scatterVx || Math.cos(angle) * 3;
          const scatterVy = b.scatterVy || Math.sin(angle) * 3;
          return {
            ...b,
            x: b.x + scatterVx,
            y: b.y + scatterVy,
            scatterVx: scatterVx * 0.85,
            scatterVy: scatterVy * 0.85,
          };
        }
        // Normal bouncing
        let { x, y, vx, vy } = b;
        x += vx; y += vy;
        if (x < 8) { x = 8; vx = Math.abs(vx); }
        if (x > 85) { x = 85; vx = -Math.abs(vx); }
        if (y < 8) { y = 8; vy = Math.abs(vy); }
        if (y > 85) { y = 85; vy = -Math.abs(vy); }
        return { ...b, x, y, vx, vy };
      }));
    });
    return () => cancelAnimationFrame(animFrame.current);
  }, [loserBubbles, scattered]);

  return (
    <div className="screen" style={{ background: 'var(--navy)', minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Stars bg */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: `${(i * 41 + 13) % 100}%`, top: `${(i * 67 + 5) % 100}%`, width: '2px', height: '2px', borderRadius: '50%', background: 'var(--gold)', opacity: 0.25, pointerEvents: 'none' }} />
      ))}

      {/* Loser bubbles bouncing */}
      {loserBubbles.map(b => (
        <div key={b.id} style={{
          position: 'absolute',
          left: `${b.x}%`,
          top: `${b.y}%`,
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: b.animal.color,
          border: '3px solid rgba(255,255,255,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          opacity: scattered ? 0.4 : 0.85,
          transition: 'opacity 0.5s',
          zIndex: 2,
        }}>
          {b.animal.emoji}
          <span style={{ fontSize: '0.45rem', color: 'white', fontFamily: 'Fredoka One, cursive', lineHeight: 1 }}>{b.name}</span>
          <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'Fredoka One, cursive' }}>{game.scores[b.id] || 0}</span>
        </div>
      ))}

      {/* Comet - winner shooting in from top */}
      {cometActive && winner && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: winner.animal.color,
          border: '4px solid var(--gold)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          animation: 'cometIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          zIndex: 5,
          boxShadow: '0 0 30px rgba(212,168,67,0.8), 0 -20px 40px rgba(212,168,67,0.4)',
        }}>
          {winner.animal.emoji}
        </div>
      )}

      {/* Winner final display */}
      {phase === 'winner' && winner && (
        <div style={{
          textAlign: 'center',
          opacity: winnerVisible ? 1 : 0,
          transform: winnerVisible ? 'scale(1)' : 'scale(0.3)',
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 10,
          position: 'relative',
        }}>
          {/* Confetti */}
          {winnerVisible && Array.from({ length: 18 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: `${(i * 23 + 5) % 100}%`, top: '-20px', width: `${5 + (i % 4)}px`, height: `${5 + (i % 4)}px`, borderRadius: i % 3 === 0 ? '50%' : '2px', background: ['var(--red)', 'var(--gold)', 'var(--green)', 'var(--orange)', 'var(--cream)'][i % 5], animation: `confettiFall ${1.5 + (i * 0.1)}s ease-in forwards`, animationDelay: `${i * 0.06}s`, pointerEvents: 'none' }} />
          ))}

          <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: winner.animal.color, border: '5px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.8rem', margin: '0 auto 16px', boxShadow: '0 0 50px rgba(212,168,67,0.7)', animation: 'pulse 1.5s ease-in-out infinite' }}>
            {winner.animal.emoji}
          </div>

          <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '4px' }}>★ Winner ★</div>
          <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--cream)', fontSize: '2.4rem', marginBottom: '4px' }}>{winner.name}</div>
          <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--gold)', fontSize: '1.6rem', marginBottom: '28px' }}>{game.scores[winner.id] || 0} pts</div>

          {/* Score breakdown */}
          <div className="card-retro" style={{ background: 'rgba(245,237,214,0.08)', borderColor: 'rgba(212,168,67,0.3)', padding: '14px 18px', marginBottom: '24px', textAlign: 'left', minWidth: '230px' }}>
            {sortedPlayers.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < sortedPlayers.length - 1 ? '1px solid rgba(212,168,67,0.15)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ opacity: 0.5, fontFamily: 'Fredoka One, cursive', color: 'var(--gold)', fontSize: '0.75rem' }}>#{i + 1}</span>
                  <span style={{ fontSize: '1rem' }}>{p.animal.emoji}</span>
                  <span style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--cream)', fontSize: '0.9rem' }}>{p.name}</span>
                </div>
                <span style={{ fontFamily: 'Abril Fatface, serif', color: i === 0 ? 'var(--gold)' : 'var(--cream)', fontSize: '1.05rem' }}>{game.scores[p.id] || 0}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => router.push('/records')} className="btn-retro btn-secondary" style={{ padding: '12px 18px', fontSize: '0.9rem' }}>Records 🏆</button>
            <button onClick={() => { resetGame(); router.push('/new-game'); }} className="btn-retro btn-primary" style={{ padding: '12px 18px', fontSize: '0.9rem' }}>Play Again →</button>
          </div>
          <button onClick={() => { resetGame(); router.push('/'); }} style={{ marginTop: '14px', background: 'none', border: 'none', color: 'var(--cream)', opacity: 0.35, fontFamily: 'Fredoka One, cursive', fontSize: '0.85rem', cursor: 'pointer', display: 'block', margin: '14px auto 0' }}>Home</button>
        </div>
      )}

      <style jsx global>{`
        @keyframes cometIn {
          0% { top: -100px; transform: translateX(-50%) scale(0.5); box-shadow: 0 -40px 60px rgba(212,168,67,0.9); }
          70% { top: 42%; transform: translateX(-50%) scale(1.3); }
          100% { top: 42%; transform: translateX(-50%) scale(0); opacity: 0; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 50px rgba(212,168,67,0.7); }
          50% { box-shadow: 0 0 80px rgba(212,168,67,1); }
        }
      `}</style>
    </div>
  );
}
