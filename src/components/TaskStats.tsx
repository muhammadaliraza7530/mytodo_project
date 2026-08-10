'use client';

import React from 'react';
import { CheckCircle2, Clock, ListTodo, AlertTriangle, TrendingUp } from 'lucide-react';
import { Task } from '@/types/todo';

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter((t) => !t.completed && t.priority === 'high').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-4 mb-8">
      {/* Progress Bar Container */}
      <div className="bg-white dark:bg-dark-700 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-600">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Overall Progress</span>
          </div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{progress}% Completed</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-dark-600 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-500 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="stats-card bg-white dark:bg-dark-700 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-dark-600 transition-all hover:border-primary-500/40 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">Total Tasks</p>
              <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mt-1">{total}</h3>
            </div>
            <div className="bg-primary-50 dark:bg-primary-950/40 p-2.5 rounded-xl border border-primary-100 dark:border-primary-900/40">
              <ListTodo className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="stats-card bg-white dark:bg-dark-700 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-dark-600 transition-all hover:border-emerald-500/40 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mt-1">{completed}</h3>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="stats-card bg-white dark:bg-dark-700 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-dark-600 transition-all hover:border-amber-500/40 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">Pending</p>
              <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mt-1">{pending}</h3>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/40">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="stats-card bg-white dark:bg-dark-700 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-dark-600 transition-all hover:border-red-500/40 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">High Priority</p>
              <h3 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mt-1">{highPriority}</h3>
            </div>
            <div className="bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-100 dark:border-red-900/40">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

