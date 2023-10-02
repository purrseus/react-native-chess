import {
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GestureHandlerRootViewProps } from 'react-native-gesture-handler/lib/typescript/components/GestureHandlerRootView';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { BOARD_SIZE, SQUARE_SIZE } from '../core/constants';
import { ChessPieceColor, Turn } from '../core/enums';
import useChessStore from '../store';
import tw from '../tailwind-native';
import ChessPieceFactory from './ChessPieceFactory';
import Square from './Square';
import utils from '../utils';

const AnimatedGestureHandlerRootView = Animated.createAnimatedComponent(
  forwardRef<unknown, GestureHandlerRootViewProps>((props, _ref) => (
    <GestureHandlerRootView {...props} />
  )),
);

export default function ChessBoard() {
  const isFirstRender = useRef(true);
  const [chessBoard, metadata, setup, setSquaresCoordinates] = useChessStore(
    state => [
      state.chessBoard,
      state.metadata,
      state.setup,
      state.setSquaresCoordinates,
    ],
  );

  const {
    ourChessPieceColor,
    enemyChessPieceColor,
    lastMove,
    currentTurn,
    isReady,
  } = metadata || {};

  const [ourColor, enemyColor] = useMemo(() => {
    const color = {
      [ChessPieceColor.White]: tw.color('white'),
      [ChessPieceColor.Black]: tw.color('gray-700'),
    };

    const hasMetadataColor = [ourChessPieceColor, enemyChessPieceColor].every(
      Number.isInteger,
    );

    return hasMetadataColor
      ? [color[ourChessPieceColor!], color[enemyChessPieceColor!]]
      : [tw.color('white'), tw.color('white')];
  }, [ourChessPieceColor, enemyChessPieceColor]);

  const turn = useDerivedValue(
    () => withTiming(currentTurn ?? Turn.Our),
    [currentTurn],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      turn.value,
      [Turn.Our, Turn.Enemy],
      [ourColor!, enemyColor!],
    ),
  }));

  useEffect(() => {
    setup(ChessPieceColor.White);
  }, []);

  const handleLayout = useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
      if (!isFirstRender.current) return;

      setSquaresCoordinates({
        x: layout.x,
        y: layout.y,
        centerX: layout.x + SQUARE_SIZE / 2,
        centerY: layout.y + SQUARE_SIZE / 2,
      });

      isFirstRender.current = false;
    },
    [setSquaresCoordinates],
  );

  const [squares, chessPieces] = useMemo(() => {
    const squares: ReactNode[] = [];
    const chessPieces: ReactNode[] = [];

    const fromSquareId = utils.stringifySquareId(
      metadata?.lastMove?.fromSquare || [-1, -1],
    );

    const toSquareId = utils.stringifySquareId(
      metadata?.lastMove?.toSquare || [-1, -1],
    );

    chessBoard.forEach((row, rowIdx) =>
      row.forEach((square, colIdx) => {
        squares.push(
          <Square
            key={square.id}
            rowIdx={rowIdx}
            colIdx={colIdx}
            data={square}
            handleLayout={!rowIdx && !colIdx ? handleLayout : undefined}
            fromSquareHighlighting={square.id === fromSquareId}
            toSquareHighlighting={square.id === toSquareId}
          />,
        );

        if (isReady && !!square.chessPiece && !!square.coordinates)
          chessPieces.push(
            <ChessPieceFactory
              key={square.chessPiece.id}
              type={square.chessPiece.type}
              rowIdx={rowIdx}
              colIdx={colIdx}
              data={square.chessPiece}
              coordinates={square.coordinates}
            />,
          );
      }),
    );

    return [squares, chessPieces];
  }, [isReady, chessBoard, handleLayout]);

  return (
    <AnimatedGestureHandlerRootView
      style={[tw`flex-fill-center`, animatedStyle]}>
      <View style={tw`border border-gray-700 bg-white shadow-black shadow-2xl`}>
        <View
          style={tw`w-[${BOARD_SIZE}px] h-[${BOARD_SIZE}px] flex-row flex-wrap`}>
          {squares}
          {chessPieces}
        </View>
      </View>
    </AnimatedGestureHandlerRootView>
  );
}
