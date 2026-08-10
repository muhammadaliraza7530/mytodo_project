export type Priority = 'low' | 'medium' | 'high';
export type Category = 'General' | 'Work' | 'Personal' | 'Urgent' | 'Health' | 'Finance';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  created_at: string;
  due_date?: string | null;
}

export type FilterStatus = 'all' | 'pending' | 'completed';
