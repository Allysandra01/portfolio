import React from 'react';

interface PieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  theme?: 'neon' | 'classic';
  size?: number;
  isDragging?: boolean;
  isCaptured?: boolean;
}

export const Piece: React.FC<PieceProps> = ({
  type,
  color,
  size = 48,
  isDragging = false,
  isCaptured = false,
}) => {
  // Pastel Color Palette
  // White: Soft Mint Green
  // Black: Cute Rose Pink
  // Captured: Cozy Grayscale Slate-Gray
  const getColors = () => {
    if (isCaptured) {
      return {
        fill: '#b2bec3',      // Slate-gray
        accent: '#95a5a6',    // Darker shadow
        eyes: '#7f8c8d',      // Dull eyes
        cheek: '#95a5a6',
        border: '#455a64',
      };
    }
    if (color === 'w') {
      return {
        fill: '#b7e4c7',      // Soft Mint Green
        accent: '#95d5b2',    // Sage shadow
        eyes: '#2d3748',      // Soft dark slate
        cheek: '#ffb5a7',     // Soft peach blush
        border: '#1b4332',    // Deep forest border
      };
    } else {
      return {
        fill: '#ffcad4',      // Cute Rose Pink
        accent: '#ffb3c1',    // Deeper pink shadow
        eyes: '#2d3748',
        cheek: '#f1a7b4',     // Rosy blush
        border: '#590d22',    // Deep wine border
      };
    }
  };

  const colors = getColors();

  // Custom rounded, cute minimalist SVG designs for each piece
  const renderSvgContent = () => {
    const { fill, accent, border, eyes, cheek } = colors;

    switch (type) {
      case 'p': // PAWN: Sweet little rounded teardrop dome with a base capsule
        return (
          <g>
            {/* Base */}
            <rect x="25" y="74" width="50" height="12" rx="6" fill={accent} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            <rect x="25" y="70" width="50" height="10" rx="5" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            
            {/* Neck Collar */}
            <ellipse cx="50" cy="62" rx="15" ry="4" fill={accent} stroke={border} strokeWidth="4" />

            {/* Body */}
            <path d="M 32,70 C 32,52 68,52 68,70 Z" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            
            {/* Head */}
            <circle cx="50" cy="38" r="15" fill={accent} stroke={border} strokeWidth="4" />
            <circle cx="50" cy="36" r="15" fill={fill} stroke={border} strokeWidth="4" />

            {/* Cute Face Expressions */}
            <circle cx="45" cy="36" r="2" fill={eyes} />
            <circle cx="55" cy="36" r="2" fill={eyes} />
            <circle cx="41" cy="40" r="2" fill={cheek} opacity="0.6" />
            <circle cx="59" cy="40" r="2" fill={cheek} opacity="0.6" />
            
            {/* Subtle smile */}
            <path d="M 48,41 Q 50,43 52,41" stroke={eyes} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'r': // ROOK: Cute castle tower with blushing turrets
        return (
          <g>
            {/* Base */}
            <rect x="22" y="74" width="56" height="12" rx="6" fill={accent} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            <rect x="22" y="70" width="56" height="10" rx="5" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />

            {/* Main Body */}
            <path d="M 28,70 L 32,38 L 68,38 L 72,70 Z" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            <path d="M 28,70 L 32,38 L 48,38 L 45,70 Z" fill={accent} opacity="0.15" />

            {/* Top Battlements (Turrets) */}
            <path d="M 28,38 L 28,24 L 38,24 L 38,30 L 48,30 L 48,24 L 52,24 L 52,30 L 62,30 L 62,24 L 72,24 L 72,38 Z" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />

            {/* Cute Rook Face */}
            <circle cx="44" cy="50" r="2.5" fill={eyes} />
            <circle cx="56" cy="50" r="2.5" fill={eyes} />
            <circle cx="39" cy="54" r="2.5" fill={cheek} opacity="0.6" />
            <circle cx="61" cy="54" r="2.5" fill={cheek} opacity="0.6" />
            <path d="M 48,55 Q 50,57 52,55" stroke={eyes} strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'n': // KNIGHT: Super cute chubby horse profile
        return (
          <g>
            {/* Base */}
            <rect x="24" y="74" width="52" height="12" rx="6" fill={accent} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            <rect x="24" y="70" width="52" height="10" rx="5" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />

            {/* Horse Body/Mane */}
            <path d="M 30,70 L 30,42 C 30,24 45,18 56,18 C 68,18 76,28 76,40 C 76,48 70,52 62,52 L 48,52 L 45,70 Z" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            
            {/* Shadow effect on backside */}
            <path d="M 30,70 L 30,42 C 30,28 38,24 44,24 L 44,70 Z" fill={accent} opacity="0.2" />

            {/* Snout with nose dot */}
            <path d="M 62,52 C 60,52 64,42 56,42 M 62,52" stroke={border} strokeWidth="2" />

            {/* Rounded Ear */}
            <path d="M 40,24 M 42,22 L 48,10 L 52,18 Z" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />

            {/* Cute side-profile eye and happy cheek */}
            <circle cx="56" cy="34" r="2.5" fill={eyes} />
            <circle cx="58" cy="40" r="3" fill={cheek} opacity="0.7" />

            {/* Mane hair curves */}
            <path d="M 32,32 C 26,35 28,42 32,42" stroke={border} strokeWidth="3" strokeLinecap="round" />
            <path d="M 32,46 C 26,49 28,56 32,56" stroke={border} strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      case 'b': // BISHOP: Lovely teardrop mitre shape with little cross
        return (
          <g>
            {/* Base */}
            <rect x="24" y="74" width="52" height="12" rx="6" fill={accent} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            <rect x="24" y="70" width="52" height="10" rx="5" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />

            {/* Bishop Mitre Teardrop Head */}
            <path d="M 50,15 C 32,38 32,64 43,70 L 57,70 C 68,64 68,38 50,15 Z" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            <path d="M 50,15 C 32,38 32,60 43,68" fill={accent} opacity="0.2" />

            {/* Small yellow top cross/circle */}
            <circle cx="50" cy="14" r="4.5" fill={isCaptured ? '#7f8c8d' : '#fec5bb'} stroke={border} strokeWidth="3" />

            {/* Traditional diagonal cut */}
            <path d="M 42,42 L 58,34" stroke={border} strokeWidth="3.5" strokeLinecap="round" />

            {/* Cute Bishop face */}
            <circle cx="44" cy="52" r="2" fill={eyes} />
            <circle cx="56" cy="52" r="2" fill={eyes} />
            <circle cx="40" cy="56" r="2.5" fill={cheek} opacity="0.6" />
            <circle cx="60" cy="56" r="2.5" fill={cheek} opacity="0.6" />
            <path d="M 47,56 Q 50,58 53,56" stroke={eyes} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'q': // QUEEN: Royal rounded 5-pointed crown
        return (
          <g>
            {/* Base */}
            <rect x="22" y="74" width="56" height="12" rx="6" fill={accent} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            <rect x="22" y="70" width="56" height="10" rx="5" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />

            {/* Collar */}
            <ellipse cx="50" cy="66" rx="18" ry="4" fill={accent} stroke={border} strokeWidth="4" />

            {/* Palace Crown body */}
            <path d="M 28,68 L 24,36 L 38,48 L 50,24 L 62,48 L 76,36 L 72,68 Z" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            
            {/* Shadow detailing */}
            <path d="M 28,68 L 24,36 L 38,48 L 50,24 L 50,68 Z" fill={accent} opacity="0.15" />

            {/* Little circles on tips */}
            <circle cx="24" cy="33" r="4" fill={isCaptured ? '#7f8c8d' : '#fec5bb'} stroke={border} strokeWidth="3" />
            <circle cx="50" cy="21" r="4" fill={isCaptured ? '#7f8c8d' : '#fec5bb'} stroke={border} strokeWidth="3" />
            <circle cx="76" cy="33" r="4" fill={isCaptured ? '#7f8c8d' : '#fec5bb'} stroke={border} strokeWidth="3" />

            {/* Queen eyes with lovely lashes */}
            <g stroke={eyes} strokeWidth="2" strokeLinecap="round" fill="none">
              {/* Left eye winking or smiling */}
              <path d="M 41,52 Q 44,55 47,52" />
              {/* Right eye */}
              <path d="M 53,52 Q 56,55 59,52" />
            </g>
            <circle cx="39" cy="56" r="3" fill={cheek} opacity="0.65" />
            <circle cx="61" cy="56" r="3" fill={cheek} opacity="0.65" />
            <path d="M 47,58 Q 50,60 53,58" stroke={eyes} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'k': // KING: Majestic heart dome with a small cross on top
        return (
          <g>
            {/* Base */}
            <rect x="22" y="74" width="56" height="12" rx="6" fill={accent} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            <rect x="22" y="70" width="56" height="10" rx="5" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />

            {/* Robe Collar */}
            <ellipse cx="50" cy="66" rx="18" ry="4" fill={accent} stroke={border} strokeWidth="4" />

            {/* Dome structure */}
            <path d="M 28,68 M 28,66 L 31,40 C 31,30 69,30 69,40 L 72,66 Z" fill={fill} stroke={border} strokeWidth="4" strokeLinejoin="round" />
            <path d="M 31,40 C 31,30 50,30 50,66 L 31,66 Z" fill={accent} opacity="0.15" />

            {/* Golden jewels band */}
            <rect x="33" y="44" width="34" height="6" rx="3" fill={isCaptured ? '#7f8c8d' : '#ffe5ec'} stroke={border} strokeWidth="3" />

            {/* Large majestic cross on top */}
            <path d="M 44,22 L 56,22 M 50,16 L 50,28" stroke={border} strokeWidth="4.5" strokeLinecap="round" />

            {/* Gentle Royal eyes and blushing cheeks */}
            <circle cx="44" cy="54" r="2.5" fill={eyes} />
            <circle cx="56" cy="54" r="2.5" fill={eyes} />
            <circle cx="39" cy="58" r="3" fill={cheek} opacity="0.6" />
            <circle cx="61" cy="58" r="3" fill={cheek} opacity="0.6" />
            <path d="M 47,59 Q 50,61 53,59" stroke={eyes} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: isDragging ? 'scale(1.18)' : 'scale(1)',
        filter: isDragging 
          ? 'drop-shadow(0 12px 16px rgba(0,0,0,0.25)) drop-shadow(0 0 12px rgba(254,197,187,0.4))'
          : 'drop-shadow(2px 3px 6px rgba(0,0,0,0.12))',
        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
      className={`flex items-center justify-center select-none cursor-grab active:cursor-grabbing ${
        isCaptured ? 'grayscale opacity-75' : ''
      }`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderSvgContent()}
      </svg>
    </div>
  );
};
