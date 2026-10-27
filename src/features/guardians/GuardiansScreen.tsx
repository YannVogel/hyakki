import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '@/i18n';
import { type GuardianCard, guardianGallery, useGame } from '@/state';
import { bodyText, Button, Card, colors, displayText, outline, radii, spacing } from '@/ui';

import { GUARDIAN_IMAGES } from '../shared/images';

const STATUS_COLORS = {
  defeated: colors.grass,
  next: colors.yellow,
  upcoming: colors.paper,
} as const;

function GuardianTile({ card }: { card: GuardianCard }) {
  const text = strings.guardians;
  const status = text.status[card.status];
  const name = text.names[card.index];
  const label = card.revealed
    ? text.knownLabel(name, text.descriptions[card.index], card.wave, status)
    : text.unknownLabel(card.wave, status);
  return (
    <Card style={styles.tile} testID={`guardian-${card.index}`}>
      <View accessible accessibilityRole="image" accessibilityLabel={label} style={styles.inner}>
        <View
          style={[
            styles.art,
            { backgroundColor: card.revealed ? colors.skyLight : colors.disabled },
          ]}
        >
          <Image
            source={GUARDIAN_IMAGES[card.index]}
            resizeMode="contain"
            // Not met yet: a black silhouette that does not give the guardian away.
            tintColor={card.revealed ? undefined : colors.ink}
            style={styles.image}
            testID={
              card.revealed ? `guardian-${card.index}-art` : `guardian-${card.index}-silhouette`
            }
          />
        </View>
        <Text style={displayText('md')} numberOfLines={1}>
          {card.revealed ? name : text.unknown}
        </Text>
        <View style={styles.meta}>
          <Text style={[bodyText('xs', 800), styles.muted]}>{text.galleryWave(card.wave)}</Text>
          <Text
            style={[
              bodyText('xs', 800),
              styles.status,
              { backgroundColor: STATUS_COLORS[card.status] },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>
    </Card>
  );
}

/** Gallery of the guardians: progress, and the urge to go further. */
export function GuardiansScreen() {
  const game = useGame((store) => store.game);
  const cards = guardianGallery(game);
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { gap: spacing[3], padding: spacing[4] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  tile: { width: '47%', padding: spacing[2] },
  inner: { gap: spacing[1] },
  art: { aspectRatio: 1, borderRadius: radii.button, ...outline('small'), overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  muted: { color: colors.muted },
  status: {
    paddingHorizontal: spacing[2],
    borderRadius: radii.chip,
    overflow: 'hidden',
    ...outline('small'),
  },
});
