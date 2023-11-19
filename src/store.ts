import isEqual from 'react-fast-compare';
import { immer } from 'zustand/middleware/immer';
import { createWithEqualityFn } from 'zustand/traditional';
import { chessPieceSelectionRef } from './components/modals/ChessPieceSelection';
import { GRID_SIZE, SQUARE_SIZE } from './core/constants';
import {
  ChessPieceColor,
  ChessPieceType,
  MoveType,
  SquareColor,
  Turn,
} from './core/enums';
import { Coordinates, SquareData } from './core/interfaces';
import { Offset, SquareAddress, SquareAddressString } from './core/types';
import utils from './utils';

interface MetaData {
  isReady: boolean;
  ourChessPieceColor: ChessPieceColor;
  enemyChessPieceColor: ChessPieceColor;
  currentTurn: Turn;
  chessBoardCoordinates?: Record<'start' | 'end', Offset>;
  kingsideCastlingOffset?: number;
  queenSideCastlingOffset?: number;
  lastMove?: Record<'fromSquare' | 'toSquare', SquareAddress>;
}

type State = {
  metadata: MetaData | null;
  chessBoard: typeof initChessBoard;
};

export type Action = {
  setup: (chessPieceColor: ChessPieceColor) => void;
  setSquaresCoordinates: (firstCoordinates: Coordinates) => void;
  moveChessPiece: (
    from: SquareAddress,
    to: SquareAddress,
    moveType: MoveType,
  ) => void;
  promotion: (
    squareAddress: SquareAddress,
    chessPieceType: ChessPieceType,
  ) => void;
  switchTurn: () => void;
  suggestSquares: (moves: SquareAddressString[]) => void;
  removeSquareSuggestions: () => void;
};

const initChessBoard: SquareData[][] = Array.from(
  { length: GRID_SIZE },
  (_, rowIdx) =>
    Array.from({ length: GRID_SIZE }, (_, colIdx) => {
      const isLightSquare = (rowIdx + colIdx).isEven;
      return {
        id: utils.stringifySquareId([rowIdx, colIdx]),
        color: isLightSquare ? SquareColor.Light : SquareColor.Dark,
        suggesting: false,
      };
    }),
);

// In case our chessPieces are white
const firstRowPosition = [
  ChessPieceType.Rook,
  ChessPieceType.Knight,
  ChessPieceType.Bishop,
  ChessPieceType.Queen,
  ChessPieceType.King,
  ChessPieceType.Bishop,
  ChessPieceType.Knight,
  ChessPieceType.Rook,
];

const secondRowPosition = Array.from(
  { length: GRID_SIZE },
  () => ChessPieceType.Pawn,
);

