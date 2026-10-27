import { StyleSheet, Text, View } from 'react-native';

import { bodyText, displayText, outline } from './styles';
import { colors, spacing } from './tokens';

export interface ChipProps {
  readonly label: string;
  /** Emphasized part: « +20 % attaque ». */
  readonly detail?: string;
}

/** A trait of a yōkai: « Cornes · +20 % attaque ». */
export function Chip({ label, detail }: ChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={bodyText('md', 800)}>
        {label}
        {detail === undefined ? null : (
          <>
            {' · '}
            <Text style={displayText('md')}>{detail}</Text>
          </>
        )}
      </Text>
    </View>
  );
}

const CHIP_HEIGHT = 30;

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    minHeight: CHIP_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    borderRadius: CHIP_HEIGHT / 2,
    backgroundColor: colors.cream,
    ...outline('small'),
  },
});
