import { ChessPieceColor, ChessPieceType, SquareColor } from './enums';
import { SquareAddressString } from './types';

export interface Coordinates {
  x: number;
  y: number;
  centerX: number;
  centerY: number;
}

export interface ChessPieceData {
  id: string;
  type: ChessPieceType;
  color: ChessPieceColor;
  numberOfSteps: number;
}

export interface SquareData {
  id: SquareAddressString;
  color: SquareColor;
  suggesting: boolean;
  coordinates?: Coordinates;
  chessPiece?: ChessPieceData;
}

export interface ChessBoardItem<D> {
  rowIdx: number;
  colIdx: number;
  data: D;
}

export interface ChessPieceProps extends ChessBoardItem<ChessPieceData> {
  coordinates: Coordinates;
}
