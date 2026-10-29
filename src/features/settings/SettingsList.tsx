import { StyleSheet, Switch, Text, View } from 'react-native';

import { strings } from '@/i18n';
import { type ToggleSetting, useSettings, type VolumeSetting } from '@/state';
import { bodyText, Card, colors, displayText, Slider, spacing, useHaptics, useSound } from '@/ui';

/** Each audio switch comes with its own volume. */
const VOLUMES: Partial<Record<ToggleSetting, VolumeSetting>> = {
  sound: 'soundVolume',
  music: 'musicVolume',
};
const ROWS: readonly ToggleSetting[] = [
  'sound',
  'music',
  'haptics',
  'notifications',
  'reduceMotion',
];

function VolumeSlider({
  setting,
  label,
  on,
}: {
  setting: VolumeSetting;
  label: string;
  on: boolean;
}) {
  const value = useSettings((store) => store.settings[setting]);
  const change = useSettings((store) => store.change);
  return (
    <Slider
      value={value}
      onChange={(next) => change(setting, next)}
      accessibilityLabel={strings.settings.volume(label)}
      disabled={!on}
      testID={`setting-${setting}`}
    />
  );
}

function SettingRow({ setting }: { setting: ToggleSetting }) {
  const value = useSettings((store) => store.settings[setting]);
  const change = useSettings((store) => store.change);
  const haptics = useHaptics();
  const play = useSound();
  const text = strings.settings[setting];
  const volume = VOLUMES[setting];
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={displayText('md')}>{text.label}</Text>
          <Text style={[bodyText('sm', 700), styles.muted]}>{text.description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={(next) => {
            change(setting, next);
            haptics('selection');
            play('ui');
          }}
          accessibilityLabel={text.label}
          accessibilityHint={text.description}
          trackColor={{ false: colors.disabled, true: colors.grassDeep }}
          thumbColor={colors.paper}
          ios_backgroundColor={colors.disabled}
          testID={`setting-${setting}`}
        />
      </View>
      {volume === undefined ? null : (
        <VolumeSlider setting={volume} label={text.label} on={value} />
      )}
    </Card>
  );
}

/** The player's preferences: sounds, music, vibrations, notifications, reduced motion. */
export function SettingsList() {
  return (
    <>
      {ROWS.map((setting) => (
        <SettingRow key={setting} setting={setting} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[1], padding: spacing[3] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  rowText: { flex: 1, gap: spacing[1] },
  muted: { color: colors.muted },
});
