import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/i18n';
import { bodyText, Button, Card, displayText, spacing } from '@/ui';

export interface GuardianPanelProps {
  readonly name: string;
  readonly wave: number;
  readonly onEngage: () => void;
  readonly onFlee: () => void;
}

/** A guardian waits for the player: face it or go back one wave (the cut-in of #35 wraps this). */
export function GuardianPanel({ name, wave, onEngage, onFlee }: GuardianPanelProps) {
  return (
    <Card style={styles.panel} testID="guardian-panel">
      <Text style={displayText('xl')}>{strings.guardians.blocks(name)}</Text>
      <Button
        label={strings.guardians.engage}
        size="large"
        onPress={onEngage}
        testID="guardian-engage"
      />
      <Button
        label={strings.guardians.flee(wave - 1)}
        variant="neutral"
        onPress={onFlee}
        testID="guardian-flee"
      />
    </Card>
  );
}

export interface FarmingBannerProps {
  readonly onChallenge: () => void;
}

/** While farming before a guardian: a reminder and the button to try again. */
export function FarmingBanner({ onChallenge }: FarmingBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={[bodyText('md', 800), styles.text]}>{strings.guardians.farming}</Text>
      <Button
        label={strings.guardians.challenge}
        onPress={onChallenge}
        testID="guardian-challenge"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing[3],
    padding: spacing[4],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
  },
  text: { flex: 1 },
});
