import { StyleSheet, Text, View } from 'react-native';

import { formatNumber, type UpgradeId } from '@/engine';
import { strings } from '@/i18n';
import type { PurchaseView } from '@/state';
import {
  bodyText,
  Button,
  Card,
  colors,
  displayText,
  OutlinedText,
  outline,
  radii,
  spacing,
} from '@/ui';

const TILE_COLORS: Record<UpgradeId, string> = {
  blade: colors.orange,
  foxfire: colors.pink,
  bell: colors.yellow,
  kekkai: colors.sky,
  lanterns: colors.purple,
};

const TILE = 52;

export interface UpgradeRowProps {
  readonly view: PurchaseView;
  readonly effect: string;
  readonly onBuy: (upgrade: UpgradeId) => void;
}

/** One Sanctuary upgrade: what it does, its level and the purchase button. */
export function UpgradeRow({ view, effect, onBuy }: UpgradeRowProps) {
  const { name, kanji } = strings.sanctuary.upgrades[view.id];
  const cost = formatNumber(view.cost);
  const label = view.maxed
    ? strings.sanctuary.maxedLabel(name)
    : view.affordable
      ? strings.sanctuary.buy(name, view.count, cost)
      : strings.sanctuary.notEnough(name, cost);
  return (
    <Card style={styles.row} testID={`upgrade-${view.id}`}>
      <View style={[styles.tile, { backgroundColor: TILE_COLORS[view.id] }]}>
        <OutlinedText style={displayText('3xl')}>{kanji}</OutlinedText>
      </View>
      <View style={styles.text}>
        <View style={styles.title}>
          <Text style={displayText('base')}>{name}</Text>
          <Text style={[bodyText('sm', 800), styles.muted]} testID={`upgrade-${view.id}-level`}>
            {strings.sanctuary.level(view.level)}
          </Text>
        </View>
        <Text style={[bodyText('sm', 700), styles.muted]}>{effect}</Text>
      </View>
      <View style={styles.buy}>
        <Button
          label={view.maxed ? strings.sanctuary.maxed : strings.sanctuary.buyLabel(view.count)}
          accessibilityLabel={label}
          disabled={view.maxed || !view.affordable}
          onPress={() => onBuy(view.id)}
          sound="purchase"
          testID={`buy-${view.id}`}
        />
        {view.maxed ? null : <Text style={[bodyText('xs', 800), styles.cost]}>{cost}</Text>}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[3] },
  tile: {
    width: TILE,
    height: TILE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.button,
    ...outline('control'),
  },
  text: { flex: 1, gap: 2 },
  title: { flexDirection: 'row', alignItems: 'baseline', gap: spacing[2] },
  muted: { color: colors.muted },
  buy: { alignItems: 'center', gap: 2 },
  cost: { color: colors.ink },
});
