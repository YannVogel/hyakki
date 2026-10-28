import { Image, StyleSheet, View } from 'react-native';

import { frameCover, type SceneLayout, toBox } from '@/render';
import type { EnemyView } from '@/state';
import { colors } from '@/ui';

import { BATTLE_BACKDROPS, type Illustration } from '../shared/images';

// The hero's shadow on the ground, in the scene frame (it was part of the former drawn backdrop).
const HERO_SHADOW = { x: 80, y: 304, width: 80, height: 14 };

export interface BattleBackdropProps {
  readonly layout: SceneLayout;
  readonly enemy: EnemyView;
  /** Guardian of the current hundred: its backdrop is loaded early, hidden until it shows up. */
  readonly upcomingGuardian: number;
}

/** The parade's illustrated backdrop, or the guardian's own while it is on stage. */
export function BattleBackdrop({ layout, enemy, upcomingGuardian }: BattleBackdropProps) {
  const onStage = enemy.kind === 'guardian';
  // An awakened guardian (index from 0 to 9) keeps the backdrop of its normal self.
  const guardian = onStage ? enemy.index : upcomingGuardian;
  const cover = ({ width, height }: Illustration) => [
    styles.absolute,
    frameCover(layout, width, height),
  ];
  const shadow = toBox(layout, HERO_SHADOW.x - HERO_SHADOW.width / 2, HERO_SHADOW.y);
  const shadowHeight = HERO_SHADOW.height * layout.scale;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={BATTLE_BACKDROPS.parade.source}
        style={cover(BATTLE_BACKDROPS.parade)}
        testID="backdrop-parade"
      />
      <Image
        source={BATTLE_BACKDROPS.guardians[guardian].source}
        style={[cover(BATTLE_BACKDROPS.guardians[guardian]), { opacity: onStage ? 1 : 0 }]}
        testID={`backdrop-guardian-${guardian}`}
      />
      <View
        style={[
          styles.shadow,
          {
            left: shadow.x,
            top: shadow.y - shadowHeight / 2,
            width: HERO_SHADOW.width * layout.scale,
            height: shadowHeight,
            borderRadius: shadowHeight / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  absolute: { position: 'absolute' },
  shadow: { position: 'absolute', backgroundColor: colors.ink, opacity: 0.2 },
});
