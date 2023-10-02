import { Component } from 'react';
import {
  Gesture,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGesture,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { SharedValue } from 'react-native-reanimated';
import { Offset } from '../core/types';

export interface SharedValues {
  isPressed: SharedValue<boolean>;
  offset: SharedValue<Offset>;
}

let draggingComponentId: string | null = null;

export default abstract class DraggableComponent<P = {}> extends Component<P> {
  protected readonly sharedValues = {} as SharedValues;
  protected panGesture: PanGesture | undefined;

  constructor(props: P) {
    super(props);

    this.panGesture = Gesture.Pan()
      .maxPointers(1)
      .onBegin(this.gestureDecorator(this.onStartMoving))
      .onUpdate(this.gestureDecorator(this.onMoving))
      .onEnd(this.gestureDecorator(this.onEndMoving))
      .onFinalize(this.gestureDecorator(this.onMoved))
      .enableTrackpadTwoFingerGesture(false);
  }

  protected abstract gestureDecorator(
    method: (...args: any[]) => void,
  ): typeof method;

  protected setDraggingComponentId(id: typeof draggingComponentId): void {
    if (draggingComponentId && id) return;
    draggingComponentId = id;
  }

  protected isThisDragging(id: typeof draggingComponentId): boolean {
    return draggingComponentId === id;
  }

  protected abstract onStartMoving(
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
  ): void;

  protected abstract onMoving(
    event: GestureUpdateEvent<PanGestureHandlerEventPayload>,
  ): void;

  protected abstract onEndMoving(
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    success: boolean,
  ): void;

  protected abstract onMoved(
    event: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    success: boolean,
  ): void;
}
