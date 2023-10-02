import {
  CardinalDirection,
  CornerDirection,
  SquareAddress,
  SquareAddressString,
} from '../core/types';
import ChessPiece from './ChessPiece';

type KingDirectionData<V> = Record<CornerDirection & CardinalDirection, V>;

export default class King extends ChessPiece {
  protected possibleMoves: SquareAddressString[] = [];

  protected calculateMoves(): void {
    const { rowIdx, colIdx } = this.props;
    const blockedDirections = {} as KingDirectionData<boolean>;

    const stepDirections: KingDirectionData<SquareAddress> = {
      topLeft: [rowIdx - 1, colIdx - 1],
      topRight: [rowIdx - 1, colIdx + 1],
      bottomLeft: [rowIdx + 1, colIdx - 1],
      bottomRight: [rowIdx + 1, colIdx + 1],
      left: [rowIdx, colIdx - 1],
      top: [rowIdx - 1, colIdx],
      right: [rowIdx, colIdx + 1],
      bottom: [rowIdx + 1, colIdx],
    };

    this.validateSteps({
      stepDirections,
      blockedDirections,
      customValidator: this.checkBlockDirection,
    });
  }
}
