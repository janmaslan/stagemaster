import React from 'react';
import { StageElementType } from '../../types/audio';

interface IconProps {
  className?: string;
  size?: number;
}

export const DrumsIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Kick drum in center */}
    <ellipse cx="20" cy="18" rx="9" ry="6" fill="#1e293b" />
    <path d="M11 18v8c0 3.3 4 6 9 6s9-2.7 9-6v-8" />
    {/* Snare drum */}
    <circle cx="10" cy="27" r="4.5" fill="#334155" />
    {/* Tom 1 & 2 */}
    <circle cx="15" cy="11" r="3.5" fill="#334155" />
    <circle cx="25" cy="11" r="3.5" fill="#334155" />
    {/* Floor Tom */}
    <circle cx="30" cy="25" r="5" fill="#334155" />
    {/* Cymbals */}
    <ellipse cx="6" cy="14" rx="4" ry="1.5" stroke="#eab308" />
    <ellipse cx="34" cy="14" rx="4.5" ry="1.8" stroke="#eab308" />
    <ellipse cx="32" cy="7" rx="3.5" ry="1.5" stroke="#eab308" />
  </svg>
);

export const GuitarAmpIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="6" width="28" height="24" rx="3" fill="#1e293b" />
    <rect x="7" y="13" width="22" height="14" rx="1.5" fill="#0f172a" stroke="#475569" strokeDasharray="2 2" />
    {/* Knobs */}
    <circle cx="9" cy="9.5" r="1.2" fill="#e2e8f0" />
    <circle cx="13" cy="9.5" r="1.2" fill="#e2e8f0" />
    <circle cx="17" cy="9.5" r="1.2" fill="#e2e8f0" />
    <circle cx="21" cy="9.5" r="1.2" fill="#e2e8f0" />
    {/* Logo */}
    <line x1="14" y1="19" x2="22" y2="19" stroke="#94a3b8" />
  </svg>
);

export const BassAmpIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Bass head */}
    <rect x="5" y="4" width="26" height="8" rx="2" fill="#334155" />
    <circle cx="10" cy="8" r="1.2" fill="#38bdf8" />
    <circle cx="14" cy="8" r="1.2" fill="#e2e8f0" />
    <circle cx="18" cy="8" r="1.2" fill="#e2e8f0" />
    <circle cx="26" cy="8" r="1.2" fill="#ef4444" />
    {/* Bass Cab 4x10 */}
    <rect x="4" y="13" width="28" height="20" rx="2" fill="#1e293b" />
    <circle cx="11" cy="18" r="3.2" fill="#0f172a" stroke="#475569" />
    <circle cx="25" cy="18" r="3.2" fill="#0f172a" stroke="#475569" />
    <circle cx="11" cy="27" r="3.2" fill="#0f172a" stroke="#475569" />
    <circle cx="25" cy="27" r="3.2" fill="#0f172a" stroke="#475569" />
  </svg>
);

export const AcousticGuitarIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M26 6L20 12" stroke="#d97706" />
    <circle cx="14" cy="22" r="8" fill="#1e293b" stroke="#d97706" />
    <circle cx="14" cy="22" r="2.5" fill="#0f172a" stroke="#d97706" />
    <line x1="28" y1="4" x2="23" y2="9" stroke="#d97706" />
  </svg>
);

export const KeyboardIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="10" width="30" height="16" rx="2.5" fill="#1e293b" />
    {/* White keys */}
    <line x1="8" y1="10" x2="8" y2="26" stroke="#475569" />
    <line x1="13" y1="10" x2="13" y2="26" stroke="#475569" />
    <line x1="18" y1="10" x2="18" y2="26" stroke="#475569" />
    <line x1="23" y1="10" x2="23" y2="26" stroke="#475569" />
    <line x1="28" y1="10" x2="28" y2="26" stroke="#475569" />
    {/* Black keys */}
    <rect x="6.5" y="10" width="3" height="9" fill="#0f172a" />
    <rect x="11.5" y="10" width="3" height="9" fill="#0f172a" />
    <rect x="21.5" y="10" width="3" height="9" fill="#0f172a" />
    <rect x="26.5" y="10" width="3" height="9" fill="#0f172a" />
  </svg>
);

export const VocalMicIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Stand tripod base */}
    <circle cx="18" cy="18" r="10" stroke="#475569" strokeDasharray="3 3" />
    <line x1="18" y1="18" x2="18" y2="30" stroke="#94a3b8" />
    <line x1="18" y1="30" x2="11" y2="34" stroke="#94a3b8" />
    <line x1="18" y1="30" x2="25" y2="34" stroke="#94a3b8" />
    {/* Mic grill */}
    <rect x="15" y="6" width="6" height="9" rx="3" fill="#cbd5e1" stroke="#475569" />
    <path d="M12 11c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="#94a3b8" />
    <line x1="18" y1="17" x2="18" y2="22" stroke="#94a3b8" />
  </svg>
);

export const WedgeMonitorIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Angled wedge shape */}
    <path d="M5 28L11 8L31 16L27 30Z" fill="#1e293b" stroke="#6366f1" />
    <ellipse cx="19" cy="21" rx="6" ry="4" fill="#0f172a" stroke="#818cf8" />
    {/* Sound waves towards performer */}
    <path d="M15 11c2-3 6-3 8-1" stroke="#818cf8" strokeDasharray="2 2" />
  </svg>
);

