import {
  cancelScheduledNotificationAsync,
  getPermissionsAsync,
  PermissionStatus,
  requestPermissionsAsync,
  scheduleNotificationAsync,
} from 'expo-notifications';

import { createCapReminder } from './notifications';

jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 3 },
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('offline-cap')),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve(null)),
}));

const text = { title: 'Titre', body: 'Texte', channel: 'Rappels' };
const permission = (status: string, canAskAgain = true) =>
  jest
    .mocked(getPermissionsAsync)
    .mockResolvedValue({ status, granted: status === 'granted', canAskAgain } as never);
const settle = () => new Promise((resolve) => setImmediate(resolve));

describe('createCapReminder', () => {
  beforeEach(() => jest.clearAllMocks());

  it('schedules nothing when the permission is refused', async () => {
    permission(PermissionStatus.DENIED);
    createCapReminder(text).schedule(8 * 3_600_000);
    await settle();
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('replaces the reminder at the time the cap is reached', async () => {
    permission(PermissionStatus.GRANTED);
    createCapReminder(text).schedule(8 * 3_600_000);
    await settle();
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('offline-cap');
    expect(scheduleNotificationAsync).toHaveBeenCalledWith({
      identifier: 'offline-cap',
      content: { title: 'Titre', body: 'Texte' },
      trigger: expect.objectContaining({ type: 'timeInterval', seconds: 8 * 3600 }),
    });
  });

  it('asks for the permission only if the player was never asked', async () => {
    permission(PermissionStatus.UNDETERMINED);
    createCapReminder(text).askPermission();
    await settle();
    expect(requestPermissionsAsync).toHaveBeenCalledTimes(1);

    permission(PermissionStatus.DENIED, false);
    createCapReminder(text).askPermission();
    await settle();
    expect(requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('never lets a system failure reach the game', async () => {
    jest.mocked(getPermissionsAsync).mockRejectedValue(new Error('unavailable'));
    expect(() => createCapReminder(text).schedule(1000)).not.toThrow();
    await settle();
  });
});
