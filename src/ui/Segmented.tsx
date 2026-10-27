import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useHaptics } from './haptics';
import { bodyText, outline } from './styles';
import { colors, radii, spacing, strokes, touchTarget } from './tokens';

export interface SegmentedOption<V> {
  readonly value: V;
  readonly label: string;
}

export interface SegmentedProps<V> {
  readonly options: readonly SegmentedOption<V>[];
  readonly value: V;
  readonly onChange: (value: V) => void;
  readonly accessibilityLabel: string;
}

/** ×1 / ×10 / Max. */
export function Segmented<V extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedProps<V>) {
  const haptics = useHaptics();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={styles.group}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: selected }}
            onPress={() => {
              haptics('selection');
              onChange(option.value);
            }}
            style={[styles.option, selected && styles.selected]}
            testID={`segment-${option.value}`}
          >
            <Text style={bodyText('base', 800)}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    gap: spacing[1],
    padding: spacing[1],
    borderRadius: radii.button + spacing[1],
    backgroundColor: colors.paper,
    ...outline('control'),
  },
  option: {
    flex: 1,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.button,
    borderWidth: strokes.small,
    borderColor: 'transparent',
  },
  selected: { backgroundColor: colors.sky, ...outline('small') },
});
