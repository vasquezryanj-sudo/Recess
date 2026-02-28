'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/GameContext';

export default function DrawPage() {
  const router = useRouter();
  const { game, setFirstPlayer } = useGame();
  const [phase, setPhase] = useState('collecting'); // collecting -> shaking -> ejecting -> result
  const [winner, setWinner] = useState(null);
  const [bubblesInJar, setBubblesInJar] = useState([]);
  const [jarShake, setJarShake] = useState(false);
  const [winnerVisible, setWinnerVisible] = useState(false);
  const [ejectingId, setEjectingId] = useState(null);

  const players = game.players;

  useEffect(() => {
    if (players.length === 0) { router.push('/new-game'); return; }

    // Collect bubbles into jar
    players.forEach((p, i) => {
      setTimeout(() => {
        setBubblesInJar(prev => [...prev, {
          ...p,
          jarX: 15 + Math.random() * 65,
          jarY: 15 + Math.random() * 65,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
        }]);
      }, i * 350 + 300);
    });

    // Shake
    setTimeout(() => {
      setPhase('shaking');
      setJarShake(true);
    }, players.length * 350 + 600);

    // Stop shake, eject winner
    setTimeout(() => {
      setJarShake(false);
      const picked = players[Math.floor(Math.random() * players.length)];
      setWinner(picked);
      setFirstPlayer(picked);
      setEjectingId(picked.id);
      setPhase('ejecting');

      setTimeout(() => {
        setPhase('result');
        setTimeout(() => setWinnerVisible(true), 300);
      }, 900);
    }, players.length * 350 + 2200);

  }, []);

  // Bounce bubbles inside jar during shaking
  useEffect(() => {
    if (phase !== 'shaking' && phase !== 'collecting') return;
    const frame = requestAnimationFrame(() => {
      setBubblesInJar(prev => prev.map(b => {
        let { jarX, jarY, vx, vy } = b;
        const speed = phase === 'shaking' ? 1.2 : 0.5;
        vx = (vx || 0) + (Math.random() - 0.5) * (phase === 'shaking' ? 0.8 : 0);
        vy = (vy || 0) + (Math.random() - 0.5) * (phase === 'shaking' ? 0.8 : 0);
        vx = Math.max(-speed * 2, Math.min(speed * 2, vx));
        vy = Math.max(-speed * 2, Math.min(speed * 2, vy));
        jarX += vx;
        jarY += vy;
        if (jarX < 10) { jarX = 10; vx = Math.abs(vx); }
        if (jarX > 80) { jarX = 80; vx = -Math.abs(vx); }
        if (jarY < 10) { jarY = 10; vy = Math.abs(vy); }
        if (jarY > 80) { jarY = 80; vy = -Math.abs(vy); }
        return { ...b, jarX, jarY, vx, vy };
      }));
    });
    return () => cancelAnimationFrame(frame);
  }, [bubblesInJar, phase]);

  return (
    <div className="screen" style={{ background: 'var(--navy)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

      {/* Stars */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: `${(i * 37 + 11) % 100}%`, top: `${(i * 53 + 7) % 100}%`, width: '2px', height: '2px', borderRadius: '50%', background: 'var(--gold)', opacity: 0.3, pointerEvents: 'none' }} />
      ))}

      {phase !== 'result' && (
        <>
          <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--cream)', fontSize: '1.4rem', marginBottom: '24px', textAlign: 'center', opacity: 0.9 }}>
            {phase === 'shaking' ? 'Shaking it up...' : phase === 'ejecting' ? '...' : 'Into the jar!'}
          </div>

          {/* UPSIDE DOWN JAR — open end faces DOWN */}
          <div style={{
            position: 'relative',
            width: '200px',
            height: '240px',
            animation: jarShake ? 'jarShake 0.12s ease-in-out infinite' : 'none',
          }}>
            {/* Jar body - the main glass part (top when upside down) */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '10px',
              right: '10px',
              height: '185px',
              background: 'rgba(245, 237, 214, 0.1)',
              border: '4px solid var(--gold)',
              borderBottom: 'none',
              borderRadius: '16px 16px 0 0',
              overflow: 'hidden',
              backdropFilter: 'blur(2px)',
            }}>
              {/* Bubbles inside */}
              {bubblesInJar.map(b => (
                <div key={b.id} style={{
                  position: 'absolute',
                  left: `${b.jarX}%`,
                  top: `${b.jarY}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: b.animal.color,
                  border: '2px solid rgba(255,255,255,0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  opacity: ejectingId === b.id ? 0 : 1,
                  transition: ejectingId === b.id ? 'none' : 'opacity 0.2s',
                }}>
                  {b.animal.emoji}
                  <span style={{ fontSize: '0.42rem', color: 'white', fontFamily: 'Fredoka One, cursive', lineHeight: 1, maxWidth: '42px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
                </div>
              ))}

              {/* Glass shine */}
              <div style={{ position: 'absolute', top: '10px', left: '12px', width: '6px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px' }} />
            </div>

            {/* Jar neck/opening - at the BOTTOM (open end down) */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '32px',
              right: '32px',
              height: '55px',
              background: 'rgba(245, 237, 214, 0.08)',
              border: '4px solid var(--gold)',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
            }} />

            {/* Ejecting bubble - shoots out the bottom */}
            {ejectingId && phase === 'ejecting' && winner && (
              <div style={{
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: winner.animal.color,
                border: '3px solid var(--gold)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                animation: 'ejectDown 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                zIndex: 10,
                boxShadow: '0 0 20px rgba(212,168,67,0.6)',
              }}>
                {winner.animal.emoji}
                <span style={{ fontSize: '0.45rem', color: 'white', fontFamily: 'Fredoka One, cursive', lineHeight: 1 }}>{winner.name}</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '28px', fontFamily: 'Fredoka One, cursive', color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '2px', opacity: 0.6 }}>
            {phase === 'collecting' && `${bubblesInJar.length} / ${players.length} in the jar`}
            {phase === 'shaking' && '✦  ✦  ✦'}
          </div>
        </>
      )}

      {/* Result */}
      {phase === 'result' && winner && (
        <div style={{ textAlign: 'center', opacity: winnerVisible ? 1 : 0, transform: winnerVisible ? 'scale(1)' : 'scale(0.4)', transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <div style={{ fontSize: '5rem', marginBottom: '12px', filter: 'drop-shadow(0 0 24px rgba(212,168,67,0.9))' }}>{winner.animal.emoji}</div>
          <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--gold)', fontSize: '2.2rem' }}>{winner.name}</div>
          <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--cream)', fontSize: '1rem', letterSpacing: '3px', marginBottom: '48px', opacity: 0.8, marginTop: '4px' }}>GOES FIRST!</div>

          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: `${10 + i * 9}%`, top: '15%', width: '8px', height: '8px', borderRadius: i % 2 === 0 ? '50%' : '2px', background: ['var(--red)', 'var(--gold)', 'var(--green)', 'var(--orange)', 'var(--cream)'][i % 5], animation: `confettiFall ${1.2 + (i * 0.15)}s ease-in forwards`, animationDelay: `${i * 0.08}s` }} />
          ))}

          <button onClick={() => router.push('/gameplay')} className="btn-retro btn-primary" style={{ padding: '16px 44px', fontSize: '1.2rem', letterSpacing: '1px' }}>
            LET'S PLAY →
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes jarShake {
          0%, 100% { transform: rotate(0deg) translateX(0); }
          20% { transform: rotate(-4deg) translateX(-6px); }
          40% { transform: rotate(4deg) translateX(6px); }
          60% { transform: rotate(-3deg) translateX(-4px); }
          80% { transform: rotate(3deg) translateX(4px); }
        }
        @keyframes ejectDown {
          0% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
          60% { transform: translateX(-50%) translateY(120px) scale(1.2); opacity: 1; }
          100% { transform: translateX(-50%) translateY(80px) scale(0); opacity: 0; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
