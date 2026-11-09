import {
  Image,
  type ImageProps,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { strings } from '@/i18n';
import { colors } from '@/ui';

import { GUARDIAN_IMAGES } from './images';

/** A guardian's name, « éveillé » once the parade has started over (awakening above 0). */
export function guardianName(index: number, awakening: number): string {
  const name = strings.guardians.names[index];
  return awakening > 0 ? strings.guardians.awakened(name) : name;
}

// The aura: the guardian's silhouette, tinted and enlarged, a wide faint layer under a close one.
const AURA_LAYERS = [
  { scale: 1.14, opacity: 0.35 },
  { scale: 1.07, opacity: 0.85 },
] as const;

export type GuardianArtProps = Omit<ImageProps, 'source' | 'resizeMode' | 'style'> & {
  readonly index: number;
  /** An awakened guardian keeps the art of its normal self, surrounded by an aura (#132). */
  readonly awakened: boolean;
  /** Box of the art: the aura is drawn in the same box. */
  readonly style: StyleProp<ViewStyle>;
};

/** The illustration of a guardian; image props (label, tint, testID) go to the art itself. */
export function GuardianArt({ index, awakened, style, ...imageProps }: GuardianArtProps) {
  const source = GUARDIAN_IMAGES[index];
  return (
    <View style={style}>
      {awakened
        ? AURA_LAYERS.map((layer) => (
            <Image
              key={layer.scale}
              source={source}
              resizeMode="contain"
              tintColor={colors.purple}
              accessible={false}
              style={[styles.fill, { opacity: layer.opacity, transform: [{ scale: layer.scale }] }]}
              testID="guardian-aura"
            />
          ))
        : null}
      {/*
        A new image when the tint changes: on iOS, an image that loses its tint keeps drawing a
        template, in the system blue (the silhouette of a guardian that becomes known).
      */}
      <Image
        key={String(imageProps.tintColor)}
        {...imageProps}
        source={source}
        resizeMode="contain"
        style={styles.fill}
      />
    </View>
  );
}

// Sized in percent: on iOS, an image held by its four edges alone took its own size.
const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' },
});
