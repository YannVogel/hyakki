import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { hardShadow, outline } from './styles';
import { colors, radii } from './tokens';

export interface CardProps {
  readonly children: ReactNode;
  readonly large?: boolean;
  readonly style?: ViewStyle;
  readonly testID?: string;
}

/** White panel with an ink outline and a hard shadow. */
export function Card({ children, large = false, style, testID }: CardProps) {
  return (
    <View
      testID={testID}
      style={[styles.card, { borderRadius: large ? radii.cardLarge : radii.card }, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, ...outline('card'), ...hardShadow('card') },
});
