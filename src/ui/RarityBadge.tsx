import { StyleSheet, Text, View } from 'react-native';

import { bodyText, outline } from './styles';
import { colors, rarityColors, spacing } from './tokens';

export type RarityToken = keyof typeof rarityColors;

export interface RarityBadgeProps {
  readonly rarity: RarityToken;
  /** Always shown: rarity is never told by the color alone. */
  readonly label: string;
}

const DOT = 14;

export function RarityBadge({ rarity, label }: RarityBadgeProps) {
  return (
    <View style={styles.badge} accessible accessibilityLabel={label}>
      <View testID="rarity-dot" style={[styles.dot, { backgroundColor: rarityColors[rarity] }]} />
      <Text style={bodyText('md', 800)}>{label}</Text>
    </View>
  );
}

const BADGE_HEIGHT = 30;

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    height: BADGE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingLeft: spacing[2],
    paddingRight: spacing[3],
    borderRadius: BADGE_HEIGHT / 2,
    backgroundColor: colors.paper,
    ...outline('control'),
  },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, ...outline('small') },
});
