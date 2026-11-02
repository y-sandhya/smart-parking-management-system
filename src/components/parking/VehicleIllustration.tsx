import React from 'react';
import { VehicleType } from '../../types';

interface VehicleIllustrationProps {
  type?: VehicleType | 'standard';
  color?: string;
  className?: string;
  isCharging?: boolean;
}

export const VehicleIllustration: React.FC<VehicleIllustrationProps> = ({
  type = 'sedan',
  color = '#2563EB',
  className = 'w-16 h-28',
  isCharging = false,
}) => {
  // Map car colors with sleek shadows and highlight tones
  const bodyColor = color || '#2563EB';

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 100 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Subtle glossy gradient for car body */}
          <linearGradient id={`car-body-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={bodyColor} stopOpacity="0.9" />
            <stop offset="60%" stopColor={bodyColor} stopOpacity="1" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.25" />
          </linearGradient>

          {/* Windshield tinted glass */}
          <linearGradient id="windshield-glass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1E293B" stopOpacity="0.95" />
          </linearGradient>

          {/* Headlight glow */}
          <radialGradient id="headlight-beam" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Wheels / Tires (Top-down side profiles) */}
        <rect x="6" y="24" width="7" height="26" rx="3.5" fill="#090D16" />
        <rect x="87" y="24" width="7" height="26" rx="3.5" fill="#090D16" />
        <rect x="6" y="128" width="7" height="26" rx="3.5" fill="#090D16" />
        <rect x="87" y="128" width="7" height="26" rx="3.5" fill="#090D16" />

        {/* Wheel rims highlight */}
        <line x1="9.5" y1="28" x2="9.5" y2="46" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="90.5" y1="28" x2="90.5" y2="46" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="9.5" y1="132" x2="9.5" y2="150" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="90.5" y1="132" x2="90.5" y2="150" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />

        {/* Side Mirrors */}
        <path d="M 12 52 C 5 50, 4 56, 12 59 Z" fill={bodyColor} />
        <path d="M 88 52 C 95 50, 96 56, 88 59 Z" fill={bodyColor} />

        {/* Main Chassis Body */}
        {type === 'suv' || type === 'van' ? (
          // Rugged SUV wider stance
          <rect
            x="11"
            y="14"
            width="78"
            height="152"
            rx="20"
            fill={`url(#car-body-${color.replace('#', '')})`}
            stroke="#0F172A"
            strokeWidth="1.5"
          />
        ) : type === 'compact' ? (
          // Nimble rounded compact
          <rect
            x="14"
            y="22"
            width="72"
            height="136"
            rx="24"
            fill={`url(#car-body-${color.replace('#', '')})`}
            stroke="#0F172A"
            strokeWidth="1.5"
          />
        ) : (
          // Streamlined Sedan / EV
          <rect
            x="12"
            y="16"
            width="76"
            height="148"
            rx="24"
            fill={`url(#car-body-${color.replace('#', '')})`}
            stroke="#0F172A"
            strokeWidth="1.5"
          />
        )}

        {/* Front Bonnet / Hood Contours */}
        <path
          d="M 24 22 C 32 32, 68 32, 76 22"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Front Headlights */}
        <path d="M 17 18 Q 23 16 30 20 Q 24 24 18 24 Z" fill="#FDE047" />
        <path d="M 83 18 Q 77 16 70 20 Q 76 24 82 24 Z" fill="#FDE047" />

        {/* Front Windshield (curved panoramic) */}
        <path
          d="M 21 48 C 28 44, 72 44, 79 48 L 75 72 C 65 70, 35 70, 25 72 Z"
          fill="url(#windshield-glass)"
        />

        {/* Sunroof / Roof Panel */}
        <rect
          x="28"
          y="76"
          width="44"
          height="38"
          rx="6"
          fill={type === 'ev' ? '#0F172A' : 'rgba(0,0,0,0.18)'}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />

        {type === 'ev' && (
          // Glass roof reflection for EV
          <line x1="33" y1="80" x2="67" y2="110" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        )}

        {/* Rear Windshield */}
        <path
          d="M 25 118 C 35 120, 65 120, 75 118 L 78 138 C 70 142, 30 142, 22 138 Z"
          fill="url(#windshield-glass)"
        />

        {/* Rear Taillights (Red LED) */}
        <path d="M 18 158 Q 25 160 32 158 Q 28 163 19 162 Z" fill="#EF4444" />
        <path d="M 82 158 Q 75 160 68 158 Q 72 163 81 162 Z" fill="#EF4444" />
        {/* Rear light strip */}
        <line x1="32" y1="159" x2="68" y2="159" stroke="#DC2626" strokeWidth="1.5" />

        {/* Rear License Plate area */}
        <rect x="36" y="161" width="28" height="6" rx="1.5" fill="#F8FAFC" stroke="#64748B" strokeWidth="0.5" />
        <line x1="40" y1="164" x2="60" y2="164" stroke="#0F172A" strokeWidth="1" strokeDasharray="1.5 1" />
      </svg>

      {/* Charging Pulse Indicator when EV is plugged in */}
      {isCharging && (
        <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-lg ring-2 ring-emerald-300 animate-pulse">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
      )}
    </div>
  );
};
