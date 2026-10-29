import { Image } from 'react-native';

import { OFUDA_IMAGE } from './images';

/** The ofuda illustration, decorative: the value next to it carries the spoken label. */
export function OfudaIcon({ size }: { size: number }) {
  return (
    <Image
      source={OFUDA_IMAGE.source}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      style={{ width: size, height: size }}
      testID="ofuda-icon"
    />
  );
}
