import { useEffect } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Element } from '@/engine';
import { strings } from '@/i18n';
import { CutInRays, GuardianEyes } from '@/render';
import {
  bodyText,
  Button,
  Card,
  colors,
  displayText,
  OutlinedText,
  outline,
  radii,
  spacing,
  strokes,
} from '@/ui';

import { GUARDIAN_IMAGES } from '../shared/images';

const SLIDE_MS = 500;
const NAME_DELAY_MS = 150;
const FADE_MS = 300;
const RAYS_TURN_MS = 60_000;
const TILT = '-6deg';
const OVERSHOOT = Easing.bezier(0.2, 0.9, 0.3, 1.3);
/** The guardian's kanji in the background: a decoration far beyond the type scale (mockup). */
const WATERMARK_SIZE = 190;

export interface GuardianCutInProps {
  readonly index: number;
  readonly name: string;
  readonly wave: number;
  readonly hp: string;
  readonly weakness: Element;
  readonly timeLimitSeconds: number;
  /** « Réduire les animations »: a short fade, nothing slides or turns. */
  readonly reduceMotion: boolean;
  readonly onEngage: () => void;
  readonly onFlee: () => void;
}

/** The entrance of a guardian: rays, eyes, name, then face it or run (about 1.5 s). */
export function GuardianCutIn({
  index,
  name,
  wave,
  hp,
  weakness,
  timeLimitSeconds,
  reduceMotion,
  onEngage,
  onFlee,
}: GuardianCutInProps) {
  const { width, height } = useWindowDimensions();
  const rotation = useSharedValue(0);
  const band = useSharedValue(reduceMotion ? 0 : -width);
  const banner = useSharedValue(reduceMotion ? 0 : width);
  const opacity = useSharedValue(0);
  const text = strings.guardians;
  const element = text.elements[weakness];

  useEffect(() => {
    opacity.value = withTiming(1, { duration: FADE_MS });
    if (reduceMotion) {
      return;
    }
    rotation.value = withRepeat(
      withTiming(Math.PI * 2, { duration: RAYS_TURN_MS, easing: Easing.linear }),
      -1,
    );
    band.value = withTiming(0, { duration: SLIDE_MS, easing: OVERSHOOT });
    banner.value = withDelay(
      NAME_DELAY_MS,
      withTiming(0, { duration: SLIDE_MS, easing: OVERSHOOT }),
    );
  }, [reduceMotion, rotation, band, banner, opacity]);

  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: band.value }, { rotate: TILT }],
  }));
  const bannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: banner.value }, { rotate: TILT }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} testID="guardian-cut-in">
      <CutInRays size={Math.max(width, height) * 1.6} rotation={rotation} />
      <Text style={[displayText('5xl'), styles.watermark]} accessible={false}>
        {text.kanji[index]}
      </Text>
      <SafeAreaView style={styles.content}>
        <OutlinedText style={displayText('base')}>{text.intro(wave)}</OutlinedText>
        <Animated.View
          style={[styles.band, { width: width + 70 }, bandStyle]}
          accessible
          accessibilityRole="image"
          accessibilityLabel={text.eyesLabel(name)}
        >
          <GuardianEyes width={width} />
        </Animated.View>
        <Animated.View style={[styles.banner, { width: width + 70 }, bannerStyle]}>
          <Text style={displayText('5xl')} testID="cut-in-name">
            {name}
          </Text>
          <Text style={bodyText('base', 800)}>{text.kana[index]}</Text>
        </Animated.View>
        <Image
          source={GUARDIAN_IMAGES[index]}
          accessibilityLabel={text.imageLabel(name, text.descriptions[index])}
          resizeMode="contain"
          style={styles.guardian}
        />
        <Card style={styles.card}>
          <Text style={[displayText('lg'), styles.center]}>{text.taglines[index]}</Text>
          <View style={styles.chips}>
            <Text style={[bodyText('md', 800), styles.chip, styles.hp]}>{text.hp(hp)}</Text>
            <Text style={[bodyText('md', 800), styles.chip, styles.weak]}>
              {text.weakness} <Text style={displayText('md')}>{element.kanji}</Text> {element.name}
            </Text>
            <Text style={[bodyText('md', 800), styles.chip, styles.timer]}>
              {text.timeLeft(timeLimitSeconds)}
            </Text>
          </View>
        </Card>
        <View style={styles.actions}>
          <Button label={text.engage} size="large" onPress={onEngage} testID="guardian-engage" />
          <Button
            label={text.flee(wave - 1)}
            variant="neutral"
            onPress={onFlee}
            testID="guardian-flee"
          />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  watermark: {
    position: 'absolute',
    left: -spacing[4],
    bottom: '22%',
    fontSize: WATERMARK_SIZE,
    lineHeight: WATERMARK_SIZE + 10,
    color: colors.paper,
    opacity: 0.22,
    transform: [{ rotate: TILT }],
  },
  content: { flex: 1, alignItems: 'center', gap: spacing[2], paddingVertical: spacing[4] },
  band: {
    marginTop: spacing[5],
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderColor: colors.ink,
  },
  banner: {
    paddingVertical: spacing[3],
    paddingHorizontal: 70,
    gap: 2,
    backgroundColor: colors.yellow,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderColor: colors.ink,
  },
  guardian: { height: 178, width: 178 },
  card: {
    alignSelf: 'stretch',
    marginHorizontal: spacing[5],
    padding: spacing[3],
    gap: spacing[3],
    alignItems: 'center',
  },
  center: { textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radii.button,
    overflow: 'hidden',
    ...outline('small'),
  },
  hp: { backgroundColor: colors.hpTrack },
  weak: { backgroundColor: colors.cream },
  timer: { backgroundColor: colors.skyLight, borderWidth: strokes.small },
  actions: {
    marginTop: 'auto',
    alignSelf: 'stretch',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
  },
});