const useChessStore = createWithEqualityFn(
  immer<State & Action>((set, get) => ({
    isReady: false,
    metadata: null,
    chessBoard: initChessBoard,
    setup: chessPieceColor =>
      set(state => {
        const areOurBlackChessPieces =
          chessPieceColor === ChessPieceColor.Black;

        const [ourChessPieceColor, enemyChessPieceColor] =
          areOurBlackChessPieces
            ? [ChessPieceColor.Black, ChessPieceColor.White]
            : [ChessPieceColor.White, ChessPieceColor.Black];

        const firstRow = areOurBlackChessPieces
          ? firstRowPosition.reverse()
          : firstRowPosition;

        state.metadata = {
          isReady: false,
          ourChessPieceColor,
          enemyChessPieceColor,
          currentTurn: areOurBlackChessPieces ? Turn.Enemy : Turn.Our,
          kingsideCastlingOffset: areOurBlackChessPieces ? -2 : 2,
          queenSideCastlingOffset: areOurBlackChessPieces ? 2 : -2,
        };

        state.chessBoard[0] = state.chessBoard[0].map(
          utils.setupChessPiece(firstRow, enemyChessPieceColor),
        );

        state.chessBoard[1] = state.chessBoard[1].map(
          utils.setupChessPiece(secondRowPosition, enemyChessPieceColor),
        );

        state.chessBoard[GRID_SIZE - 2] = state.chessBoard[GRID_SIZE - 2].map(
          utils.setupChessPiece(secondRowPosition, ourChessPieceColor),
        );

        state.chessBoard[GRID_SIZE - 1] = state.chessBoard[GRID_SIZE - 1].map(
          utils.setupChessPiece(firstRow, ourChessPieceColor),
        );
      }),
    setSquaresCoordinates: firstCoordinates =>
      set(state => {
        if (state.metadata?.isReady || !state.metadata) return;

        state.chessBoard.forEach((row, rowIdx) => {
          row.forEach((square, colIdx) => {
            square.coordinates = {
              x: firstCoordinates.x + SQUARE_SIZE * colIdx,
              y: firstCoordinates.y + SQUARE_SIZE * rowIdx,
              centerX: firstCoordinates.centerX + SQUARE_SIZE * colIdx,
              centerY: firstCoordinates.centerY + SQUARE_SIZE * rowIdx,
            };
          });
        });

        state.metadata!.chessBoardCoordinates = {
          start: {
            x: firstCoordinates.x,
            y: firstCoordinates.y,
          },
          end: {
            x: firstCoordinates.x + SQUARE_SIZE * GRID_SIZE,
            y: firstCoordinates.y + SQUARE_SIZE * GRID_SIZE,
          },
        };

        state.metadata!.isReady = true;
      }),
    moveChessPiece: ([fromRow, fromCol], [toRow, toCol], moveType) =>
      set(state => {
        state.chessBoard[toRow][toCol].chessPiece =
          state.chessBoard[fromRow][fromCol].chessPiece;

        state.chessBoard[toRow][toCol].chessPiece!.numberOfSteps += 1;

        delete state.chessBoard[fromRow][fromCol].chessPiece;

        state.metadata!.lastMove = {
          fromSquare: [fromRow, fromCol],
          toSquare: [toRow, toCol],
        };

        const currentChessPieceColor =
          state.chessBoard[toRow][toCol].chessPiece!.color;

        switch (moveType) {
          case MoveType.EnPassant:
            const decrementStep =
              currentChessPieceColor === state.metadata?.enemyChessPieceColor
                ? -1
                : 1;
            delete state.chessBoard[toRow + decrementStep][toCol].chessPiece;
            break;

          case MoveType.Promotion:
            const { coordinates, id } = get().chessBoard[toRow][toCol];

            if (coordinates && typeof currentChessPieceColor === 'number') {
              chessPieceSelectionRef.current?.showPromotableSelection({
                chessPieceColor: currentChessPieceColor,
                squareAddress: utils.parseSquareId(id),
                coordinates,
              });
            }
            break;

          case MoveType.Castling:
            const isToLeft = fromCol > toCol;

            state.chessBoard[toRow][Math.max(fromCol, toCol) - 1].chessPiece =
              state.chessBoard[fromRow][
                isToLeft ? 0 : GRID_SIZE - 1
              ].chessPiece;

            delete state.chessBoard[fromRow][isToLeft ? 0 : GRID_SIZE - 1]
              .chessPiece;
            break;
          default:
        }
      }),
    promotion: ([rowIdx, colIdx], chessPieceType) =>
      set(state => {
        state.chessBoard[rowIdx][colIdx].chessPiece!.type = chessPieceType;
      }),
    switchTurn: () =>
      set(state => {
        if (!state.metadata) return;

        state.metadata!.currentTurn =
          state.metadata?.currentTurn === Turn.Our ? Turn.Enemy : Turn.Our;
      }),
    suggestSquares: (moves: SquareAddressString[]) =>
      set(state => {
        moves.forEach(move => {
          const [rowIdx, colIdx] = utils.parseSquareId(move);
          state.chessBoard[rowIdx][colIdx].suggesting = true;
        });
      }),
    removeSquareSuggestions: () =>
      set(state => {
        state.chessBoard.forEach(row => {
          row.forEach(square => {
            square.suggesting = false;
          });
        });
      }),
  })),
  isEqual,
);

export default useChessStore;
