/**
 * KigaliBackground — Animated SVG cityscape of Gasabo District, Kigali
 * Used as a decorative background across all pages.
 * Fully transparent-safe: low opacity so content stays readable.
 */
export default function KigaliBackground({ variant = 'default' }) {
  const isLight = variant === 'light';

  return (
    <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0" aria-hidden="true">

      {/* ── Sky gradient ── */}
      <div className={`absolute inset-0 ${
        isLight
          ? 'bg-gradient-to-b from-sky-50 via-blue-50/40 to-green-50/30'
          : 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'
      }`} />

      {/* ── Rolling hills of Kigali (background) ── */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Far hill */}
        <path
          d="M0,200 C200,120 400,180 600,140 C800,100 1000,160 1200,130 C1350,110 1420,150 1440,140 L1440,320 L0,320 Z"
          fill={isLight ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)'}
        />
        {/* Mid hill */}
        <path
          d="M0,240 C180,180 360,220 540,190 C720,160 900,210 1080,185 C1260,160 1380,200 1440,190 L1440,320 L0,320 Z"
          fill={isLight ? 'rgba(22,163,74,0.10)' : 'rgba(22,163,74,0.06)'}
        />
        {/* Near ground */}
        <path
          d="M0,280 C240,260 480,275 720,265 C960,255 1200,270 1440,260 L1440,320 L0,320 Z"
          fill={isLight ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)'}
        />
      </svg>

      {/* ── Cityscape SVG ── */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 280"
        preserveAspectRatio="xMidYMax meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Window glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ─── BUILDING PALETTE ─── */}
        {/* Colors: Rwanda flag green #20603D, blue #00A1DE, yellow #FAD201, neutral grays */}

        {/* === FAR BACKGROUND BUILDINGS (very faint) === */}
        {[
          { x: 30,  w: 40, h: 80  },
          { x: 80,  w: 30, h: 60  },
          { x: 120, w: 50, h: 100 },
          { x: 180, w: 35, h: 70  },
          { x: 900, w: 45, h: 90  },
          { x: 960, w: 30, h: 65  },
          { x: 1000,w: 55, h: 110 },
          { x: 1070,w: 35, h: 75  },
          { x: 1200,w: 40, h: 85  },
          { x: 1260,w: 50, h: 95  },
          { x: 1330,w: 35, h: 70  },
          { x: 1390,w: 40, h: 80  },
        ].map((b, i) => (
          <rect
            key={`far-${i}`}
            x={b.x} y={280 - b.h} width={b.w} height={b.h}
            fill={isLight ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.12)'}
            rx="1"
          />
        ))}

        {/* === MID BUILDINGS === */}

        {/* Kacyiru-style government block (left) */}
        <rect x="50" y="140" width="70" height="140" fill={isLight ? 'rgba(30,64,175,0.12)' : 'rgba(59,130,246,0.10)'} rx="2" />
        <rect x="55" y="135" width="60" height="10" fill={isLight ? 'rgba(30,64,175,0.18)' : 'rgba(59,130,246,0.15)'} rx="1" />
        {/* windows */}
        {[0,1,2,3,4].map(row => [0,1,2].map(col => (
          <rect key={`kac-w-${row}-${col}`}
            x={60 + col * 18} y={148 + row * 22} width="10" height="14"
            fill={isLight ? 'rgba(250,210,1,0.35)' : 'rgba(250,210,1,0.20)'}
            rx="1" filter="url(#glow)"
          />
        )))}

        {/* Tall tower — Remera style */}
        <rect x="160" y="80" width="45" height="200" fill={isLight ? 'rgba(0,161,222,0.13)' : 'rgba(0,161,222,0.09)'} rx="2" />
        <rect x="163" y="75" width="39" height="8" fill={isLight ? 'rgba(0,161,222,0.20)' : 'rgba(0,161,222,0.14)'} rx="1" />
        {/* antenna */}
        <line x1="182" y1="75" x2="182" y2="55" stroke={isLight ? 'rgba(0,161,222,0.30)' : 'rgba(0,161,222,0.20)'} strokeWidth="2" />
        <circle cx="182" cy="54" r="3" fill={isLight ? 'rgba(250,210,1,0.50)' : 'rgba(250,210,1,0.35)'} filter="url(#glow)" />
        {[0,1,2,3,4,5,6].map(row => [0,1].map(col => (
          <rect key={`rem-w-${row}-${col}`}
            x={168 + col * 18} y={88 + row * 26} width="11" height="16"
            fill={isLight ? 'rgba(250,210,1,0.30)' : 'rgba(250,210,1,0.18)'}
            rx="1" filter="url(#glow)"
          />
        )))}

        {/* Wide apartment block */}
        <rect x="230" y="160" width="90" height="120" fill={isLight ? 'rgba(32,96,61,0.12)' : 'rgba(34,197,94,0.08)'} rx="2" />
        {[0,1,2,3].map(row => [0,1,2,3].map(col => (
          <rect key={`apt-w-${row}-${col}`}
            x={238 + col * 20} y={168 + row * 26} width="12" height="16"
            fill={isLight ? 'rgba(250,210,1,0.28)' : 'rgba(250,210,1,0.15)'}
            rx="1"
          />
        )))}

        {/* Kimironko market dome */}
        <rect x="360" y="170" width="100" height="110" fill={isLight ? 'rgba(0,161,222,0.10)' : 'rgba(0,161,222,0.07)'} rx="2" />
        <ellipse cx="410" cy="170" rx="52" ry="22" fill={isLight ? 'rgba(0,161,222,0.15)' : 'rgba(0,161,222,0.10)'} />
        {[0,1,2,3].map(row => [0,1,2,3,4].map(col => (
          <rect key={`kim-w-${row}-${col}`}
            x={368 + col * 18} y={178 + row * 24} width="10" height="14"
            fill={isLight ? 'rgba(32,96,61,0.30)' : 'rgba(34,197,94,0.18)'}
            rx="1"
          />
        )))}

        {/* Gisozi residential cluster */}
        <rect x="490" y="190" width="55" height="90" fill={isLight ? 'rgba(32,96,61,0.10)' : 'rgba(34,197,94,0.07)'} rx="2" />
        {/* sloped roof */}
        <polygon points="490,190 545,190 517,165" fill={isLight ? 'rgba(32,96,61,0.15)' : 'rgba(34,197,94,0.10)'} />
        {[0,1,2].map(row => [0,1].map(col => (
          <rect key={`gis-w-${row}-${col}`}
            x={498 + col * 22} y={198 + row * 26} width="13" height="16"
            fill={isLight ? 'rgba(250,210,1,0.28)' : 'rgba(250,210,1,0.15)'}
            rx="1"
          />
        )))}

        {/* Standalone house with garden */}
        <rect x="570" y="210" width="60" height="70" fill={isLight ? 'rgba(30,64,175,0.10)' : 'rgba(59,130,246,0.07)'} rx="2" />
        <polygon points="570,210 630,210 600,185" fill={isLight ? 'rgba(30,64,175,0.15)' : 'rgba(59,130,246,0.10)'} />
        {[0,1].map(row => [0,1].map(col => (
          <rect key={`house-w-${row}-${col}`}
            x={578 + col * 24} y={218 + row * 26} width="14" height="18"
            fill={isLight ? 'rgba(250,210,1,0.30)' : 'rgba(250,210,1,0.18)'}
            rx="1"
          />
        )))}

        {/* === CENTER — Kigali CBD skyline === */}

        {/* Tallest tower (CBD centerpiece) */}
        <rect x="660" y="40" width="55" height="240" fill={isLight ? 'rgba(0,161,222,0.15)' : 'rgba(0,161,222,0.11)'} rx="3" />
        <rect x="665" y="35" width="45" height="10" fill={isLight ? 'rgba(0,161,222,0.22)' : 'rgba(0,161,222,0.16)'} rx="1" />
        <line x1="687" y1="35" x2="687" y2="10" stroke={isLight ? 'rgba(0,161,222,0.35)' : 'rgba(0,161,222,0.22)'} strokeWidth="2.5" />
        <circle cx="687" cy="9" r="4" fill={isLight ? 'rgba(250,210,1,0.70)' : 'rgba(250,210,1,0.50)'} filter="url(#glow)" />
        {[0,1,2,3,4,5,6,7].map(row => [0,1,2].map(col => (
          <rect key={`cbd-w-${row}-${col}`}
            x={668 + col * 16} y={48 + row * 28} width="10" height="18"
            fill={isLight ? 'rgba(250,210,1,0.35)' : 'rgba(250,210,1,0.22)'}
            rx="1" filter="url(#glow)"
          />
        )))}

        {/* CBD left tower */}
        <rect x="600" y="90" width="48" height="190" fill={isLight ? 'rgba(32,96,61,0.13)' : 'rgba(34,197,94,0.09)'} rx="2" />
        {[0,1,2,3,4,5].map(row => [0,1].map(col => (
          <rect key={`cbdl-w-${row}-${col}`}
            x={607 + col * 20} y={98 + row * 28} width="12" height="18"
            fill={isLight ? 'rgba(250,210,1,0.28)' : 'rgba(250,210,1,0.16)'}
            rx="1"
          />
        )))}

        {/* CBD right tower */}
        <rect x="728" y="100" width="48" height="180" fill={isLight ? 'rgba(30,64,175,0.13)' : 'rgba(59,130,246,0.09)'} rx="2" />
        {[0,1,2,3,4,5].map(row => [0,1].map(col => (
          <rect key={`cbdr-w-${row}-${col}`}
            x={735 + col * 20} y={108 + row * 28} width="12" height="18"
            fill={isLight ? 'rgba(250,210,1,0.28)' : 'rgba(250,210,1,0.16)'}
            rx="1"
          />
        )))}

        {/* === RIGHT SIDE — Remera / Kinyinya === */}

        {/* Hotel/apartment tower */}
        <rect x="820" y="110" width="52" height="170" fill={isLight ? 'rgba(0,161,222,0.12)' : 'rgba(0,161,222,0.08)'} rx="2" />
        <rect x="824" y="105" width="44" height="9" fill={isLight ? 'rgba(0,161,222,0.18)' : 'rgba(0,161,222,0.12)'} rx="1" />
        {[0,1,2,3,4,5].map(row => [0,1,2].map(col => (
          <rect key={`hot-w-${row}-${col}`}
            x={827 + col * 14} y={116 + row * 26} width="9" height="16"
            fill={isLight ? 'rgba(250,210,1,0.30)' : 'rgba(250,210,1,0.18)'}
            rx="1" filter="url(#glow)"
          />
        )))}

        {/* Wide commercial block */}
        <rect x="890" y="155" width="85" height="125" fill={isLight ? 'rgba(32,96,61,0.11)' : 'rgba(34,197,94,0.07)'} rx="2" />
        {[0,1,2,3].map(row => [0,1,2,3].map(col => (
          <rect key={`com-w-${row}-${col}`}
            x={898 + col * 19} y={163 + row * 28} width="11" height="18"
            fill={isLight ? 'rgba(250,210,1,0.25)' : 'rgba(250,210,1,0.14)'}
            rx="1"
          />
        )))}

        {/* Kinyinya hillside houses */}
        <rect x="1000" y="185" width="50" height="95" fill={isLight ? 'rgba(30,64,175,0.10)' : 'rgba(59,130,246,0.07)'} rx="2" />
        <polygon points="1000,185 1050,185 1025,162" fill={isLight ? 'rgba(30,64,175,0.14)' : 'rgba(59,130,246,0.09)'} />
        {[0,1,2].map(row => [0,1].map(col => (
          <rect key={`kin-w-${row}-${col}`}
            x={1008 + col * 22} y={193 + row * 28} width="13" height="18"
            fill={isLight ? 'rgba(250,210,1,0.28)' : 'rgba(250,210,1,0.16)'}
            rx="1"
          />
        )))}

        {/* Ndera rural house */}
        <rect x="1080" y="210" width="55" height="70" fill={isLight ? 'rgba(32,96,61,0.10)' : 'rgba(34,197,94,0.07)'} rx="2" />
        <polygon points="1080,210 1135,210 1107,188" fill={isLight ? 'rgba(32,96,61,0.14)' : 'rgba(34,197,94,0.09)'} />
        {[0,1].map(row => [0,1].map(col => (
          <rect key={`nde-w-${row}-${col}`}
            x={1088 + col * 24} y={218 + row * 28} width="14" height="18"
            fill={isLight ? 'rgba(250,210,1,0.25)' : 'rgba(250,210,1,0.14)'}
            rx="1"
          />
        )))}

        {/* Far right cluster */}
        <rect x="1160" y="170" width="65" height="110" fill={isLight ? 'rgba(0,161,222,0.10)' : 'rgba(0,161,222,0.07)'} rx="2" />
        {[0,1,2,3].map(row => [0,1,2].map(col => (
          <rect key={`far-r-w-${row}-${col}`}
            x={1167 + col * 19} y={178 + row * 25} width="11" height="15"
            fill={isLight ? 'rgba(250,210,1,0.22)' : 'rgba(250,210,1,0.12)'}
            rx="1"
          />
        )))}

        <rect x="1250" y="150" width="50" height="130" fill={isLight ? 'rgba(30,64,175,0.11)' : 'rgba(59,130,246,0.08)'} rx="2" />
        {[0,1,2,3,4].map(row => [0,1].map(col => (
          <rect key={`far-r2-w-${row}-${col}`}
            x={1257 + col * 22} y={158 + row * 24} width="13" height="16"
            fill={isLight ? 'rgba(250,210,1,0.25)' : 'rgba(250,210,1,0.14)'}
            rx="1"
          />
        )))}

        <rect x="1320" y="190" width="60" height="90" fill={isLight ? 'rgba(32,96,61,0.10)' : 'rgba(34,197,94,0.07)'} rx="2" />
        <polygon points="1320,190 1380,190 1350,168" fill={isLight ? 'rgba(32,96,61,0.14)' : 'rgba(34,197,94,0.09)'} />

        {/* === TREES scattered across skyline === */}
        {[
          { x: 340, h: 30 }, { x: 555, h: 25 }, { x: 790, h: 35 },
          { x: 1060, h: 28 }, { x: 1145, h: 32 }, { x: 1305, h: 26 },
          { x: 1410, h: 30 },
        ].map((tree, i) => (
          <g key={`tree-${i}`}>
            <rect x={tree.x + 5} y={280 - tree.h * 0.4} width="4" height={tree.h * 0.4}
              fill={isLight ? 'rgba(32,96,61,0.25)' : 'rgba(34,197,94,0.15)'} />
            <ellipse cx={tree.x + 7} cy={280 - tree.h * 0.5} rx="12" ry={tree.h * 0.55}
              fill={isLight ? 'rgba(32,96,61,0.18)' : 'rgba(34,197,94,0.12)'} />
          </g>
        ))}

        {/* === GROUND LINE === */}
        <rect x="0" y="278" width="1440" height="2"
          fill={isLight ? 'rgba(32,96,61,0.15)' : 'rgba(34,197,94,0.10)'} />

        {/* === ANIMATED STARS / LIGHTS (top area) === */}
        {!isLight && [
          { cx: 100, cy: 30 }, { cx: 250, cy: 20 }, { cx: 450, cy: 35 },
          { cx: 700, cy: 15 }, { cx: 950, cy: 25 }, { cx: 1150, cy: 18 },
          { cx: 1350, cy: 30 }, { cx: 550, cy: 10 }, { cx: 850, cy: 22 },
        ].map((star, i) => (
          <circle key={`star-${i}`} cx={star.cx} cy={star.cy} r="1.5"
            fill="rgba(250,210,1,0.40)"
            style={{ animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite alternate`, animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </svg>

      {/* ── Subtle grid overlay (gives depth) ── */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(${isLight ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)'} 1px, transparent 1px), linear-gradient(90deg, ${isLight ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)'} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
