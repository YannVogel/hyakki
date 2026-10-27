import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/i18n';
import {
  bodyText,
  colors,
  displayText,
  hardShadow,
  outline,
  ProgressBar,
  radii,
  spacing,
} from '@/ui';

export interface EnemyHudProps {
  readonly name: string;
  readonly wave: number;
  readonly hpRatio: number;
  /** Guardian fight: seconds left, shown under the HP. */
  readonly secondsLeft?: number;
  readonly timeRatio?: number;
}

/** Name, level and HP of the enemy, top right of the scene. */
export function EnemyHud({ name, wave, hpRatio, secondsLeft, timeRatio }: EnemyHudProps) {
  return (
    <View style={styles.hud} pointerEvents="none">
      <View style={styles.title}>
        <Text style={[displayText('md'), styles.name]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[bodyText('xs', 800), styles.level]}>{strings.combat.enemyLevel(wave)}</Text>
      </View>
      <ProgressBar
        value={hpRatio}
        color={colors.red}
        trackColor={colors.hpTrack}
        height={12}
        accessibilityLabel={strings.combat.hpLabel(name)}
        testID="enemy-hp"
      />
      {secondsLeft === undefined ? null : (
        <View style={styles.timer}>
          <View style={styles.bar}>
            <ProgressBar
              value={timeRatio ?? 0}
              color={colors.sky}
              height={10}
              accessibilityLabel={strings.guardians.timerLabel(secondsLeft)}
              testID="guardian-timer"
            />
          </View>
          <Text style={bodyText('xs', 800)}>{strings.guardians.timeLeft(secondsLeft)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    right: spacing[2] + 2,
    top: spacing[2] + 2,
    width: 176,
    gap: spacing[1] + 1,
    paddingHorizontal: spacing[2] + 2,
    paddingTop: spacing[2] - 1,
    paddingBottom: spacing[2] + 1,
    borderRadius: radii.button,
    backgroundColor: colors.paper,
    ...outline('control'),
    ...hardShadow('small'),
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: spacing[1],
  },
  name: { flexShrink: 1 },
  level: { color: colors.muted },
  timer: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  bar: { flex: 1 },
});
