import { type ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { strings } from '@/i18n';
import { useGame, useGameStore } from '@/state';
import { colors, Icon, type Tab, TabBar } from '@/ui';

import { CombatScreen } from '../combat/CombatScreen';
import { FestivalScreen } from '../festival/FestivalScreen';
import { OfflineReturnModal } from '../offline/OfflineReturnModal';
import { SanctuaryScreen } from '../sanctuary/SanctuaryScreen';
import { SettingsScreen } from '../settings/SettingsScreen';
import { ShikigamiScreen } from '../shikigami/ShikigamiScreen';
import { TAB_ICONS } from '../shared/icons';

export type MainTab = 'combat' | 'shikigami' | 'sanctuary' | 'festival' | 'options';

const TABS: readonly Tab<MainTab>[] = (
  ['combat', 'shikigami', 'sanctuary', 'festival', 'options'] as const
).map((key) => ({
  key,
  label: strings.tabs[key],
  icon: (color: string) => <Icon parts={TAB_ICONS[key](color)} />,
}));

const screens = (goTo: (tab: MainTab) => void): Record<MainTab, () => ReactNode> => ({
  combat: () => <CombatScreen />,
  shikigami: () => <ShikigamiScreen />,
  sanctuary: () => <SanctuaryScreen />,
  festival: () => <FestivalScreen onDone={() => goTo('combat')} />,
  options: () => <SettingsScreen />,
});

/** The five tabs of the game: Combat, Shikigami, Sanctuaire, Festival, Options. */
export function MainScreen({ initialTab = 'combat' }: { initialTab?: MainTab }) {
  const [tab, setTab] = useState<MainTab>(initialTab);
  const report = useGame((store) => store.offlineReport);
  const store = useGameStore();
  return (
    <View style={styles.screen}>
      {report === null ? null : (
        <OfflineReturnModal
          report={report}
          onCollect={() => store.getState().dismissOfflineReport()}
        />
      )}
      <View style={styles.content}>{screens(setTab)[tab]()}</View>
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
});
