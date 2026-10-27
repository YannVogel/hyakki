// Pure drawing description of a yōkai: shapes, paints and groups, in the 200 × 200 frame of the
// prototype. The Skia canvas only translates these nodes; tests compare them with the prototype.

export type Animation = 'float' | 'eye' | 'tongue' | 'flame' | 'spark';

export type Shape =
  | {
      readonly kind: 'rect';
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
      readonly rx?: number;
    }
  | {
      readonly kind: 'ellipse';
      readonly cx: number;
      readonly cy: number;
      readonly rx: number;
      readonly ry: number;
    }
  | { readonly kind: 'circle'; readonly cx: number; readonly cy: number; readonly r: number }
  | { readonly kind: 'path'; readonly d: string };

export interface Paint {
  readonly fill?: string;
  readonly fillOpacity?: number;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly strokeLinecap?: 'round';
  readonly strokeLinejoin?: 'round';
  readonly opacity?: number;
}

export interface ShapeNode {
  readonly shape: Shape;
  readonly paint: Paint;
}

export interface Rotation {
  readonly angle: number;
  readonly cx: number;
  readonly cy: number;
}

export interface GroupNode {
  readonly group: {
    readonly animation?: Animation;
    /** Start offset of the animation, in seconds. */
    readonly delay?: number;
    readonly rotate?: Rotation;
    readonly translateX?: number;
    readonly translateY?: number;
    readonly scale?: number;
    /** Center of the animation's scale or rotation (CSS transform-origin of the prototype). */
    readonly origin?: { readonly x: number; readonly y: number };
  };
  readonly children: readonly DrawNode[];
}

export type DrawNode = ShapeNode | GroupNode;

export const isGroup = (node: DrawNode): node is GroupNode => 'group' in node;

/** One decimal, like the prototype's `r1`: keeps coordinates identical to the reference. */
export const r1 = (value: number): number => Math.round(value * 10) / 10;

export const shape = (value: Shape, paint: Paint = {}): ShapeNode => ({ shape: value, paint });

export const group = (
  children: readonly DrawNode[],
  options: GroupNode['group'] = {},
): GroupNode => ({ group: options, children });
