import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Card } from './Card';
import { Chip } from './Chip';
import { Pill } from './Pill';
import { ProgressBar } from './ProgressBar';
import { RarityBadge } from './RarityBadge';
import { colors, rarityColors } from './tokens';

describe('Card', () => {
  it('frames its content on paper with an ink outline', async () => {
    await render(
      <Card testID="card">
        <Text>Contenu</Text>
      </Card>,
    );
    expect(screen.getByText('Contenu')).toBeOnTheScreen();
    expect(screen.getByTestId('card')).toHaveStyle({
      backgroundColor: colors.paper,
      borderWidth: 3,
    });
  });
});

describe('Pill', () => {
  it('shows a value and speaks its full label', async () => {
    await render(<Pill value="1,28 M" accessibilityLabel="Âmes : 1,28 M" />);
    expect(screen.getByLabelText('Âmes : 1,28 M')).toBeOnTheScreen();
    expect(screen.getByText('1,28 M')).toBeOnTheScreen();
  });
});

describe('ProgressBar', () => {
  it('fills to its value and reports it as a percentage', async () => {
    await render(
      <ProgressBar value={0.62} color={colors.red} accessibilityLabel="PV" testID="hp" />,
    );
    expect(screen.getByRole('progressbar', { name: 'PV' })).toHaveAccessibilityValue({ now: 62 });
    expect(screen.getByTestId('hp-fill')).toHaveStyle({ width: '62%' });
  });

  it.each([
    [-1, 0],
    [7, 100],
    [Number.NaN, 0],
  ])('clamps %p to %p %%', async (value, percent) => {
    await render(<ProgressBar value={value} color={colors.red} accessibilityLabel="PV" />);
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: percent });
  });
});

describe('Chip and RarityBadge', () => {
  it('shows a trait and its effect', async () => {
    await render(<Chip label="Cornes" detail="+20 % attaque" />);
    expect(screen.getByText('+20 % attaque')).toBeOnTheScreen();
  });

  it('never tells the rarity by color alone', async () => {
    await render(<RarityBadge rarity="legendaire" label="Légendaire" />);
    expect(screen.getByText('Légendaire')).toBeOnTheScreen();
    expect(screen.getByTestId('rarity-dot')).toHaveStyle({
      backgroundColor: rarityColors.legendaire,
    });
  });
});
