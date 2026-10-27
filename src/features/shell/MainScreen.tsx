import { type ReactNode, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/i18n';
import { Card, colors, displayText, Icon, spacing, type Tab, TabBar } from '@/ui';

import { CombatScreen } from '../combat/CombatScreen';
import { SanctuaryScreen } from '../sanctuary/SanctuaryScreen';
import { TAB_ICONS } from '../shared/icons';

export type MainTab = 'combat' | 'shikigami' | 'sanctuary' | 'festival';

const TABS: readonly Tab<MainTab>[] = (
  ['combat', 'shikigami', 'sanctuary', 'festival'] as const
).map((key) => ({
  key,
  label: strings.tabs[key],
  icon: (color: string) => <Icon parts={TAB_ICONS[key](color)} />,
}));

// Screens still to come in this milestone show their title until they exist.
function Upcoming({ title }: { title: string }) {
  return (
    <View style={styles.upcoming}>
      <Card style={styles.card}>
        <Text style={displayText('2xl')}>{title}</Text>
      </Card>
    </View>
  );
}

const SCREENS: Record<MainTab, () => ReactNode> = {
  combat: () => <CombatScreen />,
  shikigami: () => <Upcoming title={strings.tabs.shikigami} />,
  sanctuary: () => <SanctuaryScreen />,
  festival: () => <Upcoming title={strings.tabs.festival} />,
};

/** The four tabs of the game: Combat, Shikigami, Sanctuaire, Festival. */
export function MainScreen({ initialTab = 'combat' }: { initialTab?: MainTab }) {
  const [tab, setTab] = useState<MainTab>(initialTab);
  return (
    <View style={styles.screen}>
      <View style={styles.content}>{SCREENS[tab]()}</View>
      <TabBar
        tabs={TABS}
        active={tab}
        onSelect={setTab}
        accessibilityLabel={strings.tabs.navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { flex: 1 },
  upcoming: { flex: 1, justifyContent: 'center', padding: spacing[4] },
  card: { padding: spacing[5], alignItems: 'center' },
});
