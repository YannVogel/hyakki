import { useState } from 'react';
import { Image, type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { strings } from '@/i18n';
import {
  type EffectLayer,
  type EffectPool,
  EffectsLayer,
  type EffectStage,
  type MotionLevel,
  sceneLayout,
  toBox,
  YokaiCanvas,
} from '@/render';
import type { EnemyView } from '@/state';
import { bodyText, colors, hardShadow, outline, radii, spacing, strokes } from '@/ui';

import { GUARDIAN_IMAGES, type HeroPose } from '../shared/images';
import { BattleBackdrop } from './BattleBackdrop';
import { EnemyHud } from './EnemyHud';
import { HeroFigure } from './HeroFigure';
import type { HitReactionValues } from './useHitReaction';

export interface LastHit {
  readonly damage: string;
  readonly crit: boolean;
}

export interface BattleSceneProps {
  readonly enemy: EnemyView;
  /** Guardian of the current hundred, whose backdrop waits for it. */
  readonly upcomingGuardian: number;
  readonly enemyName: string;
  /** Wave shown on the enemy's card, in its awakening level. */
  readonly wave: number;
  readonly lastHit: LastHit | null;
  readonly heroPose: HeroPose;
  readonly effects: EffectPool;
  /** The enemy flinches at the hits (useHitReaction). */
  readonly reaction: HitReactionValues;
  readonly motion: MotionLevel;
  readonly onTap: () => void;
}

// Positions in the 366 × 400 frame of the mockup scene.
const HERO = { x: 0, y: 108, height: 194 };
const ENEMY = { x: 270, y: 222, size: 160 };
const GUARDIAN = { x: 270, y: 216, size: 190 };
/** Where the damage numbers burst, announced to screen readers as the last hit. */
const HIT_AREA = { x: 132, y: 82, width: 160, height: 90 };
const HERO_HAND = { x: 100, y: 165 };

/** Where the ofuda flies from and to, for the combat effects. */
export const effectStage = (guardian: boolean): EffectStage => ({
  hand: HERO_HAND,
  target: guardian ? { x: GUARDIAN.x, y: GUARDIAN.y } : { x: ENEMY.x, y: ENEMY.y },
});

/** The battlefield: backdrop, hero, enemy and its HUD; a tap anywhere strikes. */
export function BattleScene({
  enemy,
  upcomingGuardian,
  enemyName,
  wave,
  lastHit,
  heroPose,
  effects,
  reaction,
  motion,
  onTap,
}: BattleSceneProps) {
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  // Detected on the UI thread, then queued as an engine input on the JS thread.
  const tap = useTapGesture({
    maxDuration: 1000,
    onActivate: () => {
      'worklet';
      scheduleOnRN(onTap);
    },
  });
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBox({ width, height });
  };
  const layout = box === null ? null : sceneLayout(box.width, box.height);
  const scale = layout?.scale ?? 1;
  const flinch = useAnimatedStyle(() => ({
    opacity: 1 - reaction.dim.value,
    transform: [
      { translateX: reaction.recoil.value * scale },
      { scaleX: 1 + reaction.squash.value },
      { scaleY: 1 - reaction.squash.value },
    ],
  }));
  const guardianFlash = useAnimatedStyle(() => ({ opacity: reaction.flash.value }));
  const place = (x: number, y: number, size: number) => {
    if (layout === null) return null;
    const center = toBox(layout, x, y);
    const side = size * layout.scale;
    return { left: center.x - side / 2, top: center.y - side / 2, side };
  };
  const enemyBox =
    enemy.kind === 'guardian'
      ? place(GUARDIAN.x, GUARDIAN.y, GUARDIAN.size)
      : place(ENEMY.x, ENEMY.y, ENEMY.size);
  const heroTop = layout === null ? { x: 0, y: 0 } : toBox(layout, HERO.x, HERO.y);
  const heroHeight = layout === null ? 0 : HERO.height * layout.scale;
  const hitAt = layout === null ? null : toBox(layout, HIT_AREA.x, HIT_AREA.y);
  const effectLayer = (layer: EffectLayer) =>
    box === null ? null : (
      <EffectsLayer
        pool={effects}
        layer={layer}
        width={box.width}
        height={box.height}
        motion={motion}
        critText={strings.combat.crit}
      />
    );

  return (
    <GestureDetector gesture={tap}>
      <View style={styles.scene} onLayout={onLayout} testID="battle-scene">
        {layout === null ? null : (
          <BattleBackdrop layout={layout} enemy={enemy} upcomingGuardian={upcomingGuardian} />
        )}
        {effectLayer('under')}
        {/* Screen readers strike through this button; touches go to the gesture above. */}
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          accessible
          accessibilityRole="button"
          accessibilityLabel={strings.combat.tapLabel}
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={onTap}
          testID="battle-strike"
        />
        {layout === null ? null : (
          <HeroFigure
            pose={heroPose}
            idleHeight={heroHeight}
            left={heroTop.x}
            bottom={heroTop.y + heroHeight}
            reduceMotion={motion === 'reduced'}
            accessibilityLabel={strings.combat.heroLabel}
          />
        )}
        {enemyBox === null ? null : (
          <Animated.View
            style={[
              styles.enemy,
              {
                left: enemyBox.left,
                top: enemyBox.top,
                width: enemyBox.side,
                height: enemyBox.side,
              },
              flinch,
            ]}
            testID="enemy-reaction"
          >
            {enemy.kind === 'yokai' ? (
              <YokaiCanvas
                spec={enemy.spec}
                size={enemyBox.side}
                accessibilityLabel={enemyName}
                flash={reaction.flash}
                testID="enemy-yokai"
              />
            ) : (
              <>
                <Image
                  source={GUARDIAN_IMAGES[enemy.index]}
                  accessibilityLabel={enemyName}
                  resizeMode="contain"
                  testID="enemy-guardian"
                  style={{ width: enemyBox.side, height: enemyBox.side }}
                />
                {/* The flash: the same picture, tinted white over its whole silhouette. */}
                <Animated.Image
                  source={GUARDIAN_IMAGES[enemy.index]}
                  resizeMode="contain"
                  tintColor={colors.paper}
                  accessible={false}
                  style={[
                    styles.flash,
                    { width: enemyBox.side, height: enemyBox.side },
                    guardianFlash,
                  ]}
                />
              </>
            )}
          </Animated.View>
        )}
        {effectLayer('over')}
        <EnemyHud
          name={enemyName}
          wave={wave}
          hpRatio={enemy.hpRatio}
          secondsLeft={
            enemy.kind === 'guardian' && enemy.engaged
              ? Math.ceil(enemy.timeLeftMs / 1000)
              : undefined
          }
          timeRatio={enemy.kind === 'guardian' ? enemy.timeRatio : undefined}
        />
        {/* The damage numbers are drawn by Skia: screen readers read the last hit here. */}
        {lastHit === null || hitAt === null || layout === null ? null : (
          <View
            style={[
              styles.absolute,
              {
                left: hitAt.x,
                top: hitAt.y,
                width: HIT_AREA.width * layout.scale,
                height: HIT_AREA.height * layout.scale,
              },
            ]}
            pointerEvents="none"
            accessible
            accessibilityLabel={strings.combat.lastHit(lastHit.damage, lastHit.crit)}
            testID="last-hit"
          />
        )}
        <Text style={[bodyText('sm', 800), styles.hint]} pointerEvents="none">
          {strings.combat.tapHint}
        </Text>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  // Flinches from the feet, like the hero's poses.
  enemy: { position: 'absolute', transformOrigin: 'bottom' },
  flash: { position: 'absolute', left: 0, top: 0 },
  scene: {
    flex: 1,
    marginHorizontal: spacing[3],
    overflow: 'hidden',
    borderRadius: radii.cardLarge,
    borderWidth: strokes.card,
    borderColor: colors.ink,
    backgroundColor: colors.sky,
    ...hardShadow('card'),
  },
  absolute: { position: 'absolute' },
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 1,
    overflow: 'hidden',
    borderRadius: radii.button,
    backgroundColor: colors.paper,
    ...outline('small'),
  },
});
