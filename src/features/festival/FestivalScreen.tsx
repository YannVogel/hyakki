import { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { festivalPreview, formatNumber } from '@/engine';
import { strings } from '@/i18n';
import { paradeView, useGame, useGameStore } from '@/state';
import { bodyText, Button, Card, colors, displayText, OutlinedText, spacing } from '@/ui';

import { FESTIVAL_HEADER, HERO_POSES, heroPoseSize } from '../shared/images';

const multiplier = (value: number) => (Math.round(value * 10) / 10).toFixed(1).replace('.', ',');
const HERO_HEIGHT = 140;
/** Frame of the Festival scene in its mockup (design/mockups/Aube.dc.html): 366 × 220. */
const HEADER_ASPECT_RATIO = 366 / 220;

export interface FestivalScreenProps {
  /** Back to the parade (after a Festival, or to keep going). */
  readonly onDone: () => void;
}

/** Restart the parade stronger, never by mistake: the Festival asks for a confirmation. */
export function FestivalScreen({ onDone }: FestivalScreenProps) {
  const game = useGame((store) => store.game);
  const store = useGameStore();
  const [confirming, setConfirming] = useState(false);
  const preview = festivalPreview(game);
  const parade = paradeView(game);
  const text = strings.festival;
  const now = multiplier(preview.bonusNow);
  const after = multiplier(preview.bonusAfter);

  const launch = () => {
    setConfirming(false);
    if (store.getState().startFestival().ok) {
      onDone();
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.scene}>
          {/* The frame sets the size: a local image would impose its own height. */}
          <View style={styles.header}>
            <Image
              source={FESTIVAL_HEADER.source}
              resizeMode="cover"
              accessible
              accessibilityRole="image"
              accessibilityLabel={text.sceneLabel}
              style={styles.headerImage}
              testID="festival-header"
            />
          </View>
          <Image
            source={HERO_POSES.victory.source}
            accessibilityLabel={text.heroLabel}
            style={[styles.hero, heroPoseSize('victory', HERO_HEIGHT)]}
          />
        </View>
        <Text style={[bodyText('sm', 800), styles.muted]}>
          {text.status(parade.number, parade.wave, game.parade.maxWave)}
        </Text>
        <OutlinedText style={displayText('4xl')}>{text.title}</OutlinedText>
        <Text style={bodyText('base', 700)}>{text.pitch}</Text>
        {preview.unlocked ? (
          <Card style={styles.rewards}>
            <View style={styles.reward}>
              <Text style={displayText('4xl')} testID="festival-sparks">
                {text.sparks(formatNumber(preview.sparksToEarn))}
              </Text>
              <Text style={bodyText('sm', 800)}>{text.sparksLabel}</Text>
            </View>
            <View style={styles.reward} accessible accessibilityLabel={text.bonusLabel(now, after)}>
              <Text style={displayText('xl')}>{text.bonusChange(now, after)}</Text>
              <Text style={bodyText('sm', 800)}>{text.bonus}</Text>
            </View>
          </Card>
        ) : (
          <Card style={styles.rewards}>
            <Text style={bodyText('base', 800)} testID="festival-locked">
              {text.locked}
            </Text>
          </Card>
        )}
        <Button
          label={text.start}
          size="large"
          variant="danger"
          disabled={!preview.unlocked}
          onPress={() => setConfirming(true)}
          testID="festival-start"
        />
        <Button
          label={text.keepGoing}
          variant="neutral"
          onPress={onDone}
          testID="festival-keep-going"
        />
      </ScrollView>
      <Modal
        visible={confirming}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirming(false)}
      >
        <View style={styles.dialogBackdrop}>
          <Card large style={styles.dialog} testID="festival-confirm">
            <Text style={displayText('2xl')}>{text.confirmTitle}</Text>
            <Text style={bodyText('base', 700)}>{text.confirmBody}</Text>
            <Button
              label={text.confirm}
              variant="danger"
              onPress={launch}
              testID="festival-confirm-yes"
            />
            <Button
              label={text.cancel}
              variant="neutral"
              onPress={() => setConfirming(false)}
              testID="festival-confirm-no"
            />
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { gap: spacing[3], padding: spacing[4] },
  scene: { alignItems: 'center' },
  header: { width: '100%', aspectRatio: HEADER_ASPECT_RATIO },
  headerImage: { width: '100%', height: '100%' },
  hero: { position: 'absolute', bottom: 0, left: spacing[3] },
  muted: { color: colors.muted },
  rewards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing[4],
    gap: spacing[3],
  },
  reward: { alignItems: 'center', gap: spacing[1] },
  dialogBackdrop: { flex: 1, justifyContent: 'center', padding: spacing[5] },
  dialog: { gap: spacing[3], padding: spacing[5] },
});
