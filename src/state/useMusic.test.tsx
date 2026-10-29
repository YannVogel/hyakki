import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { stateAtWave } from '@/engine/testing/states';

import { createSettingsStore } from './settings';
import { createFakeStore } from './testing/fakeStore';
import { type Music, useMusic } from './useMusic';

async function setup(saved?: string) {
  const settings = createSettingsStore({ read: () => saved, write: jest.fn() });
  const { store: game } = createFakeStore({ game: stateAtWave(1, 50) });
  const music = { play: jest.fn(), setVolume: jest.fn() } satisfies Music;
  const listeners: ((status: AppStateStatus) => void)[] = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
    listeners.push(listener);
    return { remove: jest.fn() };
  });
  Object.defineProperty(AppState, 'currentState', { value: 'active', configurable: true });
  const hook = await renderHook(() => useMusic(settings, game, music));
  const moveTo = (status: AppStateStatus) =>
    act(() => listeners.forEach((listen) => listen(status)));
  return { settings, game, music, hook, moveTo };
}

describe('useMusic', () => {
  it("plays the parade's theme at the chosen volume while the app is in front", async () => {
    const { music } = await setup('{"musicVolume":0.3}');
    expect(music.setVolume).toHaveBeenLastCalledWith(0.3);
    expect(music.play).toHaveBeenLastCalledWith('parade');
  });

  it("switches to the guardian's theme from its cut-in to the end of its fight", async () => {
    const { music, game } = await setup();
    await act(() => game.setState({ game: stateAtWave(1, 100) }));
    expect(music.play).toHaveBeenLastCalledWith('guardian');
    await act(() => game.setState({ game: stateAtWave(1, 101) }));
    expect(music.play).toHaveBeenLastCalledWith('parade');
  });

  it('stays silent when the setting is off, and starts again when it is back on', async () => {
    const { music, settings } = await setup('{"music":false}');
    expect(music.play).toHaveBeenLastCalledWith(null);
    await act(() => settings.getState().change('music', true));
    expect(music.play).toHaveBeenLastCalledWith('parade');
  });

  it('follows the volume at once', async () => {
    const { music, settings } = await setup();
    await act(() => settings.getState().change('musicVolume', 0.1));
    expect(music.setVolume).toHaveBeenLastCalledWith(0.1);
  });

  it('pauses in the background and resumes in front', async () => {
    const { music, moveTo } = await setup();
    await moveTo('background');
    expect(music.play).toHaveBeenLastCalledWith(null);
    await moveTo('active');
    expect(music.play).toHaveBeenLastCalledWith('parade');
  });

  it('stops when the app root goes away', async () => {
    const { music, hook } = await setup();
    await hook.unmount();
    expect(music.play).toHaveBeenLastCalledWith(null);
  });
});
