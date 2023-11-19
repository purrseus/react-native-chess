import { GRID_SIZE } from '../core/constants';
import {
  CardinalDirection,
  CornerDirection,
  SquareAddress
} from '../core/types';
import ChessPiece from './ChessPiece';

type QueenDirectionData<V> = Record<CornerDirection | CardinalDirection, V>;

export default class Queen extends ChessPiece {
  protected calculateMoves(): void {
    const { rowIdx, colIdx } = this.props;
    const blockedDirections = {} as QueenDirectionData<boolean>;

    for (let step = 1; step < GRID_SIZE; step++) {
      const stepDirections: QueenDirectionData<SquareAddress> = {
        topLeft: [rowIdx - step, colIdx - step],
        topRight: [rowIdx - step, colIdx + step],
        bottomLeft: [rowIdx + step, colIdx - step],
        bottomRight: [rowIdx + step, colIdx + step],
        left: [rowIdx, colIdx - step],
        top: [rowIdx - step, colIdx],
        right: [rowIdx, colIdx + step],
        bottom: [rowIdx + step, colIdx],
      };

      this.validateSteps({
        stepDirections,
        blockedDirections,
        customValidator: this.checkBlockDirection,
      });
    }
  }
}
