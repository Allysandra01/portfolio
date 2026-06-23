// Cute, rounded minimalist chess piece SVGs.
// Each piece type renders inside a 100x100 viewBox.
// Color is driven by `fill` (set by react-chessboard's PieceRenderObject contract).
// We add a soft outline + face dots for cuteness.

import type { CSSProperties, JSX } from "react";

type Props = { fill?: string; svgStyle?: CSSProperties };

const outline = "oklch(0.32 0.05 280)";

const Wrap = ({ children, svgStyle }: { children: JSX.Element; svgStyle?: CSSProperties }) => (
  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", ...svgStyle }}>
    {children}
  </svg>
);

const Face = ({ y = 50 }: { y?: number }) => (
  <g>
    <circle cx="42" cy={y} r="2.2" fill={outline} />
    <circle cx="58" cy={y} r="2.2" fill={outline} />
    <path d={`M44 ${y + 5} Q50 ${y + 9} 56 ${y + 5}`} stroke={outline} strokeWidth="1.6" fill="none" strokeLinecap="round" />
  </g>
);

const Base = ({ fill }: { fill: string }) => (
  <g>
    <ellipse cx="50" cy="90" rx="30" ry="5" fill="oklch(0 0 0 / 0.12)" />
    <rect x="22" y="78" width="56" height="10" rx="5" fill={fill} stroke={outline} strokeWidth="2" />
  </g>
);

function Pawn({ fill = "white", svgStyle }: Props) {
  return (
    <Wrap svgStyle={svgStyle}>
      <g>
        <Base fill={fill} />
        <rect x="30" y="65" width="40" height="18" rx="4" fill={fill} stroke={outline} strokeWidth="2" />
        <circle cx="50" cy="48" r="20" fill={fill} stroke={outline} strokeWidth="2.5" />
        <Face y={50} />
      </g>
    </Wrap>
  );
}

function Rook({ fill = "white", svgStyle }: Props) {
  return (
    <Wrap svgStyle={svgStyle}>
      <g>
        <Base fill={fill} />
        <rect x="26" y="60" width="48" height="22" rx="4" fill={fill} stroke={outline} strokeWidth="2" />
        <rect x="24" y="30" width="52" height="34" rx="6" fill={fill} stroke={outline} strokeWidth="2.5" />
        <rect x="22" y="22" width="14" height="12" fill={fill} stroke={outline} strokeWidth="2" />
        <rect x="43" y="22" width="14" height="12" fill={fill} stroke={outline} strokeWidth="2" />
        <rect x="64" y="22" width="14" height="12" fill={fill} stroke={outline} strokeWidth="2" />
        <Face y={48} />
      </g>
    </Wrap>
  );
}

function Knight({ fill = "white", svgStyle }: Props) {
  return (
    <Wrap svgStyle={svgStyle}>
      <g>
        <Base fill={fill} />
        <path
          d="M30 80 L30 60 Q30 30 55 25 Q60 18 70 20 Q78 26 72 36 L78 44 Q82 60 70 64 L70 80 Z"
          fill={fill}
          stroke={outline}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="60" cy="38" r="2.2" fill={outline} />
        <path d="M52 46 Q55 49 60 47" stroke={outline} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M68 24 L74 22" stroke={outline} strokeWidth="2" strokeLinecap="round" />
      </g>
    </Wrap>
  );
}

function Bishop({ fill = "white", svgStyle }: Props) {
  return (
    <Wrap svgStyle={svgStyle}>
      <g>
        <Base fill={fill} />
        <rect x="30" y="68" width="40" height="14" rx="4" fill={fill} stroke={outline} strokeWidth="2" />
        <path
          d="M50 18 Q72 32 70 56 Q70 70 50 70 Q30 70 30 56 Q28 32 50 18 Z"
          fill={fill}
          stroke={outline}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="14" r="3" fill={fill} stroke={outline} strokeWidth="2" />
        <path d="M42 50 L58 50" stroke={outline} strokeWidth="2" strokeLinecap="round" />
        <Face y={42} />
      </g>
    </Wrap>
  );
}

function Queen({ fill = "white", svgStyle }: Props) {
  return (
    <Wrap svgStyle={svgStyle}>
      <g>
        <Base fill={fill} />
        <rect x="28" y="66" width="44" height="16" rx="4" fill={fill} stroke={outline} strokeWidth="2" />
        <path
          d="M24 66 L30 36 L40 50 L50 24 L60 50 L70 36 L76 66 Z"
          fill={fill}
          stroke={outline}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {[
          [30, 36],
          [40, 50],
          [50, 24],
          [60, 50],
          [70, 36],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill={fill} stroke={outline} strokeWidth="2" />
        ))}
        <Face y={56} />
      </g>
    </Wrap>
  );
}

function King({ fill = "white", svgStyle }: Props) {
  return (
    <Wrap svgStyle={svgStyle}>
      <g>
        <Base fill={fill} />
        <rect x="28" y="66" width="44" height="16" rx="4" fill={fill} stroke={outline} strokeWidth="2" />
        <path
          d="M26 66 Q26 38 50 36 Q74 38 74 66 Z"
          fill={fill}
          stroke={outline}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect x="44" y="14" width="12" height="6" rx="1" fill={fill} stroke={outline} strokeWidth="2" />
        <rect x="47" y="8" width="6" height="18" rx="1" fill={fill} stroke={outline} strokeWidth="2" />
        <Face y={54} />
      </g>
    </Wrap>
  );
}

// react-chessboard expects keys: wP wN wB wR wQ wK bP bN bB bR bQ bK
// fill is passed by the library — we ignore it and inject our own pastel signature.
const WHITE = "oklch(0.85 0.1 160)"; // soft mint
const BLACK = "oklch(0.74 0.13 0)";  // rose pink

const make = (Comp: (p: Props) => JSX.Element, fill: string) =>
  ({ svgStyle }: Props = {}) =>
    <Comp fill={fill} svgStyle={svgStyle} />;

export const cozyPieces = {
  wP: make(Pawn, WHITE),
  wR: make(Rook, WHITE),
  wN: make(Knight, WHITE),
  wB: make(Bishop, WHITE),
  wQ: make(Queen, WHITE),
  wK: make(King, WHITE),
  bP: make(Pawn, BLACK),
  bR: make(Rook, BLACK),
  bN: make(Knight, BLACK),
  bB: make(Bishop, BLACK),
  bQ: make(Queen, BLACK),
  bK: make(King, BLACK),
};

// Used in capture sidebar; returns the right component
export function CapturedPiece({ code }: { code: string }) {
  const map: Record<string, (p?: Props) => JSX.Element> = cozyPieces;
  const Comp = map[code];
  if (!Comp) return null;
  return <Comp />;
}
