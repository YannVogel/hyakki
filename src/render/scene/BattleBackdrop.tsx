import { Canvas, Group, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { colors } from '@/ui/tokens';

import { DrawNodeView } from '../yokai/DrawNodeView';
import { group } from '../yokai/nodes';
import { backdrop, SCENE_HEIGHT, SCENE_WIDTH, sceneLayout } from './backdrop';

export interface BattleBackdropProps {
  readonly width: number;
  readonly height: number;
}

/** Sky, sun, clouds, hills, torii and path of the battlefield, behind the fighters. */
export function BattleBackdrop({ width, height }: BattleBackdropProps) {
  const layout = sceneLayout(width, height);
  const drawing = useMemo(() => group(backdrop()), []);
  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <Group
        transform={[
          { translateX: layout.offsetX },
          { translateY: layout.offsetY },
          { scale: layout.scale },
        ]}
      >
        <Rect x={0} y={0} width={SCENE_WIDTH} height={SCENE_HEIGHT}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, SCENE_HEIGHT)}
            colors={[colors.skyDeep, colors.skyLight]}
          />
        </Rect>
        <DrawNodeView node={drawing} motion={null} />
      </Group>
    </Canvas>
  );
}
