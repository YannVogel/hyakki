import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '@/i18n';
import { awakenedGuardianGallery, guardianGallery, useGame } from '@/state';
import { bodyText, Button, colors, displayText, spacing } from '@/ui';

import { AwakenedGuardianTile, GuardianTile } from './GuardianTile';

/** Gallery of the guardians: progress, and the urge to go further. */
export function GuardiansScreen() {
  const game = useGame((store) => store.game);
  const cards = guardianGallery(game);
  const awakened = awakenedGuardianGallery(game);
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Button
          label={strings.guardians.back}
          variant="neutral"
          onPress={() => router.back()}
          testID="guardians-back"
        />
        <Text style={displayText('3xl')}>{strings.guardians.galleryTitle}</Text>
        <Text style={bodyText('base', 700)}>
          {strings.guardians.gallerySubtitle(game.guardiansDefeated.length)}
        </Text>
        <View style={styles.grid}>
          {cards.map((card) => (
            <GuardianTile key={card.index} card={card} />
          ))}
        </View>
        {awakened === null ? null : (
          <>
            <Text style={[displayText('2xl'), styles.section]}>
              {strings.guardians.awakenedTitle}
            </Text>
            <Text style={bodyText('base', 700)}>
              {strings.guardians.awakenedSubtitle(
                awakened.filter((card) => card.bestLevel !== null).length,
              )}
            </Text>
            <View style={styles.grid}>
              {awakened.map((card) => (
                <AwakenedGuardianTile key={card.index} card={card} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { gap: spacing[3], padding: spacing[4] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  section: { marginTop: spacing[3] },
});
