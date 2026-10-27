import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { HERO_POSES, type HeroPose, heroPoseSize } from '../shared/images';

/** A new pose lands with a short squash, well under the 150 ms of a noticeable transition. */
export const POSE_TRANSITION_MS = 120;
/** Breathing bob of the mockup (`hk-bob`): 3 units up and back in 1.6 s. */
const BOB_PERIOD_MS = 1600;
const BOB_RATIO = 3 / 194;
const SQUASH_X = 0.06;
const SQUASH_Y = 0.08;

export interface HeroFigureProps {
  readonly pose: HeroPose;
  /** Height of the idle pose: every pose is drawn at the same scale. */
  readonly idleHeight: number;
  readonly left: number;
  /** Where the feet stand. */
  readonly bottom: number;
  readonly reduceMotion: boolean;
  readonly accessibilityLabel: string;
}

/** The hero's illustration, standing on its feet whatever the pose, gently breathing. */
export function HeroFigure({
  pose,
  idleHeight,
  left,
  bottom,
  reduceMotion,
  accessibilityLabel,
}: HeroFigureProps) {
  const size = heroPoseSize(pose, idleHeight);
  const squash = useSharedValue(1);
  const bob = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    squash.value = 0;
    squash.value = withTiming(1, { duration: POSE_TRANSITION_MS, easing: Easing.out(Easing.quad) });
  }, [pose, reduceMotion, squash]);

  useEffect(() => {
    if (reduceMotion) {
      bob.value = 0;
      return;
    }
    bob.value = withRepeat(
      withTiming(1, { duration: BOB_PERIOD_MS / 2, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(bob);
  }, [reduceMotion, bob]);

  const motion = useAnimatedStyle(() => ({
    transform: [
      { translateY: -BOB_RATIO * idleHeight * bob.value },
      { scaleX: 1 + SQUASH_X * (1 - squash.value) },
      { scaleY: 1 - SQUASH_Y * (1 - squash.value) },
    ],
  }));

  return (
    <Animated.Image
      source={HERO_POSES[pose].source}
      accessibilityLabel={accessibilityLabel}
      testID="hero"
      style={[styles.hero, { left, top: bottom - size.height, ...size }, motion]}
    />
  );
}

const styles = StyleSheet.create({
  // Squash from the feet, not from the middle.
  hero: { position: 'absolute', transformOrigin: 'bottom' },
});
