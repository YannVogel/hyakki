import * as Haptics from 'expo-haptics';

import type { HapticKind } from '@/ui/haptics';

const IMPACTS: Record<Exclude<HapticKind, 'selection' | 'success'>, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
};

/** Plays a haptic; a device without haptics (or a failure) never disturbs the game. */
export function playHaptic(kind: HapticKind): void {
  const feedback =
    kind === 'selection'
      ? Haptics.selectionAsync()
      : kind === 'success'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : Haptics.impactAsync(IMPACTS[kind]);
  feedback.catch(() => undefined);
}
