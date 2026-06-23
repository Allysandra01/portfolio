import { Chess } from 'chess.js';

// Piece values for material evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Positional grids (PST matrices). Note that these are from perspective of White.
// We mirror them vertically for Black when computing black-side position evaluations.
const PAWN_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_PST = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  5,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_MIDDLE_GAME_PST = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

/**
 * Static board evaluation. Evaluates material and positional values.
 * Returns a score from White's perspective (high is good for White, low is good for Black).
 */
export function evaluateBoard(chess: Chess): number {
  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = board[r][c];
      if (!square) continue;

      const type = square.type;
      const color = square.color;
      let val = PIECE_VALUES[type] || 0;

      // Add positional grid modifiers
      let pValue = 0;
      const rowIdx = color === 'w' ? r : 7 - r; // Mirror table for black
      const colIdx = c;

      switch (type) {
        case 'p':
          pValue = PAWN_PST[rowIdx][colIdx];
          break;
        case 'n':
          pValue = KNIGHT_PST[rowIdx][colIdx];
          break;
        case 'b':
          pValue = BISHOP_PST[rowIdx][colIdx];
          break;
        case 'r':
          pValue = ROOK_PST[rowIdx][colIdx];
          break;
        case 'q':
          pValue = QUEEN_PST[rowIdx][colIdx];
          break;
        case 'k':
          pValue = KING_MIDDLE_GAME_PST[rowIdx][colIdx];
          break;
      }

      const totalVal = val + pValue;
      if (color === 'w') {
        score += totalVal;
      } else {
        score -= totalVal;
      }
    }
  }

  // Draw conditions and game overrides
  if (chess.isCheckmate()) {
    // If the active turn is white, white is checkmated -> black wins
    return chess.turn() === 'w' ? -100000 : 100000;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0;
  }

  return score;
}

/**
 * Minimax algorithm with alpha-beta pruning.
 * Returns the optimum score for the current player.
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });
  
  // Sort moves slightly: prioritize captures/checks first to speed up alpha-beta pruning significantly
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += PIECE_VALUES[a.captured] * 10;
    if (b.captured) scoreB += PIECE_VALUES[b.captured] * 10;
    if (a.san.includes('+')) scoreA += 50;
    if (b.san.includes('+')) scoreB += 50;
    return scoreB - scoreA;
  });

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' });
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break; // beta cutoff
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' });
      const evaluation = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break; // alpha cutoff
      }
    }
    return minEval;
  }
}

/**
 * Calculates the absolute best move for the active turn in the chess board.
 * - chess: A Chess instance representing the active session.
 * - depth: Search depth (1 to 3 works best in standard UI turns).
 * Returns the from/to algebraic move options or null if no legal moves exist.
 */
export function getBestMove(
  chess: Chess,
  depth: number = 2
): { from: string; to: string; promotion?: string } | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Let's shuffle moves randomly first to prevent the CPU from repeating identical openings
  const shuffledMoves = [...moves].sort(() => Math.random() - 0.5);

  let bestMove: typeof moves[0] | null = null;
  const isWhite = chess.turn() === 'w';

  if (isWhite) {
    let bestScore = -Infinity;
    for (const move of shuffledMoves) {
      // Default auto-promote pawns to Queen for simplicity
      const promoteOption = (move.piece === 'p' && (move.to.endsWith('8') || move.to.endsWith('1'))) ? 'q' : undefined;
      chess.move({ from: move.from, to: move.to, promotion: promoteOption });
      const score = minimax(chess, depth - 1, -Infinity, Infinity, false);
      chess.undo();

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;
    for (const move of shuffledMoves) {
      const promoteOption = (move.piece === 'p' && (move.to.endsWith('8') || move.to.endsWith('1'))) ? 'q' : undefined;
      chess.move({ from: move.from, to: move.to, promotion: promoteOption });
      const score = minimax(chess, depth - 1, -Infinity, Infinity, true);
      chess.undo();

      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  if (!bestMove) return null;

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: (bestMove.piece === 'p' && (bestMove.to.endsWith('8') || bestMove.to.endsWith('1'))) ? 'q' : undefined
  };
}
