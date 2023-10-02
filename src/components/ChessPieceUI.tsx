import { Text } from 'react-native';
import { GestureDetector, PanGesture } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SQUARE_SIZE } from '../core/constants';
import { ChessPieceColor, ChessPieceType, Turn } from '../core/enums';
import { ChessPieceProps } from '../core/interfaces';
import { Offset } from '../core/types';
import tw from '../tailwind-native';
import { SharedValues } from './DraggableComponent';
import useChessStore from '../store';

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

interface ChessPieceUIProps extends Omit<ChessPieceProps, 'rowIdx' | 'colIdx'> {
  sharedValues: SharedValues;
  panGesture: PanGesture;
}

const chessPieceSymbol = new Map<
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

export default function ChessPieceUI({
  data,
  coordinates,
  sharedValues,
  panGesture,
}: ChessPieceUIProps) {
  const currentTurn = useChessStore(state => state.metadata?.currentTurn);
  sharedValues.isPressed = useSharedValue(false);

  sharedValues.offset = useSharedValue<Offset>({
    x: 0,
    y: 0,
  });

  const scaleValue = useDerivedValue(() =>
    withTiming(+sharedValues.isPressed.value),
  );

  const turn = useDerivedValue(
    () => withTiming(currentTurn ?? Turn.Our),
    [currentTurn],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scaleValue.value, [0, 1], [1, 1.5]);

    const rotateValue = interpolate(
      turn.value,
      [Turn.Our, Turn.Enemy],
      [0, 180],
    );

    return {
      transform: [
        { translateX: sharedValues.offset.value.x },
        { translateY: sharedValues.offset.value.y },
        { scale },
        {
          rotate: `${rotateValue}deg`,
        },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          tw`w-[${SQUARE_SIZE}px] h-[${SQUARE_SIZE}px] flex-center absolute left-[${coordinates.x}px] top-[${coordinates.y}px]`,
          animatedStyle,
        ]}>
        <Text
          style={tw.style(`text-3xl text-gray-700 text-center`, {
            fontFamily: 'Arial Unicode MS',
            ...(data.color === ChessPieceColor.White && {
              textShadowColor: tw.color('gray-700'),
              textShadowRadius: 1,
            }),
          })}>
          {chessPieceSymbol.get(`${data.color}${data.type}`)}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}
