import { Component } from 'react';
import { ChessPieceType } from '../core/enums';
import { ChessPieceProps } from '../core/interfaces';
import Bishop from './Bishop';
import King from './King';
import Knight from './Knight';
import Pawn from './Pawn';
import Queen from './Queen';
import Rook from './Rook';

interface ChessPieceFactoryProps extends ChessPieceProps {
  type: ChessPieceType;
}

export default class ChessPieceFactory extends Component<ChessPieceFactoryProps> {
  private readonly chessPieces = new Map<ChessPieceType, typeof Component>([
    [ChessPieceType.King, King],
    [ChessPieceType.Queen, Queen],
    [ChessPieceType.Bishop, Bishop],
    [ChessPieceType.Knight, Knight],
    [ChessPieceType.Rook, Rook],
    [ChessPieceType.Pawn, Pawn],
  ]);

  render(): React.ReactNode {
    const ChessPieceComponent = this.chessPieces.get(this.props.type);
    if (!ChessPieceComponent) return null;

    return <ChessPieceComponent {...this.props} />;
  }
}
