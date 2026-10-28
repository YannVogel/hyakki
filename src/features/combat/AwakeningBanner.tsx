import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/i18n';
import { bodyText, Card, displayText, OutlinedText, spacing } from '@/ui';

/** Over the scene, after Nurarihyon's defeat: the parade starts over, one awakening level up. */
export function AwakeningBanner({ level }: { level: number }) {
  const title = strings.combat.awakeningTitle(level);
  return (
    <View
      style={styles.overlay}
      pointerEvents="none"
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${title} ${strings.combat.awakeningBody}`}
      testID="awakening-banner"
    >
      <Card style={styles.card}>
        <OutlinedText style={displayText('3xl')}>{title}</OutlinedText>
        <Text style={[bodyText('base', 800), styles.body]}>{strings.combat.awakeningBody}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, justifyContent: 'center', padding: spacing[6] },
  card: { alignItems: 'center', gap: spacing[1], padding: spacing[4] },
  body: { textAlign: 'center' },
});
