'use client';

import React, { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

import { type TaskStatus } from '@task-manager/shared/schemas/task';
import {
  getTaskByIdQueryFn,
  updateTaskMutationFn,
  deleteTaskMutationFn,
  getTaskHistoryQueryFn
} from '@/lib/api';
import TaskDialog from '@/components/task-dialog';
import { TaskDetailCard } from '@/components/task-detail/task-detail-card';
import { TaskActivityTimeline } from '@/components/task-detail/task-activity-timeline';
import {
  TaskDetailLoading,
  TaskDetailError
} from '@/components/task-detail/task-detail-fallback';
import { useTaskSSE } from '@/hooks/use-task-sse';

export default function TaskDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  useTaskSSE();
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

  // Fetch task history
  const { data: historyResponse, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['task-history', taskId],
    queryFn: () => getTaskHistoryQueryFn(taskId),
    enabled: !!taskId
  });

  const history = historyResponse?.data || [];

  // 2. Status toggle mutation
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: updateTaskMutationFn,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task-history', taskId] });
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

  const handleDeleteTask = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  const isPending = isUpdatingStatus || isDeleting;

  // Render loading state
  if (isLoading) {
    return <TaskDetailLoading />;
  }

  // Render error/not found state
  if (isError || !task) {
    return (
      <TaskDetailError
        message={
          (error as any)?.message ||
          'The task you are looking for does not exist or you do not have permission to view it.'
        }
        onBack={() => router.push('/')}
      />
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

        {/* Task Details Card */}
        <TaskDetailCard
          task={task}
          onToggleStatus={handleToggleStatus}
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={handleDeleteTask}
          isPending={isPending}
        />

        {/* Task Activity Log Timeline */}
        <TaskActivityTimeline
          history={history}
          isLoading={isHistoryLoading}
        />
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
