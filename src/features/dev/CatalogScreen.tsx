import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { strings } from '@/i18n';
import {
  Button,
  Card,
  Chip,
  colors,
  displayText,
  OutlinedText,
  Pill,
  ProgressBar,
  RarityBadge,
  Segmented,
  spacing,
  TabBar,
} from '@/ui';

const TABS = [
  { key: 'combat', label: 'Combat' },
  { key: 'shikigami', label: 'Shikigami' },
  { key: 'sanctuary', label: 'Sanctuaire' },
  { key: 'festival', label: 'Festival' },
] as const;

type Quantity = 1 | 10 | 'max';

/** Development screen: every base component of the design system (#30). */
export function CatalogScreen() {
  const text = strings.catalog;
  const [quantity, setQuantity] = useState<Quantity>(1);
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('combat');
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={displayText('3xl')}>{text.title}</Text>
        <Card style={styles.section}>
          <Text style={displayText('lg')}>{text.buttons}</Text>
          <Button label={text.primary} onPress={() => undefined} />
          <Button label={text.danger} variant="danger" onPress={() => undefined} />
          <Button label={text.neutral} variant="neutral" onPress={() => undefined} />
          <Button label={text.disabled} disabled onPress={() => undefined} />
          <Button label={text.large} size="large" onPress={() => undefined} />
        </Card>
        <Card large style={styles.section}>
          <Text style={displayText('lg')}>{text.displays}</Text>
          <Pill value={text.soulsValue} accessibilityLabel={text.soulsLabel} />
          <ProgressBar
            value={0.62}
            color={colors.red}
            trackColor={colors.hpTrack}
            accessibilityLabel={text.hpLabel}
          />
          <Chip label={text.trait} detail={text.traitEffect} />
          <RarityBadge rarity="legendaire" label={text.rarity} />
          <Segmented
            accessibilityLabel={text.quantity}
            value={quantity}
            onChange={setQuantity}
            options={[
              { value: 1, label: '×1' },
              { value: 10, label: '×10' },
              { value: 'max', label: 'Max' },
            ]}
          />
          <View style={styles.sky}>
            <OutlinedText style={displayText('4xl')}>{text.title2}</OutlinedText>
          </View>
        </Card>
      </ScrollView>
      <TabBar tabs={TABS} active={tab} onSelect={setTab} accessibilityLabel={text.navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { gap: spacing[4], padding: spacing[4], paddingTop: spacing[6] * 2 },
  section: { gap: spacing[3], padding: spacing[4] },
  sky: { alignItems: 'center', padding: spacing[3], backgroundColor: colors.sky },
});
