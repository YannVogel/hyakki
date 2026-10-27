import {
  Circle,
  Group,
  Oval,
  Path,
  Rect,
  RoundedRect,
  type Transforms3d,
} from '@shopify/react-native-skia';
import type { DerivedValue } from 'react-native-reanimated';

import { type Animation, type DrawNode, isGroup, type ShapeNode } from './nodes';

/** Animated transforms by animation kind; null draws the still pose. */
export type Motion = Readonly<Record<Animation, DerivedValue<Transforms3d>>> & {
  readonly sparkOpacity: DerivedValue<number>;
};

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

export /** Draws a tree of drawing nodes with Skia (fill, then stroke, like SVG). */
function DrawNodeView({ node, motion }: { node: DrawNode; motion: Motion | null }) {
  if (!isGroup(node)) {
    return <ShapeView node={node} />;
  }
  const { animation, rotate, translateX, translateY, scale, origin } = node.group;
  const children = node.children.map((child, index) => (
    <DrawNodeView key={index} node={child} motion={motion} />
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
  if (translateX !== undefined || translateY !== undefined || scale !== undefined) {
    return (
      <Group
        transform={[
          { translateX: translateX ?? 0 },
          { translateY: translateY ?? 0 },
          { scale: scale ?? 1 },
        ]}
      >
        {children}
      </Group>
    );
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
