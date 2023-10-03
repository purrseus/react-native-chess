import {
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { runOnJS, withSpring, withTiming } from 'react-native-reanimated';
import { INITIAL_OFFSET, SQUARE_SIZE } from '../core/constants';
import { Turn } from '../core/enums';
import { ChessPieceProps, SquareData } from '../core/interfaces';
import { Offset, SquareAddress, SquareAddressString } from '../core/types';
import useChessStore from '../store';
import utils from '../utils';
import ChessPieceUI from './ChessPieceUI';
import DraggableComponent from './DraggableComponent';

export default abstract class ChessPiece extends DraggableComponent<ChessPieceProps> {
  protected abstract possibleMoves: SquareAddressString[];

  protected abstract calculateMoves(): void;

  componentDidUpdate({
    rowIdx: prevRowIdx,
    colIdx: preColIdx,
  }: Readonly<ChessPieceProps>): void {
    const { rowIdx, colIdx } = this.props;
    const prevSquareAddress = utils.stringifySquareId([prevRowIdx, preColIdx]);
    const currentSquareAddress = utils.stringifySquareId([rowIdx, colIdx]);

    if (prevSquareAddress !== currentSquareAddress) this.resetValue();
  }

  //#region  gestures
  protected onStartMoving(
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
  ): void {
    this.calculateMoves();
    this.suggestSquares(this.possibleMoves);
    this.sharedValues.isPressed.value = true;
  }

  protected onMoving(
    event: GestureUpdateEvent<PanGestureHandlerEventPayload>,
  ): void {
    this.sharedValues.offset.value = {
      x: event.translationX,
      y: event.translationY,
    };
  }

  protected onEndMoving(
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    success: boolean,
  ): void {
    const { coordinates } = this.props;
    const { chessBoard, metadata } = useChessStore.getState();
    const { chessBoardCoordinates } = metadata || {};

    const currentCenterTranslation: Offset = {
      x: coordinates.centerX + event.translationX,
      y: coordinates.centerY + event.translationY,
    };

    const inChessBoard = utils.isInCoordinateRange(
      chessBoardCoordinates!.start,
      currentCenterTranslation,
      chessBoardCoordinates!.end,
    );

    if (!inChessBoard) {
      this.goBack();
      return;
    }

    // TODO tinh toan dua theo translation, ko dua vao loop
    for (let rowIdx = 0; rowIdx < chessBoard.length; rowIdx++) {
      for (let colIdx = 0; colIdx < chessBoard[rowIdx].length; colIdx++) {
        const square = chessBoard[rowIdx][colIdx];

        if (!square.coordinates) {
          this.goBack();
          return;
        }

        const startSquare: Offset = {
          x: square.coordinates.x,
          y: square.coordinates.y,
        };

        const endSquare: Offset = {
          x: square.coordinates.x + SQUARE_SIZE,
          y: square.coordinates.y + SQUARE_SIZE,
        };

        const inTargetSquare = utils.isInCoordinateRange(
          startSquare,
          currentCenterTranslation,
          endSquare,
        );

        if (!inTargetSquare) continue;

        this.moveTo(square);
        return;
      }
    }

    this.goBack();
  }

  protected onMoved(
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    success: boolean,
  ): void {
    this.possibleMoves = [];
    this.removeSquareSuggestions();
    this.sharedValues.isPressed.value = false;
  }

  protected gestureDecorator(method: (...args: any[]) => void): typeof method {
    return (...args) => {
      const { id: chessPieceId, color: chessPieceColor } = this.props.data;
      const { metadata } = useChessStore.getState();
      const { currentTurn, ourChessPieceColor, enemyChessPieceColor } =
        metadata || {};

      const param = {
        [this.onStartMoving.name]: chessPieceId,
        [this.onMoved.name]: null,
      };

      if (Object.keys(param).includes(method.name))
        this.setDraggingComponentId(param[method.name]);

      const currentTurnColor =
        currentTurn === Turn.Our ? ourChessPieceColor : enemyChessPieceColor;

      const isThisTurn = chessPieceColor === currentTurnColor;

      const isThisDragging =
        method.name === this.onMoved.name || this.isThisDragging(chessPieceId);

      const isDraggable = isThisTurn && isThisDragging;

      if (!isDraggable) return;

      return method.apply(this, args);
    };
  }
  //#endregion

  //#region navigation
  protected goBack(): void {
    this.sharedValues.offset.value = withSpring(INITIAL_OFFSET, {
      damping: 14,
    });
  }

  protected moveTo(targetSquare: SquareData): void {
    const { rowIdx, colIdx, coordinates } = this.props;
    const { moveChessPiece, switchTurn } = useChessStore.getState();

    const canMove = this.possibleMoves.includes(targetSquare.id);

    if (!canMove) {
      this.goBack();
      return;
    }

    this.sharedValues.offset.value = withTiming(
      {
        x: targetSquare.coordinates!.x - coordinates.x,
        y: targetSquare.coordinates!.y - coordinates.y,
      },
      undefined,
      finished => {
        if (!finished) return;
        const targetSquareAddress = utils.parseSquareId(targetSquare.id);
        runOnJS(moveChessPiece)([rowIdx, colIdx], targetSquareAddress);
        runOnJS(switchTurn)();
      },
    );
  }
  //#endregion

  //#region interaction
  protected suggestSquares(moves: SquareAddressString[]): void {
    useChessStore.getState().suggestSquares(moves);
  }

  protected removeSquareSuggestions(): void {
    useChessStore.getState().removeSquareSuggestions();
  }
  //#endregion

  //#region validation
  protected validateSteps<K extends string, V extends SquareAddress>({
    stepDirections,
    blockedDirections,
    customValidator,
  }: {
    stepDirections: Record<K, V>;
    blockedDirections?: Record<K, boolean>;
    customValidator?: (param: {
      direction: K;
      squareAddress: V;
      blockedDirections: typeof blockedDirections;
    }) => boolean;
  }): void {
    const chessBoard = useChessStore.getState().chessBoard;

    const stepDirectionArray = Object.entries(stepDirections) as [K, V][];

    for (const [direction, squareAddress] of stepDirectionArray) {
      if (squareAddress.isEmpty) continue;

      const isInChessBoard = squareAddress.every(utils.isIdxInBoard);
      if (!isInChessBoard) continue;

      const isInvalid = customValidator?.({
        direction,
        squareAddress,
        blockedDirections:
          blockedDirections || ({} as unknown as typeof blockedDirections),
      });

      if (isInvalid) continue;

      const chessPiece =
        chessBoard[squareAddress.first][squareAddress.last].chessPiece;
      const sameChessPieceColor = this.props.data.color === chessPiece?.color;
      if (sameChessPieceColor) continue;

      const possibleMove = squareAddress.join('-') as SquareAddressString;
      this.possibleMoves.push(possibleMove);
    }
  }

  protected checkBlockDirection({
    direction,
    squareAddress,
    blockedDirections,
  }: {
    direction: string;
    squareAddress: SquareAddress;
    blockedDirections?: Record<string, boolean>;
  }): boolean {
    blockedDirections![direction] ??= false;
    const isThisDirectionBlocked = !!blockedDirections![direction];
    if (isThisDirectionBlocked) return true;

    const isAllDirectionsBlocked = Object.values(blockedDirections!).every(
      Boolean,
    );
    if (isAllDirectionsBlocked) return true;

    const chessPiece =
      useChessStore.getState().chessBoard[squareAddress.first][
        squareAddress.last
      ].chessPiece;

    blockedDirections![direction] = !!chessPiece;
    return false;
  }
  //#endregion

  protected resetValue(): void {
    this.sharedValues.offset.value = INITIAL_OFFSET;
    this.possibleMoves = [];
  }

  render(): React.ReactNode {
    if (!this.panGesture) return null;

    return (
      <ChessPieceUI
        {...this.props}
        sharedValues={this.sharedValues}
        panGesture={this.panGesture}
      />
    );
  }
}
