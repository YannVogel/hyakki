import { render, screen } from '@testing-library/react-native';

import { strings } from '@/i18n';
import { colors } from '@/ui';

import { GuardianArt, guardianName } from './GuardianArt';
import { GUARDIAN_IMAGES } from './images';

const SIZE = { width: 120, height: 120 };

describe('guardianName', () => {
  it('names a guardian of the first level as itself, awakened beyond', () => {
    expect(guardianName(1, 0)).toBe(strings.guardians.names[1]);
    expect(guardianName(1, 2)).toBe(strings.guardians.awakened(strings.guardians.names[1]));
  });
});

describe('GuardianArt', () => {
  it('draws the guardian alone when it is not awakened', async () => {
    await render(<GuardianArt index={4} awakened={false} style={SIZE} testID="art" />);
    expect(screen.getByTestId('art')).toHaveProp('source', GUARDIAN_IMAGES[4]);
    expect(screen.queryByTestId('guardian-aura')).toBeNull();
  });

  it('surrounds an awakened guardian with its silhouette, tinted and enlarged', async () => {
    await render(<GuardianArt index={4} awakened style={SIZE} testID="art" />);
    const layers = screen.getAllByTestId('guardian-aura');
    expect(layers.length).toBeGreaterThan(0);
    for (const layer of layers) {
      expect(layer).toHaveProp('source', GUARDIAN_IMAGES[4]);
      expect(layer).toHaveProp('tintColor', colors.purple);
      expect(layer).toHaveProp('accessible', false);
    }
  });

  it('passes the label and the tint to the art itself', async () => {
    await render(
      <GuardianArt
        index={0}
        awakened
        style={SIZE}
        tintColor={colors.ink}
        accessibilityLabel="Silhouette"
      />,
    );
    expect(screen.getByLabelText('Silhouette')).toHaveProp('tintColor', colors.ink);
  });
});
