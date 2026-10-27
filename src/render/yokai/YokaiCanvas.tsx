import {
  Canvas,
  Circle,
  Group,
  Oval,
  Path,
  Rect,
  RoundedRect,
  type Transforms3d,
} from '@shopify/react-native-skia';
import { useMemo } from 'react';
import {
  type DerivedValue,
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import type { YokaiSpec } from '@/engine';

import { drawYokai, YOKAI_FRAME } from './drawYokai';
import { blinkScale, flameScale, floatOffset, sparkle, tongueAngle } from './motion';
import { type Animation, type DrawNode, isGroup, type ShapeNode } from './nodes';

type Motion = Readonly<Record<Animation, DerivedValue<Transforms3d>>> & {
  readonly sparkOpacity: DerivedValue<number>;
};

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

function ShapeView({ node }: { node: ShapeNode }) {
  const { shape, paint } = node;
  const alpha = paint.opacity ?? 1;
  const passes = [
    paint.fill !== undefined && paint.fill !== 'none'
      ? { style: 'fill' as const, color: paint.fill, opacity: alpha * (paint.fillOpacity ?? 1) }
      : null,
    paint.stroke !== undefined
      ? {
          style: 'stroke' as const,
          color: paint.stroke,
          opacity: alpha,
          strokeWidth: paint.strokeWidth ?? 1,
          strokeCap: paint.strokeLinecap ?? ('butt' as const),
          strokeJoin: paint.strokeLinejoin ?? ('miter' as const),
        }
      : null,
  ].filter((pass) => pass !== null);

  return passes.map((pass) => {
    switch (shape.kind) {
      case 'path':
        return <Path key={pass.style} path={shape.d} {...pass} />;
      case 'circle':
        return <Circle key={pass.style} cx={shape.cx} cy={shape.cy} r={shape.r} {...pass} />;
      case 'ellipse':
        return (
          <Oval
            key={pass.style}
            x={shape.cx - shape.rx}
            y={shape.cy - shape.ry}
            width={shape.rx * 2}
            height={shape.ry * 2}
            {...pass}
          />
        );
      case 'rect':
        return shape.rx === undefined ? (
          <Rect
            key={pass.style}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            {...pass}
          />
        ) : (
          <RoundedRect
            key={pass.style}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            r={shape.rx}
            {...pass}
          />
        );
    }
  });
}

function NodeView({ node, motion }: { node: DrawNode; motion: Motion | null }) {
  if (!isGroup(node)) {
    return <ShapeView node={node} />;
  }
  const { animation, rotate, translateY, origin } = node.group;
  const children = node.children.map((child, index) => (
    <NodeView key={index} node={child} motion={motion} />
  ));
  if (rotate !== undefined) {
    return (
      <Group
        transform={[{ rotate: (rotate.angle * Math.PI) / 180 }]}
        origin={{ x: rotate.cx, y: rotate.cy }}
      >
        {children}
      </Group>
    );
  }
  if (translateY !== undefined) {
    return <Group transform={[{ translateY }]}>{children}</Group>;
  }
  if (animation !== undefined && motion !== null) {
    return (
      <Group
        transform={motion[animation]}
        origin={origin}
        opacity={animation === 'spark' ? motion.sparkOpacity : undefined}
      >
        {children}
      </Group>
    );
  }
  return <Group>{children}</Group>;
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
        <NodeView node={drawing} motion={reduceMotion ? null : motion} />
      </Group>
    </Canvas>
  );
}
