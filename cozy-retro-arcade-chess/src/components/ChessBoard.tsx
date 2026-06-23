import React, { useState, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Piece } from './Piece';
import { audio } from '../utils/audio';

interface ChessBoardProps {
  game: Chess;
  theme: 'neon' | 'classic' | 'light' | 'galaxy' | 'dark';
  isFlipped: boolean;
  playerColor: 'w' | 'b' | 'both'; // both = manual 2-player
  onMove: (from: string, to: string, promotion?: string) => void;
  disabled: boolean;
}

interface DragState {
  pieceType: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  pieceColor: 'w' | 'b';
  fromSquare: string;
  startX: number; // Page coordinates
  startY: number;
  currentX: number;
  currentY: number;
  squareSize: number;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  theme,
  isFlipped,
  playerColor,
  onMove,
  disabled
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Clear dragging state or highlights if game resets/changed
  useEffect(() => {
    setPossibleMoves([]);
    // Extract last move from game history if possible
    const history = game.history({ verbose: true });
    if (history.length > 0) {
      const last = history[history.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }
  }, [game]);

  // Coordinates helper mapping (col, row) to square Name
  const getSquareName = (col: number, row: number): string => {
    const file = isFlipped ? String.fromCharCode(104 - col) : String.fromCharCode(97 + col);
    const rank = isFlipped ? row + 1 : 8 - row;
    return `${file}${rank}`;
  };

  // Convert FEN grid locations for board loop
  const getBoardGrid = () => {
    const board = game.board();
    const grid: Array<Array<{ square: string; piece: { type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k'; color: 'w' | 'b' } | null }>> = [];

    for (let r = 0; r < 8; r++) {
      const rowGrid = [];
      const actualRow = isFlipped ? 7 - r : r;
      for (let c = 0; c < 8; c++) {
        const actualCol = isFlipped ? 7 - c : c;
        const squareData = board[actualRow][actualCol];
        const squareName = getSquareName(c, r);
        rowGrid.push({
          square: squareName,
          piece: squareData ? { type: squareData.type, color: squareData.color } : null,
        });
      }
      grid.push(rowGrid);
    }
    return grid;
  };

  // Check if player is allowed to move this piece
  const isPlayerControl = (color: 'w' | 'b'): boolean => {
    if (disabled) return false;
    if (game.turn() !== color) return false;
    if (playerColor === 'both') return true;
    return playerColor === color;
  };

  // Drag handlers
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    square: string,
    piece: { type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k'; color: 'w' | 'b' }
  ) => {
    if (!isPlayerControl(piece.color)) return;
    e.preventDefault();

    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    audio.select();

    const squareSize = rect.width / 8;
    setDrag({
      pieceType: piece.type,
      pieceColor: piece.color,
      fromSquare: square,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      squareSize,
    });

    // Extract valid moves for the selected piece
    const moves = game.moves({ square: square as any, verbose: true });
    setPossibleMoves(moves.map(m => m.to));

    // Capture pointer events to keep tracking smooth even outside board bounds
    try {
      (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("setPointerCapture not supported or failed", err);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    setDrag(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY,
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    e.preventDefault();
    try {
      (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      console.warn("releasePointerCapture not supported or failed", err);
    }

    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) {
      setDrag(null);
      setPossibleMoves([]);
      return;
    }

    // Determine target square under pointer coordinates
    const squareSize = rect.width / 8;
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    const colIdx = Math.floor(relX / squareSize);
    const rowIdx = Math.floor(relY / squareSize);

    let targetSquare: string | null = null;
    if (colIdx >= 0 && colIdx < 8 && rowIdx >= 0 && rowIdx < 8) {
      targetSquare = getSquareName(colIdx, rowIdx);
    }

    if (targetSquare && targetSquare !== drag.fromSquare && possibleMoves.includes(targetSquare)) {
      // Check for pawn promotion (move to final rank)
      const isPawn = drag.pieceType === 'p';
      const isPromotion = isPawn && (targetSquare.endsWith('8') || targetSquare.endsWith('1'));
      
      onMove(drag.fromSquare, targetSquare, isPromotion ? 'q' : undefined);
    } else {
      // Return or invalid move sounds
      if (targetSquare && targetSquare !== drag.fromSquare) {
        audio.error();
      }
    }

    setDrag(null);
    setPossibleMoves([]);
  };

  const boardGrid = getBoardGrid();
  const kingInCheckSquare = () => {
    if (!game.inCheck()) return null;
    const board = game.board();
    const activeColor = game.turn();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = board[r][c];
        if (sq && sq.type === 'k' && sq.color === activeColor) {
          // Find translated coordinates
          const actualCol = isFlipped ? 7 - c : c;
          const actualRow = isFlipped ? r : 7 - r;
          // Return algebraic string
          const file = String.fromCharCode(97 + c);
          const rank = 8 - r;
          return `${file}${rank}`;
        }
      }
    }
    return null;
  };

  const checkSquare = kingInCheckSquare();

  // Draw theme color styles
  let boardBorderColor = '';
  let boardBgContainer = 'bg-[#fffaf5]';
  let boardCabinetShadow = '4px 6px 0px rgba(149,213,178,0.2)';
  if (theme === 'neon') {
    boardBorderColor = 'border-[#ffb5a7] shadow-[0_0_15px_rgba(255,181,167,0.3)]';
    boardCabinetShadow = '4px 6px 0px rgba(255,181,167,0.2)';
  } else if (theme === 'classic') {
    boardBorderColor = 'border-[#95d5b2] shadow-[0_0_15px_rgba(149,213,178,0.3)]';
    boardCabinetShadow = '4px 6px 0px rgba(149,213,178,0.2)';
  } else if (theme === 'galaxy') {
    boardBorderColor = 'border-[#c582ff] shadow-[0_0_20px_rgba(197,130,255,0.45)]';
    boardBgContainer = 'bg-[#100b26]';
    boardCabinetShadow = '4px 6px 0px rgba(197,130,255,0.25)';
  } else if (theme === 'dark') {
    boardBorderColor = 'border-[#404040] shadow-[0_0_15px_rgba(255,255,255,0.1)]';
    boardBgContainer = 'bg-[#1c1c1c]';
    boardCabinetShadow = '4px 6px 0px rgba(255,255,255,0.06)';
  } else {
    boardBorderColor = 'border-[#1b4332] shadow-[0_0_15px_rgba(27,67,50,0.3)]';
    boardCabinetShadow = '4px 6px 0px rgba(27,67,50,0.2)';
  }
  const overlayClass = 'bg-transparent';

  return (
    <div className="relative flex flex-col items-center">
      {/* Wooden Bezel / Arcade Container cabinet accent */}
      <div 
        className={`p-3 ${boardBgContainer} border-4 ${boardBorderColor} rounded-lg relative select-none`}
        style={{
          boxShadow: boardCabinetShadow
        }}
      >
        {/* CRT Scanline and Flicker Overlay for Cozy subtle vibe */}
        <div className={`absolute inset-0 pointer-events-none z-30 ${overlayClass} mix-blend-overlay opacity-10`} />

        {/* The Actual grid */}
        <div
          ref={boardRef}
          className="grid grid-cols-8 grid-rows-8 outline-none relative rounded overflow-hidden"
          style={{
            width: 'min(80vw, 440px)',
            height: 'min(80vw, 440px)',
            cursor: disabled ? 'not-allowed' : 'default',
          }}
        >
          {boardGrid.map((rowArr, rIdx) => {
            return rowArr.map((cell, cIdx) => {
              const isDark = (rIdx + cIdx) % 2 === 1;
              const isSelected = drag && drag.fromSquare === cell.square;
              const isPossible = possibleMoves.includes(cell.square);
              const isCheck = checkSquare === cell.square;
              const isLast = lastMove && (lastMove.from === cell.square || lastMove.to === cell.square);

              // Square background logic based on theme
              // Soft, pleasing palette instead of harsh blacks and whites.
              let squareBg = '';
              if (theme === 'neon') {
                // Pastel Lavender Theme
                squareBg = isDark ? 'bg-[#b8c0ff]' : 'bg-[#fffaf0]';
              } else if (theme === 'classic') {
                // Warm Sage Green Theme
                squareBg = isDark ? 'bg-[#a3b18a]' : 'bg-[#faf5eb]';
              } else if (theme === 'galaxy') {
                // Deep Black-Purple Galaxy Contrast
                squareBg = isDark ? 'bg-[#180a30]' : 'bg-[#ded4fc]';
              } else if (theme === 'dark') {
                // Sleek High-Contrast Gray-Charcoal Dark Theme
                squareBg = isDark ? 'bg-[#2b2b2b]' : 'bg-[#525252]';
              } else {
                // High-Contrast Professional Light Theme
                squareBg = isDark ? 'bg-[#7e998a]' : 'bg-[#ffffff]';
              }

              // Highlight modifiers
              let borderModifier = 'border-none';
              let squareOverlay = null;

              if (isCheck) {
                // Flash soft coral-red for king in check
                borderModifier = 'border-4 border-[#ff7b90] animate-pulse z-10';
              } else if (isSelected) {
                // Muted coral/peach accent highlights
                borderModifier = 'border-4 border-[#fec5bb] z-10';
              } else if (isLast) {
                // Subtle coral overlay highlight for last moves
                squareOverlay = <div className="absolute inset-0 bg-[#fec5bb]/30 mix-blend-multiply" />;
              }

              return (
                <div
                  id={`square-${cell.square}`}
                  key={cell.square}
                  className={`relative flex items-center justify-center transition-all ${squareBg} ${borderModifier}`}
                >
                  {squareOverlay}

                  {/* Render piece */}
                  {cell.piece && (
                    <div
                      onPointerDown={(e) => handlePointerDown(e, cell.square, cell.piece!)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      className="absolute inset-0 flex items-center justify-center z-10 touch-none active:scale-105"
                      style={{ opacity: (drag && drag.fromSquare === cell.square) ? 0 : 1 }}
                    >
                      <Piece
                        type={cell.piece.type}
                        color={cell.piece.color}
                        theme={theme}
                        size={40}
                      />
                    </div>
                  )}

                  {/* Move Target Guide Indicator - Muted Peach Dot */}
                  {isPossible && (
                    <div className="absolute z-20 pointer-events-none flex items-center justify-center inset-0">
                      <div className="w-4 h-4 rounded-full border-2 border-white bg-[#fec5bb] animate-scaleIn shadow-md" />
                    </div>
                  )}

                  {/* Corner Coordinate Guides (Rank on left, File on bottom) */}
                  {cIdx === 0 && (
                    <span className="absolute top-0.5 left-1 text-[9px] font-mono select-none opacity-50 font-bold z-10 text-neutral-600">
                      {isFlipped ? (rIdx + 1) : (8 - rIdx)}
                    </span>
                  )}
                  {rIdx === 7 && (
                    <span className="absolute bottom-0.5 right-1 text-[9px] font-mono select-none opacity-50 font-bold z-10 text-neutral-600">
                      {isFlipped ? String.fromCharCode(104 - cIdx) : String.fromCharCode(97 + cIdx)}
                    </span>
                  )}
                </div>
              );
            });
          })}

          {/* Floating Absolute Element For Piece Drag Shadow Follower */}
          {drag && (
            <div
              className="fixed pointer-events-none z-50 mix-blend-normal transform -translate-x-1/2 -translate-y-1/2 scale-110"
              style={{
                left: drag.currentX,
                top: drag.currentY,
              }}
            >
              <Piece
                type={drag.pieceType}
                color={drag.pieceColor}
                theme={theme}
                size={drag.squareSize * 1.15}
                isDragging={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
