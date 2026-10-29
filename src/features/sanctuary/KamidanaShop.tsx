import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { formatNumber, kamidanaRefund } from '@/engine';
import { strings } from '@/i18n';
import { kamidanaViews, useGame, useGameStore } from '@/state';
import { bodyText, Button, Card, colors, displayText, spacing } from '@/ui';

import { OfudaIcon } from '../shared/OfudaIcon';
import { KAMIDANA_SECTIONS } from './kamidanaCatalog';
import { KamidanaRow } from './KamidanaRow';

/** The Kamidana: blessings paid in ofuda, kept for life, all taken back in one gesture. */
export function KamidanaShop() {
  const game = useGame((store) => store.game);
  const store = useGameStore();
  const [confirming, setConfirming] = useState(false);
  const text = strings.kamidana;
  const views = kamidanaViews(game);
  const refund = formatNumber(kamidanaRefund(game));
  const nothingPlaced = views.every((view) => view.level === 0);

  const takeBack = () => {
    setConfirming(false);
    store.getState().refundKamidana();
  };

  return (
    <>
      <Card style={styles.stock}>
        <OfudaIcon size={40} />
        <View style={styles.stockText}>
          <Text style={[bodyText('sm', 800), styles.muted]}>{text.ofuda}</Text>
          <Text style={displayText('2xl')} testID="kamidana-ofuda">
            {formatNumber(game.ofuda)}
          </Text>
          <Text style={[bodyText('sm', 800), styles.muted]}>{text.kept}</Text>
        </View>
      </Card>
      {game.ofuda === 0 && nothingPlaced ? (
        <Text style={bodyText('base', 700)} testID="kamidana-empty">
          {text.empty}
        </Text>
      ) : null}
      {KAMIDANA_SECTIONS.map((section) => (
        <View key={section.key} style={styles.section}>
          <Text style={displayText('xl')} accessibilityRole="header">
            {text.sections[section.key]}
          </Text>
          {views
            .filter((view) => section.upgrades.includes(view.id))
            .map((view) => (
              <KamidanaRow
                key={view.id}
                view={view}
                onBuy={(upgrade) => store.getState().buyKamidana(upgrade)}
              />
            ))}
        </View>
      ))}
      <Button
        label={text.refund}
        accessibilityLabel={text.refundLabel(refund)}
        variant="neutral"
        disabled={nothingPlaced}
        onPress={() => setConfirming(true)}
        testID="kamidana-refund"
      />
      <Modal
        visible={confirming}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirming(false)}
      >
        <View style={styles.dialogBackdrop}>
          <Card large style={styles.dialog} testID="kamidana-refund-confirm">
            <Text style={displayText('2xl')}>{text.refundTitle}</Text>
            <Text style={bodyText('base', 700)}>{text.refundBody(refund)}</Text>
            <Button
              label={text.refundConfirm}
              variant="danger"
              onPress={takeBack}
              sound="purchase"
              testID="kamidana-refund-yes"
            />
            <Button
              label={text.refundCancel}
              variant="neutral"
              onPress={() => setConfirming(false)}
              testID="kamidana-refund-no"
            />
          </Card>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  stock: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[3] },
  stockText: { flex: 1 },
  muted: { color: colors.muted },
  section: { gap: spacing[3] },
  dialogBackdrop: { flex: 1, justifyContent: 'center', padding: spacing[5] },
  dialog: { gap: spacing[3], padding: spacing[5] },
});
