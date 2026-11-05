import { fireEvent, screen } from '@testing-library/react-native';

import {
  bestTeam,
  big,
  createNewGame,
  formatNumber,
  type GameState,
  generate,
  levelUpCost,
  maxLevelUps,
  nameOf,
  toNumber,
} from '@/engine';
import { RARITY_NAMES, strings } from '@/i18n';

import { bulkReleaseViews, collectionView } from '@/state';

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
    expect(screen.getAllByText(nameOf(generate(22, 1))).length).toBeGreaterThan(0);
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

  it('marks the team members in the grid, for the eye and for screen readers', async () => {
    await renderScreen(<ShikigamiScreen />, owning([11, 22], [22]));
    const label = (seed: number) =>
      strings.shikigami.tileLabel(
        nameOf(generate(seed, 1)),
        1,
        RARITY_NAMES[generate(seed, 1).rarity],
      );
    expect(screen.getByTestId('shikigami-22')).toHaveProp(
      'accessibilityLabel',
      strings.shikigami.inTeamLabel(label(22)),
    );
    expect(screen.getByTestId('shikigami-22-badge')).toHaveTextContent(
      strings.shikigami.inTeamBadge,
    );
    expect(screen.getByTestId('shikigami-11')).toHaveProp('accessibilityLabel', label(11));
    expect(screen.queryByTestId('shikigami-11-badge')).toBeNull();
  });

  it('follows the team changes without leaving the screen', async () => {
    await renderScreen(<ShikigamiScreen />, owning([11, 22]));
    await fireEvent.press(screen.getByTestId('shikigami-22'));
    await fireEvent.press(screen.getByTestId('shikigami-team'));
    expect(screen.getByTestId('shikigami-22-badge')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('shikigami-team'));
    expect(screen.queryByTestId('shikigami-22-badge')).toBeNull();
  });

  it('fields the best team in one tap, then has nothing left to improve', async () => {
    const game = owning([11, 22, 33, 44, 55], [11]);
    const { store } = await renderScreen(<ShikigamiScreen />, game);
    await fireEvent.press(screen.getByTestId('best-team'));
    const fielded = store.getState().game.team;
    expect([...fielded].sort()).toEqual([...bestTeam(game)].sort());
    expect(screen.getByTestId('best-team')).toBeDisabled();
  });

  it('offers no best team without a collection', async () => {
    await renderScreen(<ShikigamiScreen />, owning([]));
    expect(screen.getByTestId('best-team')).toBeDisabled();
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

  it('levels up ten at once in ×10 mode, and shows the price of the ten', async () => {
    const souls = 5000;
    const { store } = await renderScreen(<ShikigamiScreen />, owning([7], [], souls));
    await fireEvent.press(screen.getByTestId('shikigami-7'));
    await fireEvent.press(screen.getByRole('radio', { name: strings.shikigami.modes.ten }));
    const cost = formatNumber(levelUpCost(1, 10));
    expect(screen.getByTestId('shikigami-level-up')).toHaveTextContent(
      strings.shikigami.levelUp(10, cost),
    );
    await fireEvent.press(screen.getByTestId('shikigami-level-up'));
    expect(store.getState().game.shikigami[0].level).toBe(11);
  });

  it('levels up as much as the souls allow in « Max » mode, kept from one card to the next', async () => {
    const souls = 1_000_000;
    const { store } = await renderScreen(<ShikigamiScreen />, owning([7, 8], [], souls));
    await fireEvent.press(screen.getByTestId('shikigami-7'));
    await fireEvent.press(screen.getByRole('radio', { name: strings.shikigami.modes.max }));
    await fireEvent.press(screen.getByTestId('shikigami-close'));
    await fireEvent.press(screen.getByTestId('shikigami-8'));
    expect(screen.getByRole('radio', { name: strings.shikigami.modes.max })).toBeChecked();
    await fireEvent.press(screen.getByTestId('shikigami-level-up'));
    const levels = maxLevelUps(1, big(souls));
    expect(store.getState().game.shikigami[1].level).toBe(1 + levels);
  });

  it('cannot level up ×100 when the souls only pay for fewer levels', async () => {
    await renderScreen(<ShikigamiScreen />, owning([7], [], 5000));
    await fireEvent.press(screen.getByTestId('shikigami-7'));
    await fireEvent.press(screen.getByRole('radio', { name: strings.shikigami.modes.hundred }));
    expect(screen.getByTestId('shikigami-level-up')).toBeDisabled();
    expect(screen.getByTestId('shikigami-level-up')).toHaveTextContent(
      strings.shikigami.levelUp(100, formatNumber(levelUpCost(1, 100))),
    );
  });

  it('releases a shikigami outside the team after a confirmation, for souls', async () => {
    const { store } = await renderScreen(<ShikigamiScreen />, owning([11, 22], [11], 0));
    await fireEvent.press(screen.getByTestId('shikigami-22'));
    await fireEvent.press(screen.getByTestId('shikigami-release'));
    expect(
      screen.getByText(strings.shikigami.releaseTitle(nameOf(generate(22, 1)))),
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('shikigami-release-confirm-yes'));
    const game = store.getState().game;
    expect(game.shikigami.map((entry) => entry.seed)).toEqual([11]);
    expect(toNumber(game.souls)).toBeGreaterThan(0);
    expect(screen.queryByTestId('shikigami-sheet')).toBeNull();
  });

  it('keeps the shikigami when the release is cancelled', async () => {
    const { store } = await renderScreen(<ShikigamiScreen />, owning([11, 22], [11]));
    await fireEvent.press(screen.getByTestId('shikigami-22'));
    await fireEvent.press(screen.getByTestId('shikigami-release'));
    await fireEvent.press(screen.getByTestId('shikigami-release-confirm-no'));
    expect(store.getState().game.shikigami).toHaveLength(2);
    expect(screen.getByTestId('shikigami-sheet')).toBeOnTheScreen();
  });

  it('offers no release to a team member', async () => {
    await renderScreen(<ShikigamiScreen />, owning([11, 22], [11]));
    await fireEvent.press(screen.getByTestId('team-11'));
    expect(screen.queryByTestId('shikigami-release')).toBeNull();
  });

  it('releases in bulk every shikigami of a rarity outside the team', async () => {
    const seeds = Array.from({ length: 12 }, (_, index) => index + 1);
    const game = owning(seeds, [1]);
    const commons = collectionView(game)
      .filter((entry) => !entry.inTeam && entry.spec.rarity === 'common')
      .map((entry) => entry.seed);
    const { store } = await renderScreen(<ShikigamiScreen />, game);
    const souls = bulkReleaseViews(game, collectionView(game)).common.souls;
    expect(commons.length).toBeGreaterThan(0);
    expect(screen.getByTestId('bulk-release')).toHaveTextContent(
      strings.shikigami.bulk.release(commons.length, formatNumber(souls)),
    );
    await fireEvent.press(screen.getByTestId('bulk-release'));
    await fireEvent.press(screen.getByTestId('bulk-release-confirm-yes'));
    const left = store.getState().game.shikigami.map((entry) => entry.seed);
    expect(left).toContain(1);
    expect(left.some((seed) => commons.includes(seed))).toBe(false);
    expect(left).toHaveLength(seeds.length - commons.length);
  });

  it('has nothing to release in bulk for a rarity without spare shikigami', async () => {
    await renderScreen(<ShikigamiScreen />, owning([1, 2], [1]));
    await fireEvent.press(
      screen.getByRole('radio', { name: strings.shikigami.bulk.rarities.legendary }),
    );
    expect(screen.getByTestId('bulk-release')).toBeDisabled();
    expect(screen.getByTestId('bulk-release')).toHaveTextContent(strings.shikigami.bulk.none);
  });

  it('hides the bulk release while every shikigami is in the team', async () => {
    await renderScreen(<ShikigamiScreen />, owning([1, 2], [1, 2]));
    expect(screen.queryByTestId('bulk-release')).toBeNull();
  });
});
