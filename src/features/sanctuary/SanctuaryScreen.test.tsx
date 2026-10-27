import { fireEvent, screen } from '@testing-library/react-native';

import { big, createNewGame } from '@/engine';
import { strings } from '@/i18n';

import { renderScreen } from '../testing/renderScreen';
import { SanctuaryScreen } from './SanctuaryScreen';

const withSouls = (souls: number, sanctuary = {}) => ({
  ...createNewGame(1),
  souls: big(souls),
  sanctuary: { ...createNewGame(1).sanctuary, ...sanctuary },
});

describe('SanctuaryScreen', () => {
  it('lists the five upgrades with their level', async () => {
    await renderScreen(<SanctuaryScreen />, withSouls(0));
    for (const upgrade of Object.values(strings.sanctuary.upgrades)) {
      expect(screen.getByText(upgrade.name)).toBeOnTheScreen();
    }
    expect(screen.getAllByText(strings.sanctuary.level(0))).toHaveLength(5);
  });

  it('disables what the souls cannot pay', async () => {
    await renderScreen(<SanctuaryScreen />, withSouls(0));
    expect(screen.getByTestId('buy-blade')).toBeDisabled();
  });

  it('shows a purchase at once', async () => {
    const { store } = await renderScreen(<SanctuaryScreen />, withSouls(100));
    await fireEvent.press(screen.getByTestId('buy-blade'));
    expect(store.getState().game.sanctuary.blade).toBe(1);
    expect(screen.getByTestId('upgrade-blade-level')).toHaveTextContent(strings.sanctuary.level(1));
  });

  it('buys ten levels at once in ×10 mode', async () => {
    const { store } = await renderScreen(<SanctuaryScreen />, withSouls(1e6));
    await fireEvent.press(screen.getByRole('radio', { name: strings.sanctuary.modes.ten }));
    await fireEvent.press(screen.getByTestId('buy-blade'));
    expect(store.getState().game.sanctuary.blade).toBe(10);
  });

  it('shows maxed upgrades as such', async () => {
    await renderScreen(<SanctuaryScreen />, withSouls(1e6, { kekkai: 25 }));
    expect(
      screen.getByLabelText(strings.sanctuary.maxedLabel(strings.sanctuary.upgrades.kekkai.name)),
    ).toBeDisabled();
  });
});
