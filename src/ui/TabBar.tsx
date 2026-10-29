import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useHaptics } from './haptics';
import { useSound } from './sound';
import { bodyText, outline } from './styles';
import { colors, radii, spacing, strokes } from './tokens';

export interface Tab<K extends string> {
  readonly key: K;
  readonly label: string;
  readonly icon?: (color: string) => ReactNode;
}

export interface TabBarProps<K extends string> {
  readonly tabs: readonly Tab<K>[];
  readonly active: K;
  readonly onSelect: (key: K) => void;
  readonly accessibilityLabel: string;
}

const TAB_HEIGHT = 52;

/** Bottom navigation: the active tab is a yellow inked pill. */
export function TabBar<K extends string>({
  tabs,
  active,
  onSelect,
  accessibilityLabel,
}: TabBarProps<K>) {
  const haptics = useHaptics();
  const play = useSound();
  return (
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={styles.bar}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        const color = selected ? colors.ink : colors.muted;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) {
                haptics('selection');
                play('ui');
                onSelect(tab.key);
              }
            }}
            style={[styles.tab, selected && styles.selected]}
            testID={`tab-${tab.key}`}
          >
            {tab.icon?.(color)}
            <Text style={[bodyText('xs', 800), { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingTop: spacing[2],
    paddingBottom: spacing[5],
    backgroundColor: colors.paper,
    borderTopWidth: strokes.card,
    borderTopColor: colors.ink,
  },
  tab: {
    flex: 1,
    height: TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: radii.button,
    borderWidth: strokes.control,
    borderColor: 'transparent',
  },
  selected: { backgroundColor: colors.yellow, ...outline('control') },
});
