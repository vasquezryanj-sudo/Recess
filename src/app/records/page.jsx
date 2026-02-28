'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRecords, deleteRecord } from '@/lib/storage';

const ANIMALS_MAP = {
  fox: '🦊', bear: '🐻', rabbit: '🐰', frog: '🐸', cat: '🐱',
  penguin: '🐧', owl: '🦉', duck: '🦆', wolf: '🐺', raccoon: '🦝', lion: '🦁', elephant: '🐘',
};

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setRecords(getRecords());
  }, []);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="screen" style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--navy)', padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--cream)', fontSize: '1.4rem', cursor: 'pointer', padding: 0 }}>←</button>
        <div style={{ fontFamily: 'Abril Fatface, serif', color: 'var(--cream)', fontSize: '1.6rem' }}>Records</div>
      </div>

      <div style={{ background: 'var(--gold)', borderBottom: '3px solid var(--navy)', padding: '12px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '1.5rem' }}>🏆</span>
        <div style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--navy)', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Hall of Champions</div>
      </div>

      <div style={{ padding: '16px' }}>
        {records.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎲</div>
            <div style={{ fontFamily: 'Abril Fatface, serif', fontSize: '1.3rem', color: 'var(--navy)', marginBottom: '8px' }}>No games yet!</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--navy)', opacity: 0.5 }}>Play your first game to see records here.</div>
          </div>
        )}

        {records.map(record => {
          const players = record.players || [];
          const winner = players[0];
          const others = players.slice(1);
          return (
            <div key={record.id} onClick={() => setSelected(selected?.id === record.id ? null : record)} className="card-retro" style={{ marginBottom: '12px', overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontFamily: 'Abril Fatface, serif', fontSize: '1.1rem', color: 'var(--navy)' }}>{record.title}</div>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.75rem', color: 'var(--navy)', opacity: 0.5 }}>{formatDate(record.played_at)}</div>
                </div>
                <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.9rem', color: 'var(--red)' }}>
                  {winner && `${ANIMALS_MAP[winner.animal_id] || '🎮'} ${winner.name} beat ${others.map(p => p.name).join(', ')}`}
                </div>
              </div>
              {selected?.id === record.id && (
                <div style={{ borderTop: '2px solid var(--navy)', padding: '12px 16px', background: 'var(--paper)' }}>
                  {players.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: i < players.length - 1 ? '1px dashed rgba(27,42,74,0.2)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'Fredoka One, cursive', color: 'var(--navy)', opacity: 0.4, fontSize: '0.8rem' }}>#{i+1}</span>
                        <span>{ANIMALS_MAP[p.animal_id] || '🎮'}</span>
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
    </div>
  );
}
