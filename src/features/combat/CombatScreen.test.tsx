import { fireEvent, screen } from '@testing-library/react-native';

import { createNewGame, enemySeed, formatNumber, generate, nameOf } from '@/engine';
import { strings } from '@/i18n';

import { renderScreen } from '../testing/renderScreen';
import { CombatScreen } from './CombatScreen';

const renderWith = async (game = createNewGame(2026)) =>
  (await renderScreen(<CombatScreen />, game)).store;

const atGuardian = (farming: boolean) => {
  const state = createNewGame(5);
  const wave = farming ? 99 : 100;
  return {
    ...state,
    parade: { ...state.parade, wave, maxWave: 100, farming },
    enemy: {
      ...state.enemy,
      seed: enemySeed(5, wave),
      guardian: farming ? null : { engaged: false, timeLeftMs: 30_000 },
    },
  };
};

describe('CombatScreen', () => {
  it('shows the wave, the souls and the current yōkai', async () => {
    const game = createNewGame(2026);
    await renderWith(game);
    expect(screen.getByText(strings.combat.wave(1), { exact: false })).toBeOnTheScreen();
    expect(screen.getByLabelText(strings.combat.souls(formatNumber(game.souls)))).toBeOnTheScreen();
    expect(
      screen.getByText(nameOf(generate(game.enemy.seed, game.generatorVersion))),
    ).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: /Lancer/ })).toHaveLength(3);
  });

  it('turns a tap on the scene into an engine input', async () => {
    const store = await renderWith();
    await fireEvent(screen.getByTestId('battle-strike'), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    });
    expect(store.getState().pendingInputs).toEqual([{ type: 'tap' }]);
  });

  it('casts a talisman', async () => {
    const store = await renderWith();
    await fireEvent.press(screen.getByTestId('talisman-raijin'));
    expect(store.getState().pendingInputs).toEqual([{ type: 'castTalisman', talisman: 'raijin' }]);
  });

  it('asks the player to face or flee a waiting guardian', async () => {
    const store = await renderWith(atGuardian(false));
    expect(screen.getByTestId('guardian-cut-in')).toBeOnTheScreen();
    expect(screen.getByTestId('cut-in-name')).toHaveTextContent('Bake-danuki');
    // One line, shrunk if needed: a long name never breaks mid-word.
    expect(screen.getByTestId('cut-in-name')).toHaveProp('numberOfLines', 1);
    expect(screen.getByTestId('cut-in-name')).toHaveProp('adjustsFontSizeToFit', true);
    await fireEvent.press(screen.getByTestId('guardian-engage'));
    await fireEvent.press(screen.getByTestId('guardian-flee'));
    expect(store.getState().pendingInputs.map((input) => input.type)).toEqual([
      'engageGuardian',
      'fleeGuardian',
    ]);
  });

  it('offers to face the guardian again while farming', async () => {
    const store = await renderWith(atGuardian(true));
    await fireEvent.press(screen.getByTestId('guardian-challenge'));
    expect(store.getState().pendingInputs).toEqual([{ type: 'challengeGuardian' }]);
  });
});
