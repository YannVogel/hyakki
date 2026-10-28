import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatNumber } from '@/engine';
import { strings } from '@/i18n';
import type { NextGuardianView, ParadeView } from '@/state';
import { bodyText, colors, displayText, Icon, Pill, ProgressBar, spacing } from '@/ui';

import { OFUDA_ICON, SOULS_ICON } from '../shared/icons';
import { GUARDIAN_IMAGES } from '../shared/images';

export interface CombatHeaderProps {
  readonly parade: ParadeView;
  readonly nextGuardian: NextGuardianView;
  readonly souls: string;
  readonly ofuda: number;
}

/** Parade and wave, currencies, progress toward the next guardian. */
export function CombatHeader({ parade, nextGuardian, souls, ofuda }: CombatHeaderProps) {
  const text = strings.combat;
  const ofudaValue = formatNumber(ofuda);
  return (
    <View style={styles.header}>
      <View style={styles.top}>
        {/* Development builds only: a long press opens the development screens. */}
        <Pressable
          onLongPress={__DEV__ ? () => router.push('/dev') : undefined}
          disabled={!__DEV__}
          testID="dev-hub"
        >
          <Text style={[bodyText('sm', 800), styles.muted]}>
            {text.parade(parade.number, parade.level)}
          </Text>
          <Text style={displayText('2xl')} testID="combat-wave">
            {text.wave(parade.waveInTier)}{' '}
            <Text style={[displayText('lg'), styles.muted]}>{text.ofTier}</Text>
          </Text>
        </Pressable>
        <View style={styles.pills}>
          <Pill
            icon={<Icon parts={SOULS_ICON} size={20} />}
            value={souls}
            accessibilityLabel={text.souls(souls)}
            testID="combat-souls"
          />
          <Pill
            icon={<Icon parts={OFUDA_ICON} size={20} />}
            value={ofudaValue}
            accessibilityLabel={text.ofuda(ofudaValue)}
          />
        </View>
      </View>
      <View style={styles.progress}>
        <View style={styles.bar}>
          <ProgressBar
            value={parade.tierProgress}
            color={colors.yellow}
            accessibilityLabel={text.progress(parade.waveInTier)}
          />
        </View>
        <NextGuardianThumbnail guardian={nextGuardian} />
      </View>
    </View>
  );
}

/** The guardian at the end of the bar, a black silhouette until it is known (as in the gallery). */
function NextGuardianThumbnail({ guardian }: { guardian: NextGuardianView }) {
  const { index, revealed } = guardian;
  return (
    <Image
      source={GUARDIAN_IMAGES[index]}
      resizeMode="contain"
      tintColor={revealed ? undefined : colors.ink}
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        revealed
          ? strings.combat.nextGuardian(strings.guardians.names[index])
          : strings.combat.nextGuardianUnknown
      }
      style={styles.thumbnail}
      testID={revealed ? 'next-guardian-art' : 'next-guardian-silhouette'}
    />
  );
}

const THUMBNAIL = 44;

const styles = StyleSheet.create({
  header: { gap: spacing[3], paddingHorizontal: spacing[4], paddingTop: spacing[4] },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pills: { flexDirection: 'row', gap: spacing[2] },
  muted: { color: colors.muted },
  progress: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  bar: { flex: 1 },
  thumbnail: { width: THUMBNAIL, height: THUMBNAIL },
});
