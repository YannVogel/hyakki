import { screen } from '@testing-library/react-native';

import { createNewGame, type GameState } from '@/engine';
import { strings } from '@/i18n';

import { renderScreen } from '../testing/renderScreen';
import { GuardiansScreen } from './GuardiansScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const progressed = (wave: number, defeated: number[]): GameState => {
  const state = createNewGame(1);
  return {
    ...state,
    parade: { ...state.parade, wave, maxWave: wave },
    guardiansDefeated: defeated,
  };
};

describe('GuardiansScreen', () => {
  it('shows the ten guardians and how many are defeated', async () => {
    await renderScreen(<GuardiansScreen />, progressed(250, [0, 1]));
    expect(screen.getByText(strings.guardians.gallerySubtitle(2))).toBeOnTheScreen();
    expect(screen.getAllByTestId(/^guardian-\d+$/)).toHaveLength(10);
  });

  it('follows the progression: defeated, next, then upcoming', async () => {
    await renderScreen(<GuardiansScreen />, progressed(250, [0, 1]));
    const { status, names, descriptions } = strings.guardians;
    expect(
      screen.getByLabelText(
        strings.guardians.knownLabel(names[0], descriptions[0], 100, status.defeated),
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByLabelText(strings.guardians.unknownLabel(300, status.next)),
    ).toBeOnTheScreen();
    expect(
      screen.getByLabelText(strings.guardians.unknownLabel(1000, status.upcoming)),
    ).toBeOnTheScreen();
  });

  it('hides unmet guardians behind a silhouette whose label gives nothing away', async () => {
    await renderScreen(<GuardiansScreen />, progressed(1, []));
    expect(screen.getAllByTestId(/-silhouette$/)).toHaveLength(10);
    for (const name of strings.guardians.names) {
      expect(screen.queryByText(name)).toBeNull();
      expect(screen.queryByLabelText(new RegExp(name))).toBeNull();
    }
  });
});
