'use client';

const ICONS = {
  robot: (
    <>
      <circle cx="16" cy="4.5" r="2.5" fill="white"/>
      <rect x="14.5" y="6.5" width="3" height="4" fill="white"/>
      <rect x="7" y="10" width="18" height="15" rx="3" fill="white"/>
      <rect x="11" y="14.5" width="4" height="3.5" rx="1" fill="rgba(0,0,0,0.25)"/>
      <rect x="17" y="14.5" width="4" height="3.5" rx="1" fill="rgba(0,0,0,0.25)"/>
      <rect x="11.5" y="21" width="9" height="2" rx="1" fill="rgba(0,0,0,0.15)"/>
    </>
  ),
  skull: (
    <>
      <circle cx="16" cy="13.5" r="9.5" fill="white"/>
      <rect x="12" y="23" width="8" height="5" rx="1.5" fill="white"/>
      <circle cx="12.5" cy="13" r="2.5" fill="rgba(0,0,0,0.3)"/>
      <circle cx="19.5" cy="13" r="2.5" fill="rgba(0,0,0,0.3)"/>
      <line x1="13.5" y1="23" x2="13.5" y2="28" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
      <line x1="16" y1="23" x2="16" y2="28" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
      <line x1="18.5" y1="23" x2="18.5" y2="28" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
    </>
  ),
  sun: (
    <>
      <circle cx="16" cy="16" r="7" fill="white"/>
      <g stroke="white" strokeWidth="2.5" strokeLinecap="round">
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="16" y1="26" x2="16" y2="30"/>
        <line x1="2" y1="16" x2="6" y2="16"/>
        <line x1="26" y1="16" x2="30" y2="16"/>
        <line x1="6.1" y1="6.1" x2="8.9" y2="8.9"/>
        <line x1="23.1" y1="23.1" x2="25.9" y2="25.9"/>
        <line x1="6.1" y1="25.9" x2="8.9" y2="23.1"/>
        <line x1="23.1" y1="8.9" x2="25.9" y2="6.1"/>
      </g>
      <circle cx="13" cy="14.5" r="1.3" fill="rgba(0,0,0,0.2)"/>
      <circle cx="19" cy="14.5" r="1.3" fill="rgba(0,0,0,0.2)"/>
      <path d="M12 19 Q16 22 20 19" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
    </>
  ),
  cactus: (
    <>
      <rect x="12.5" y="4" width="7" height="24" rx="3.5" fill="white"/>
      <rect x="4" y="12" width="9" height="6" rx="3" fill="white"/>
      <rect x="19" y="8" width="9" height="6" rx="3" fill="white"/>
      <line x1="16" y1="10" x2="16" y2="12" stroke="rgba(0,0,0,0.1)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="16" y1="16" x2="16" y2="18" stroke="rgba(0,0,0,0.1)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="16" y1="22" x2="16" y2="24" stroke="rgba(0,0,0,0.1)" strokeWidth="1" strokeLinecap="round"/>
    </>
  ),
  ghost: (
    <>
      <path d="M7 28 L7 14 C7 8 11 4 16 4 C21 4 25 8 25 14 L25 28 L22 25 L19 28 L16 25 L13 28 L10 25 Z" fill="white"/>
      <circle cx="12" cy="14.5" r="2.2" fill="rgba(0,0,0,0.25)"/>
      <circle cx="20" cy="14.5" r="2.2" fill="rgba(0,0,0,0.25)"/>
      <ellipse cx="16" cy="20.5" rx="2" ry="2.5" fill="rgba(0,0,0,0.15)"/>
    </>
  ),
  shark: (
    <>
      <ellipse cx="16" cy="18" rx="12" ry="7" fill="white"/>
      <path d="M16 11 L12.5 5 L19.5 11 Z" fill="white"/>
      <path d="M4 18 L2 13 L2 23 Z" fill="white"/>
      <circle cx="22" cy="16" r="1.8" fill="rgba(0,0,0,0.25)"/>
      <path d="M24 20 Q27 20 28 17" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.2" strokeLinecap="round"/>
    </>
  ),
  wizard: (
    <>
      <path d="M16 2 L6 26 L26 26 Z" fill="white"/>
      <rect x="3" y="24" width="26" height="5" rx="2.5" fill="white"/>
      <polygon points="16,8 17.2,11 20.5,11.5 18,13.5 18.8,17 16,15 13.2,17 14,13.5 11.5,11.5 14.8,11" fill="rgba(0,0,0,0.15)"/>
    </>
  ),
  bolt: (
    <>
      <path d="M18 2 L8 16 L14 16 L12 30 L24 14 L17 14 Z" fill="white"/>
    </>
  ),
  planet: (
    <>
      <ellipse cx="16" cy="16" rx="15" ry="4" fill="none" stroke="white" strokeWidth="2.5" transform="rotate(-20 16 16)" opacity="0.5"/>
      <circle cx="16" cy="16" r="9" fill="white"/>
      <circle cx="12" cy="13" r="1.5" fill="rgba(0,0,0,0.1)"/>
      <circle cx="19" cy="19" r="2.5" fill="rgba(0,0,0,0.08)"/>
    </>
  ),
  mushroom: (
    <>
      <rect x="12" y="18" width="8" height="10" rx="2" fill="white" opacity="0.85"/>
      <path d="M4 19 Q4 6 16 6 Q28 6 28 19 Z" fill="white"/>
      <circle cx="11" cy="13" r="2" fill="rgba(0,0,0,0.12)"/>
      <circle cx="19" cy="11" r="1.5" fill="rgba(0,0,0,0.12)"/>
      <circle cx="16" cy="16" r="1.8" fill="rgba(0,0,0,0.12)"/>
    </>
  ),
  flame: (
    <>
      <path d="M16 3 C16 3 24 12 24 19 C24 24 20 28 16 28 C12 28 8 24 8 19 C8 12 16 3 16 3 Z" fill="white"/>
      <path d="M16 14 C16 14 20 18 20 21 C20 23.5 18 26 16 26 C14 26 12 23.5 12 21 C12 18 16 14 16 14 Z" fill="rgba(0,0,0,0.12)"/>
    </>
  ),
  diamond: (
    <>
      <path d="M16 3 L27 14 L16 29 L5 14 Z" fill="white"/>
      <path d="M5 14 L27 14" stroke="rgba(0,0,0,0.15)" strokeWidth="1.2"/>
      <path d="M12 3.5 L10 14 L16 29" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
      <path d="M20 3.5 L22 14 L16 29" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
    </>
  ),
};

export default function AvatarIcon({ id, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      {ICONS[id] || <circle cx="16" cy="16" r="10" fill="white" opacity="0.5"/>}
    </svg>
  );
}
