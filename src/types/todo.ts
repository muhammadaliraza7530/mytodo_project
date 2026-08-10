export type Priority = 'low' | 'medium' | 'high';
export type Category = 'General' | 'Work' | 'Personal' | 'Urgent' | 'Health' | 'Finance';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  created_at: string;
  completed_at?: string | null;
  due_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  notes?: string | null;
  recurrence?: Recurrence;
  streak?: number;
  last_renewed_at?: string | null;
}

export type FilterStatus = 'all' | 'pending' | 'completed' | 'recurring' | 'timed';
