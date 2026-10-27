import { useState } from 'react';
import { Image, type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import { strings } from '@/i18n';
import { BattleBackdrop, sceneLayout, toBox, YokaiCanvas } from '@/render';
import type { EnemyView } from '@/state';
import {
  bodyText,
  colors,
  hardShadow,
  OutlinedText,
  outline,
  radii,
  spacing,
  strokes,
  displayText,
} from '@/ui';

import { GUARDIAN_IMAGES, HERO_ASPECT, HERO_POSES } from '../shared/images';
import { EnemyHud } from './EnemyHud';

export interface LastHit {
  readonly damage: string;
  readonly crit: boolean;
}

export interface BattleSceneProps {
  readonly enemy: EnemyView;
  readonly enemyName: string;
  readonly wave: number;
  readonly lastHit: LastHit | null;
  readonly onTap: () => void;
}

// Positions in the 366 × 400 frame of the mockup scene.
const HERO = { x: 0, y: 108, height: 194 };
const ENEMY = { x: 270, y: 222, size: 160 };
const GUARDIAN = { x: 270, y: 216, size: 190 };
const HIT_LABEL = { x: 132, y: 82 };

/** The battlefield: backdrop, hero, enemy and its HUD; a tap anywhere strikes. */
export function BattleScene({ enemy, enemyName, wave, lastHit, onTap }: BattleSceneProps) {
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
  const hitAt = layout === null ? null : toBox(layout, HIT_LABEL.x, HIT_LABEL.y);

  return (
    <GestureDetector gesture={tap}>
      <View style={styles.scene} onLayout={onLayout} testID="battle-scene">
        {box === null ? null : <BattleBackdrop width={box.width} height={box.height} />}
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
        <Image
          source={HERO_POSES.idle}
          accessibilityLabel={strings.combat.heroLabel}
          style={[
            styles.hero,
            {
              left: heroTop.x,
              top: heroTop.y,
              height: heroHeight,
              width: heroHeight * HERO_ASPECT,
            },
          ]}
        />
        {enemyBox === null ? null : enemy.kind === 'yokai' ? (
          <View style={[styles.absolute, { left: enemyBox.left, top: enemyBox.top }]}>
            <YokaiCanvas
              spec={enemy.spec}
              size={enemyBox.side}
              accessibilityLabel={enemyName}
              testID="enemy-yokai"
            />
          </View>
        ) : (
          <Image
            source={GUARDIAN_IMAGES[enemy.index]}
            accessibilityLabel={enemyName}
            resizeMode="contain"
            testID="enemy-guardian"
            style={[
              styles.absolute,
              {
                left: enemyBox.left,
                top: enemyBox.top,
                width: enemyBox.side,
                height: enemyBox.side,
              },
            ]}
          />
        )}
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
        {lastHit === null || hitAt === null ? null : (
          <View
            style={[styles.absolute, { left: hitAt.x, top: hitAt.y }]}
            pointerEvents="none"
            testID="last-hit"
          >
            <Text style={[displayText('lg'), styles.hitLabel]}>
              {lastHit.crit ? strings.combat.crit : strings.combat.hit}
            </Text>
            <OutlinedText style={displayText('4xl')} width={2}>
              {lastHit.damage}
            </OutlinedText>
          </View>
        )}
        <Text style={[bodyText('sm', 800), styles.hint]} pointerEvents="none">
          {strings.combat.tapHint}
        </Text>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
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
  hero: { position: 'absolute' },
  hitLabel: { color: colors.red },
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
