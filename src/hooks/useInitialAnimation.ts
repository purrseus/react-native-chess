import { useEffect, useState } from 'react';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

export default function useInitialAnimation() {
  const initial = useSharedValue(0);
  const [animationEnd, setAnimationEnd] = useState(false);

  const initialStyle = useAnimatedStyle(() => {
    return {
      opacity: initial.value,
    };
  });

  useEffect(() => {
    initial.value = withTiming(1, undefined, (finished) => {
      if (finished) runOnJS(setAnimationEnd)(true);
    });
  }, []);

  return { initialStyle, animationEnd };
}