export const IemStationIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Bodypack transmitter */}
    <rect x="10" y="11" width="16" height="20" rx="3" fill="#1e293b" stroke="#a855f7" />
    <rect x="13" y="14" width="10" height="6" rx="1" fill="#0f172a" stroke="#a855f7" />
    {/* Antenna */}
    <line x1="14" y1="11" x2="14" y2="3" stroke="#cbd5e1" strokeWidth="2" />
    {/* Volume knob */}
    <circle cx="22" cy="7" r="2" fill="#e2e8f0" />
  </svg>
);

export const StageboxIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="6" width="28" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
    {/* Handle */}
    <path d="M13 6V3h10v3" stroke="#38bdf8" />
    {/* XLR port sockets */}
    <circle cx="9" cy="13" r="2" fill="#1e293b" stroke="#38bdf8" />
    <circle cx="15" cy="13" r="2" fill="#1e293b" stroke="#38bdf8" />
    <circle cx="21" cy="13" r="2" fill="#1e293b" stroke="#38bdf8" />
    <circle cx="27" cy="13" r="2" fill="#1e293b" stroke="#38bdf8" />
    <circle cx="9" cy="22" r="2" fill="#1e293b" stroke="#38bdf8" />
    <circle cx="15" cy="22" r="2" fill="#1e293b" stroke="#38bdf8" />
    <circle cx="21" cy="22" r="2" fill="#1e293b" stroke="#38bdf8" />
    <circle cx="27" cy="22" r="2" fill="#1e293b" stroke="#38bdf8" />
  </svg>
);

export const SubSnakeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="6" y="8" width="24" height="20" rx="3" fill="#1e293b" stroke="#0ea5e9" />
    <circle cx="12" cy="14" r="2" fill="#0f172a" stroke="#0ea5e9" />
    <circle cx="18" cy="14" r="2" fill="#0f172a" stroke="#0ea5e9" />
    <circle cx="24" cy="14" r="2" fill="#0f172a" stroke="#0ea5e9" />
    <circle cx="12" cy="22" r="2" fill="#0f172a" stroke="#0ea5e9" />
    <circle cx="18" cy="22" r="2" fill="#0f172a" stroke="#0ea5e9" />
    <circle cx="24" cy="22" r="2" fill="#0f172a" stroke="#0ea5e9" />
  </svg>
);

export const DiBoxIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="6" y="9" width="24" height="18" rx="2" fill="#1e293b" stroke="#eab308" />
    <text x="11" y="21" fill="#eab308" fontSize="8" fontWeight="bold" fontFamily="sans-serif">DI</text>
    {/* In / Out jacks */}
    <circle cx="24" cy="14" r="1.5" fill="#facc15" />
    <circle cx="24" cy="22" r="1.5" fill="#facc15" />
  </svg>
);

export const PowerDropIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="10" width="26" height="16" rx="3" fill="#7f1d1d" stroke="#ef4444" />
    {/* Sockets */}
    <circle cx="11" cy="18" r="3.5" fill="#450a0a" stroke="#f87171" />
    <circle cx="18" cy="18" r="3.5" fill="#450a0a" stroke="#f87171" />
    <circle cx="25" cy="18" r="3.5" fill="#450a0a" stroke="#f87171" />
    <text x="16" y="8" fill="#fca5a5" fontSize="7" fontWeight="bold">230V</text>
  </svg>
);

export const HornIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 18h12l8-8v16l-8-8" fill="#1e293b" stroke="#eab308" />
  </svg>
);

export const PercussionIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="13" cy="10" rx="5" ry="3" fill="#1e293b" stroke="#ca8a04" />
    <path d="M8 10c0 10 2 18 5 18s5-8 5-18" stroke="#ca8a04" />
    <ellipse cx="23" cy="12" rx="4.5" ry="2.5" fill="#1e293b" stroke="#ca8a04" />
    <path d="M18.5 12c0 9 2 15 4.5 15s4.5-6 4.5-15" stroke="#ca8a04" />
  </svg>
);

export const DjIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="9" width="28" height="18" rx="2" fill="#1e293b" stroke="#06b6d4" />
    <circle cx="11" cy="18" r="5" fill="#0f172a" stroke="#22d3ee" />
    <circle cx="25" cy="18" r="5" fill="#0f172a" stroke="#22d3ee" />
    <line x1="18" y1="13" x2="18" y2="23" stroke="#22d3ee" />
  </svg>
);

export const getStageIconComponent = (type: StageElementType) => {
  switch (type) {
    case 'drums': return DrumsIcon;
    case 'guitar_amp': return GuitarAmpIcon;
    case 'bass_amp': return BassAmpIcon;
    case 'acoustic_guitar': return AcousticGuitarIcon;
    case 'keyboard': return KeyboardIcon;
    case 'vocal': return VocalMicIcon;
    case 'wedge_monitor': return WedgeMonitorIcon;
    case 'iem_station': return IemStationIcon;
    case 'stagebox': return StageboxIcon;
    case 'sub_snake': return SubSnakeIcon;
    case 'di_box': return DiBoxIcon;
    case 'power_drop': return PowerDropIcon;
    case 'horn': return HornIcon;
    case 'percussion': return PercussionIcon;
    case 'dj': return DjIcon;
    default: return StageboxIcon;
  }
};
