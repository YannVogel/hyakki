import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatNumber } from '@/engine';
import { strings } from '@/i18n';
import type { ParadeView } from '@/state';
import { bodyText, colors, displayText, Icon, Pill, ProgressBar, spacing } from '@/ui';

import { OFUDA_ICON, SOULS_ICON } from '../shared/icons';

export interface CombatHeaderProps {
  readonly parade: ParadeView;
  readonly souls: string;
  readonly ofuda: number;
}

/** Parade and wave, currencies, progress toward the next guardian. */
export function CombatHeader({ parade, souls, ofuda }: CombatHeaderProps) {
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
          <Text style={[bodyText('sm', 800), styles.muted]}>{text.parade(parade.number)}</Text>
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
        <Text style={bodyText('sm', 800)}>{text.nextGuardian}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing[3], paddingHorizontal: spacing[4], paddingTop: spacing[4] },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pills: { flexDirection: 'row', gap: spacing[2] },
  muted: { color: colors.muted },
  progress: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  bar: { flex: 1 },
});
