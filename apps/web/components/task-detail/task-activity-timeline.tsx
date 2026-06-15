import React from 'react';
import {
  Activity,
  Loader2,
  Plus,
  Pencil,
  Check,
  Clock,
  Paperclip,
  Calendar,
  User
} from 'lucide-react';
import { type TaskHistoryItem } from '@/lib/api';

interface TaskActivityTimelineProps {
  history: TaskHistoryItem[];
  isLoading: boolean;
}

export function TaskActivityTimeline({
  history,
  isLoading
}: TaskActivityTimelineProps) {
  const formatDateTime = (dateVal: Date | string) => {
    const d = new Date(dateVal);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className='mt-8 rounded-2xl border border-slate-200/50 bg-white/95 p-6 shadow-xs sm:p-8 dark:border-slate-800/40 dark:bg-gray-900/95'>
      <h2 className='mb-6 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-gray-50'>
        <Activity className='size-5 text-indigo-600 dark:text-indigo-400' />
        <span>Activity Log</span>
      </h2>

      {isLoading ? (
        <div className='flex items-center justify-center py-6'>
          <Loader2 className='size-6 animate-spin text-slate-400' />
        </div>
      ) : history.length === 0 ? (
        <div className='py-6 text-center text-xs text-slate-500 dark:text-slate-400'>
          No activity recorded yet.
        </div>
      ) : (
        <div className='relative ml-4 space-y-8 border-l-2 border-slate-100 pl-6 dark:border-slate-800'>
          {history.map((item) => {
            // Determine icon and icon background based on actions and details
            let Icon = Activity;
            let bgClass =
              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/80';

            if (item.action === 'CREATE') {
              Icon = Plus;
              bgClass =
                'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30';
            } else if (item.action === 'UPDATE') {
              Icon = Pencil;
              bgClass =
                'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30';

              // Specific overrides based on single field changes
              if (item.changes && item.changes.length === 1) {
                const change = item.changes[0]!;
                const field = change.field;
                if (field === 'status') {
                  const toVal = change.to;
                  if (toVal === 'DONE') {
                    Icon = Check;
                    bgClass =
                      'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30';
                  } else {
                    Icon = Clock;
                    bgClass =
                      'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30';
                  }
                } else if (field === 'attachment') {
                  Icon = Paperclip;
                  bgClass =
                    'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400 border-cyan-200/50 dark:border-cyan-900/30';
                } else if (field === 'due date') {
                  Icon = Calendar;
                  bgClass =
                    'bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400 border-teal-200/50 dark:border-teal-900/30';
                }
              }
            }

            return (
              <div
                key={item.id}
                className='group relative'
              >
                {/* Circle icon on the timeline line */}
                <div
                  className={`absolute top-0.5 -left-[40px] flex size-8 items-center justify-center rounded-full border bg-white shadow-xs transition-colors duration-200 dark:bg-gray-950 ${bgClass}`}
                >
                  <Icon className='size-4' />
                </div>

                <div className='flex flex-col gap-1'>
                  {/* Description & Action details */}
                  <div className='text-xs font-semibold text-slate-800 dark:text-slate-200'>
                    {item.description}
                  </div>

                  {/* Detail log if there are multiple updates */}
                  {item.action === 'UPDATE' &&
                    item.changes &&
                    item.changes.length > 1 && (
                      <div className='mt-2 space-y-1 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/40 dark:bg-slate-900/30'>
                        {item.changes.map((change, idx) => {
                          const formatChangeVal = (v: any) =>
                            v === null ? 'none' : String(v).replace('_', ' ');
                          return (
                            <div
                              key={idx}
                              className='flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-600 dark:text-slate-400'
                            >
                              <span className='font-bold text-slate-500 capitalize'>
                                {change.field}:
                              </span>
                              <span className='text-slate-400 line-through'>
                                {formatChangeVal(change.from)}
                              </span>
                              <span className='text-slate-400'>→</span>
                              <span className='font-medium text-slate-700 dark:text-slate-300'>
                                {formatChangeVal(change.to)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {/* Subtitle with User / Email & Timestamp */}
                  <div className='mt-1 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500'>
                    <span className='inline-flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400'>
                      <User className='size-3' />
                      {item.userEmail || 'System'}
                    </span>
                    <span>•</span>
                    <span>{formatDateTime(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
