'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Moon,
  Sun,
  Database,
  Search,
  Eraser,
  Download,
  Filter,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Repeat,
  Flame,
  X,
  Clock,
} from 'lucide-react';
import { Task, Priority, Category, FilterStatus, Recurrence } from '@/types/todo';
import { TaskStats } from '@/components/TaskStats';
import { TaskCompletionChart } from '@/components/TaskCompletionChart';
import { TaskForm } from '@/components/TaskForm';
import { TaskItem } from '@/components/TaskItem';
import { SupabaseConfigModal } from '@/components/SupabaseConfigModal';
import { getSupabaseClient, getSupabaseConfig } from '@/lib/supabase';
import { createRenewedTask, formatRecurrence } from '@/lib/recurrence';
import { calculateDuration } from '@/lib/timeUtils';
import confetti from 'canvas-confetti';

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isConnectedToSupabase, setIsConnectedToSupabase] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [renewalAlert, setRenewalAlert] = useState<{
    text: string;
    nextDue: string;
    recurrence: Recurrence;
    streak: number;
  } | null>(null);

  // Initialize theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Auto-dismiss renewal notification
  useEffect(() => {
    if (renewalAlert) {
      const timer = setTimeout(() => {
        setRenewalAlert(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [renewalAlert]);

  // Load Tasks from Supabase or Local Storage
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    const config = getSupabaseConfig();

    if (supabase && config.url) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setIsConnectedToSupabase(true);
          setTasks(data as Task[]);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }

    // Fallback to local storage
    setIsConnectedToSupabase(false);
    const saved = localStorage.getItem('taskflow_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        setTasks([]);
      }
    } else {
      const now = new Date();
      const getPastIso = (daysAgo: number, hours = 10, mins = 0) => {
        const d = new Date(now);
        d.setDate(now.getDate() - daysAgo);
        d.setHours(hours, mins, 0, 0);
        return d.toISOString();
      };
      const today = now.toISOString().split('T')[0];

      // Default sample tasks highlighting timing, recurring features, and 7-day completion history
      setTasks([
        {
          id: '1',
          text: 'Welcome to TaskFlow with Start/End Times & Auto-Renewal!',
          completed: false,
          priority: 'high',
          category: 'General',
          created_at: new Date().toISOString(),
          recurrence: 'none',
          start_time: '08:30',
          end_time: '09:00',
        },
        {
          id: '2',
          text: 'Daily morning workout & hydration routine',
          completed: false,
          priority: 'medium',
          category: 'Health',
          due_date: today,
          start_time: '07:00',
          end_time: '08:00',
          recurrence: 'daily',
          streak: 3,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          text: 'Weekly team sprint review and planning session',
          completed: false,
          priority: 'high',
          category: 'Work',
          due_date: today,
          start_time: '14:00',
          end_time: '15:30',
          recurrence: 'weekly',
          streak: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: '4',
          text: 'Q3 budget audit & financial forecast review',
          completed: true,
          completed_at: getPastIso(1, 16, 30),
          priority: 'high',
          category: 'Finance',
          created_at: getPastIso(2, 9, 0),
          start_time: '15:00',
          end_time: '16:30',
        },
        {
          id: '5',
          text: 'Design system token review & dark mode audit',
          completed: true,
          completed_at: getPastIso(2, 11, 30),
          priority: 'medium',
          category: 'Work',
          created_at: getPastIso(3, 9, 30),
          start_time: '10:30',
          end_time: '11:30',
        },
        {
          id: '6',
          text: '30-minute interval cardio & core workout',
          completed: true,
          completed_at: getPastIso(3, 8, 0),
          priority: 'low',
          category: 'Health',
          created_at: getPastIso(4, 7, 0),
          start_time: '07:30',
          end_time: '08:00',
          recurrence: 'daily',
          streak: 2,
        },
        {
          id: '7',
          text: 'Weekly grocery run & meal planning',
          completed: true,
          completed_at: getPastIso(4, 18, 0),
          priority: 'medium',
          category: 'Personal',
          created_at: getPastIso(5, 12, 0),
          start_time: '17:00',
          end_time: '18:00',
        },
        {
          id: '8',
          text: 'Patch urgent security dependency update',
          completed: true,
          completed_at: getPastIso(5, 14, 15),
          priority: 'high',
          category: 'Urgent',
          created_at: getPastIso(5, 13, 0),
          start_time: '13:30',
          end_time: '14:15',
        },
      ]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Save tasks to local storage backup whenever tasks change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  // Handle Add Task
  const handleAddTask = async (
    text: string,
    priority: Priority,
    category: Category,
    dueDate?: string,
    recurrence?: Recurrence,
    startTime?: string,
    endTime?: string
  ) => {
    const newTask: Task = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task_${Date.now()}`,
      text,
      completed: false,
      priority,
      category,
      created_at: new Date().toISOString(),
      due_date: dueDate || null,
      start_time: startTime || null,
      end_time: endTime || null,
      recurrence: recurrence || 'none',
      streak: 0,
    };

    setTasks((prev) => [newTask, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase && isConnectedToSupabase) {
      try {
        await supabase.from('tasks').insert([newTask]);
      } catch (e) {
        console.error('Error inserting into Supabase:', e);
      }
    }
  };

  // Handle Toggle Complete with Automatic Renewal Logic
  const handleToggleComplete = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const willBeCompleted = !target.completed;
    const isRecurring = Boolean(target.recurrence && target.recurrence !== 'none');

    // If completing a recurring task, generate the auto-renewed next task
    let renewedTask: Task | null = null;
    if (willBeCompleted && isRecurring) {
      renewedTask = createRenewedTask(target);
    }

    const updatedTasks = tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          completed: willBeCompleted,
          completed_at: willBeCompleted ? new Date().toISOString() : null,
          last_renewed_at: willBeCompleted && isRecurring ? new Date().toISOString() : t.last_renewed_at,
        };
      }
      return t;
    });

    const finalTasks = renewedTask ? [renewedTask, ...updatedTasks] : updatedTasks;
    setTasks(finalTasks);

    // Trigger celebrations and notifications
    if (willBeCompleted) {
      confetti({
        particleCount: isRecurring ? 100 : 70,
        spread: isRecurring ? 80 : 65,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#3b82f6', '#8b5cf6'],
      });

      if (renewedTask && target.recurrence) {
        setRenewalAlert({
          text: target.text,
          nextDue: renewedTask.due_date || 'next period',
          recurrence: target.recurrence,
          streak: renewedTask.streak || 1,
        });
      }
    }

    // Sync with Supabase
    const supabase = getSupabaseClient();
    if (supabase && isConnectedToSupabase) {
      try {
        await supabase
          .from('tasks')
          .update({
            completed: willBeCompleted,
            completed_at: willBeCompleted ? new Date().toISOString() : null,
            last_renewed_at: willBeCompleted && isRecurring ? new Date().toISOString() : target.last_renewed_at,
          })
          .eq('id', id);

        if (renewedTask) {
          await supabase.from('tasks').insert([renewedTask]);
        }
      } catch (e) {
        console.error('Error syncing with Supabase:', e);
      }
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isConnectedToSupabase) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch (e) {
        console.error('Error deleting from Supabase:', e);
      }
    }
  };

  // Handle Update Task
  const handleUpdateTask = async (
    id: string,
    newText: string,
    priority: Priority,
    category: Category,
    dueDate?: string,
    recurrence?: Recurrence,
    startTime?: string,
    endTime?: string
  ) => {
    const updated = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            text: newText,
            priority,
            category,
            due_date: dueDate || null,
            recurrence: recurrence || 'none',
            start_time: startTime !== undefined ? (startTime || null) : t.start_time,
            end_time: endTime !== undefined ? (endTime || null) : t.end_time,
          }
        : t
    );
    setTasks(updated);

    const target = updated.find((t) => t.id === id);
    const supabase = getSupabaseClient();
    if (supabase && isConnectedToSupabase && target) {
      try {
        await supabase
          .from('tasks')
          .update({
            text: target.text,
            priority: target.priority,
            category: target.category,
            due_date: target.due_date,
            recurrence: target.recurrence || 'none',
            start_time: target.start_time,
            end_time: target.end_time,
          })
          .eq('id', id);
      } catch (e) {
        console.error('Error updating Supabase:', e);
      }
    }
  };

  // Handle Clear Completed
  const handleClearCompleted = async () => {
    const completedIds = tasks.filter((t) => t.completed).map((t) => t.id);
    setTasks((prev) => prev.filter((t) => !t.completed));

    const supabase = getSupabaseClient();
    if (supabase && isConnectedToSupabase && completedIds.length > 0) {
      try {
        await supabase.from('tasks').delete().in('id', completedIds);
      } catch (e) {
        console.error('Error deleting completed tasks from Supabase:', e);
      }
    }
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    if (tasks.length === 0) return;

    const headers = [
      'ID',
      'Task',
      'Status',
      'Priority',
      'Category',
      'Start Time',
      'End Time',
      'Duration',
      'Recurrence',
      'Streak',
      'Due Date',
      'Created At',
    ];
    const rows = tasks.map((task) => [
      task.id,
      `"${task.text.replace(/"/g, '""')}"`,
      task.completed ? 'Completed' : 'Pending',
      task.priority,
      task.category,
      task.start_time || '',
      task.end_time || '',
      calculateDuration(task.start_time, task.end_time) || '',
      task.recurrence || 'none',
      task.streak || 0,
      task.due_date || '',
      task.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Drag & Drop Reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const currentFiltered = [...filteredTasks];
    const [movedTask] = currentFiltered.splice(draggedIndex, 1);
    currentFiltered.splice(targetIndex, 0, movedTask);

    if (currentFiltered.length === tasks.length) {
      setTasks(currentFiltered);
    } else {
      const filteredIds = new Set(currentFiltered.map((t) => t.id));
      const hiddenTasks = tasks.filter((t) => !filteredIds.has(t.id));
      setTasks([...currentFiltered, ...hiddenTasks]);
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Filter & Search Logic
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed' && !task.completed) return false;
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'recurring' && (!task.recurrence || task.recurrence === 'none')) return false;
    if (filter === 'timed' && !task.start_time && !task.end_time) return false;
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (
      searchQuery &&
      !task.text.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary-500 dark:text-primary-400 glow-text flex items-center gap-2">
              TaskFlow <Sparkles className="w-7 h-7 text-emerald-400" />
            </h1>
            <span className="bg-primary-500/10 dark:bg-primary-400/20 text-primary-600 dark:text-primary-300 border border-primary-500/20 text-xs px-2.5 py-1 rounded-full font-semibold">
              Next.js 15 + Recurring Tasks
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Organize daily routines, habits, and projects with automated recurrence
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={tasks.length === 0}
            className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200/60 dark:border-dark-600 text-gray-700 dark:text-gray-200 transition-all font-medium shadow-sm"
            title="Export tasks as CSV"
          >
            <Download className="w-3.5 h-3.5 text-primary-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Supabase Status Pill */}
          <button
            onClick={() => setIsConfigOpen(true)}
            className={`flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl border transition-all font-medium ${
              isConnectedToSupabase
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnectedToSupabase ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <Database className="w-3.5 h-3.5" />
            {isConnectedToSupabase ? 'Supabase Connected' : 'Connect Supabase'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600 transition-all shadow-md hover:shadow-lg border border-gray-200/60 dark:border-dark-600"
            title="Toggle Theme"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>
      </header>

      {/* Auto-Renewal Toast Alert */}
      {renewalAlert && (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 via-primary-500/10 to-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                <span>Task Completed & Auto-Renewed!</span>
                <span className="bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                  {renewalAlert.streak} streak
                </span>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                &ldquo;<span className="font-semibold">{renewalAlert.text}</span>&rdquo; scheduled for next cycle ({formatRecurrence(renewalAlert.recurrence)} • Due {renewalAlert.nextDue})
              </p>
            </div>
          </div>
          <button
            onClick={() => setRenewalAlert(null)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <TaskStats tasks={tasks} />

      {/* 7-Day Completion History Data Visualization (Recharts) */}
      <TaskCompletionChart tasks={tasks} />

      {/* Add Task Input Form */}
      <TaskForm onAddTask={handleAddTask} />

      {/* Search & Filters Toolbar */}
      <div className="bg-white dark:bg-dark-700 rounded-2xl p-4 shadow-sm mb-6 border border-gray-100 dark:border-dark-600 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-600/80 rounded-xl text-xs text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-dark-600/90 p-1 rounded-xl w-full sm:w-auto justify-center flex-wrap">
            {(['all', 'pending', 'completed', 'recurring', 'timed'] as FilterStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1 ${
                  filter === st
                    ? 'bg-primary-500 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {st === 'recurring' && <Repeat className="w-3 h-3" />}
                {st === 'timed' && <Clock className="w-3 h-3" />}
                {st === 'timed' ? 'With Timing' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Category / Priority Filter */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-gray-100 dark:border-dark-600 text-xs">
          <span className="text-gray-400 dark:text-gray-400 flex items-center gap-1 font-semibold text-[11px] uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-primary-500" /> Filter:
          </span>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-dark-600/80 border border-gray-200/80 dark:border-dark-500 rounded-lg text-xs font-medium dark:text-gray-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="General">General</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Urgent">Urgent</option>
            <option value="Health">Health</option>
            <option value="Finance">Finance</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-dark-600/80 border border-gray-200/80 dark:border-dark-500 rounded-lg text-xs font-medium dark:text-gray-200 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {(categoryFilter !== 'all' || priorityFilter !== 'all' || searchQuery || filter !== 'all') && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setPriorityFilter('all');
                setSearchQuery('');
                setFilter('all');
              }}
              className="text-primary-500 dark:text-primary-400 hover:underline text-xs font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-dark-700 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-dark-600 transition-all">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-primary-500" />
            <p className="text-sm">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20 text-primary-500" />
            <p className="text-base font-medium">No tasks found</p>
            <p className="text-xs text-gray-400 mt-1">
              {filter === 'completed'
                ? 'No completed tasks yet.'
                : filter === 'pending'
                ? 'All pending tasks cleared!'
                : filter === 'recurring'
                ? 'No recurring tasks created yet. Select Daily or Weekly when adding a task!'
                : filter === 'timed'
                ? 'No scheduled/timed tasks created yet. Set Start and End times in the form above!'
                : 'Add a new task above to get started.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-dark-600">
            {filteredTasks.map((task, idx) => (
              <TaskItem
                key={task.id}
                task={task}
                index={idx}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onUpdateTask={handleUpdateTask}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === idx}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={tasks.length === 0}
            className="text-xs text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium px-3.5 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-1.5 border border-gray-200/60 dark:border-dark-600"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          <button
            onClick={handleClearCompleted}
            disabled={!tasks.some((t) => t.completed)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium px-3.5 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 flex items-center gap-1.5"
          >
            <Eraser className="w-3.5 h-3.5" /> Clear Completed
          </button>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </p>
      </div>

      {/* Supabase Config Modal */}
      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={loadTasks}
      />
    </main>
  );
}

