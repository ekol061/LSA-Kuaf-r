import React from 'react';

interface LsaLogoProps {
  className?: string;
  size?: number;
}

export const LsaLogo: React.FC<LsaLogoProps> = ({ className = '', size = 44 }) => {
  return (
    <div
      className={`rounded-2xl bg-zinc-950 flex items-center justify-center border-2 border-red-600 shadow-md shrink-0 overflow-hidden select-none ${className}`}
      style={{ width: size, height: size }}
      title="L.S.A Bay Kuaför"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dark Background & Inner Red Ring */}
        <rect width="100" height="100" rx="22" fill="#09090B" />
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="18"
          stroke="#DC2626"
          strokeWidth="3"
        />

        {/* Top Barber Scissors Icon */}
        <g stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="36" y1="32" x2="64" y2="16" />
          <line x1="64" y1="32" x2="36" y2="16" />
          <circle cx="33" cy="34" r="4.5" fill="#09090B" stroke="#FFFFFF" strokeWidth="2.5" />
          <circle cx="67" cy="34" r="4.5" fill="#09090B" stroke="#FFFFFF" strokeWidth="2.5" />
        </g>

        {/* Bold High-Contrast L.S.A Monogram */}
        <text
          x="50"
          y="64"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          fontSize="28"
          fontWeight="900"
          letterSpacing="1.5"
        >
          L.S.A
        </text>

        {/* Bottom Red Accent Bar */}
        <rect x="20" y="73" width="60" height="12" rx="4" fill="#DC2626" />
        <text
          x="50"
          y="82"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          fontSize="8.5"
          fontWeight="800"
          letterSpacing="1.5"
        >
          KUAFÖR
        </text>
      </svg>
    </div>
  );
};
