import { GestureDetector, PanGesture } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SQUARE_SIZE } from '../core/constants';
import { Turn } from '../core/enums';
import { ChessPieceProps } from '../core/interfaces';
import { Offset } from '../core/types';
import useChessStore from '../store';
import tw from '../tailwind-native';
import ChessPieceSymbolText from './ChessPieceSymbolText';
import { SharedValues } from './DraggableComponent';

interface ChessPieceUIProps extends Omit<ChessPieceProps, 'rowIdx' | 'colIdx'> {
  sharedValues: SharedValues;
  panGesture: PanGesture;
}

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
    const scale = interpolate(scaleValue.value, [0, 1], [1, 2]);

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
        <ChessPieceSymbolText color={data.color} type={data.type} />
      </Animated.View>
    </GestureDetector>
  );
}
