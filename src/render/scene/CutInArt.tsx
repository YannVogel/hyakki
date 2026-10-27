import { Canvas, Group, Path } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import { colors } from '@/ui/tokens';

import { DrawNodeView } from '../yokai/DrawNodeView';
import { group } from '../yokai/nodes';
import { EYES_HEIGHT, EYES_WIDTH, GUARDIAN_EYES, rayWedges } from './cutIn';

const RAYS = 36;

export interface CutInRaysProps {
  readonly size: number;
  /** Rotation in radians, driven by the caller (still when motion is reduced). */
  readonly rotation: SharedValue<number>;
}

/** Red and orange rays turning behind the guardian. */
export function CutInRays({ size, rotation }: CutInRaysProps) {
  const wedges = useMemo(() => rayWedges(RAYS, size), [size]);
  const transform = useDerivedValue(() => [
    { translateX: size / 2 },
    { translateY: size / 2 },
    { rotate: rotation.value },
  ]);
  return (
    <Canvas style={[StyleSheet.absoluteFill, { backgroundColor: colors.red }]} pointerEvents="none">
      <Group transform={transform}>
        {wedges.map((d) => (
          <Path key={d} path={d} color={colors.orange} />
        ))}
      </Group>
    </Canvas>
  );
}

/** The guardian's eyes in close-up, in a band of the given width. */
export function GuardianEyes({ width }: { width: number }) {
  const drawing = useMemo(() => group(GUARDIAN_EYES), []);
  const height = (width / EYES_WIDTH) * EYES_HEIGHT;
  return (
    <Canvas style={{ width, height }} pointerEvents="none">
      <Group transform={[{ scale: width / EYES_WIDTH }]}>
        <DrawNodeView node={drawing} motion={null} />
      </Group>
    </Canvas>
  );
}
