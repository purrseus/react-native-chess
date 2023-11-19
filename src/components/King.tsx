import { MoveType } from '../core/enums';
import {
  CardinalDirection,
  CornerDirection,
  SquareAddress,
} from '../core/types';
import useChessStore from '../store';
import ChessPiece from './ChessPiece';

type CastlingKey = 'kingside' | 'queenside';
type CastlingDirectionData<V = {}> = Record<CastlingKey, V>;
type KingDirectionData<V> = Record<CornerDirection | CardinalDirection, V> &
  CastlingDirectionData<V>;

export default class King extends ChessPiece {
  private readonly castlingNames: CastlingKey[] = ['kingside', 'queenside'];

  private readonly validMove = {
    isInvalid: false as const,
    moveType: MoveType.Castling,
  };

  private readonly invalidMove = { isInvalid: true as const };

  protected calculateMoves(): void {
    const { rowIdx, colIdx, data } = this.props;
    const { metadata, chessBoard } = useChessStore.getState();

    const { kingsideCastlingOffset = 0, queenSideCastlingOffset = 0 } =
      metadata || {};

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
      kingside: [-1, -1],
      queenside: [-1, -1],
    };

    if (!data.numberOfSteps) {
      stepDirections.kingside = [rowIdx, colIdx + kingsideCastlingOffset];
      stepDirections.queenside = [rowIdx, colIdx + queenSideCastlingOffset];
    }

    this.validateSteps({
      stepDirections,
      blockedDirections,
      customValidator: param => {
        if (!this.castlingNames.includes(param.direction as CastlingKey))
          return this.checkBlockDirection(param);

        const kingHasMoved = !!data.numberOfSteps;
        if (kingHasMoved) return this.invalidMove;

        const rookOffset =
          param.direction === 'kingside'
            ? kingsideCastlingOffset + 1
            : queenSideCastlingOffset + 2;

        const rookColIdx = colIdx + rookOffset;

        const rookHasMoved =
          !!chessBoard[rowIdx][rookColIdx].chessPiece?.numberOfSteps;

        if (rookHasMoved) return this.invalidMove;

        for (
          let i = Math.min(colIdx, rookColIdx) + 1;
          i < Math.max(colIdx, rookColIdx);
          i++
        ) {
          if (!!chessBoard[rowIdx][i].chessPiece) return this.invalidMove;
        }

        return this.validMove;
      },
    });
  }
}
