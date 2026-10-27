import { Canvas, Circle } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMMKVNumber } from 'react-native-mmkv';
import { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { strings } from '@/i18n';
import { storage } from '@/services/storage';
import { fontFamily } from '@/ui/fonts';

// Temporary design values until the design system tokens exist (#29).
import tokens from '../../../design/tokens.json';

const COUNTER_KEY = 'nativeCheck.counter';
const CANVAS_SIZE = 200;
const MIN_RADIUS = 40;
const MAX_RADIUS = 80;
const PULSE_MS = 900;

// Temporary screen proving Skia, Reanimated and MMKV run in the development build (#13).
export function NativeCheckScreen() {
  const [count = 0, setCount] = useMMKVNumber(COUNTER_KEY, storage);
  const radius = useSharedValue(MIN_RADIUS);

  useEffect(() => {
    radius.value = withRepeat(
      withTiming(MAX_RADIUS, { duration: PULSE_MS, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [radius]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{strings.nativeCheck.title}</Text>
      <Text style={styles.body}>{strings.nativeCheck.description}</Text>
      <Canvas style={styles.canvas} testID="native-check-canvas">
        <Circle
          cx={CANVAS_SIZE / 2}
          cy={CANVAS_SIZE / 2}
          r={radius}
          color={tokens.color.red.$value}
        />
      </Canvas>
      <Text style={styles.body} testID="native-check-counter">
        {strings.nativeCheck.counter(count)}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setCount(count + 1)}
        style={styles.button}
        testID="native-check-increment"
      >
        <Text style={styles.body}>{strings.nativeCheck.increment}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: tokens.color.cream.$value,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    color: tokens.color.ink.$value,
  },
  body: {
    fontFamily: fontFamily.body700,
    fontSize: 16,
    color: tokens.color.ink.$value,
    textAlign: 'center',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: tokens.color.ink.$value,
    backgroundColor: tokens.color.yellow.$value,
  },
});
