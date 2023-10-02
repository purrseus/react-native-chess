import { SquareAddress, SquareAddressString } from '../core/types';
import useChessStore from '../store';
import ChessPiece from './ChessPiece';

export default class Pawn extends ChessPiece {
  protected possibleMoves: SquareAddressString[] = [];

  protected calculateMoves(): void {
    const { rowIdx, colIdx, data } = this.props;
    const metadata = useChessStore.getState().metadata;
    const maxStep = data.numberOfSteps ? 1 : 2;

    for (let step = 1; step <= maxStep; step++) {
      const offsetStep = (n: number) =>
        data.color === metadata?.enemyChessPieceColor ? n : -n;

      const stepDirections: Record<
        'forward' | 'forwardLeft' | 'forwardRight',
        SquareAddress
      > = {
        forward: [rowIdx + offsetStep(step), colIdx],
        forwardLeft: [rowIdx + offsetStep(1), colIdx + offsetStep(1)],
        forwardRight: [rowIdx + offsetStep(1), colIdx - offsetStep(1)],
      };

      this.validateSteps({
        stepDirections,
        customValidator: param => {
          const { direction, squareAddress } = param;
          const chessBoard = useChessStore.getState().chessBoard;

          const targetSquare =
            chessBoard[squareAddress.first][squareAddress.last];

          if (['forwardLeft', 'forwardRight'].includes(direction))
            return !targetSquare.chessPiece;

          if (direction === 'forward') {
            if (step === 2) {
              const previousSquare =
                chessBoard[squareAddress.first - offsetStep(1)][
                  squareAddress.last
                ].chessPiece;

              return !!previousSquare;
            }

            return !!targetSquare.chessPiece;
          }

          return false;
        },
      });
    }
  }
}
