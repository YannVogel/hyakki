import { StyleSheet, Text, View } from 'react-native';

import { formatNumber, type KamidanaId } from '@/engine';
import { strings } from '@/i18n';
import type { KamidanaView } from '@/state';
import { bodyText, Button, Card, colors, displayText, spacing } from '@/ui';

import { KAMIDANA_COLORS, KAMIDANA_EFFECTS, kamidanaValue } from './kamidanaCatalog';
import { UpgradeTile } from './UpgradeTile';

export interface KamidanaRowProps {
  readonly view: KamidanaView;
  readonly onBuy: (upgrade: KamidanaId) => void;
}

/** One blessing of the Kamidana: what it does, now and at the next level, and its price. */
export function KamidanaRow({ view, onBuy }: KamidanaRowProps) {
  const text = strings.kamidana;
  const { name, kanji } = text.upgrades[view.id];
  const cost = formatNumber(view.cost);
  const now = kamidanaValue(view.id, view.effect);
  const value =
    view.nextEffect === null ? now : text.change(now, kamidanaValue(view.id, view.nextEffect));
  const label = view.maxed
    ? text.maxedLabel(name)
    : view.affordable
      ? text.buyLabel(name, cost)
      : text.notEnough(name, cost);
  return (
    <Card style={styles.row} testID={`kamidana-${view.id}`}>
      <UpgradeTile kanji={kanji} color={KAMIDANA_COLORS[view.id]} />
      <View style={styles.text}>
        <View style={styles.title}>
          <Text style={displayText('base')}>{name}</Text>
          <Text style={[bodyText('sm', 800), styles.muted]} testID={`kamidana-${view.id}-level`}>
            {text.level(view.level, view.maxLevel)}
          </Text>
        </View>
        <Text style={[bodyText('sm', 700), styles.muted]}>{KAMIDANA_EFFECTS[view.id]}</Text>
        <Text style={bodyText('sm', 800)} testID={`kamidana-${view.id}-value`}>
          {value}
        </Text>
      </View>
      <View style={styles.buy}>
        <Button
          label={view.maxed ? text.maxed : text.buy}
          accessibilityLabel={label}
          disabled={view.maxed || !view.affordable}
          onPress={() => onBuy(view.id)}
          sound="purchase"
          testID={`buy-kamidana-${view.id}`}
        />
        {view.maxed ? null : (
          <Text style={[bodyText('xs', 800), styles.cost]}>{text.cost(cost)}</Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[3] },
  text: { flex: 1, gap: 2 },
  title: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: spacing[2] },
  muted: { color: colors.muted },
  buy: { alignItems: 'center', gap: 2 },
  cost: { color: colors.ink },
});
