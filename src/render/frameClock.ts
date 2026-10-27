import { type SharedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';

/**
 * Time of the UI thread's frames, in ms. `timeSinceFirstFrame` would restart each time the caller
 * re-renders (the frame callback is registered again): the frame timestamp keeps counting.
 */
export function useFrameClock(running = true): SharedValue<number> {
  const clock = useSharedValue(0);
  useFrameCallback((frame) => {
    clock.value = frame.timestamp;
  }, running);
  return clock;
}
