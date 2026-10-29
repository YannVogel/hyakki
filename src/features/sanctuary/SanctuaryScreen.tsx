import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '@/i18n';
import { bodyText, colors, displayText, Segmented, spacing } from '@/ui';

import { HERO_POSES, heroPoseSize } from '../shared/images';
import { KamidanaShop } from './KamidanaShop';
import { SoulsShop } from './SoulsShop';

type Shop = 'souls' | 'kamidana';

const SHOPS = [
  { value: 'souls', label: strings.shops.souls },
  { value: 'kamidana', label: strings.shops.kamidana },
] as const;

const HERO_HEIGHT = 120;

/** Two shops: the Sanctuary (souls, reset at each Festival) and the Kamidana (ofuda, for life). */
export function SanctuaryScreen() {
  const [shop, setShop] = useState<Shop>('souls');
  const text = shop === 'souls' ? strings.sanctuary : strings.kamidana;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={displayText('3xl')}>{text.title}</Text>
            <Text style={bodyText('base', 700)}>{text.subtitle}</Text>
          </View>
          <Image
            source={HERO_POSES.barrier.source}
            accessibilityLabel={strings.sanctuary.heroLabel}
            style={heroPoseSize('barrier', HERO_HEIGHT)}
          />
        </View>
        <Segmented
          accessibilityLabel={strings.shops.label}
          options={SHOPS}
          value={shop}
          onChange={setShop}
        />
        {shop === 'souls' ? <SoulsShop /> : <KamidanaShop />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { gap: spacing[3], padding: spacing[4] },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing[2] },
  headerText: { flex: 1, gap: spacing[1] },
});
