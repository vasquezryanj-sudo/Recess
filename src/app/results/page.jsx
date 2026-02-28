'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/GameContext';
import { saveGame } from '@/lib/storage';

export default function ResultsPage() {
  const router = useRouter();
  const { game, resetGame } = useGame();
  const [phase, setPhase] = useState('bubbles');
  const [visibleBubbles, setVisibleBubbles] = useState([]);
  const [winnerVisible, setWinnerVisible] = useState(false);

  const sortedPlayers = [...game.players].sort((a, b) => (game.scores[b.id] || 0) - (game.scores[a.id] || 0));
  const winner = sortedPlayers[0];

  useEffect(() => {
    if (!winner) { router.push('/'); return; }
    const losers = sortedPlayers.slice(1);
    losers.forEach((p, i) => {
      setTimeout(() => setVisibleBubbles(prev => [...prev, p]), i * 250 + 200);
    });
    setTimeout(() => {
      setPhase('winner');
      setWinnerVisible(true);
      try { saveGame({ title: game.title, bggGame: game.bggGame, players: game.players, scores: game.scores }); } catch (e) { console.error(e); }
    }, losers.length * 250 + 800);
  }, []);

  const positions = [
    { top: '8%', left: '8%' }, { top: '8%', right: '8%' }, { bottom: '15%', left: '8%' },
    { bottom: '15%', right: '8%' }, { top: '45%', left: '4%' }, { top: '45%', right: '4%' }
  ];

  return (
    <div className="screen" style={{ background: 'var(--navy)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', overflow: 'hidden' }}>

      {winnerVisible && Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: '-10px', width: `${6 + Math.random() * 6}px`, height: `${6 + Math.random() * 6}px`, borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0', background: ['var(--red)', 'var(--gold)', 'var(--green)', 'var(--orange)', 'var(--cream)'][i % 5], animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in forwards`, animationDelay: `${Math.random() * 0.5}s`, zIndex: 10 }} />
      ))}

      {visibleBubbles.map((p, i) => (
        <div key={p.id} style={{ position: 'absolute', ...positions[i % positions.length], width: '56px', height: '56px', borderRadius: '50%', background: p.animal.color, border: '3px solid rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards', opacity: 0 }}>
          {p.animal.emoji}
          <span style={{ fontSize: '0.45rem', color: 'white', fontFamily: 'Fredoka One, cursive', lineHeight: 1 }}>{p.name}</span>
          <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'Fredoka One, cursive' }}>{game.scores[p.id] || 0}</span>
        </div>
      ))}

      <div style={{ textAlign: 'center', opacity: winnerVisible ? 1 : 0, transform: winnerVisible ? 'scale(1)' : 'scale(0)', transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', zIndex: 5 }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: winner?.animal.color, border: '5px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', margin: '0 auto 16px', boxShadow: '0 0 40px rgba(212,168,67,0.6)', animation: winnerVisible ? 'pulse 1.5s ease-in-out infinite' : 'none' }}>
          {winner?.animal.emoji}
        </div>
        <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--gold)', fontSize: '1rem', letterSpacing: '4px', marginBottom: '4px', textTransform: 'uppercase' }}>★ Winner ★</div>
        <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--cream)', fontSize: '2.2rem', marginBottom: '4px' }}>{winner?.name}</div>
        <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--gold)', fontSize: '1.5rem', marginBottom: '32px' }}>{game.scores[winner?.id] || 0} pts</div>

        <div className="card-retro" style={{ background: 'rgba(245,237,214,0.1)', borderColor: 'rgba(212,168,67,0.4)', padding: '16px', marginBottom: '28px', textAlign: 'left', minWidth: '220px' }}>
          {sortedPlayers.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < sortedPlayers.length - 1 ? '1px solid rgba(212,168,67,0.2)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ opacity: 0.6, fontFamily: 'Fredoka One, cursive', color: 'var(--gold)', fontSize: '0.8rem' }}>#{i + 1}</span>
                <span style={{ fontSize: '1.1rem' }}>{p.animal.emoji}</span>
                <span style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--cream)', fontSize: '0.95rem' }}>{p.name}</span>
              </div>
              <span style={{ fontFamily: 'Abril Fatface, serif', color: i === 0 ? 'var(--gold)' : 'var(--cream)', fontSize: '1.1rem' }}>{game.scores[p.id] || 0}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => router.push('/records')} className="btn-retro btn-secondary" style={{ padding: '12px 20px', fontSize: '0.9rem' }}>Records 🏆</button>
          <button onClick={() => { resetGame(); router.push('/new-game'); }} className="btn-retro btn-primary" style={{ padding: '12px 20px', fontSize: '0.9rem' }}>Play Again →</button>
        </div>
        <button onClick={() => { resetGame(); router.push('/'); }} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--cream)', opacity: 0.4, fontFamily: 'Fredoka One, cursive', fontSize: '0.85rem', cursor: 'pointer' }}>Home</button>
      </div>

      <style jsx global>{`
        @keyframes popIn { 0% { opacity: 0; transform: scale(0); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 40px rgba(212,168,67,0.6); } 50% { box-shadow: 0 0 60px rgba(212,168,67,0.9); } }
      `}</style>
    </div>
  );
}
