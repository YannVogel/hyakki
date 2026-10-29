import { fireEvent, screen } from '@testing-library/react-native';

import { createNewGame, type GameState, KAMIDANA_IDS } from '@/engine';
import { strings } from '@/i18n';

import { renderScreen } from '../testing/renderScreen';
import { kamidanaValue } from './kamidanaCatalog';
import { SanctuaryScreen } from './SanctuaryScreen';

const text = strings.kamidana;

const withOfuda = (ofuda: number, kamidana: Partial<GameState['kamidana']> = {}): GameState => ({
  ...createNewGame(1),
  ofuda,
  kamidana: { ...createNewGame(1).kamidana, ...kamidana },
});

async function openKamidana(game: GameState) {
  const rendered = await renderScreen(<SanctuaryScreen />, game);
  await fireEvent.press(screen.getByRole('radio', { name: strings.shops.kamidana }));
  return rendered;
}

describe('Kamidana', () => {
  it('opens from the Sanctuary and lists the twelve blessings in three sections', async () => {
    await openKamidana(withOfuda(0));
    expect(screen.getByText(text.subtitle)).toBeOnTheScreen();
    for (const section of Object.values(text.sections)) {
      expect(screen.getByRole('header', { name: section })).toBeOnTheScreen();
    }
    for (const id of KAMIDANA_IDS) {
      expect(screen.getByText(text.upgrades[id].name)).toBeOnTheScreen();
    }
    expect(screen.queryByTestId('upgrade-blade')).toBeNull();
  });

  it('explains how to earn ofuda when there are none', async () => {
    await openKamidana(withOfuda(0));
    expect(screen.getByTestId('kamidana-empty')).toHaveTextContent(text.empty);
    expect(screen.getByTestId('buy-kamidana-blessing')).toBeDisabled();
    expect(screen.getByTestId('kamidana-refund')).toBeDisabled();
  });

  it('places an ofuda: the cost leaves the stock and the level rises', async () => {
    const { store } = await openKamidana(withOfuda(45));
    expect(screen.getByTestId('kamidana-blessing-value')).toHaveTextContent('×1 → ×1,5');
    await fireEvent.press(screen.getByTestId('buy-kamidana-blessing'));
    expect(store.getState().game.kamidana.blessing).toBe(1);
    expect(screen.getByTestId('kamidana-ofuda')).toHaveTextContent('15');
    expect(screen.getByTestId('kamidana-blessing-level')).toHaveTextContent(text.level(1, 10));
    expect(screen.getByTestId('kamidana-blessing-value')).toHaveTextContent('×1,5 → ×2,25');
  });

  it('disables a blessing the ofuda cannot pay, or at its maximum', async () => {
    await openKamidana(withOfuda(35, { hourglass: 4 }));
    expect(screen.getByTestId('buy-kamidana-blessing')).not.toBeDisabled();
    expect(screen.getByTestId('buy-kamidana-headStart')).toBeDisabled();
    expect(screen.getByLabelText(text.maxedLabel(text.upgrades.hourglass.name))).toBeDisabled();
    expect(screen.getByTestId('kamidana-hourglass-value')).toHaveTextContent('50 s');
  });

  it('takes every ofuda back after a confirmation', async () => {
    const { store } = await openKamidana(withOfuda(5, { blessing: 2, vigil: 1 }));
    await fireEvent.press(screen.getByTestId('kamidana-refund'));
    expect(screen.getByText(text.refundBody('120'))).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('kamidana-refund-yes'));
    expect(store.getState().game.ofuda).toBe(125);
    expect(store.getState().game.kamidana.blessing).toBe(0);
    expect(store.getState().game.kamidana.vigil).toBe(0);
  });

  it('keeps everything when the refund is cancelled', async () => {
    const { store } = await openKamidana(withOfuda(5, { blessing: 2 }));
    await fireEvent.press(screen.getByTestId('kamidana-refund'));
    await fireEvent.press(screen.getByTestId('kamidana-refund-no'));
    expect(store.getState().game.ofuda).toBe(5);
    expect(store.getState().game.kamidana.blessing).toBe(2);
  });

  it('reads each blessing out: name, level, effect and price', async () => {
    await openKamidana(withOfuda(3));
    expect(
      screen.getByLabelText(text.notEnough(text.upgrades.blessing.name, '30')),
    ).toBeOnTheScreen();
  });
});

describe('kamidanaValue', () => {
  it('writes each kind of value the French way', () => {
    expect(kamidanaValue('blessing', 2.25)).toBe('×2,25');
    expect(kamidanaValue('hourglass', 40)).toBe('40 s');
    expect(kamidanaValue('headStart', 26)).toBe('vague 26');
    expect(kamidanaValue('festivalFlame', 1.5)).toBe('+50 %');
    expect(kamidanaValue('vigil', 0.7)).toBe('70 %');
  });
});
