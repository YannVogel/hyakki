import { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { festivalPreview, formatNumber } from '@/engine';
import { strings } from '@/i18n';
import { FestivalScene } from '@/render';
import { paradeView, useGame, useGameStore } from '@/state';
import { bodyText, Button, Card, colors, displayText, OutlinedText, spacing } from '@/ui';

import { HERO_ASPECT, HERO_POSES } from '../shared/images';

const multiplier = (value: number) => (Math.round(value * 10) / 10).toFixed(1).replace('.', ',');
const HERO_HEIGHT = 140;

export interface FestivalScreenProps {
  /** Back to the parade (after a Festival, or to keep going). */
  readonly onDone: () => void;
}

/** Restart the parade stronger, never by mistake: the Festival asks for a confirmation. */
export function FestivalScreen({ onDone }: FestivalScreenProps) {
  const game = useGame((store) => store.game);
  const store = useGameStore();
  const { width } = useWindowDimensions();
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
          <FestivalScene width={width - spacing[4] * 2} accessibilityLabel={text.sceneLabel} />
          <Image
            source={HERO_POSES.victory}
            accessibilityLabel={text.heroLabel}
            style={[styles.hero, { height: HERO_HEIGHT, width: HERO_HEIGHT * HERO_ASPECT }]}
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
