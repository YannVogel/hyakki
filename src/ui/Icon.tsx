import { Canvas, Group, Path } from '@shopify/react-native-skia';

/** A part of an icon in a 24 × 24 frame: an SVG path, filled and/or stroked. */
export interface IconPart {
  readonly d: string;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
}

export interface IconProps {
  readonly parts: readonly IconPart[];
  readonly size?: number;
}

const FRAME = 24;

/** Decorative icon (hidden from screen readers: the surrounding control carries the label). */
export function Icon({ parts, size = 22 }: IconProps) {
  return (
    <Canvas
      style={{ width: size, height: size }}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <Group transform={[{ scale: size / FRAME }]}>
        {parts.flatMap((part, index) => [
          part.fill === undefined ? null : (
            <Path key={`f${index}`} path={part.d} color={part.fill} />
          ),
          part.stroke === undefined ? null : (
            <Path
              key={`s${index}`}
              path={part.d}
              color={part.stroke}
              style="stroke"
              strokeWidth={part.strokeWidth ?? 2.2}
              strokeCap="round"
              strokeJoin="round"
            />
          ),
        ])}
      </Group>
    </Canvas>
  );
}
