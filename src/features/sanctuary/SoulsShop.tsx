import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BALANCE, formatNumber, type PurchaseMode, type UpgradeId } from '@/engine';
import { strings } from '@/i18n';
import { soulsPerSecond, upgradeViews, useGame, useGameStore } from '@/state';
import { bodyText, Card, colors, displayText, Icon, Segmented, spacing } from '@/ui';

import { SOULS_ICON } from '../shared/icons';
import { UpgradeRow } from './UpgradeRow';

const percent = (fraction: number) => String(Math.round(fraction * 10_000) / 100).replace('.', ',');

/** What each level brings, from the balance constants (never hard-coded in the text). */
const EFFECTS: Record<UpgradeId, string> = {
  blade: strings.sanctuary.upgrades.blade.effect(percent(BALANCE.upgrades.blade.damageGrowth - 1)),
  foxfire: strings.sanctuary.upgrades.foxfire.effect(
    percent(BALANCE.upgrades.foxfire.burnPerLevel),
  ),
  bell: strings.sanctuary.upgrades.bell.effect(percent(BALANCE.upgrades.bell.soulsPerLevel)),
  kekkai: strings.sanctuary.upgrades.kekkai.effect(
    percent(BALANCE.upgrades.kekkai.cooldownPerLevel),
  ),
  lanterns: strings.sanctuary.upgrades.lanterns.effect(
    String(BALANCE.upgrades.lanterns.offlineHoursPerLevel),
  ),
};

const MODES = [
  { value: 1, label: strings.sanctuary.modes.one },
  { value: 10, label: strings.sanctuary.modes.ten },
  { value: 'max', label: strings.sanctuary.modes.max },
] as const;

/** The Sanctuary's upgrades, paid in souls, ×1, ×10 or as many as possible. */
export function SoulsShop() {
  const game = useGame((store) => store.game);
  const store = useGameStore();
  const [mode, setMode] = useState<PurchaseMode>(1);
  return (
    <>
      <Card style={styles.souls}>
        <Icon parts={SOULS_ICON} size={28} />
        <View style={styles.soulsText}>
          <Text style={[bodyText('sm', 800), styles.muted]}>{strings.sanctuary.souls}</Text>
          <Text style={displayText('2xl')} testID="sanctuary-souls">
            {formatNumber(game.souls)}
          </Text>
        </View>
        <Text style={bodyText('md', 800)}>
          {strings.sanctuary.perSecond(formatNumber(soulsPerSecond(game)))}
        </Text>
      </Card>
      <Segmented
        accessibilityLabel={strings.sanctuary.quantity}
        options={MODES}
        value={mode}
        onChange={setMode}
      />
      {upgradeViews(game, mode).map((view) => (
        <UpgradeRow
          key={view.id}
          view={view}
          effect={EFFECTS[view.id]}
          onBuy={(upgrade) => store.getState().buyUpgrade(upgrade, mode)}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  souls: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[3] },
  soulsText: { flex: 1 },
  muted: { color: colors.muted },
});
