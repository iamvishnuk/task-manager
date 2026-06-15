'use client';

import React, { use, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { type TaskStatus } from '@task-manager/shared/schemas/task';
import TaskCard from '@/components/task-card';
import TaskDialog from '@/components/task-dialog';
import WorkspaceHeader from '@/components/workspace-header';
import WorkspaceFilters from '@/components/workspace-filters';
import WorkspacePagination from '@/components/workspace-pagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTasksQueryFn,
  getTasksStatsQueryFn,
  updateTaskMutationFn,
  deleteTaskMutationFn
} from '@/lib/api';
import TaskEmptyState from '@/components/task-empty-state';
import { useTaskSSE } from '@/hooks/use-task-sse';

export default function Page({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  useTaskSSE();
  const resolvedSearchParams = use(searchParams);
  const { resolvedTheme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  // Interactive state initialized from searchParams (bookmarkable state)
  const [statusFilter, setStatusFilter] = useState<string>(
    typeof resolvedSearchParams.status === 'string'
      ? resolvedSearchParams.status
      : 'ALL'
  );
  const [priorityFilter, setPriorityFilter] = useState<string>(
    typeof resolvedSearchParams.priority === 'string'
      ? resolvedSearchParams.priority
      : 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    typeof resolvedSearchParams.search === 'string'
      ? resolvedSearchParams.search
      : ''
  );
  const [sortOrder, setSortOrder] = useState<string>(
    typeof resolvedSearchParams.sort === 'string'
      ? resolvedSearchParams.sort
      : 'dueDate_asc'
  );
  const [currentPage, setCurrentPage] = useState<number>(
    typeof resolvedSearchParams.page === 'string'
      ? parseInt(resolvedSearchParams.page, 10)
      : 1
  );

  // Debounced search query to prevent excessive API hits
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState<string>(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset page to 1 on search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync state to URL without reloading the page
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
    if (searchQuery) params.set('search', searchQuery);
    if (sortOrder !== 'dueDate_asc') params.set('sort', sortOrder);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query}`
    );
  }, [statusFilter, priorityFilter, searchQuery, sortOrder, currentPage]);

  const handleFilterChange = (updater: () => void) => {
    updater();
    setCurrentPage(1);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<
    | (import('@task-manager/shared/schemas/task').Task & { id: string })
    | undefined
  >(undefined);
  const ITEMS_PER_PAGE = 6;

  // 1. Fetch Task Status Metrics from backend
  const { data: statsQueryData } = useQuery({
    queryKey: ['tasks-stats'],
    queryFn: getTasksStatsQueryFn
  });

  const stats = statsQueryData?.data ?? {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
    total: 0
  };

  // 2. Fetch Tasks list (paginated, filtered, searched, sorted) from backend
  const {
    data: tasksQueryData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: [
      'tasks',
      statusFilter,
      priorityFilter,
      debouncedSearchQuery,
      sortOrder,
      currentPage
    ],
    queryFn: () =>
      getTasksQueryFn({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
        search: debouncedSearchQuery || undefined,
        sort: sortOrder,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      })
  });

  const tasksList = tasksQueryData?.data?.tasks ?? [];
  const totalItems = tasksQueryData?.data?.pagination?.total ?? 0;
  const totalPages = tasksQueryData?.data?.pagination?.totalPages ?? 1;

  // 3. Mutate Task Status (Quick Action Toggle)
  const { mutate: updateStatus } = useMutation({
    mutationFn: updateTaskMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update task status', {
        description: error.message || 'Please try again.'
      });
    }
  });

  const toggleTaskStatus = (id: string) => {
    const task = tasksList.find((t) => t.id === id);
    if (!task) return;

    const nextStatusMap: Record<TaskStatus, TaskStatus> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO'
    };
    const nextStatus = nextStatusMap[task.status];
    toast.success(`Task status updated to ${nextStatus.replace('_', ' ')}`);

    updateStatus({
      id,
      data: { status: nextStatus }
    });
  };

  // 4. Mutate Task Deletion
  const { mutate: deleteTask } = useMutation({
    mutationFn: deleteTaskMutationFn,
    onSuccess: () => {
      toast.success('Task deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats'] });
    },
    onError: (error: any) => {
      toast.error('Failed to delete task', {
        description: error.message || 'Please try again.'
      });
    }
  });

  // Safe page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className='min-h-svh w-full bg-slate-50/70 text-slate-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-50'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <WorkspaceHeader
          theme={resolvedTheme}
          setTheme={setTheme}
          onNewTaskClick={() => {
            setEditingTask(undefined);
            setIsModalOpen(true);
          }}
        />

        {/* Filters & Control Panel */}
        <WorkspaceFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          priorityFilter={priorityFilter}
          setPriorityFilter={(val) =>
            handleFilterChange(() => setPriorityFilter(val))
          }
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          statusFilter={statusFilter}
          setStatusFilter={(val) =>
            handleFilterChange(() => setStatusFilter(val))
          }
          stats={stats}
        />

        {/* Tasks View: Loading vs Error vs List vs Empty */}
        {isLoading ? (
          <div className='flex h-64 items-center justify-center rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/40 dark:bg-gray-900/50'>
            <div className='flex flex-col items-center gap-3'>
              <Loader2 className='size-8 animate-spin text-blue-900 dark:text-blue-600' />
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Loading your workspace...
              </p>
            </div>
          </div>
        ) : isError ? (
          <div className='flex h-64 items-center justify-center rounded-2xl border border-red-200/50 bg-red-50/20 dark:border-red-900/30 dark:bg-red-950/10'>
            <div className='flex flex-col items-center gap-3 text-center'>
              <p className='text-sm font-semibold text-red-600 dark:text-red-400'>
                Failed to load tasks
              </p>
              <p className='max-w-md text-xs text-red-500/80 dark:text-red-400/80'>
                {(error as any)?.message ||
                  'An unexpected error occurred while fetching tasks. Please try again.'}
              </p>
              <button
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ['tasks'] })
                }
                className='mt-2 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:cursor-pointer hover:bg-red-500'
              >
                Retry
              </button>
            </div>
          </div>
        ) : tasksList.length > 0 ? (
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {tasksList.map((task) => (
              <TaskCard
                task={task}
                toggleTaskStatus={toggleTaskStatus}
                deleteTask={(id) => deleteTask(id)}
                onEdit={(task) => {
                  setEditingTask(task);
                  setIsModalOpen(true);
                }}
                key={task.id}
              />
            ))}
          </div>
        ) : (
          <TaskEmptyState
            setPriorityFilter={setPriorityFilter}
            setStatusFilter={setStatusFilter}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* Pagination controls */}
        {!isLoading && totalItems > ITEMS_PER_PAGE && (
          <WorkspacePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={goToPage}
          />
        )}
      </div>

      <TaskDialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingTask(undefined);
          }
        }}
        task={editingTask}
      />
    </div>
  );
}
