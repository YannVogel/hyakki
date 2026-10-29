import { useState } from 'react';
import { type GestureResponderEvent, StyleSheet, View } from 'react-native';

import { outline } from './styles';
import { colors, touchTarget } from './tokens';

/** Screen-reader swipes and the arrow keys move the value by a tenth. */
export const SLIDER_STEP = 0.1;
const TRACK_HEIGHT = 12;
const THUMB = 28;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
/** Steps land on round tenths, whatever the rounding of the previous value. */
const stepped = (value: number) => clamp(Math.round(value * 10) / 10);

export interface SliderProps {
  /** From 0 to 1. */
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly accessibilityLabel: string;
  readonly disabled?: boolean;
  readonly testID?: string;
}

/** A value from 0 to 1, set by dragging or tapping along the track (volumes). */
export function Slider({
  value,
  onChange,
  accessibilityLabel,
  disabled = false,
  testID,
}: SliderProps) {
  const [width, setWidth] = useState(0);
  const ratio = clamp(value);
  const moveTo = (event: GestureResponderEvent) => {
    if (width > 0) {
      onChange(clamp(event.nativeEvent.locationX / width));
    }
  };
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(ratio * 100),
        text: `${Math.round(ratio * 100)} %`,
      }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={({ nativeEvent }) => {
        if (!disabled) {
          const delta = nativeEvent.actionName === 'increment' ? SLIDER_STEP : -SLIDER_STEP;
          onChange(stepped(ratio + delta));
        }
      }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => !disabled}
      onMoveShouldSetResponder={() => !disabled}
      // Inside a scroll view: a horizontal drag on the slider must not hand over to the scroll.
      onResponderTerminationRequest={() => false}
      onResponderGrant={moveTo}
      onResponderMove={moveTo}
      style={[styles.hitArea, disabled && styles.disabled]}
      testID={testID}
    >
      <View style={styles.track} pointerEvents="none">
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <View
        pointerEvents="none"
        style={[styles.thumb, { left: `${ratio * 100}%` }]}
        testID={testID === undefined ? undefined : `${testID}-thumb`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hitArea: { height: touchTarget, justifyContent: 'center', marginHorizontal: THUMB / 2 },
  disabled: { opacity: 0.45 },
  track: {
    height: TRACK_HEIGHT,
    overflow: 'hidden',
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.paper,
    ...outline('control'),
  },
  fill: { height: '100%', backgroundColor: colors.grassDeep },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    marginLeft: -THUMB / 2,
    borderRadius: THUMB / 2,
    backgroundColor: colors.yellow,
    ...outline('control'),
  },
});
