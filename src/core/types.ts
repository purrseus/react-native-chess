import { Coordinates } from './interfaces';

export type Offset = Pick<Coordinates, 'x' | 'y'>;

export type SquareAddress = [number, number];

export type SquareAddressString = `${number}-${number}`;

export type CardinalDirection = 'top' | 'left' | 'right' | 'bottom';

export type CornerDirection = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
