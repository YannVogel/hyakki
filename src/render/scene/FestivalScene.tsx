import { Canvas, Group, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { useMemo } from 'react';

import { colors } from '@/ui/tokens';

import { DrawNodeView } from '../yokai/DrawNodeView';
import { group } from '../yokai/nodes';
import { FESTIVAL_HEIGHT, FESTIVAL_WIDTH, festivalScene } from './festival';

/** Festival sky with fireworks and lanterns, at the given width. */
export function FestivalScene({
  width,
  accessibilityLabel,
}: {
  width: number;
  accessibilityLabel: string;
}) {
  const drawing = useMemo(() => group(festivalScene()), []);
  const scale = width / FESTIVAL_WIDTH;
  return (
    <Canvas
      style={{ width, height: FESTIVAL_HEIGHT * scale }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <Group transform={[{ scale }]}>
        <Rect x={0} y={0} width={FESTIVAL_WIDTH} height={FESTIVAL_HEIGHT}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, FESTIVAL_HEIGHT)}
            colors={[colors.purple, colors.sky]}
          />
        </Rect>
        <DrawNodeView node={drawing} motion={null} />
      </Group>
    </Canvas>
  );
}
