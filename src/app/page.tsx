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
} from 'lucide-react';
import { Task, Priority, Category, FilterStatus } from '@/types/todo';
import { TaskStats } from '@/components/TaskStats';
import { TaskForm } from '@/components/TaskForm';
import { TaskItem } from '@/components/TaskItem';
import { SupabaseConfigModal } from '@/components/SupabaseConfigModal';
import { getSupabaseClient, getSupabaseConfig } from '@/lib/supabase';
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
      // Default sample task
      setTasks([
        {
          id: '1',
          text: 'Welcome to TaskFlow Next.js 15 & Supabase!',
          completed: false,
          priority: 'high',
          category: 'General',
          created_at: new Date().toISOString(),
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
    dueDate?: string
  ) => {
    const newTask: Task = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      text,
      completed: false,
      priority,
      category,
      created_at: new Date().toISOString(),
      due_date: dueDate || null,
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

  // Handle Toggle Complete
  const handleToggleComplete = async (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);

    const target = updated.find((t) => t.id === id);

    // Trigger confetti if task was newly completed
    if (target?.completed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#3b82f6'],
      });
    }

    const supabase = getSupabaseClient();
    if (supabase && isConnectedToSupabase && target) {
      try {
        await supabase
          .from('tasks')
          .update({ completed: target.completed })
          .eq('id', id);
      } catch (e) {
        console.error('Error updating Supabase:', e);
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
    dueDate?: string
  ) => {
    const updated = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            text: newText,
            priority,
            category,
            due_date: dueDate || null,
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

    const headers = ['ID', 'Task', 'Status', 'Priority', 'Category', 'Created At', 'Due Date'];
    const rows = tasks.map((task) => [
      task.id,
      `"${task.text.replace(/"/g, '""')}"`,
      task.completed ? 'Completed' : 'Pending',
      task.priority,
      task.category,
      task.created_at,
      task.due_date || '',
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
              Next.js 15 + TS
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Organize your productivity with Supabase integration
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

      {/* Stats Summary */}
      <TaskStats tasks={tasks} />

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
          <div className="flex gap-1 bg-gray-100 dark:bg-dark-600/90 p-1 rounded-xl w-full sm:w-auto justify-center">
            {(['all', 'pending', 'completed'] as FilterStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === st
                    ? 'bg-primary-500 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {st}
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

          {(categoryFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setPriorityFilter('all');
                setSearchQuery('');
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
