'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Layers,
  Folder,
  Briefcase,
  User,
  Flame,
  Heart,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Tag,
  X,
} from 'lucide-react';
import { Task, Category } from '@/types/todo';

interface CategoryTabBarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  tasks: Task[];
}

const DEFAULT_CATEGORIES: { name: string; label: string; icon: React.ElementType; color: string }[] = [
  { name: 'all', label: 'All Tasks', icon: Layers, color: 'text-primary-500 bg-primary-500/10' },
  { name: 'General', label: 'General', icon: Folder, color: 'text-gray-500 bg-gray-500/10' },
  { name: 'Work', label: 'Work', icon: Briefcase, color: 'text-blue-500 bg-blue-500/10' },
  { name: 'Personal', label: 'Personal', icon: User, color: 'text-purple-500 bg-purple-500/10' },
  { name: 'Urgent', label: 'Urgent', icon: Flame, color: 'text-red-500 bg-red-500/10' },
  { name: 'Health', label: 'Health', icon: Heart, color: 'text-emerald-500 bg-emerald-500/10' },
  { name: 'Finance', label: 'Finance', icon: DollarSign, color: 'text-amber-500 bg-amber-500/10' },
];

export function CategoryTabBar({
  activeCategory,
  onSelectCategory,
  tasks,
}: CategoryTabBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // Extract any custom categories from tasks that are not in default list
  const existingCategories = new Set(
    DEFAULT_CATEGORIES.map((c) => c.name.toLowerCase())
  );
  const customCategories = Array.from(
    new Set(
      tasks
        .map((t) => t.category)
        .filter((c) => Boolean(c) && !existingCategories.has(c.toLowerCase()))
    )
  );

  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories.map((cat) => ({
      name: cat,
      label: cat,
      icon: Tag,
      color: 'text-teal-500 bg-teal-500/10',
    })),
  ];

  // Calculate task counts per category
  const categoryCounts = tasks.reduce<Record<string, { total: number; pending: number }>>(
    (acc, task) => {
      const cat = task.category || 'General';
      if (!acc[cat]) {
        acc[cat] = { total: 0, pending: 0 };
      }
      acc[cat].total += 1;
      if (!task.completed) {
        acc[cat].pending += 1;
      }
      return acc;
    },
    {}
  );

  const totalTasksCount = tasks.length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 10);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tasks]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-4 group">
      {/* Category Tab Bar Header / Bar Container */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-primary-500" /> Category Filters
        </span>

        {activeCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-semibold text-emerald-600 dark:text-primary-400 hover:text-emerald-700 dark:hover:text-primary-300 flex items-center gap-1 transition-colors"
          >
            Clear category filter <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="relative flex items-center w-full max-w-full min-w-0 overflow-hidden">
        {/* Left Scroll Button */}
        {showLeftScroll && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-2 z-10 p-1.5 rounded-full bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-dark-600 shadow-md hover:bg-gray-50 dark:hover:bg-dark-600 transition-all"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Tabs Wrapper */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 w-full scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allCategories.map((cat) => {
            const isActive = activeCategory === cat.name;
            const Icon = cat.icon;
            const isAll = cat.name === 'all';

            const countObj = isAll
              ? { total: totalTasksCount, pending: pendingTasksCount }
              : categoryCounts[cat.name] || { total: 0, pending: 0 };

            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 dark:bg-primary-500 text-white border-emerald-600 dark:border-primary-500 shadow-sm shadow-emerald-600/20 scale-[1.02]'
                    : 'bg-white dark:bg-dark-700 text-slate-700 dark:text-gray-300 border-slate-200/80 dark:border-dark-600 hover:bg-slate-50 dark:hover:bg-dark-600 hover:border-slate-300 dark:hover:border-dark-500 shadow-2xs'
                }`}
              >
                <span
                  className={`p-1 rounded-lg ${
                    isActive ? 'bg-white/20 text-white' : cat.color
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>

                <span>{cat.label}</span>

                {/* Badge Count */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-dark-600 text-slate-700 dark:text-gray-400'
                  }`}
                >
                  {countObj.pending > 0 ? (
                    <span>
                      {countObj.pending}
                      <span className="opacity-60 text-[9px]">/{countObj.total}</span>
                    </span>
                  ) : (
                    <span>{countObj.total}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        {showRightScroll && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-2 z-10 p-1.5 rounded-full bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-dark-600 shadow-md hover:bg-gray-50 dark:hover:bg-dark-600 transition-all"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
