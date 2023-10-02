import { GRID_SIZE } from '../core/constants';
import {
  CardinalDirection,
  SquareAddress,
  SquareAddressString,
} from '../core/types';
import ChessPiece from './ChessPiece';

type RookDirectionData<V> = Record<CardinalDirection, V>;

export default class Rook extends ChessPiece {
  protected possibleMoves: SquareAddressString[] = [];

  protected calculateMoves(): void {
    const { rowIdx, colIdx } = this.props;
    const blockedDirections = {} as RookDirectionData<boolean>;

    for (let step = 1; step < GRID_SIZE; step++) {
      const stepDirections: RookDirectionData<SquareAddress> = {
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
