import { Text, TextStyle } from 'react-native';
import { ChessPieceColor, ChessPieceType } from '../core/enums';
import tw from '../tailwind-native';

type ChessPieceSymbol =
  | '♔'
  | '♕'
  | '♗'
  | '♘'
  | '♖'
  | '♙'
  | '♚'
  | '♛'
  | '♝'
  | '♞'
  | '♜'
  | '♟︎';

interface ChessPieceSymbolTextProps {
  color: ChessPieceColor;
  type: ChessPieceType;
  style?: TextStyle;
}

export const chessPieceSymbol = new Map<
  `${ChessPieceColor}${ChessPieceType}`,
  ChessPieceSymbol
>([
  [`${ChessPieceColor.White}${ChessPieceType.King}`, '♔'],
  [`${ChessPieceColor.White}${ChessPieceType.Queen}`, '♕'],
  [`${ChessPieceColor.White}${ChessPieceType.Bishop}`, '♗'],
  [`${ChessPieceColor.White}${ChessPieceType.Knight}`, '♘'],
  [`${ChessPieceColor.White}${ChessPieceType.Rook}`, '♖'],
  [`${ChessPieceColor.White}${ChessPieceType.Pawn}`, '♙'],
  [`${ChessPieceColor.Black}${ChessPieceType.King}`, '♚'],
  [`${ChessPieceColor.Black}${ChessPieceType.Queen}`, '♛'],
  [`${ChessPieceColor.Black}${ChessPieceType.Bishop}`, '♝'],
  [`${ChessPieceColor.Black}${ChessPieceType.Knight}`, '♞'],
  [`${ChessPieceColor.Black}${ChessPieceType.Rook}`, '♜'],
  [`${ChessPieceColor.Black}${ChessPieceType.Pawn}`, '♟︎'],
]);

export default function ChessPieceSymbolText({
  color,
  type,
  style,
}: ChessPieceSymbolTextProps) {
  return (
    <Text
      style={tw.style(
        `text-3xl text-gray-700 text-center`,
        {
          fontFamily: 'Arial Unicode MS',
        },
        style,
      )}>
      {chessPieceSymbol.get(`${color}${type}`)}
    </Text>
  );
}
