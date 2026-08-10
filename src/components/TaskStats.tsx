'use client';

import React from 'react';
import { CheckCircle2, Clock, ListTodo, TrendingUp, Repeat, Flame, Timer } from 'lucide-react';
import { Task } from '@/types/todo';

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const recurring = tasks.filter((t) => t.recurrence && t.recurrence !== 'none').length;
  const timed = tasks.filter((t) => t.start_time || t.end_time).length;
  const maxStreak = Math.max(0, ...tasks.map((t) => t.streak || 0));
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-4 mb-8">
      {/* Progress Bar Container */}
      <div className="bg-white dark:bg-dark-700 rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-dark-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-primary-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-gray-200">Overall Completion</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-primary-400 sm:hidden">{progress}% Done</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {timed > 0 && (
              <span className="text-[10px] sm:text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/40 flex items-center gap-1">
                <Timer className="w-3 h-3" /> {timed} timed
              </span>
            )}
            {recurring > 0 && (
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-primary-400 bg-emerald-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-primary-800/40 flex items-center gap-1">
                <Repeat className="w-3 h-3" /> {recurring} recurring
              </span>
            )}
            {maxStreak > 0 && (
              <span className="text-[10px] sm:text-[11px] font-semibold text-amber-700 dark:text-orange-400 bg-amber-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-orange-800/40 flex items-center gap-1">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500 dark:fill-orange-500 dark:text-orange-500" /> {maxStreak} streak
              </span>
            )}
            <span className="text-xs font-bold text-emerald-600 dark:text-primary-400 hidden sm:inline">{progress}% Done</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-dark-600 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-primary-500 dark:to-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="stats-card bg-white dark:bg-dark-700 rounded-2xl shadow-xs p-4 border border-slate-200/80 dark:border-dark-600 transition-all hover:border-emerald-500/40 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">Total Tasks</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-gray-100 mt-1">{total}</h3>
            </div>
            <div className="bg-emerald-50 dark:bg-primary-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-primary-900/40">
              <ListTodo className="w-5 h-5 text-emerald-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="stats-card bg-white dark:bg-dark-700 rounded-2xl shadow-xs p-4 border border-slate-200/80 dark:border-dark-600 transition-all hover:border-emerald-500/40 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-gray-100 mt-1">{completed}</h3>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="stats-card bg-white dark:bg-dark-700 rounded-2xl shadow-xs p-4 border border-slate-200/80 dark:border-dark-600 transition-all hover:border-amber-500/40 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">Pending</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-gray-100 mt-1">{pending}</h3>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="stats-card bg-white dark:bg-dark-700 rounded-2xl shadow-xs p-4 border border-slate-200/80 dark:border-dark-600 transition-all hover:border-teal-500/40 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">Recurring & Timed</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-gray-100 mt-1 flex items-baseline gap-1.5">
                {recurring}
                {timed > 0 && (
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    +{timed}⏰
                  </span>
                )}
              </h3>
            </div>
            <div className="bg-teal-50 dark:bg-primary-950/40 p-2.5 rounded-xl border border-teal-100 dark:border-primary-900/40">
              <Repeat className="w-5 h-5 text-teal-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


