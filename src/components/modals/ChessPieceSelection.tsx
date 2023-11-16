import { createRef, useImperativeHandle, useMemo, useState } from 'react';
import {
  Modal,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { BOARD_SIZE, SQUARE_SIZE } from '../../core/constants';
import { ChessPieceColor, ChessPieceType } from '../../core/enums';
import { Coordinates } from '../../core/interfaces';
import { SquareAddress } from '../../core/types';
import useChessStore from '../../store';
import tw from '../../tailwind-native';
import ChessPieceSymbolText from '../ChessPieceSymbolText';

interface SelectionMeta {
  squareAddress: SquareAddress;
  coordinates: Coordinates;
  chessPieceColor: ChessPieceColor;
}

const replaceableChessPieceTypes = [
  ChessPieceType.Queen,
  ChessPieceType.Bishop,
  ChessPieceType.Knight,
  ChessPieceType.Rook,
];

export const chessPieceSelectionRef = createRef<{
  showPromotableSelection: (selectionMetaParam: SelectionMeta) => void;
}>();

export default function ChessPieceSelection() {
  const [promotion, switchTurn] = useChessStore(state => [
    state.promotion,
    state.switchTurn,
  ]);

  const [selectionMeta, setSelectionMeta] = useState<
    SelectionMeta | undefined
  >();

  const isTop = selectionMeta?.coordinates.y === 0;

  const selectionData = useMemo(
    () =>
      isTop ? replaceableChessPieceTypes : [...replaceableChessPieceTypes].reverse(),
    [isTop],
  );

  const [containerStyle, itemStyle] = useMemo<[ViewStyle, TextStyle]>(() => {
    const top =
      (selectionMeta?.coordinates.y ?? 0) -
      (isTop ? 0 : SQUARE_SIZE * (selectionData.length + 1)) +
      SQUARE_SIZE;

    return [
      {
        left: selectionMeta?.coordinates.x ?? 0,
        top,
        width: SQUARE_SIZE,
        height: SQUARE_SIZE * selectionData.length,
      },
      {
        transform: [{ rotate: isTop ? '0deg' : '180deg' }],
      },
    ];
  }, [selectionMeta, selectionData]);

  useImperativeHandle(
    chessPieceSelectionRef,
    () => ({
      showPromotableSelection: setSelectionMeta,
    }),
    [],
  );

  const select = (value: ChessPieceType) => {
    if (!selectionMeta) return;

    promotion(selectionMeta.squareAddress, value);
    switchTurn();
    setSelectionMeta(undefined);
  };

  if (!selectionMeta) return null;

  return (
    <Modal transparent animationType="fade" visible={!!selectionMeta}>
      <View style={tw`flex-1 justify-center items-center bg-slate-500/30`}>
        <View style={tw`w-[${BOARD_SIZE}px] h-[${BOARD_SIZE}px]`}>
          <View
            style={tw.style(
              'absolute bg-white shadow-black shadow-2xl shadow-opacity-80',
              containerStyle,
            )}>
            {selectionData.map(chessPieceType => (
              <TouchableOpacity
                activeOpacity={1}
                key={`${chessPieceType}`}
                style={tw`flex-1 justify-center items-center`}
                onPress={() => select(chessPieceType)}>
                <ChessPieceSymbolText
                  color={selectionMeta.chessPieceColor}
                  type={chessPieceType}
                  style={itemStyle}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
