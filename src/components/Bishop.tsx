import { GRID_SIZE } from '../core/constants';
import {
  CornerDirection,
  SquareAddress
} from '../core/types';
import ChessPiece from './ChessPiece';

type BishopDirectionData<V> = Record<CornerDirection, V>;

export default class Bishop extends ChessPiece {
  protected calculateMoves(): void {
    const { rowIdx, colIdx } = this.props;
    const blockedDirections = {} as BishopDirectionData<boolean>;

    for (let step = 1; step < GRID_SIZE; step++) {
      const stepDirections: BishopDirectionData<SquareAddress> = {
        topLeft: [rowIdx - step, colIdx - step],
        topRight: [rowIdx - step, colIdx + step],
        bottomLeft: [rowIdx + step, colIdx - step],
        bottomRight: [rowIdx + step, colIdx + step],
      };

      this.validateSteps({
        stepDirections,
        blockedDirections,
        customValidator: this.checkBlockDirection,
      });
    }
  }
}
