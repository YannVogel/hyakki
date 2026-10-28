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

/**
 * Name, level and HP of the enemy, top right of the scene. The name has the card's full width
 * and up to two lines: the longest generated names fit without being cut.
 */
export function EnemyHud({ name, wave, hpRatio, secondsLeft, timeRatio }: EnemyHudProps) {
  return (
    <View style={styles.hud} pointerEvents="none">
      <Text style={displayText('md')} numberOfLines={2} testID="enemy-name">
        {name}
      </Text>
      <View style={styles.row}>
        <View style={styles.bar}>
          <ProgressBar
            value={hpRatio}
            color={colors.red}
            trackColor={colors.hpTrack}
            height={12}
            accessibilityLabel={strings.combat.hpLabel(name)}
            testID="enemy-hp"
          />
        </View>
        <Text style={[bodyText('xs', 800), styles.level]}>{strings.combat.enemyLevel(wave)}</Text>
      </View>
      {secondsLeft === undefined ? null : (
        <View style={styles.row}>
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

// Wide enough for nine names out of ten on one line, clear of the hero on a 360 dp screen.
const HUD_WIDTH = 200;

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    right: spacing[2] + 2,
    top: spacing[2] + 2,
    width: HUD_WIDTH,
    gap: spacing[1],
    paddingHorizontal: spacing[2] + 2,
    paddingTop: spacing[2] - 1,
    paddingBottom: spacing[2] - 1,
    borderRadius: radii.button,
    backgroundColor: colors.paper,
    ...outline('control'),
    ...hardShadow('small'),
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  level: { color: colors.muted },
  bar: { flex: 1 },
});
