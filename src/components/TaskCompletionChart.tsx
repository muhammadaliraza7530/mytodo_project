'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  Sparkles,
  Layers,
  Award,
  Flame,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { Task } from '@/types/todo';
import { getSevenDayCompletionStats, DailyCompletionPoint } from '@/lib/chartUtils';

interface TaskCompletionChartProps {
  tasks: Task[];
}

type ChartViewType = 'bar' | 'trend' | 'categories';

const CATEGORY_COLORS = {
  Work: '#3b82f6',     // Blue
  Health: '#10b981',   // Emerald
  Personal: '#8b5cf6', // Violet
  General: '#6366f1',  // Indigo
  Finance: '#f59e0b',  // Amber
  Urgent: '#ef4444',   // Rose/Red
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
    payload: DailyCompletionPoint;
  }>;
  label?: string;
  viewType: ChartViewType;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, viewType }) => {
  if (!active || !payload || payload.length === 0) return null;

  const dataPoint = payload[0].payload as DailyCompletionPoint;
  const completedCount = dataPoint.completed;
  const completedTasks = dataPoint.completedTasks || [];

  return (
    <div className="bg-white dark:bg-dark-800 p-3.5 rounded-xl shadow-xl border border-gray-200 dark:border-dark-600 text-xs min-w-[200px] max-w-[280px] z-50 animate-fadeIn pointer-events-none">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-600 pb-2 mb-2">
        <span className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary-500" />
          {dataPoint.fullDisplayDate}
        </span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
          {dataPoint.displayDate}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Completed Tasks:
          </span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
            {completedCount}
          </span>
        </div>

        {dataPoint.created > 0 && (
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Tasks Created:</span>
            <span className="font-medium text-gray-600 dark:text-gray-300">{dataPoint.created}</span>
          </div>
        )}

        {/* Category Breakdown list if in categories view or if categories exist */}
        {viewType === 'categories' && completedCount > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-dark-600 space-y-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Category Breakdown
            </span>
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
              const count = (dataPoint as unknown as Record<string, number>)[cat] || 0;
              if (count === 0) return null;
              return (
                <div key={cat} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    {cat}
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Task Titles Preview */}
        {completedTasks.length > 0 && viewType !== 'categories' && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-dark-600">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Completed on this day:
            </span>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {completedTasks.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="truncate text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{t.text}</span>
                </div>
              ))}
              {completedTasks.length > 3 && (
                <p className="text-[10px] text-gray-400 italic">
                  +{completedTasks.length - 3} more task{completedTasks.length - 3 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export function TaskCompletionChart({ tasks }: TaskCompletionChartProps) {
  const [mounted, setMounted] = useState(false);
  const [viewType, setViewType] = useState<ChartViewType>('bar');
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = getSevenDayCompletionStats(tasks);

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-dark-700 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-600 mb-8 h-64 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2 text-sm text-gray-400">
          <Activity className="w-4 h-4 text-primary-500 animate-spin" />
          <span>Loading 7-Day Completion Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-700 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-dark-600 mb-8 transition-all hover:shadow-md">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-dark-600">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/40">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                7-Day Task Completion History
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                  {stats.totalCompleted} done
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Visualizing daily completion velocity and task momentum over the last week
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-gray-100 dark:bg-dark-600 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewType('bar')}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              viewType === 'bar'
                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Daily Bars"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Bars</span>
          </button>

          <button
            type="button"
            onClick={() => setViewType('trend')}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              viewType === 'trend'
                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Completion Trend Curve"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Trend</span>
          </button>

          <button
            type="button"
            onClick={() => setViewType('categories')}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              viewType === 'categories'
                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Category Mix"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Categories</span>
          </button>
        </div>
      </div>

      {/* 7-Day Key Insights Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 bg-gray-50 dark:bg-dark-800/60 rounded-xl border border-gray-100 dark:border-dark-600">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Total Completed
          </span>
          <p className="text-xl font-extrabold text-gray-800 dark:text-gray-100 mt-0.5">
            {stats.totalCompleted}{' '}
            <span className="text-[11px] font-normal text-gray-400">tasks</span>
          </p>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-dark-800/60 rounded-xl border border-gray-100 dark:border-dark-600">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary-500" /> Daily Average
          </span>
          <p className="text-xl font-extrabold text-gray-800 dark:text-gray-100 mt-0.5">
            {stats.dailyAverage}{' '}
            <span className="text-[11px] font-normal text-gray-400">/ day</span>
          </p>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-dark-800/60 rounded-xl border border-gray-100 dark:border-dark-600">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-500" /> Peak Day
          </span>
          <p className="text-xl font-extrabold text-gray-800 dark:text-gray-100 mt-0.5 truncate">
            {stats.peakDayName !== 'None' ? stats.peakDayName : '—'}{' '}
            {stats.maxDayCount > 0 && (
              <span className="text-[11px] font-semibold text-emerald-500">
                ({stats.maxDayCount})
              </span>
            )}
          </p>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-dark-800/60 rounded-xl border border-gray-100 dark:border-dark-600">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" /> Active Days
          </span>
          <p className="text-xl font-extrabold text-gray-800 dark:text-gray-100 mt-0.5">
            {stats.activeDaysCount}{' '}
            <span className="text-[11px] font-normal text-gray-400">of 7 days</span>
          </p>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="mt-2 pt-2">
        <div className="w-full h-64 sm:h-72">
          {viewType === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.data}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-gray-200 dark:text-dark-600"
                />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-gray-500 dark:text-gray-400"
                  axisLine={{ stroke: 'currentColor' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-gray-500 dark:text-gray-400"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip viewType="bar" />}
                  cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }}
                />
                {stats.dailyAverage > 0 && (
                  <ReferenceLine
                    y={stats.dailyAverage}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label={{
                      value: `Avg ${stats.dailyAverage}`,
                      position: 'top',
                      fill: '#f59e0b',
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                )}
                <Bar
                  dataKey="completed"
                  name="Completed Tasks"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {viewType === 'trend' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.data}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-gray-200 dark:text-dark-600"
                />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-gray-500 dark:text-gray-400"
                  axisLine={{ stroke: 'currentColor' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-gray-500 dark:text-gray-400"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip viewType="trend" />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed Tasks"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#areaGradient)"
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {viewType === 'categories' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.data}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-gray-200 dark:text-dark-600"
                />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-gray-500 dark:text-gray-400"
                  axisLine={{ stroke: 'currentColor' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-gray-500 dark:text-gray-400"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip viewType="categories" />}
                  cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="Work" stackId="a" fill={CATEGORY_COLORS.Work} radius={[0, 0, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Health" stackId="a" fill={CATEGORY_COLORS.Health} radius={[0, 0, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Personal" stackId="a" fill={CATEGORY_COLORS.Personal} radius={[0, 0, 0, 0]} maxBarSize={32} />
                <Bar dataKey="General" stackId="a" fill={CATEGORY_COLORS.General} radius={[0, 0, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Finance" stackId="a" fill={CATEGORY_COLORS.Finance} radius={[0, 0, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Urgent" stackId="a" fill={CATEGORY_COLORS.Urgent} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Subtle Footer Prompt */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-2 pt-3 border-t border-gray-100 dark:border-dark-600 text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Interactive chart: Hover over any day to see specific completed tasks</span>
          </div>
          {stats.topCategory !== 'None' && (
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              Top category this week:{' '}
              <strong className="text-primary-600 dark:text-primary-400">{stats.topCategory}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
