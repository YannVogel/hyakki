import { fireEvent, screen } from '@testing-library/react-native';

import { strings } from '@/i18n';
import { fontFamily } from '@/ui/fonts';

import { renderScreen } from '../testing/renderScreen';
import { HomeScreen } from './HomeScreen';

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: unknown }) => children,
  router: { back: jest.fn() },
}));

describe('HomeScreen (development hub)', () => {
  it('shows the game title in the display font', async () => {
    await renderScreen(<HomeScreen />);
    expect(screen.getByText(strings.home.title)).toHaveStyle({ fontFamily: fontFamily.display });
    expect(screen.getByText(strings.home.kanji)).toBeOnTheScreen();
  });

  it('shows the subtitle in the body font', async () => {
    await renderScreen(<HomeScreen />);
    expect(screen.getByText(strings.home.subtitle)).toHaveStyle({ fontFamily: fontFamily.body700 });
  });

  it('jumps to the first guardian', async () => {
    const { store } = await renderScreen(<HomeScreen />);
    await fireEvent.press(screen.getByTestId('dev-guardian'));
    expect(store.getState().game.parade.wave).toBe(100);
    expect(store.getState().game.enemy.guardian).toEqual({ engaged: false, timeLeftMs: 30_000 });
  });
});
