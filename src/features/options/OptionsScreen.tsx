import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '@/i18n';
import { colors, displayText, Segmented, spacing } from '@/ui';

import { SettingsList } from '../settings/SettingsList';
import { RulesList } from './RulesList';

type Page = 'settings' | 'rules';

const PAGES = [
  { value: 'settings', label: strings.options.settings },
  { value: 'rules', label: strings.options.rules },
] as const;

/** The Options tab: the player's settings, and the rules of the game. */
export function OptionsScreen() {
  const [page, setPage] = useState<Page>('settings');
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={displayText('3xl')} accessibilityRole="header" testID="options-title">
          {page === 'settings' ? strings.settings.title : strings.rules.title}
        </Text>
        <Segmented
          accessibilityLabel={strings.options.label}
          options={PAGES}
          value={page}
          onChange={setPage}
        />
        {page === 'settings' ? <SettingsList /> : <RulesList />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { gap: spacing[3], padding: spacing[4] },
});
