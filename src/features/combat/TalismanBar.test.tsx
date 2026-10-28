import { render, screen } from '@testing-library/react-native';

import { strings } from '@/i18n';
import type { TalismanView } from '@/state';

import { TalismanBar } from './TalismanBar';

const TALISMANS: TalismanView[] = [
  { id: 'kitsunebi', cooldownMs: 20_000, cooldownRatio: 1 },
  { id: 'raijin', cooldownMs: 10_000, cooldownRatio: 0.5 },
  { id: 'kekkai', cooldownMs: 0, cooldownRatio: 0 },
];

describe('TalismanBar', () => {
  it('veils a recharging talisman from the bottom, as high as the recharge left', async () => {
    await render(<TalismanBar talismans={TALISMANS} onCast={jest.fn()} />);
    expect(screen.getByTestId('talisman-kitsunebi-shade')).toHaveStyle({
      bottom: 0,
      height: '100%',
    });
    expect(screen.getByTestId('talisman-raijin-shade')).toHaveStyle({ bottom: 0, height: '50%' });
    expect(screen.queryByTestId('talisman-kekkai-shade')).toBeNull();
  });

  it('shows the seconds left on a recharging talisman only', async () => {
    await render(<TalismanBar talismans={TALISMANS} onCast={jest.fn()} />);
    expect(screen.getByText(strings.combat.seconds(20))).toBeOnTheScreen();
    expect(screen.getByText(strings.combat.seconds(10))).toBeOnTheScreen();
    expect(
      screen.getByLabelText(strings.combat.talismanReady(strings.talismans.kekkai.name)),
    ).toBeOnTheScreen();
  });
});
