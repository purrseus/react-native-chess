import { Component } from 'react';
import { ChessPieceType } from '../core/enums';
import { ChessPieceProps } from '../core/interfaces';
import Bishop from './Bishop';
import King from './King';
import Knight from './Knight';
import Pawn from './Pawn';
import Queen from './Queen';
import Rook from './Rook';

export default class ChessPieceFactory extends Component<ChessPieceProps> {
  private readonly chessPieces = new Map<ChessPieceType, typeof Component>([
    [ChessPieceType.King, King],
    [ChessPieceType.Queen, Queen],
    [ChessPieceType.Bishop, Bishop],
    [ChessPieceType.Knight, Knight],
    [ChessPieceType.Rook, Rook],
    [ChessPieceType.Pawn, Pawn],
  ]);

  render(): React.ReactNode {
    const ChessPieceComponent = this.chessPieces.get(this.props.data.type);
    if (!ChessPieceComponent) return null;

    return <ChessPieceComponent {...this.props} />;
  }
}
