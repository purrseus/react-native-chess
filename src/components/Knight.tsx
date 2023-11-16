import { SquareAddress } from '../core/types';
import ChessPiece from './ChessPiece';

export default class Knight extends ChessPiece {
  protected calculateMoves(): void {
    const { rowIdx, colIdx } = this.props;

    const stepDirections: Record<string, SquareAddress> = {
      topLeft: [rowIdx - 2, colIdx - 1],
      topRight: [rowIdx - 2, colIdx + 1],
      leftTop: [rowIdx - 1, colIdx - 2],
      leftBottom: [rowIdx + 1, colIdx - 2],
      rightTop: [rowIdx - 1, colIdx + 2],
      rightBottom: [rowIdx + 1, colIdx + 2],
      bottomLeft: [rowIdx + 2, colIdx - 1],
      bottomRight: [rowIdx + 2, colIdx + 1],
    };

    this.validateSteps({ stepDirections });
  }
}
