'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/GameContext';

export default function DrawPage() {
  const router = useRouter();
  const { game, setFirstPlayer } = useGame();
  const [phase, setPhase] = useState('collecting');
  const [winner, setWinner] = useState(null);
  const [bubblesInJar, setBubblesInJar] = useState([]);
  const [jarShake, setJarShake] = useState(false);
  const [winnerVisible, setWinnerVisible] = useState(false);

  const players = game.players;

  useEffect(() => {
    if (players.length === 0) { router.push('/new-game'); return; }

    const timeouts = players.map((p, i) =>
      setTimeout(() => {
        setBubblesInJar(prev => [...prev, { ...p, jarX: 30 + Math.random() * 40, jarY: 20 + Math.random() * 40 }]);
      }, i * 300 + 200)
    );

    setTimeout(() => {
      setPhase('shaking');
      setJarShake(true);
      setTimeout(() => setJarShake(false), 1200);
    }, players.length * 300 + 800);

    setTimeout(() => {
      const picked = players[Math.floor(Math.random() * players.length)];
      setWinner(picked);
      setFirstPlayer(picked);
      setPhase('result');
      setTimeout(() => setWinnerVisible(true), 400);
    }, players.length * 300 + 2400);

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="screen" style={{ background: 'var(--navy)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: i % 3 === 0 ? '3px' : '2px', height: i % 3 === 0 ? '3px' : '2px', borderRadius: '50%', background: 'var(--gold)', opacity: 0.4 + Math.random() * 0.4, pointerEvents: 'none' }} />
      ))}

      {phase !== 'result' && (
        <>
          <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--cream)', fontSize: '1.5rem', marginBottom: '32px', textAlign: 'center' }}>
            Drawing for first player...
          </div>
          <div style={{ position: 'relative', width: '180px', height: '220px', animation: jarShake ? 'shake 0.15s ease infinite' : 'none' }}>
            <div style={{ position: 'absolute', bottom: 0, left: '10px', right: '10px', height: '190px', background: 'rgba(245, 237, 214, 0.12)', border: '4px solid var(--gold)', borderRadius: '8px 8px 20px 20px', backdropFilter: 'blur(4px)', overflow: 'hidden' }}>
              {bubblesInJar.map((b, i) => (
                <div key={b.id} style={{ position: 'absolute', left: `${b.jarX}%`, bottom: `${b.jarY}%`, transform: 'translate(-50%, 50%)', width: '44px', height: '44px', borderRadius: '50%', background: b.animal.color, border: '2px solid rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', animation: 'float 2s ease-in-out infinite', animationDelay: `${i * 0.3}s` }}>
                  {b.animal.emoji}
                  <span style={{ fontSize: '0.45rem', color: 'white', fontFamily: 'Fredoka One, cursive', maxWidth: '40px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1 }}>{b.name}</span>
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', top: 0, left: '30px', right: '30px', height: '35px', background: 'rgba(245, 237, 214, 0.15)', border: '4px solid var(--gold)', borderBottom: 'none', borderRadius: '4px 4px 0 0' }} />
          </div>
          <div style={{ marginTop: '24px', fontFamily: 'Fredoka One, cursive', color: 'var(--gold)', fontSize: '1rem', letterSpacing: '2px', opacity: 0.7 }}>
            {phase === 'shaking' ? '✦ SHAKING ✦' : `${bubblesInJar.length} / ${players.length} players`}
          </div>
        </>
      )}

      {phase === 'result' && winner && (
        <div style={{ textAlign: 'center', opacity: winnerVisible ? 1 : 0, transform: winnerVisible ? 'scale(1)' : 'scale(0.5)', transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <div style={{ fontSize: '5rem', marginBottom: '8px', filter: 'drop-shadow(0 0 20px rgba(212, 168, 67, 0.8))' }}>{winner.animal.emoji}</div>
          <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--gold)', fontSize: '2rem', marginBottom: '4px' }}>{winner.name}</div>
          <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--cream)', fontSize: '1.1rem', letterSpacing: '2px', marginBottom: '48px', opacity: 0.8 }}>GOES FIRST!</div>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: `${10 + (i * 7.5)}%`, top: `${20 + Math.sin(i) * 20}%`, width: '8px', height: '8px', borderRadius: i % 2 === 0 ? '50%' : '2px', background: ['var(--red)', 'var(--gold)', 'var(--green)', 'var(--orange)', 'var(--cream)'][i % 5], animation: `confettiFall ${1 + Math.random()}s ease-in forwards`, animationDelay: `${i * 0.1}s` }} />
          ))}
          <button onClick={() => router.push('/gameplay')} className="btn-retro btn-primary" style={{ padding: '16px 40px', fontSize: '1.2rem', letterSpacing: '1px' }}>
            LET'S PLAY →
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-8px) rotate(-3deg); }
          75% { transform: translateX(8px) rotate(3deg); }
        }
        @keyframes float {
          0%, 100% { transform: translate(-50%, 50%) translateY(0px); }
          50% { transform: translate(-50%, 50%) translateY(-8px); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
