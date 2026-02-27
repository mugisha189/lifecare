// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – types will be provided by expo at runtime
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReminderFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export async function ensureNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

interface ScheduleReminderInput {
  title: string;
  body: string;
  frequency: ReminderFrequency;
  hour: number;
  minute: number;
}

export interface MedicationReminderSummary {
  id: string;
  title: string;
  body: string;
  frequency?: ReminderFrequency;
  time?: string;
}

type StoredReminder = MedicationReminderSummary;

const STORAGE_KEY = '@lifecare:medication-reminders';

async function loadStoredReminders(): Promise<StoredReminder[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredReminder[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

async function saveStoredReminders(reminders: StoredReminder[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export async function scheduleMedicationReminder(input: ScheduleReminderInput) {
  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) {
    throw new Error('Notifications permission not granted');
  }

  const { title, body, frequency, hour, minute } = input;

  // Map to OS-level repeating notification schedule
  if (frequency === 'DAILY') {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: {
          type: 'medication-reminder',
          frequency,
          hour,
          minute,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    });

    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const current = await loadStoredReminders();
    await saveStoredReminders([
      ...current,
      { id, title, body, frequency, time },
    ]);
    return;
  }

  if (frequency === 'WEEKLY') {
    // Approximate: every 7 days at the selected time
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: {
          type: 'medication-reminder',
          frequency,
          hour,
          minute,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        repeats: true,
        seconds: 7 * 24 * 60 * 60,
      },
    });

    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const current = await loadStoredReminders();
    await saveStoredReminders([
      ...current,
      { id, title, body, frequency, time },
    ]);
    return;
  }

  // MONTHLY – approximate as every 30 days
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: {
        type: 'medication-reminder',
        frequency,
        hour,
        minute,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      repeats: true,
      seconds: 30 * 24 * 60 * 60,
    },
  });

  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const current = await loadStoredReminders();
  await saveStoredReminders([
    ...current,
    { id, title, body, frequency, time },
  ]);
}

export async function getMedicationReminders(): Promise<MedicationReminderSummary[]> {
  return loadStoredReminders();
}

export async function cancelMedicationReminder(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
  const current = await loadStoredReminders();
  const updated = current.filter(r => r.id !== id);
  await saveStoredReminders(updated);
}

export default {
  ensureNotificationPermissions,
  scheduleMedicationReminder,
  getMedicationReminders,
  cancelMedicationReminder,
};

