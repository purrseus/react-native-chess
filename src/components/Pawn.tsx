import { GRID_SIZE } from '../core/constants';
import { ChessPieceType, MoveType } from '../core/enums';
import { ChessPieceData } from '../core/interfaces';
import { SquareAddress } from '../core/types';
import useChessStore from '../store';
import ChessPiece from './ChessPiece';

export default class Pawn extends ChessPiece {
  protected calculateMoves(): void {
    const { rowIdx, colIdx, data } = this.props;
    const { metadata, chessBoard } = useChessStore.getState();
    const maxStep = data.numberOfSteps ? 1 : 2;
    const isEnemyChessPiece = data.color === metadata?.enemyChessPieceColor;

    const offsetStep = (n: number) => (isEnemyChessPiece ? n : -n);

    const incrementStep = offsetStep(1);
    const decrementStep = isEnemyChessPiece ? -1 : 1;

    const validMove = {
      isInvalid: false as const,
      moveType: MoveType.Standard,
    };
    const invalidMove = { isInvalid: true as const };

    for (let step = 1; step <= maxStep; step++) {
      const stepDirections: Record<
        'forward' | 'forwardLeft' | 'forwardRight',
        SquareAddress
      > = {
        forward: [rowIdx + offsetStep(step), colIdx],
        forwardLeft: [rowIdx + incrementStep, colIdx + incrementStep],
        forwardRight: [rowIdx + incrementStep, colIdx - incrementStep],
      };

      this.validateSteps({
        stepDirections,
        customValidator: param => {
          const { direction, squareAddress } = param;

          const targetSquare =
            chessBoard[squareAddress.first][squareAddress.last];

          const isLastRank =
            squareAddress.first === (isEnemyChessPiece ? GRID_SIZE - 1 : 0);

          if (isLastRank) validMove.moveType = MoveType.Promotion;

          if (direction === 'forward') {
            if (step === 1)
              return !targetSquare.chessPiece ? validMove : invalidMove;

            const previousSquare =
              chessBoard[squareAddress.first + decrementStep][
                squareAddress.last
              ];

            return !previousSquare.chessPiece && !targetSquare.chessPiece
              ? validMove
              : invalidMove;
          }

          if (targetSquare.chessPiece) return validMove;

          const sameLevelRowIdx = squareAddress.first + decrementStep;
          const sameLevelBesideSquare =
            chessBoard[sameLevelRowIdx][squareAddress.last];

          if (
            this.isValidEnPassantMove(
              sameLevelRowIdx,
              sameLevelBesideSquare.chessPiece,
            )
          )
            return { isInvalid: false, moveType: MoveType.EnPassant };

          return invalidMove;
        },
      });
    }
  }

  private isValidEnPassantMove(
    rowIdx: number,
    chessPiece?: ChessPieceData,
  ): boolean {
    const centerRowsOfChessBoard = [3, 4];

    return (
      chessPiece?.type === ChessPieceType.Pawn && // isPawn
      chessPiece.color !== this.props.data.color && // isEnemy
      chessPiece.numberOfSteps === 1 &&
      centerRowsOfChessBoard.includes(rowIdx) // isFirstLongStep
    );
  }
}
