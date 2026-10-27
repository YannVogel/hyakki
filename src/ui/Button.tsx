import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useHaptics } from './haptics';
import { bodyText, displayText, hardShadow, outline } from './styles';
import { colors, radii, spacing, touchTarget } from './tokens';

export type ButtonVariant = 'primary' | 'danger' | 'neutral';

export interface ButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: ButtonVariant;
  /** Large: main call to action (58 pt, display font). */
  readonly size?: 'regular' | 'large';
  readonly disabled?: boolean;
  readonly icon?: ReactNode;
  /** Spoken instead of the label when it needs more context (« Acheter ×10 pour 1,2 M âmes »). */
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
  readonly testID?: string;
}

const BACKGROUNDS: Record<ButtonVariant, string> = {
  primary: colors.yellow,
  danger: colors.red,
  neutral: colors.paper,
};

/** Physical-looking button: it sinks by 3 pt and loses its shadow when pressed. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'regular',
  disabled = false,
  icon,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const haptics = useHaptics();
  const large = size === 'large';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        haptics('selection');
        onPress();
      }}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        large && styles.large,
        { backgroundColor: disabled ? colors.disabled : BACKGROUNDS[variant] },
        disabled || pressed ? styles.pressed : hardShadow('button'),
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Text
          style={[
            large ? displayText('xl') : bodyText('base', 800),
            variant === 'danger' && !disabled && styles.onDanger,
            disabled && styles.disabledText,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    minWidth: touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    borderRadius: radii.button,
    ...outline('control'),
  },
  large: { minHeight: touchTarget + spacing[3] + 2 },
  pressed: { transform: [{ translateY: 3 }] },
  disabled: { transform: [] },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  onDanger: { color: colors.paper },
  disabledText: { color: colors.muted },
});
