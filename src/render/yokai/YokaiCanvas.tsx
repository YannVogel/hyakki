import { Canvas, ColorMatrix, Group, Paint, type Transforms3d } from '@shopify/react-native-skia';
import { memo, useMemo } from 'react';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import type { YokaiSpec } from '@/engine';
import { useReduceMotion } from '@/ui/motion';

import { flashMatrix } from '../effects/hitReaction';
import { useFrameClock } from '../frameClock';
import { DrawNodeView, type Motion } from './DrawNodeView';
import { drawYokai, YOKAI_FRAME } from './drawYokai';
import { blinkScale, flameScale, floatOffset, sparkle, tongueAngle } from './motion';

function useMotion(delaySeconds: number, running: boolean): Motion {
  const clock = useFrameClock(running);
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
  /** White flash over the drawing, from 0 to 1 (the enemy is hit). */
  readonly flash?: SharedValue<number>;
  readonly testID?: string;
}

/** A generated yōkai drawn with Skia, with its idle animations (off when motion is reduced). */
export function YokaiCanvas({ spec, size, accessibilityLabel, flash, testID }: YokaiCanvasProps) {
  const drawing = useMemo(() => drawYokai(spec), [spec]);
  const reduceMotion = useReduceMotion();
  const motion = useMotion(spec.animationDelay, !reduceMotion);
  const whiten = useDerivedValue(() => flashMatrix(flash?.value ?? 0));
  return (
    <Canvas
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Group
        transform={[{ scale: size / YOKAI_FRAME }]}
        layer={
          flash === undefined ? undefined : (
            <Paint>
              <ColorMatrix matrix={whiten} />
            </Paint>
          )
        }
      >
        <DrawNodeView node={drawing} motion={reduceMotion ? null : motion} />
      </Group>
    </Canvas>
  );
}

export interface YokaiThumbnailProps {
  readonly spec: YokaiSpec;
  readonly size: number;
}

/**
 * Still drawing of a yōkai for long lists: no animation clock, and memoized so that a list
 * re-render never redraws thumbnails whose seed did not change.
 */
export const YokaiThumbnail = memo(
  function YokaiThumbnail({ spec, size }: YokaiThumbnailProps) {
    const drawing = useMemo(() => drawYokai(spec), [spec]);
    return (
      <Canvas style={{ width: size, height: size }} accessible={false} pointerEvents="none">
        <Group transform={[{ scale: size / YOKAI_FRAME }]}>
          <DrawNodeView node={drawing} motion={null} />
        </Group>
      </Canvas>
    );
  },
  (previous, next) => previous.spec.seed === next.spec.seed && previous.size === next.size,
);
