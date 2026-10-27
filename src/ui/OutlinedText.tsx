import { StyleSheet, Text, type TextStyle, View } from 'react-native';

import { colors } from './tokens';

// React Native cannot stroke text: the outline is the text drawn eight times around itself in ink,
// plus a deeper copy below for the hard shadow (docs/DESIGN_SYSTEM.md § 3).
const OUTLINE_OFFSETS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;

export interface OutlinedTextProps {
  readonly children: string;
  /** Font, size… of the text; its color stays white. */
  readonly style: TextStyle;
  /** Outline thickness in points (2 for titles, 3 for big figures). */
  readonly width?: number;
  readonly testID?: string;
}

/** White text with an ink outline and hard shadow, for titles on colored backgrounds. */
export function OutlinedText({ children, style, width = 2, testID }: OutlinedTextProps) {
  const copies = [...OUTLINE_OFFSETS.map(([x, y]) => [x * width, y * width]), [0, width * 2]];
  return (
    <View testID={testID}>
      {copies.map(([x, y], index) => (
        <Text
          key={index}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={[
            style,
            styles.copy,
            { color: colors.ink, transform: [{ translateX: x }, { translateY: y }] },
          ]}
        >
          {children}
        </Text>
      ))}
      <Text style={[style, { color: colors.paper }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { position: 'absolute', left: 0, top: 0 },
});
