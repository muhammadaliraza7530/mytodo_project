import { Recurrence, Task } from '@/types/todo';

/**
 * Calculates the next due date string (YYYY-MM-DD) based on recurrence pattern
 */
export function getNextRecurringDate(
  currentDueDate: string | null | undefined,
  recurrence: Recurrence
): string {
  if (!recurrence || recurrence === 'none') {
    return currentDueDate || '';
  }

  // Base date is current due date or today
  let baseDate: Date;
  if (currentDueDate) {
    // Parse date safely
    const [yearStr, monthStr, dayStr] = currentDueDate.split('T')[0].split('-');
    if (yearStr && monthStr && dayStr) {
      baseDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
    } else {
      baseDate = new Date(currentDueDate);
    }
  } else {
    baseDate = new Date();
  }

  if (isNaN(baseDate.getTime())) {
    baseDate = new Date();
  }

  // Ensure next due date is not in the past relative to today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startAnchor = baseDate.getTime() < today.getTime() ? today : baseDate;
  const nextDate = new Date(startAnchor.getFullYear(), startAnchor.getMonth(), startAnchor.getDate());

  switch (recurrence) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats recurrence interval for readable presentation
 */
export function formatRecurrence(recurrence?: Recurrence): string {
  switch (recurrence) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    default:
      return 'Does not repeat';
  }
}

/**
 * Returns human-readable renewal description
 */
export function getRenewalHint(recurrence?: Recurrence, dueDate?: string | null): string {
  if (!recurrence || recurrence === 'none') return '';
  const nextDue = getNextRecurringDate(dueDate, recurrence);
  switch (recurrence) {
    case 'daily':
      return `Repeats every day • Next renewal: ${nextDue}`;
    case 'weekly':
      return `Repeats every week • Next renewal: ${nextDue}`;
    case 'monthly':
      return `Repeats monthly • Next renewal: ${nextDue}`;
    default:
      return '';
  }
}

/**
 * Creates the renewed instance of a completed recurring task
 */
export function createRenewedTask(task: Task): Task {
  const recurrence = task.recurrence || 'daily';
  const nextDueDate = getNextRecurringDate(task.due_date, recurrence);
  const newStreak = (task.streak || 0) + 1;

  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text: task.text,
    completed: false,
    priority: task.priority,
    category: task.category,
    recurrence: task.recurrence,
    streak: newStreak,
    due_date: nextDueDate,
    start_time: task.start_time || null,
    end_time: task.end_time || null,
    notes: task.notes || null,
    created_at: new Date().toISOString(),
    last_renewed_at: new Date().toISOString(),
  };
}
