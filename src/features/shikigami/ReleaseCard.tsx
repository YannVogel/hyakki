import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { formatNumber, type Rarity } from '@/engine';
import { strings } from '@/i18n';
import type { ReleaseView } from '@/state';
import {
  bodyText,
  Button,
  Card,
  colors,
  ConfirmDialog,
  displayText,
  Segmented,
  spacing,
} from '@/ui';

const text = strings.shikigami.bulk;

const RARITIES = (['common', 'rare', 'epic', 'legendary'] as const).map((rarity) => ({
  value: rarity,
  label: text.rarities[rarity],
}));

export interface ReleaseCardProps {
  readonly views: Readonly<Record<Rarity, ReleaseView>>;
  readonly onRelease: (seeds: readonly number[]) => void;
}

/** Releases, in one gesture and after a confirmation, every shikigami of a rarity outside the team. */
export function ReleaseCard({ views, onRelease }: ReleaseCardProps) {
  const [rarity, setRarity] = useState<Rarity>('common');
  const [confirming, setConfirming] = useState(false);
  const view = views[rarity];
  const count = view.seeds.length;
  const souls = formatNumber(view.souls);
  return (
    <Card style={styles.card}>
      <Text style={displayText('base')}>{text.title}</Text>
      <Text style={[bodyText('sm', 700), styles.muted]}>{text.hint}</Text>
      <Segmented
        accessibilityLabel={text.rarity}
        options={RARITIES}
        value={rarity}
        onChange={setRarity}
      />
      <Button
        label={count === 0 ? text.none : text.release(count, souls)}
        accessibilityLabel={
          count === 0 ? text.none : text.releaseLabel(text.rarities[rarity], count, souls)
        }
        variant="neutral"
        disabled={count === 0}
        onPress={() => setConfirming(true)}
        testID="bulk-release"
      />
      <ConfirmDialog
        visible={confirming}
        title={text.confirmTitle(count)}
        body={text.confirmBody(souls)}
        confirmLabel={text.confirm}
        cancelLabel={strings.shikigami.releaseCancel}
        onConfirm={() => {
          setConfirming(false);
          onRelease(view.seeds);
        }}
        onCancel={() => setConfirming(false)}
        testID="bulk-release-confirm"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[3], padding: spacing[3] },
  muted: { color: colors.muted },
});
