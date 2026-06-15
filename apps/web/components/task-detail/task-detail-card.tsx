import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Pencil,
  Paperclip,
  FileText
} from 'lucide-react';
import {
  type TaskStatus,
  type TaskPriority
} from '@task-manager/shared/schemas/task';
import { Badge } from '@task-manager/ui/components/badge';
import { Button } from '@task-manager/ui/components/button';
import { cn } from '@task-manager/ui/lib/utils';

interface TaskDetailCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date | string;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
}

export function TaskDetailCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  isPending
}: TaskDetailCardProps) {
  const getAttachmentUrl = (pathUrl: string) => {
    if (pathUrl.startsWith('http://') || pathUrl.startsWith('https://'))
      return pathUrl;
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    try {
      const origin = new URL(apiUrl).origin;
      return `${origin}${pathUrl}`;
    } catch {
      return pathUrl;
    }
  };

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

  const getDueDateStyle = (dateVal: Date | string, statusVal: TaskStatus) => {
    if (statusVal === 'DONE') return 'text-slate-500 dark:text-slate-400';
    const d = new Date(dateVal);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (due < today) {
      return 'text-red-500 dark:text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded-md';
    }
    if (due.getTime() - today.getTime() <= 24 * 60 * 60 * 1000) {
      return 'text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md';
    }
    return 'text-slate-700 dark:text-slate-300';
  };

  return (
    <div className='rounded-2xl border border-slate-200/50 bg-white/95 p-6 shadow-xs sm:p-8 dark:border-slate-800/40 dark:bg-gray-900/95'>
      {/* Header Badges */}
      <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
        <Badge
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wider uppercase',
            task.status === 'TODO' &&
              'border-blue-200/50 bg-blue-50 text-blue-600 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400',
            task.status === 'IN_PROGRESS' &&
              'border-indigo-200/50 bg-indigo-50 text-indigo-600 dark:border-indigo-900/30 dark:bg-indigo-950/20 dark:text-indigo-400',
            task.status === 'DONE' &&
              'border-emerald-200/50 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400'
          )}
        >
          {task.status === 'TODO' && (
            <Circle className='size-3 fill-blue-600/20' />
          )}
          {task.status === 'IN_PROGRESS' && (
            <Clock className='size-3 fill-indigo-600/20' />
          )}
          {task.status === 'DONE' && (
            <CheckCircle2 className='size-3 fill-emerald-600/20' />
          )}
          <span>{task.status.replace('_', ' ')}</span>
        </Badge>

        <Badge
          className={cn(
            'rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wider uppercase',
            task.priority === 'HIGH' &&
              'border-red-200/50 bg-red-50 text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400',
            task.priority === 'MEDIUM' &&
              'border-amber-200/50 bg-amber-50 text-amber-600 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400',
            task.priority === 'LOW' &&
              'border-slate-200/50 bg-slate-100 text-slate-600 dark:border-slate-700/30 dark:bg-slate-800/40 dark:text-slate-400'
          )}
        >
          {task.priority} Priority
        </Badge>
      </div>

      {/* Title */}
      <h1 className='text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-gray-50'>
        {task.title}
      </h1>

      {/* Details Metadata Grid */}
      <div className='mt-6 grid grid-cols-1 gap-4 border-t border-b border-slate-100 py-5 sm:grid-cols-3 dark:border-slate-800/60'>
        <div className='flex items-center gap-2 text-xs'>
          <Calendar className='size-4.5 text-slate-400' />
          <div className='flex flex-col'>
            <span className='text-[9px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500'>
              Due Date
            </span>
            <span className={getDueDateStyle(task.dueDate, task.status)}>
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2 text-xs'>
          <Clock className='size-4.5 text-slate-400' />
          <div className='flex flex-col'>
            <span className='text-[9px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500'>
              Created Date
            </span>
            <span className='text-slate-700 dark:text-slate-300'>
              {formatDateTime(task.createdAt)}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2 text-xs'>
          <Clock className='size-4.5 text-slate-400' />
          <div className='flex flex-col'>
            <span className='text-[9px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500'>
              Last Updated
            </span>
            <span className='text-slate-700 dark:text-slate-300'>
              {formatDateTime(task.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className='mt-6'>
        <h3 className='mb-2.5 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500'>
          Description
        </h3>
        <p className='text-sm leading-relaxed whitespace-pre-wrap text-slate-600 sm:text-base dark:text-slate-300'>
          {task.description}
        </p>
      </div>

      {/* Attachment Section */}
      {task.attachmentUrl && (
        <div className='mt-8 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/40 dark:bg-slate-900/30'>
          <h4 className='mb-2.5 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500'>
            Attachment
          </h4>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2.5 overflow-hidden'>
              <div className='rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'>
                <FileText className='size-5 shrink-0' />
              </div>
              <div className='flex flex-col overflow-hidden'>
                <span className='truncate text-xs font-bold text-slate-700 dark:text-slate-200'>
                  {task.attachmentName || 'Attachment File'}
                </span>
                <span className='text-[10px] text-slate-400'>
                  Click to download or view
                </span>
              </div>
            </div>
            <a
              href={getAttachmentUrl(task.attachmentUrl)}
              target='_blank'
              rel='noopener noreferrer'
              className='dark:hover:bg-gray-750 inline-flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-xs hover:cursor-pointer hover:bg-slate-50 dark:border-slate-700 dark:bg-gray-800 dark:text-indigo-400'
            >
              <Paperclip className='size-3.5' />
              <span>Download</span>
            </a>
          </div>
        </div>
      )}

      {/* Actions panel */}
      <div className='mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-slate-800/60'>
        <div className='flex items-center gap-3.5'>
          <Button
            onClick={onToggleStatus}
            disabled={isPending}
            className='bg-blue-800 text-white hover:cursor-pointer hover:bg-blue-900 dark:bg-blue-800 dark:hover:bg-blue-900'
          >
            {task.status === 'DONE'
              ? 'Mark Incomplete'
              : task.status === 'IN_PROGRESS'
                ? 'Mark Done'
                : 'Start Task'}
          </Button>

          <Button
            variant='outline'
            onClick={onEdit}
            disabled={isPending}
            className='inline-flex items-center gap-1.5 hover:cursor-pointer'
          >
            <Pencil className='size-3.5' />
            <span>Edit Task</span>
          </Button>
        </div>

        <button
          onClick={onDelete}
          disabled={isPending}
          className='inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:cursor-pointer hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
        >
          <Trash2 className='size-4' />
          <span>Delete Task</span>
        </button>
      </div>
    </div>
  );
}
