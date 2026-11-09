import { screen } from '@testing-library/react-native';

import { createNewGame, type GameState } from '@/engine';
import { strings } from '@/i18n';

import { renderScreen } from '../testing/renderScreen';
import { GuardiansScreen } from './GuardiansScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const progressed = (wave: number, defeated: number[], bestAwakening?: number[]): GameState => {
  const state = createNewGame(1);
  return {
    ...state,
    parade: { ...state.parade, wave, maxWave: wave },
    guardiansDefeated: defeated,
    guardiansBestAwakening: bestAwakening ?? state.guardiansBestAwakening,
  };
};

const ALL_TEN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

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

  it('keeps the awakened guardians hidden until Nurarihyon has fallen', async () => {
    await renderScreen(<GuardiansScreen />, progressed(950, [0, 1, 2, 3, 4, 5, 6, 7, 8]));
    expect(screen.queryByText(strings.guardians.awakenedTitle)).toBeNull();
    expect(screen.queryAllByTestId(/^awakened-guardian-\d+$/)).toHaveLength(0);
  });

  it('shows the highest awakening level each awakened guardian fell at', async () => {
    const { awakened, names, descriptions, status, galleryWave } = strings.guardians;
    await renderScreen(
      <GuardiansScreen />,
      progressed(2250, ALL_TEN, [2, 1, 0, 0, 0, 0, 0, 0, 0, 0]),
    );
    expect(screen.getByText(strings.guardians.awakenedTitle)).toBeOnTheScreen();
    expect(screen.getByText(strings.guardians.awakenedSubtitle(2))).toBeOnTheScreen();
    expect(screen.getAllByTestId(/^awakened-guardian-\d+$/)).toHaveLength(10);
    expect(
      screen.getByLabelText(
        strings.guardians.knownLabel(
          awakened(names[0]),
          descriptions[0],
          100,
          strings.guardians.awakenedRecordLabel(3),
        ),
      ),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('awakened-guardian-1-art')).toBeOnTheScreen();
    // Karasu-tengu waits at Éveil 3, its awakened self never beaten: a silhouette, « Prochain ».
    expect(screen.getByTestId('awakened-guardian-2-silhouette')).toBeOnTheScreen();
    expect(
      screen.getByLabelText(
        strings.guardians.knownLabel(awakened(names[2]), descriptions[2], 300, status.next),
      ),
    ).toBeOnTheScreen();
    expect(screen.getAllByText(galleryWave(100))).toHaveLength(2);
    // On screen, under the « Gardiens éveillés » title, the plain name: the long ones fit.
    expect(screen.getAllByText(names[8])).toHaveLength(2);
    expect(screen.queryByText(awakened(names[8]))).toBeNull();
  });
});
