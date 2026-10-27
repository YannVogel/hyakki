import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { offlineCapMs } from '@/engine';

import { createSettingsStore } from './settings';
import { createFakeStore } from './testing/fakeStore';
import { useCapReminder } from './useCapReminder';

function setup(savedSettings?: string) {
  let onChange: (status: AppStateStatus) => void = () => undefined;
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
    onChange = listener as (status: AppStateStatus) => void;
    return { remove: jest.fn() };
  });
  const { store, clock } = createFakeStore();
  const settings = createSettingsStore({ read: () => savedSettings, write: jest.fn() });
  const reminder = { schedule: jest.fn(), cancel: jest.fn(), askPermission: jest.fn() };
  return {
    store,
    clock,
    settings,
    reminder,
    appState: (status: AppStateStatus) => onChange(status),
  };
}

describe('useCapReminder', () => {
  afterEach(() => jest.restoreAllMocks());

  it('reminds the player when the cap will be reached, and cancels on return', async () => {
    const { store, settings, reminder, appState } = setup();
    await renderHook(() => useCapReminder(store, settings, reminder));
    expect(reminder.cancel).toHaveBeenCalledTimes(1);

    appState('background');
    expect(reminder.schedule).toHaveBeenCalledWith(offlineCapMs(store.getState().game));
    appState('active');
    expect(reminder.cancel).toHaveBeenCalledTimes(2);
  });

  it('stays quiet when the player turned notifications off', async () => {
    const { store, settings, reminder, appState } = setup('{"notifications":false}');
    await renderHook(() => useCapReminder(store, settings, reminder));
    appState('background');
    expect(reminder.schedule).not.toHaveBeenCalled();
  });

  it('never asks for the permission at first launch', async () => {
    const { store, settings, reminder } = setup();
    await renderHook(() => useCapReminder(store, settings, reminder));
    expect(reminder.askPermission).not.toHaveBeenCalled();
  });

  it('asks once the first offline report is closed', async () => {
    const { store, clock, settings, reminder } = setup();
    await renderHook(() => useCapReminder(store, settings, reminder));
    clock.now += 3_600_000;
    await act(() => store.getState().resume());
    expect(reminder.askPermission).not.toHaveBeenCalled();
    await act(() => store.getState().dismissOfflineReport());
    expect(reminder.askPermission).toHaveBeenCalledTimes(1);
  });

  it('asks when the player turns notifications on', async () => {
    const { store, settings, reminder } = setup('{"notifications":false}');
    await renderHook(() => useCapReminder(store, settings, reminder));
    await act(() => settings.getState().change('notifications', true));
    expect(reminder.askPermission).toHaveBeenCalledTimes(1);
  });
});
