'use client';

import React from 'react';
import { BellRing, CheckCircle2, Clock, X, Tag, Sparkles } from 'lucide-react';
import { Task } from '@/types/todo';
import { formatTimeString, calculateDuration } from '@/lib/timeUtils';

interface StartNotificationModalProps {
  task: Task | null;
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string) => void;
  onDismiss: () => void;
}

export function StartNotificationModal({
  task,
  onComplete,
  onSnooze,
  onDismiss,
}: StartNotificationModalProps) {
  if (!task) return null;

  const duration = calculateDuration(task.start_time, task.end_time);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-dark-800 border-2 border-emerald-500/50 dark:border-emerald-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden glow-border">
        {/* Glow Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-primary-500 animate-pulse" />

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
          title="Dismiss notification"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-500/15 text-emerald-500 rounded-2xl border border-emerald-500/30 flex items-center justify-center animate-bounce">
            <BellRing className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Start Time Reached!
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Time to start your task
            </h2>
          </div>
        </div>

        {/* Task Content Card */}
        <div className="bg-gray-50 dark:bg-dark-700/60 border border-gray-200 dark:border-dark-600 rounded-2xl p-4 mb-6">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
            {task.text}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Time Slot Badge */}
            {task.start_time && (
              <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTimeString(task.start_time)}
                {task.end_time ? ` - ${formatTimeString(task.end_time)}` : ''}
                {duration ? ` (${duration})` : ''}
              </span>
            )}

            {/* Category */}
            <span className="bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
              <Tag className="w-3 h-3 text-primary-500" />
              {task.category}
            </span>

            {/* Priority */}
            <span
              className={`px-2.5 py-1 rounded-lg font-semibold border uppercase text-[10px] ${getPriorityStyle(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Mark Complete */}
          <button
            onClick={() => onComplete(task.id)}
            className="w-full sm:flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Complete
          </button>

          {/* Snooze 5 mins */}
          <button
            onClick={() => onSnooze(task.id)}
            className="w-full sm:w-auto py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30 rounded-xl transition-all flex items-center justify-center gap-1.5 text-sm"
          >
            <Clock className="w-4 h-4" />
            Snooze 5m
          </button>

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            className="w-full sm:w-auto py-3 px-3 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all flex items-center justify-center text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
