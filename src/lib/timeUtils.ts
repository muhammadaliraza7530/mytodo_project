/**
 * Utility functions for task start time, end time, and duration formatting
 */

export function formatTimeString(timeStr?: string | null): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Calculates duration between start_time (HH:mm) and end_time (HH:mm)
 */
export function calculateDuration(startTime?: string | null, endTime?: string | null): string | null {
  if (!startTime || !endTime) return null;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return null;

  let diffMinutes = endH * 60 + endM - (startH * 60 + startM);
  if (diffMinutes < 0) {
    // Crosses midnight
    diffMinutes += 24 * 60;
  }

  if (diffMinutes === 0) return '0 min';

  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${mins} min${mins > 1 ? 's' : ''}`;
}

/**
 * Checks if a task with due_date, start_time, and end_time is currently happening now
 */
export function isTaskCurrentlyActive(
  dueDate?: string | null,
  startTime?: string | null,
  endTime?: string | null,
  completed?: boolean
): boolean {
  if (completed || !startTime || !endTime) return false;

  const now = new Date();

  // If due_date is set, verify it matches today
  if (dueDate) {
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const taskDateStr = dueDate.split('T')[0];
    if (taskDateStr !== todayStr) return false;
  }

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (endMinutes >= startMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Spans past midnight
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}
