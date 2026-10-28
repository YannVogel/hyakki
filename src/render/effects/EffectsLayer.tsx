import {
  Canvas,
  Group,
  Oval,
  Path,
  Rect,
  RoundedRect,
  type SkFont,
  Text,
  useFont,
} from '@shopify/react-native-skia';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { type SharedValue, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';

import { displayFontFile } from '@/ui/fonts';
import { colors } from '@/ui/tokens';

import { useFrameClock } from '../frameClock';
import { SCENE_HEIGHT, SCENE_WIDTH, sceneLayout } from '../scene/layout';
import {
  createPool,
  type EffectKind,
  effectFrame,
  type EffectSlot,
  type MotionLevel,
  spawnInto,
  type SpawnRequest,
  speedLinesPath,
  starPath,
} from './effects';

export interface EffectPool {
  readonly slots: SharedValue<EffectSlot[]>;
  readonly clock: SharedValue<number>;
  /** Starts effects on the UI thread, at its current frame: no React render. */
  readonly spawn: (requests: readonly SpawnRequest[]) => void;
}

/** The pool shared by the layers drawn under and over the fighters. */
export function useEffectPool(): EffectPool {
  const [initial] = useState(createPool);
  const slots = useSharedValue(initial);
  const clock = useFrameClock();
  return useMemo(
    () => ({
      slots,
      clock,
      spawn: (requests: readonly SpawnRequest[]) => {
        if (requests.length === 0) {
          return;
        }
        scheduleOnUI((pending: readonly SpawnRequest[]) => {
          'worklet';
          slots.value = spawnInto(slots.value, pending, clock.value);
        }, requests);
      },
    }),
    [slots, clock],
  );
}

const LAYER_KINDS = {
  under: ['impact'],
  over: ['speedLines', 'ofuda', 'petal', 'damage', 'critLabel', 'flash'],
} as const satisfies Record<string, readonly EffectKind[]>;

export type EffectLayer = keyof typeof LAYER_KINDS;

const TEXT_KINDS: readonly EffectKind[] = ['damage', 'critLabel'];
const DAMAGE_FONT_SIZE = 30;
const LABEL_FONT_SIZE = 18;
const STAR = starPath(12, 80, 58);
const SPEED_LINES = speedLinesPath(28, 95, 260);

interface Fonts {
  readonly damage: SkFont | null;
  readonly label: SkFont | null;
}

interface SlotProps {
  readonly pool: EffectPool;
  readonly index: number;
}

/** Text with a hard outline, centered on (0, 0); its content is the slot's text or `text`. */
function OutlinedEffectText({
  pool,
  index,
  font,
  text,
  fill,
  outline,
  outlineWidth,
  drop,
}: SlotProps & {
  readonly font: SkFont | null;
  readonly text?: string;
  readonly fill: string;
  readonly outline: string;
  readonly outlineWidth: number;
  readonly drop: number;
}) {
  const content = useDerivedValue(() => text ?? pool.slots.value[index].text);
  const x = useDerivedValue(() => (font === null ? 0 : -font.measureText(content.value).width / 2));
  const baseline = font === null ? 0 : font.getSize() * 0.35;
  return (
    <Group>
      {/* Hard drop shadow, then outline, then fill: the mockup's stacked text-shadows. */}
      {drop > 0 ? (
        <Text font={font} text={content} x={x} y={baseline + drop} color={outline} />
      ) : null}
      {(drop > 0 ? [drop, 0] : [0]).map((offset) => (
        <Text
          key={offset}
          font={font}
          text={content}
          x={x}
          y={baseline + offset}
          color={outline}
          style="stroke"
          strokeWidth={outlineWidth}
          strokeJoin="round"
        />
      ))}
      <Text font={font} text={content} x={x} y={baseline} color={fill} />
    </Group>
  );
}

function EffectArt({
  kind,
  pool,
  index,
  fonts,
  critText,
}: SlotProps & { readonly kind: EffectKind; readonly fonts: Fonts; readonly critText: string }) {
  switch (kind) {
    case 'impact':
      return (
        <Group>
          <Path path={STAR} color={colors.sun} />
          <Path path={STAR} color={colors.ink} style="stroke" strokeWidth={3} strokeJoin="round" />
        </Group>
      );
    case 'ofuda':
      return (
        <Group>
          <RoundedRect x={-7} y={-12} width={14} height={24} r={2} color={colors.paper} />
          <RoundedRect
            x={-7}
            y={-12}
            width={14}
            height={24}
            r={2}
            color={colors.ink}
            style="stroke"
            strokeWidth={2}
          />
          <Path
            path="M0 -7 L0 7"
            color={colors.red}
            style="stroke"
            strokeWidth={2.5}
            strokeCap="round"
          />
        </Group>
      );
    case 'petal':
      return (
        <Group>
          <Oval x={-5} y={-3.5} width={10} height={7} color={colors.sakura} />
          <Oval
            x={-5}
            y={-3.5}
            width={10}
            height={7}
            color={colors.ink}
            style="stroke"
            strokeWidth={1.5}
          />
        </Group>
      );
    case 'speedLines':
      return (
        <Path
          path={SPEED_LINES}
          color={colors.ink}
          style="stroke"
          strokeWidth={3}
          strokeCap="round"
        />
      );
    case 'flash':
      return <Rect x={0} y={0} width={SCENE_WIDTH} height={SCENE_HEIGHT} color={colors.paper} />;
    case 'damage':
      return (
        <OutlinedEffectText
          pool={pool}
          index={index}
          font={fonts.damage}
          fill={colors.sun}
          outline={colors.ink}
          outlineWidth={7}
          drop={5}
        />
      );
    case 'critLabel':
      return (
        <OutlinedEffectText
          pool={pool}
          index={index}
          font={fonts.label}
          text={critText}
          fill={colors.red}
          outline={colors.paper}
          outlineWidth={4}
          drop={0}
        />
      );
  }
}

function EffectView({
  kind,
  pool,
  index,
  motion,
  fonts,
  critText,
}: SlotProps & {
  readonly kind: EffectKind;
  readonly motion: MotionLevel;
  readonly fonts: Fonts;
  readonly critText: string;
}) {
  const frame = useDerivedValue(() =>
    effectFrame(pool.slots.value[index], pool.clock.value, motion),
  );
  const transform = useDerivedValue(() => [
    { translateX: frame.value.x },
    { translateY: frame.value.y },
    { rotate: frame.value.rotation },
    { scale: frame.value.scale },
  ]);
  const opacity = useDerivedValue(() => frame.value.opacity);
  // Outlined text fades as a whole: drawn in a layer, its outline never shows through the fill.
  return (
    <Group transform={transform} opacity={opacity} layer={TEXT_KINDS.includes(kind)}>
      <EffectArt kind={kind} pool={pool} index={index} fonts={fonts} critText={critText} />
    </Group>
  );
}

export interface EffectsLayerProps {
  readonly pool: EffectPool;
  readonly layer: EffectLayer;
  readonly width: number;
  readonly height: number;
  readonly motion: MotionLevel;
  /** The critical hit label, from the interface texts. */
  readonly critText: string;
}

/** One canvas of combat effects over the battle scene; every slot is mounted once. */
export function EffectsLayer({ pool, layer, width, height, motion, critText }: EffectsLayerProps) {
  const fonts = {
    damage: useFont(displayFontFile, DAMAGE_FONT_SIZE),
    label: useFont(displayFontFile, LABEL_FONT_SIZE),
  };
  const slots = useMemo(() => {
    const kinds: readonly EffectKind[] = LAYER_KINDS[layer];
    return createPool()
      .map((slot, index) => ({ kind: slot.kind, index }))
      .filter((slot) => kinds.includes(slot.kind));
  }, [layer]);
  const layout = sceneLayout(width, height);
  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <Group
        transform={[
          { translateX: layout.offsetX },
          { translateY: layout.offsetY },
          { scale: layout.scale },
        ]}
      >
        {slots.map(({ kind, index }) => (
          <EffectView
            key={index}
            kind={kind}
            pool={pool}
            index={index}
            motion={motion}
            fonts={fonts}
            critText={critText}
          />
        ))}
      </Group>
    </Canvas>
  );
}
