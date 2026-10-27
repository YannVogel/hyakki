import { Canvas, Group, type Transforms3d } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import {
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import type { YokaiSpec } from '@/engine';

import { DrawNodeView, type Motion } from './DrawNodeView';
import { drawYokai, YOKAI_FRAME } from './drawYokai';
import { blinkScale, flameScale, floatOffset, sparkle, tongueAngle } from './motion';

function useMotion(delaySeconds: number, running: boolean): Motion {
  const clock = useSharedValue(0);
  useFrameCallback((frame) => {
    clock.value = frame.timeSinceFirstFrame;
  }, running);
  return {
    float: useDerivedValue<Transforms3d>(() => [
      { translateY: floatOffset(clock.value, delaySeconds) },
    ]),
    eye: useDerivedValue<Transforms3d>(() => [{ scaleY: blinkScale(clock.value) }]),
    tongue: useDerivedValue<Transforms3d>(() => [{ rotate: tongueAngle(clock.value) }]),
    flame: useDerivedValue<Transforms3d>(() => {
      const scale = flameScale(clock.value);
      return [{ scaleX: scale.x }, { scaleY: scale.y }];
    }),
    spark: useDerivedValue<Transforms3d>(() => [{ scale: sparkle(clock.value).scale }]),
    sparkOpacity: useDerivedValue(() => sparkle(clock.value).opacity),
  };
}

export interface YokaiCanvasProps {
  readonly spec: YokaiSpec;
  /** Side of the square canvas, in points. */
  readonly size: number;
  /** Spoken description of the yōkai (name and look). */
  readonly accessibilityLabel: string;
  readonly testID?: string;
}

/** A generated yōkai drawn with Skia, with its idle animations (off when motion is reduced). */
export function YokaiCanvas({ spec, size, accessibilityLabel, testID }: YokaiCanvasProps) {
  const drawing = useMemo(() => drawYokai(spec), [spec]);
  const reduceMotion = useReducedMotion();
  const motion = useMotion(spec.animationDelay, !reduceMotion);
  return (
    <Canvas
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Group transform={[{ scale: size / YOKAI_FRAME }]}>
        <DrawNodeView node={drawing} motion={reduceMotion ? null : motion} />
      </Group>
    </Canvas>
  );
}
