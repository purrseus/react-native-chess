import { Dimensions } from "react-native";

export const NUMBER_OF_SQUARES = 64;
export const GRID_SIZE = Math.sqrt(NUMBER_OF_SQUARES);

const { width, height } = Dimensions.get('screen');
const windowWidth = height > width ? width : height;
export const BOARD_SIZE = windowWidth - 2;
export const SQUARE_SIZE = BOARD_SIZE / GRID_SIZE;

export const INITIAL_OFFSET = { x: 0, y: 0 };
