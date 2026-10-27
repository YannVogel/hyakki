import { StyleSheet, View } from 'react-native';

import { outline } from './styles';
import { colors, strokes } from './tokens';

export interface ProgressBarProps {
  /** From 0 to 1 (clamped). */
  readonly value: number;
  readonly color: string;
  readonly trackColor?: string;
  readonly accessibilityLabel: string;
  readonly height?: number;
  readonly testID?: string;
}

const DEFAULT_HEIGHT = 16;

/** HP, parade progress, offline cap: a filled bar with an inked right edge. */
export function ProgressBar({
  value,
  color,
  trackColor = colors.paper,
  accessibilityLabel,
  height = DEFAULT_HEIGHT,
  testID,
}: ProgressBarProps) {
  const ratio = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      testID={testID}
      style={[styles.track, { height, borderRadius: height / 2, backgroundColor: trackColor }]}
    >
      <View
        testID={testID === undefined ? undefined : `${testID}-fill`}
        style={[
          styles.fill,
          ratio > 0 && ratio < 1 && styles.edge,
          { width: `${ratio * 100}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', ...outline('control') },
  fill: { height: '100%' },
  edge: { borderRightWidth: strokes.control, borderRightColor: colors.ink },
});
