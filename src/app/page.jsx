'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROTATING_PHRASES } from '@/lib/GameContext';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function HomePage() {
  const router = useRouter();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [dayName, setDayName] = useState('');

  useEffect(() => {
    const d = new Date();
    setDayName(DAYS[d.getDay()]);
    const randomStart = Math.floor(Math.random() * ROTATING_PHRASES.length);
    setPhraseIndex(randomStart);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setPhraseIndex(i => (i + 1) % ROTATING_PHRASES.length);
        setFadeIn(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="screen" style={{ background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'repeating-linear-gradient(90deg, var(--red) 0px, var(--red) 20px, var(--navy) 20px, var(--navy) 40px, var(--gold) 40px, var(--gold) 60px)' }} />

      <button
        onClick={() => router.push('/records')}
        className="btn-retro btn-navy"
        style={{ position: 'absolute', top: '24px', right: '20px', padding: '8px 14px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
        aria-label="Records"
      >
        <PodiumIcon />
        <span style={{ fontSize: '0.6rem', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Fredoka One, cursive' }}>Records</span>
      </button>

      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ fontFamily: 'Abril Fatface, serif', fontSize: '5rem', color: 'var(--navy)', lineHeight: 1, letterSpacing: '-2px', textShadow: '4px 4px 0px var(--red)' }}>
          RECESS
        </div>
        <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '0.9rem', color: 'var(--gold)', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '4px' }}>
          ★ Board Game Tracker ★
        </div>
      </div>

      <button
        onClick={() => router.push('/new-game')}
        className="btn-retro btn-primary"
        style={{ padding: '24px 56px', fontSize: '2rem', borderRadius: '16px', borderWidth: '4px', boxShadow: '6px 6px 0px var(--navy)', marginBottom: '60px', letterSpacing: '1px' }}
      >
        PLAY NOW
      </button>

      <div style={{ textAlign: 'center', position: 'absolute', bottom: '32px', left: '20px', right: '20px' }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem', color: 'var(--navy)', opacity: 0.7, marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          A board game on a {dayName}.
        </div>
        <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: '1.05rem', color: 'var(--red)', opacity: fadeIn ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          Better than {ROTATING_PHRASES[phraseIndex]}.
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px', background: 'repeating-linear-gradient(90deg, var(--gold) 0px, var(--gold) 20px, var(--navy) 20px, var(--navy) 40px, var(--red) 40px, var(--red) 60px)' }} />
    </div>
  );
}

function PodiumIcon() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="12" width="9" height="16" fill="var(--gold)" stroke="var(--cream)" strokeWidth="1.5" rx="1"/>
      <text x="4.5" y="22" textAnchor="middle" fontSize="7" fill="var(--navy)" fontFamily="Fredoka One, cursive" fontWeight="bold">2</text>
      <rect x="11" y="4" width="10" height="24" fill="var(--red)" stroke="var(--cream)" strokeWidth="1.5" rx="1"/>
      <text x="16" y="19" textAnchor="middle" fontSize="8" fill="white" fontFamily="Fredoka One, cursive" fontWeight="bold">1</text>
      <rect x="23" y="17" width="9" height="11" fill="var(--orange)" stroke="var(--cream)" strokeWidth="1.5" rx="1"/>
      <text x="27.5" y="25" textAnchor="middle" fontSize="7" fill="var(--navy)" fontFamily="Fredoka One, cursive" fontWeight="bold">3</text>
      <text x="16" y="12" textAnchor="middle" fontSize="7" fill="var(--gold)">★</text>
    </svg>
  );
}
