import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { displayText, hardShadow, outline } from './styles';
import { colors, spacing } from './tokens';

export interface PillProps {
  readonly icon?: ReactNode;
  readonly value: string;
  /** Full spoken text, e.g. « Âmes : 1,28 M ». */
  readonly accessibilityLabel: string;
  readonly testID?: string;
}

/** Short info such as a currency: icon and value in the display font. */
export function Pill({ icon, value, accessibilityLabel, testID }: PillProps) {
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={styles.pill}
    >
      {icon}
      <Text style={displayText('md')}>{value}</Text>
    </View>
  );
}

const PILL_HEIGHT = 34;

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    height: PILL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingLeft: spacing[2],
    paddingRight: spacing[3],
    borderRadius: PILL_HEIGHT / 2,
    backgroundColor: colors.paper,
    ...outline('control'),
    ...hardShadow('small'),
  },
});
