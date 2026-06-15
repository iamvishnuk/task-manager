'use client';

import React, { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Pencil,
  Paperclip,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';

import {
  type TaskStatus,
  type TaskPriority
} from '@task-manager/shared/schemas/task';
import { Badge } from '@task-manager/ui/components/badge';
import { Button } from '@task-manager/ui/components/button';
import { cn } from '@task-manager/ui/lib/utils';
import {
  getTaskByIdQueryFn,
  updateTaskMutationFn,
  deleteTaskMutationFn
} from '@/lib/api';
import TaskDialog from '@/components/task-dialog';

export default function TaskDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const taskId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // 1. Fetch task details
  const {
    data: queryResponse,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTaskByIdQueryFn(taskId),
    enabled: !!taskId
  });

  const task = queryResponse?.data;

  // 2. Status toggle mutation
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: updateTaskMutationFn,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats'] });

      const nextStatus = response?.data?.status || 'TODO';
      toast.success(`Task marked as ${nextStatus.replace('_', ' ')}`);
    },
    onError: (err: any) => {
      toast.error('Failed to update task status', {
        description: err.message || 'Please try again.'
      });
    }
  });

  // 3. Deletion mutation
  const { mutate: deleteTask, isPending: isDeleting } = useMutation({
    mutationFn: deleteTaskMutationFn,
    onSuccess: () => {
      toast.success('Task deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats'] });
      router.push('/');
    },
    onError: (err: any) => {
      toast.error('Failed to delete task', {
        description: err.message || 'Please try again.'
      });
    }
  });

  const handleToggleStatus = () => {
    if (!task) return;
    const nextStatusMap: Record<TaskStatus, TaskStatus> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO'
    };
    const nextStatus = nextStatusMap[task.status];
    updateStatus({
      id: taskId,
      data: { status: nextStatus }
    });
  };

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

  const isPending = isUpdatingStatus || isDeleting;

  // Render loading state
  if (isLoading) {
    return (
      <div className='flex min-h-svh w-full items-center justify-center bg-slate-50/70 dark:bg-gray-950'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='size-8 animate-spin text-blue-900 dark:text-blue-600' />
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            Loading task details...
          </p>
        </div>
      </div>
    );
  }

  // Render error/not found state
  if (isError || !task) {
    return (
      <div className='flex min-h-svh w-full items-center justify-center bg-slate-50/70 p-4 dark:bg-gray-950'>
        <div className='flex max-w-md flex-col items-center gap-4 rounded-2xl border border-red-200/50 bg-white p-6 text-center shadow-xs dark:border-red-950/40 dark:bg-gray-900'>
          <AlertCircle className='size-10 text-red-500' />
          <div className='flex flex-col gap-1'>
            <h2 className='text-base font-bold text-slate-900 dark:text-gray-50'>
              Failed to load task
            </h2>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              {(error as any)?.message ||
                'The task you are looking for does not exist or you do not have permission to view it.'}
            </p>
          </div>
          <Button
            onClick={() => router.push('/')}
            className='mt-2 inline-flex items-center gap-1.5 hover:cursor-pointer'
          >
            <ArrowLeft className='size-4' />
            <span>Back to Workspace</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-svh w-full bg-slate-50/70 text-slate-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-50'>
      <div className='mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Top Back Navigation Link */}
        <button
          onClick={() => router.push('/')}
          disabled={isPending}
          className='mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:cursor-pointer hover:text-slate-800 dark:text-slate-400 dark:hover:text-gray-200'
        >
          <ArrowLeft className='size-4' />
          <span>Back to Workspace</span>
        </button>

        {/* Task Details Card Layout */}
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
                onClick={handleToggleStatus}
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
                onClick={() => setIsEditDialogOpen(true)}
                disabled={isPending}
                className='inline-flex items-center gap-1.5 hover:cursor-pointer'
              >
                <Pencil className='size-3.5' />
                <span>Edit Task</span>
              </Button>
            </div>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this task?')) {
                  deleteTask(taskId);
                }
              }}
              disabled={isPending}
              className='inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:cursor-pointer hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
            >
              <Trash2 className='size-4' />
              <span>Delete Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal integration */}
      <TaskDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => setIsEditDialogOpen(open)}
        task={task}
      />
    </div>
  );
}
