import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/i18n';
import { bodyText, Button, spacing } from '@/ui';

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
