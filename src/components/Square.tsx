import { memo } from 'react';
import isEqual from 'react-fast-compare';
import { LayoutChangeEvent, View } from 'react-native';
import { SQUARE_SIZE } from '../core/constants';
import { SquareColor } from '../core/enums';
import { ChessBoardItem, SquareData } from '../core/interfaces';
import tw from '../tailwind-native';

export interface SquareProps extends ChessBoardItem<NonNullable<SquareData>> {
  handleLayout?: (event: LayoutChangeEvent) => void;
  fromSquareHighlighting?: boolean;
  toSquareHighlighting?: boolean;
}

const squareStyle: Record<SquareColor, string> = {
  [SquareColor.Light]: 'bg-white',
  [SquareColor.Dark]: 'bg-gray-400',
};

const Square = memo(
  ({
    data,
    handleLayout,
    fromSquareHighlighting = false,
    toSquareHighlighting = false,
  }: SquareProps) => {
    const noHighlight = !fromSquareHighlighting && !toSquareHighlighting;

    return (
      <View
        id={data.id}
        onLayout={handleLayout}
        style={tw.style(
          `w-[${SQUARE_SIZE}px] h-[${SQUARE_SIZE}px] flex-center`,
          fromSquareHighlighting && 'bg-blue-500/50',
          toSquareHighlighting && 'bg-green-500/50',
          noHighlight && squareStyle[data.color]!,
        )}>
        {data.suggesting && (
          <View style={tw`w-2/5 h-2/5 rounded-full bg-slate-500`} />
        )}
      </View>
    );
  },
  isEqual,
);

export default Square;