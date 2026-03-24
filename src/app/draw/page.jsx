'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/GameContext';
import AvatarIcon from '@/lib/AvatarIcon';

export default function DrawPage() {
  const router = useRouter();
  const { game, setFirstPlayer } = useGame();
  const [phase, setPhase] = useState('spinning'); // spinning -> result
  const [winner, setWinner] = useState(null);
  const [winnerVisible, setWinnerVisible] = useState(false);
  const [offset, setOffset] = useState(0);
  const animRef = useRef(null);
  const startTime = useRef(null);
  const winnerIndex = useRef(null);

  const players = game.players;
  const ITEM_HEIGHT = 90;
  const DURATION = 3000;

  useEffect(() => {
    if (players.length === 0) { router.push('/new-game'); return; }

    const picked = Math.floor(Math.random() * players.length);
    winnerIndex.current = picked;

    // Total distance: several full cycles + land on winner
    const fullCycles = 5;
    const totalItems = fullCycles * players.length + picked;
    const totalDistance = totalItems * ITEM_HEIGHT;

    startTime.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setOffset(eased * totalDistance);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Spinning done — reveal winner
        const pickedPlayer = players[picked];
        setWinner(pickedPlayer);
        setFirstPlayer(pickedPlayer);
        setTimeout(() => {
          setPhase('result');
          setTimeout(() => setWinnerVisible(true), 300);
        }, 400);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Build repeating list for the reel
  const reelItems = [];
  if (players.length > 0) {
    for (let i = 0; i < players.length * 8; i++) {
      reelItems.push(players[i % players.length]);
    }
  }

  return (
    <div className="screen" style={{ background: 'var(--navy)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

      {/* Stars */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: `${(i * 37 + 11) % 100}%`, top: `${(i * 53 + 7) % 100}%`, width: '2px', height: '2px', borderRadius: '50%', background: 'var(--gold)', opacity: 0.3, pointerEvents: 'none' }} />
      ))}

      {phase === 'spinning' && (
        <>
          <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--cream)', fontSize: '1.4rem', marginBottom: '32px', textAlign: 'center', opacity: 0.9 }}>
            Who goes first?
          </div>

          {/* Slot machine reel */}
          <div style={{ position: 'relative', width: '240px', height: `${ITEM_HEIGHT}px`, overflow: 'hidden', borderRadius: '16px', border: '4px solid var(--gold)', background: 'rgba(245,237,214,0.08)' }}>
            {/* Selection indicator arrows */}
            <div style={{ position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: 'var(--gold)', zIndex: 5 }}>▶</div>
            <div style={{ position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: 'var(--gold)', zIndex: 5 }}>◀</div>

            {/* Gradient overlays for depth */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '20px', background: 'linear-gradient(to bottom, var(--navy), transparent)', zIndex: 3, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20px', background: 'linear-gradient(to top, var(--navy), transparent)', zIndex: 3, pointerEvents: 'none' }} />

            {/* Reel strip */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, transform: `translateY(${-offset % (reelItems.length * ITEM_HEIGHT)}px)` }}>
              {reelItems.map((p, i) => (
                <div key={i} style={{
                  height: `${ITEM_HEIGHT}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '0 20px',
                }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%', background: p.animal.color,
                    border: '3px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <AvatarIcon id={p.animal.id} size={28} />
                  </div>
                  <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--cream)', fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', flex: 1 }}>
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '28px', fontFamily: 'Fredoka One, cursive', color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '2px', opacity: 0.6 }}>
            ✦ ✦ ✦
          </div>
        </>
      )}

      {/* Result */}
      {phase === 'result' && winner && (
        <div style={{ textAlign: 'center', opacity: winnerVisible ? 1 : 0, transform: winnerVisible ? 'scale(1)' : 'scale(0.4)', transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: winner.animal.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', filter: 'drop-shadow(0 0 24px rgba(212,168,67,0.9))' }}>
            <AvatarIcon id={winner.animal.id} size={64} />
          </div>
          <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--gold)', fontSize: '2.2rem' }}>{winner.name}</div>
          <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--cream)', fontSize: '1rem', letterSpacing: '3px', marginBottom: '48px', opacity: 0.8, marginTop: '4px' }}>GOES FIRST!</div>

          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: `${10 + i * 9}%`, top: '15%', width: '8px', height: '8px', borderRadius: i % 2 === 0 ? '50%' : '2px', background: ['var(--red)', 'var(--gold)', 'var(--green)', 'var(--orange)', 'var(--cream)'][i % 5], animation: `confettiFall ${1.2 + (i * 0.15)}s ease-in forwards`, animationDelay: `${i * 0.08}s` }} />
          ))}

          <button onClick={() => router.push('/gameplay')} className="btn-retro btn-primary" style={{ padding: '16px 44px', fontSize: '1.2rem', letterSpacing: '1px' }}>
            LET&apos;S PLAY →
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
