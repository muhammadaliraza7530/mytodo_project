import { Task, Category } from '@/types/todo';

export interface DailyCompletionPoint {
  date: string; // YYYY-MM-DD
  dayName: string; // e.g. "Mon", "Tue"
  formattedDate: string; // e.g. "Aug 9"
  displayDate: string; // e.g. "Today", "Yesterday", "Sat 8"
  fullDisplayDate: string; // e.g. "Sunday, August 9, 2026"
  completed: number;
  created: number;
  completedTasks: Task[];
  General: number;
  Work: number;
  Personal: number;
  Urgent: number;
  Health: number;
  Finance: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

export interface SevenDayStats {
  data: DailyCompletionPoint[];
  totalCompleted: number;
  dailyAverage: number;
  maxDayCount: number;
  peakDayName: string;
  topCategory: string;
  activeDaysCount: number;
  completionRate: number;
}

/**
 * Normalizes any timestamp or date string to YYYY-MM-DD
 */
export function toDateString(date: Date | string): string {
  if (typeof date === 'string') {
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    return date.slice(0, 10);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns completion date string for a task.
 * Looks for completed_at first, then due_date if completed, or created_at if completed.
 */
export function getTaskCompletionDate(task: Task): string | null {
  if (!task.completed) return null;
  if (task.completed_at) {
    return toDateString(task.completed_at);
  }
  if (task.last_renewed_at) {
    return toDateString(task.last_renewed_at);
  }
  if (task.due_date) {
    return toDateString(task.due_date);
  }
  if (task.created_at) {
    return toDateString(task.created_at);
  }
  return null;
}

/**
 * Generates the 7-day completion dataset and summary metrics for Recharts
 */
export function getSevenDayCompletionStats(tasks: Task[]): SevenDayStats {
  const points: DailyCompletionPoint[] = [];
  const today = new Date();

  // Generate date points for past 6 days + today (7 total days)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const dateStr = toDateString(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    let displayDate = `${dayName} ${d.getDate()}`;
    if (i === 0) {
      displayDate = 'Today';
    } else if (i === 1) {
      displayDate = 'Yesterday';
    }

    const fullDisplayDate = d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    points.push({
      date: dateStr,
      dayName,
      formattedDate,
      displayDate,
      fullDisplayDate,
      completed: 0,
      created: 0,
      completedTasks: [],
      General: 0,
      Work: 0,
      Personal: 0,
      Urgent: 0,
      Health: 0,
      Finance: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
    });
  }

  const pointMap = new Map<string, DailyCompletionPoint>();
  points.forEach((p) => pointMap.set(p.date, p));

  const categoryCounts: Record<Category, number> = {
    General: 0,
    Work: 0,
    Personal: 0,
    Urgent: 0,
    Health: 0,
    Finance: 0,
  };

  // Populate data for completed tasks
  tasks.forEach((task) => {
    // Check created date
    const createdDate = toDateString(task.created_at);
    if (pointMap.has(createdDate)) {
      pointMap.get(createdDate)!.created += 1;
    }

    // Check completion date
    if (task.completed) {
      const compDate = getTaskCompletionDate(task);
      if (compDate && pointMap.has(compDate)) {
        const point = pointMap.get(compDate)!;
        point.completed += 1;
        point.completedTasks.push(task);

        // Category breakdown
        if (task.category && point[task.category] !== undefined) {
          point[task.category] += 1;
          categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
        }

        // Priority breakdown
        if (task.priority === 'high') point.highPriority += 1;
        else if (task.priority === 'medium') point.mediumPriority += 1;
        else if (task.priority === 'low') point.lowPriority += 1;
      }
    }
  });

  const totalCompleted = points.reduce((sum, p) => sum + p.completed, 0);
  const totalCreated = points.reduce((sum, p) => sum + p.created, 0);
  const dailyAverage = Number((totalCompleted / 7).toFixed(1));

  let maxDayCount = 0;
  let peakDayName = 'None';
  let activeDaysCount = 0;

  points.forEach((p) => {
    if (p.completed > maxDayCount) {
      maxDayCount = p.completed;
      peakDayName = p.displayDate;
    }
    if (p.completed > 0) {
      activeDaysCount += 1;
    }
  });

  // Determine top category
  let topCategory = 'General';
  let topCategoryCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > topCategoryCount) {
      topCategoryCount = count;
      topCategory = cat;
    }
  });

  const completionRate = totalCreated > 0 ? Math.min(100, Math.round((totalCompleted / totalCreated) * 100)) : totalCompleted > 0 ? 100 : 0;

  return {
    data: points,
    totalCompleted,
    dailyAverage,
    maxDayCount,
    peakDayName,
    topCategory: topCategoryCount > 0 ? topCategory : 'None',
    activeDaysCount,
    completionRate,
  };
}
