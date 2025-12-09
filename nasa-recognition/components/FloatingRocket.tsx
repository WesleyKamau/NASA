'use client';

export default function FloatingRocket() {
  return (
    <div className="fixed bottom-10 right-10 z-10 pointer-events-none animate-float">
      <div className="relative">
        {/* Rocket */}
        <svg
          width="60"
          height="80"
          viewBox="0 0 60 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          {/* Flames */}
          <g className="animate-pulse">
            <ellipse cx="30" cy="75" rx="8" ry="5" fill="#F97316" opacity="0.8" />
            <ellipse cx="30" cy="78" rx="6" ry="3" fill="#FBBF24" opacity="0.9" />
          </g>

          {/* Body */}
          <path
            d="M30 5 L45 30 L45 60 L30 70 L15 60 L15 30 Z"
            fill="#E5E7EB"
            stroke="#9CA3AF"
            strokeWidth="1"
          />

          {/* Nose cone */}
          <path d="M30 5 L45 30 L30 25 L15 30 Z" fill="#3B82F6" />

          {/* Window */}
          <circle cx="30" cy="40" r="6" fill="#60A5FA" opacity="0.7" />
          <circle cx="30" cy="40" r="4" fill="#93C5FD" opacity="0.5" />

          {/* Wings */}
          <path d="M15 50 L5 65 L15 60 Z" fill="#EF4444" />
          <path d="M45 50 L55 65 L45 60 Z" fill="#EF4444" />

          {/* Details */}
          <line x1="20" y1="32" x2="40" y2="32" stroke="#9CA3AF" strokeWidth="1" />
          <line x1="20" y1="36" x2="40" y2="36" stroke="#9CA3AF" strokeWidth="1" />
        </svg>

        {/* Glow effect */}
        <div className="absolute inset-0 blur-xl bg-blue-500/20 -z-10 animate-pulse" />
      </div>
    </div>
  );
}
