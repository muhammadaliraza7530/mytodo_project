import { Task } from '@/types/todo';
import { formatTimeString, calculateDuration } from './timeUtils';

/**
 * Audio chime synthesizer using Web Audio API
 */
export function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Upbeat notification chord (C5 -> E5 -> G5)
    playTone(523.25, 0.0, 0.25); // C5
    playTone(659.25, 0.15, 0.35); // E5
    playTone(783.99, 0.3, 0.5); // G5
  } catch (e) {
    console.warn('Could not play notification sound:', e);
  }
}

/**
 * Requests browser Notification API permission
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return 'denied';
  }
}

/**
 * Sends native browser Notification if permission is granted
 */
export function sendBrowserNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'taskflow-start-time',
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.warn('Error displaying native notification:', e);
    }
  }
}

/**
 * Helper to get YYYY-MM-DD string for local date
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks which tasks have reached their start_time
 */
export function getTasksDueForStartTime(
  tasks: Task[],
  notifiedKeys: Set<string>,
  snoozedMap: Record<string, number>
): Task[] {
  const now = new Date();
  const todayStr = getTodayDateString();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMins = currentHours * 60 + currentMinutes;
  const nowTimestamp = now.getTime();

  const dueTasks: Task[] = [];

  for (const task of tasks) {
    if (task.completed || !task.start_time) continue;

    // Verify date alignment
    if (task.due_date) {
      const taskDateStr = task.due_date.split('T')[0];
      if (taskDateStr !== todayStr) continue;
    }

    const [startH, startM] = task.start_time.split(':').map(Number);
    if (isNaN(startH) || isNaN(startM)) continue;

    const taskStartMins = startH * 60 + startM;
    const notificationKey = `${task.id}_${todayStr}_${task.start_time}`;

    // Check if task is snoozed
    const snoozedUntil = snoozedMap[task.id];
    if (snoozedUntil && nowTimestamp < snoozedUntil) {
      continue;
    }

    // Trigger if current minute matches task start minute OR task start time was within last 2 minutes
    const minuteDiff = currentTotalMins - taskStartMins;
    if (minuteDiff >= 0 && minuteDiff <= 2) {
      if (!notifiedKeys.has(notificationKey)) {
        dueTasks.push(task);
      }
    }
  }

  return dueTasks;
}
