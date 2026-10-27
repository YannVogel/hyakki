import { router } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '@/i18n';
import { type SettingKey, useSettings } from '@/state';
import { bodyText, Button, Card, colors, displayText, spacing, useHaptics } from '@/ui';

const ROWS: readonly SettingKey[] = ['haptics', 'notifications', 'reduceMotion'];

function SettingRow({ setting }: { setting: SettingKey }) {
  const value = useSettings((store) => store.settings[setting]);
  const change = useSettings((store) => store.change);
  const haptics = useHaptics();
  const text = strings.settings[setting];
  return (
    <Card style={styles.row}>
      <View style={styles.rowText}>
        <Text style={displayText('md')}>{text.label}</Text>
        <Text style={[bodyText('sm', 700), styles.muted]}>{text.description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(next) => {
          change(setting, next);
          haptics('selection');
        }}
        accessibilityLabel={text.label}
        accessibilityHint={text.description}
        trackColor={{ false: colors.disabled, true: colors.grassDeep }}
        thumbColor={colors.paper}
        ios_backgroundColor={colors.disabled}
        testID={`setting-${setting}`}
      />
    </Card>
  );
}

/** The player's preferences: vibrations, notifications, reduced motion. */
export function SettingsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Button
          label={strings.settings.back}
          variant="neutral"
          onPress={() => router.back()}
          testID="settings-back"
        />
        <Text style={displayText('3xl')}>{strings.settings.title}</Text>
        {ROWS.map((setting) => (
          <SettingRow key={setting} setting={setting} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { gap: spacing[3], padding: spacing[4] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[3] },
  rowText: { flex: 1, gap: spacing[1] },
  muted: { color: colors.muted },
});
