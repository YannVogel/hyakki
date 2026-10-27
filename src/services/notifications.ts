import {
  AndroidImportance,
  cancelScheduledNotificationAsync,
  getPermissionsAsync,
  PermissionStatus,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  SchedulableTriggerInputTypes,
  setNotificationChannelAsync,
} from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_ID = 'offline-cap';
const CHANNEL_ID = 'reminders';

export interface ReminderText {
  readonly title: string;
  readonly body: string;
  /** Name of the Android notification channel, shown in the system settings. */
  readonly channel: string;
}

async function schedule(delayMs: number, text: ReminderText): Promise<void> {
  // Never asks here: without the player's permission, nothing is scheduled.
  const permission = await getPermissionsAsync();
  if (!permission.granted) {
    return;
  }
  if (Platform.OS === 'android') {
    await setNotificationChannelAsync(CHANNEL_ID, {
      name: text.channel,
      importance: AndroidImportance.DEFAULT,
    });
  }
  await cancelScheduledNotificationAsync(REMINDER_ID);
  await scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: { title: text.title, body: text.body },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(delayMs / 1000)),
      channelId: CHANNEL_ID,
    },
  });
}

async function askPermission(): Promise<void> {
  const permission = await getPermissionsAsync();
  if (permission.status === PermissionStatus.UNDETERMINED && permission.canAskAgain) {
    await requestPermissionsAsync();
  }
}

const ignore = () => undefined;

/**
 * The single local reminder of the game: "your shikigami stopped gaining". No push token, no
 * server. A refusal or a failure of the system never disturbs the game, so errors are dropped.
 */
export function createCapReminder(text: ReminderText) {
  return {
    schedule: (delayMs: number) => void schedule(delayMs, text).catch(ignore),
    cancel: () => void cancelScheduledNotificationAsync(REMINDER_ID).catch(ignore),
    askPermission: () => void askPermission().catch(ignore),
  };
}
