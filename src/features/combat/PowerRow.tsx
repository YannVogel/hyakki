import { StyleSheet, Text, View } from 'react-native';

import { generate, nameOf } from '@/engine';
import { OBJECT_KANJI, RARITY_NAMES, strings } from '@/i18n';
import { bodyText, colors, displayText, outline, rarityColors, spacing } from '@/ui';

const RARITY_TOKENS = {
  common: 'commun',
  rare: 'rare',
  epic: 'epique',
  legendary: 'legendaire',
} as const;
const BADGE = 34;

export interface PowerRowProps {
  /** Formatted damage per second. */
  readonly power: string;
  readonly team: readonly number[];
}

/** « Puissance » of the player and the badges of the active team. */
export function PowerRow({ power, team }: PowerRowProps) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={[bodyText('sm', 800), styles.muted]}>{strings.combat.power}</Text>
        <Text style={displayText('2xl')} testID="combat-power">
          {power}{' '}
          <Text style={[bodyText('base', 800), styles.muted]}>{strings.combat.perSecond}</Text>
        </Text>
      </View>
      <View style={styles.team}>
        <Text style={[bodyText('sm', 800), styles.muted]}>{strings.combat.team}</Text>
        {team.length === 0 ? (
          <Text style={[bodyText('sm', 700), styles.muted]}>{strings.combat.noTeam}</Text>
        ) : (
          team.map((seed) => {
            const spec = generate(seed);
            return (
              <View
                key={seed}
                accessible
                accessibilityLabel={`${nameOf(spec)}, ${RARITY_NAMES[spec.rarity]}`}
                style={[
                  styles.badge,
                  { backgroundColor: rarityColors[RARITY_TOKENS[spec.rarity]] },
                ]}
              >
                <Text style={displayText('lg')}>{OBJECT_KANJI[spec.object]}</Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

export { RARITY_TOKENS };

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  muted: { color: colors.muted },
  team: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] + 2 },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...outline('control'),
  },
});
