import 'react-native-get-random-values';

import { nanoid } from 'nanoid';
import { GRID_SIZE } from './core/constants';
import { ChessPieceColor, ChessPieceType } from './core/enums';
import { SquareData } from './core/interfaces';
import { Offset, SquareAddress, SquareAddressString } from './core/types';

const utils = {
  stringifySquareId([rowIdx, colIdx]: SquareAddress): SquareAddressString {
    'worklet';
    return `${rowIdx}-${colIdx}`;
  },
  parseSquareId(id: SquareAddressString): SquareAddress {
    'worklet';
    return id.split('-').map(Number) as SquareAddress;
  },
  isIdxInBoard(idx: number): boolean {
    'worklet';
    return idx >= 0 && idx < GRID_SIZE;
  },
  isInCoordinateRange(start: Offset, target: Offset, end: Offset) {
    const inXRange = start.x < target.x && target.x <= end.x;
    const inYRange = start.y < target.y && target.y <= end.y;

    return inXRange && inYRange;
  },
  setupChessPiece(
    types: ChessPieceType[],
    color: ChessPieceColor,
  ): (square: SquareData, index: number) => SquareData {
    return (square, index) => ({
      ...square,
      chessPiece: {
        id: nanoid(),
        numberOfSteps: 0,
        type: types[index],
        color,
      },
    });
  },
};

export default utils;
