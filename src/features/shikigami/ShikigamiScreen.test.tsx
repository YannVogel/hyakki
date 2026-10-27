import { fireEvent, screen } from '@testing-library/react-native';

import { big, createNewGame, type GameState, generate, nameOf } from '@/engine';
import { strings } from '@/i18n';

import { renderScreen } from '../testing/renderScreen';
import { ShikigamiScreen } from './ShikigamiScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const owning = (seeds: number[], team: number[] = [], souls = 0): GameState => {
  const state = createNewGame(1);
  return {
    ...state,
    souls: big(souls),
    shikigami: seeds.map((seed) => ({ seed, level: 1, generatorVersion: 1 })),
    team,
    attackTimers: { hero: 0, team: team.map(() => 1000) },
  };
};

describe('ShikigamiScreen', () => {
  it('invites to capture yōkai when the collection is empty', async () => {
    await renderScreen(<ShikigamiScreen />, owning([]));
    expect(screen.getByText(strings.shikigami.empty)).toBeOnTheScreen();
    expect(screen.getAllByText(strings.shikigami.emptySlot)).toHaveLength(3);
  });

  it('lists the collection and opens the card of a shikigami', async () => {
    await renderScreen(<ShikigamiScreen />, owning([11, 22, 33]));
    expect(screen.getByText(strings.shikigami.count(3), { exact: false })).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('shikigami-22'));
    expect(screen.getByTestId('shikigami-sheet')).toBeOnTheScreen();
    expect(screen.getAllByText(nameOf(generate(22))).length).toBeGreaterThan(0);
    expect(screen.getByText(strings.shikigami.traits)).toBeOnTheScreen();
  });

  it('adds a shikigami to the team and removes it', async () => {
    const { store } = await renderScreen(<ShikigamiScreen />, owning([11, 22]));
    await fireEvent.press(screen.getByTestId('shikigami-22'));
    await fireEvent.press(screen.getByTestId('shikigami-team'));
    expect(store.getState().game.team).toEqual([22]);
    await fireEvent.press(screen.getByTestId('shikigami-team'));
    expect(store.getState().game.team).toEqual([]);
  });

  it('refuses a fourth team member', async () => {
    await renderScreen(<ShikigamiScreen />, owning([1, 2, 3, 4], [1, 2, 3]));
    await fireEvent.press(screen.getByTestId('shikigami-4'));
    expect(screen.getByTestId('shikigami-team')).toBeDisabled();
    expect(screen.getByText(strings.shikigami.teamFull)).toBeOnTheScreen();
  });

  it('levels a shikigami up for souls', async () => {
    const { store } = await renderScreen(<ShikigamiScreen />, owning([7], [], 500));
    await fireEvent.press(screen.getByTestId('shikigami-7'));
    await fireEvent.press(screen.getByTestId('shikigami-level-up'));
    expect(store.getState().game.shikigami[0].level).toBe(2);
  });

  it('cannot level up without enough souls', async () => {
    await renderScreen(<ShikigamiScreen />, owning([7]));
    await fireEvent.press(screen.getByTestId('shikigami-7'));
    expect(screen.getByTestId('shikigami-level-up')).toBeDisabled();
  });
});
