import { StyleSheet, View } from 'react-native';

import type { LevelUpMode } from '@/engine';
import { strings } from '@/i18n';
import { Button, Segmented, spacing } from '@/ui';

const MODES = [
  { value: 1, label: strings.shikigami.modes.one },
  { value: 10, label: strings.shikigami.modes.ten },
  { value: 100, label: strings.shikigami.modes.hundred },
  { value: 'max', label: strings.shikigami.modes.max },
] as const;

export interface LevelUpControlProps {
  readonly mode: LevelUpMode;
  readonly onModeChange: (mode: LevelUpMode) => void;
  /** Levels the chosen mode buys, and their cost, already formatted. */
  readonly count: number;
  readonly cost: string;
  readonly affordable: boolean;
  readonly onLevelUp: () => void;
}

/** ×1 / ×10 / ×100 / Max, then the level-up button with the price of the chosen levels. */
export function LevelUpControl({
  mode,
  onModeChange,
  count,
  cost,
  affordable,
  onLevelUp,
}: LevelUpControlProps) {
  const text = strings.shikigami;
  return (
    <View style={styles.control}>
      <Segmented
        accessibilityLabel={text.quantity}
        options={MODES}
        value={mode}
        onChange={onModeChange}
      />
      <Button
        label={text.levelUp(count, cost)}
        accessibilityLabel={text.levelUpLabel(count, cost)}
        disabled={!affordable}
        onPress={onLevelUp}
        sound="purchase"
        testID="shikigami-level-up"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  control: { gap: spacing[2] },
});
