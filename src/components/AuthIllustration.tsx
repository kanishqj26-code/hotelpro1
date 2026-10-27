import React from 'react';

export const AuthIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center p-6 ${className}`}>
      <svg
        viewBox="0 0 600 500"
        className="w-full max-w-[520px] h-auto drop-shadow-sm select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.6">
          <path
            d="M80 190C60 170 50 140 70 120C90 100 120 120 120 150C120 175 100 195 80 190Z"
            fill="#dbeafe"
          />
          <path
            d="M60 270C40 240 30 190 70 180C100 170 110 210 100 240C90 270 70 280 60 270Z"
            fill="#bfdbfe"
          />
          <path
            d="M40 380C10 330 30 280 80 300C120 320 120 370 90 410C65 440 45 410 40 380Z"
            fill="#93c5fd"
          />
          <path
            d="M60 460C40 410 80 370 120 390C160 410 150 460 110 480C80 495 65 480 60 460Z"
            fill="#bfdbfe"
          />
          <ellipse cx="110" cy="300" rx="14" ry="7" fill="#1e293b" />
          <ellipse cx="110" cy="335" rx="16" ry="8" fill="#1e293b" />
          <ellipse cx="110" cy="370" rx="15" ry="7" fill="#1e293b" />
          <ellipse cx="110" cy="405" rx="12" ry="6" fill="#1e293b" />
          <line x1="110" y1="280" x2="110" y2="425" stroke="#1e293b" strokeWidth="3" />

          <g fill="#60a5fa" opacity="0.45">
            {Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 7 }).map((_, c) => (
                <circle key={`${r}-${c}`} cx={160 + c * 16} cy={110 + r * 16} r="3" />
              ))
            )}
          </g>

          <path
            d="M510 240C540 210 560 260 540 290C520 320 480 310 480 270C480 250 495 240 510 240Z"
            fill="#dbeafe"
          />
          <path
            d="M540 330C580 310 570 370 540 400C510 430 470 410 480 360C490 330 520 320 540 330Z"
            fill="#bfdbfe"
          />
        </g>

        <rect
          x="120"
          y="150"
          width="360"
          height="250"
          rx="12"
          stroke="#e2e8f0"
          strokeWidth="10"
          fill="#ffffff"
        />

        <path d="M260 400L250 460H350L340 400H260Z" fill="#cbd5e1" />
        <rect x="210" y="455" width="180" height="12" rx="4" fill="#2563eb" />

        <circle cx="285" cy="415" r="4" fill="#93c5fd" />
        <rect x="296" y="411" width="8" height="8" transform="rotate(45 300 415)" fill="#2563eb" />
        <circle cx="315" cy="415" r="4" fill="#93c5fd" />

        <g transform="rotate(12 300 270)">
          <rect
            x="180"
            y="170"
            width="220"
            height="190"
            rx="14"
            fill="#1e1b4b"
            stroke="#312e81"
            strokeWidth="3"
          />
          <circle cx="330" cy="300" r="26" fill="#e11d48" />
          <line x1="310" y1="292" x2="350" y2="292" stroke="#1e1b4b" strokeWidth="4" />
          <line x1="308" y1="300" x2="352" y2="300" stroke="#1e1b4b" strokeWidth="4" />
          <line x1="312" y1="308" x2="348" y2="308" stroke="#1e1b4b" strokeWidth="4" />
        </g>

        <g>
          <path d="M150 260L190 320L155 345L120 280Z" fill="#2563eb" />
          <rect x="180" y="305" width="22" height="16" transform="rotate(35 190 310)" fill="#1d4ed8" />
          <path
            d="M190 305C200 290 220 270 250 250C255 246 265 248 260 255C250 270 230 285 210 305L260 265C266 260 272 265 268 272C250 295 230 315 200 325Z"
            fill="#fed7aa"
          />
        </g>

        <g>
          <rect x="420" y="220" width="40" height="55" rx="4" fill="#2563eb" />
          <rect x="420" y="270" width="40" height="8" fill="#1d4ed8" />
          <path
            d="M420 275C405 275 375 250 340 235C330 230 335 215 350 220C380 230 405 245 420 255Z"
            fill="#fed7aa"
          />
          <ellipse cx="370" cy="245" rx="16" ry="12" fill="#fed7aa" />

          <g transform="rotate(-38 340 240)">
            <rect x="330" y="140" width="22" height="130" rx="6" fill="#e11d48" />
            <polygon points="330,170 341,155 352,170" fill="#1e3a8a" />
            <polygon points="330,200 341,185 352,200" fill="#1e3a8a" />
            <polygon points="330,230 341,215 352,230" fill="#1e3a8a" />
            <polygon points="330,270 341,295 352,270" fill="#0f172a" />
            <rect x="328" y="132" width="26" height="10" rx="3" fill="#2563eb" />
          </g>
        </g>

        <g fill="#2563eb">
          <circle cx="310" cy="130" r="3" />
          <path d="M310 120L312 128L320 130L312 132L310 140L308 132L300 130L308 128Z" fill="#1d4ed8" />
          <rect x="235" y="125" width="6" height="6" transform="rotate(45 238 128)" fill="#1e3a8a" />
        </g>
      </svg>
    </div>
  );
};
