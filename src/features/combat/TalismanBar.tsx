import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TalismanId } from '@/engine';
import { strings } from '@/i18n';
import type { TalismanView } from '@/state';
import {
  bodyText,
  colors,
  displayText,
  hardShadow,
  OutlinedText,
  radii,
  spacing,
  strokes,
  useHaptics,
} from '@/ui';

const TALISMAN_COLORS: Record<TalismanId, string> = {
  kitsunebi: colors.orange,
  raijin: colors.yellow,
  kekkai: colors.sky,
};

const BUTTON_HEIGHT = 92;

export interface TalismanBarProps {
  readonly talismans: readonly TalismanView[];
  readonly onCast: (talisman: TalismanId) => void;
}

/** The three talismans; a recharging one is veiled from the bottom up and shows its seconds left. */
export function TalismanBar({ talismans, onCast }: TalismanBarProps) {
  const haptics = useHaptics();
  return (
    <View style={styles.bar}>
      {talismans.map(({ id, cooldownMs, cooldownRatio }) => {
        const { name, kanji } = strings.talismans[id];
        const seconds = Math.ceil(cooldownMs / 1000);
        const ready = cooldownMs <= 0;
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityLabel={
              ready
                ? strings.combat.talismanReady(name)
                : strings.combat.talismanWaiting(name, seconds)
            }
            accessibilityState={{ disabled: !ready }}
            disabled={!ready}
            onPress={() => {
              haptics('medium');
              onCast(id);
            }}
            testID={`talisman-${id}`}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: TALISMAN_COLORS[id] },
              pressed ? styles.pressed : hardShadow('card'),
            ]}
          >
            <OutlinedText style={displayText('4xl')}>{kanji}</OutlinedText>
            <Text style={bodyText('md', 800)}>{name}</Text>
            {ready ? null : (
              <>
                <View
                  style={[styles.shade, { height: `${cooldownRatio * 100}%` }]}
                  pointerEvents="none"
                  testID={`talisman-${id}-shade`}
                />
                <View style={styles.countdown} pointerEvents="none">
                  <OutlinedText style={displayText('xl')}>
                    {strings.combat.seconds(seconds)}
                  </OutlinedText>
                </View>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3] + 2,
  },
  button: {
    flex: 1,
    height: BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    overflow: 'hidden',
    borderRadius: radii.button + 2,
    borderWidth: strokes.card,
    borderColor: colors.ink,
  },
  pressed: { transform: [{ translateY: 3 }] },
  shade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.ink,
    opacity: 0.62,
  },
  countdown: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
