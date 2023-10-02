import { Platform } from 'react-native';

global.isAndroid = () => Platform.OS === 'android';

global.isIos = () => Platform.OS === 'ios';

global.formatReferenceType = (value, space = 2) =>
  typeof value === 'object' ? JSON.stringify(value, null, space) : value;

global.duration = ({ d = 0, h = 0, m = 0, s = 0, ms = 0 }) => {
  const daysInMs = d * 24 * 60 * 60 * 1000;
  const hoursInMs = h * 60 * 60 * 1000;
  const minutesInMs = m * 60 * 1000;
  const secondsInMs = s * 1000;

  return daysInMs + hoursInMs + minutesInMs + secondsInMs + ms;
};

global.wait = (timeout = 1000) =>
  new Promise(resolve => setTimeout(resolve, timeout));

global.createAscendingOrderArray = (length = 0) =>
  Array.from({ length }, (_, i) => i);

export * from './array';
export * from './number';
export * from './object';
export * from './string';
