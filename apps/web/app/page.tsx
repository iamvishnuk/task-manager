'use client';

import React, { use, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Moon,
  Sun,
  X,
  AlertTriangle,
  ArrowUpDown,
  Filter
} from 'lucide-react';

import { Button } from '@task-manager/ui/components/button';
import { Input } from '@task-manager/ui/components/input';
import { Label } from '@task-manager/ui/components/label';
import { Textarea } from '@task-manager/ui/components/textarea';
import { cn } from '@task-manager/ui/lib/utils';
import {
  type Task,
  TaskStatus,
  TaskPriority
} from '@task-manager/shared/schemas/task';
import TaskCard from '@/components/task-card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@task-manager/ui/components/select';
import Logo from '@/images/logo.png';
import Image from 'next/image';
import TaskDialog from '@/components/task-dialog';

// Initial dummy tasks array matching the Task model
const INITIAL_TASKS: (Task & { id: string })[] = [
  {
    id: '1',
    title: 'Complete Project Pitch Presentation',
    description:
      'Prepare slides and key speaking points for the Q3 product roadmap review session with the executive team.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow
  },
  {
    id: '2',
    title: 'Conduct Design System Audit',
    description:
      'Review component patterns, spacing consistency, and accessibility features across all dashboard views.',
    status: 'DONE',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: '3',
    title: 'Refactor Core API Controllers',
    description:
      'Clean up controller files to implement generic handler middleware, improve query performance, and add structured error logging.',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
  },
  {
    id: '4',
    title: 'Update Project Documentation & README',
    description:
      'Add clear API endpoint guides, environment setup instructions, and deployment workflow diagrams to the README.',
    status: 'TODO',
    priority: 'LOW',
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000) // 8 days from now
  },
  {
    id: '5',
    title: 'Set up Production PostgreSQL & Drizzle ORM',
    description:
      'Provision database schema in production, write deployment migrations, and configure connection pool settings.',
    status: 'DONE',
    priority: 'HIGH',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    id: '6',
    title: 'Implement Authentication Middleware',
    description:
      'Secure API endpoints with JSON Web Token (JWT) validation and check permission scopes for task edits.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
  },
  {
    id: '7',
    title: 'Integrate Tailwind CSS v4 Theme',
    description:
      'Upgrade the existing design token systems to work with @tailwindcss/postcss and define premium CSS variables.',
    status: 'DONE',
    priority: 'LOW',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: '8',
    title: 'Write Endpoint Integration Tests',
    description:
      'Write robust test suites for task filtering, user authorization, and request validations using Vitest.',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) // 6 days from now
  },
  {
    id: '9',
    title: 'Optimize Image and UI Assets',
    description:
      'Compress layout logos, run WebP conversion tools, and establish lazy loading logic for asset packages.',
    status: 'TODO',
    priority: 'LOW',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
  },
  {
    id: '10',
    title: 'Fix Login Toast Alerts & Notifications',
    description:
      'Resolve issue where toast alerts would output standard errors instead of user-friendly validation messages.',
    status: 'DONE',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
  },
  {
    id: '11',
    title: 'Deploy Application to Staging',
    description:
      'Configure CI/CD pipelines, coordinate Docker builds, and run end-to-end user flows on the staging domain.',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) // 4 days from now
  },
  {
    id: '12',
    title: 'Prepare Sprint Retrospective Report',
    description:
      'Compile team statistics, outstanding tickets, bottleneck analysis, and action items for the upcoming retrospective.',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  }
];

export default function Page({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Read search params using React's `use` hook
  const resolvedSearchParams = use(searchParams);

  const { resolvedTheme, setTheme } = useTheme();
  const [tasks, setTasks] = useState<(Task & { id: string })[]>(INITIAL_TASKS);

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

  // Reset page number on filter/search update
  const handleFilterChange = (updater: () => void) => {
    updater();
    setCurrentPage(1);
  };

  // State for Create Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<TaskStatus>('TODO');
  const [newPriority, setNewPriority] = useState<TaskPriority>('MEDIUM');
  const [newDueDate, setNewDueDate] = useState('');

  // Handle task creation
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!newDueDate) {
      toast.error('Due date is required');
      return;
    }

    const newTask: Task & { id: string } = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: newStatus,
      priority: newPriority,
      dueDate: new Date(newDueDate)
    };

    setTasks((prev) => [newTask, ...prev]);
    toast.success('Task created successfully!');

    // Reset Form & Close Modal
    setNewTitle('');
    setNewDescription('');
    setNewStatus('TODO');
    setNewPriority('MEDIUM');
    setNewDueDate('');
    setIsModalOpen(false);
  };

  // Status counts calculations
  const totalTasksCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter(
    (t) => t.status === 'IN_PROGRESS'
  ).length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

  // Filter tasks based on filters and search
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'ALL' || task.priority === priorityFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase() || '').includes(
        searchQuery.toLowerCase()
      );
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOrder === 'dueDate_asc') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    } else if (sortOrder === 'dueDate_desc') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return b.dueDate.getTime() - a.dueDate.getTime();
    } else if (sortOrder === 'priority_desc') {
      const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    } else if (sortOrder === 'priority_asc') {
      const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    }
    return 0;
  });

  // Pagination helper
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(sortedTasks.length / ITEMS_PER_PAGE) || 1;
  const paginatedTasks = sortedTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Safe page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Toggle tasks status directly from card (quick action)
  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatusMap: Record<TaskStatus, TaskStatus> = {
            TODO: 'IN_PROGRESS',
            IN_PROGRESS: 'DONE',
            DONE: 'TODO'
          };
          const nextStatus = nextStatusMap[t.status];
          toast.success(
            `Task status updated to ${nextStatus.replace('_', ' ')}`
          );
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  return (
    <div className='min-h-svh w-full bg-slate-50/70 text-slate-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-50'>
      {/* Dynamic Background Gradients */}
      <div className='absolute top-0 left-0 -z-10 h-[500px] w-full bg-linear-to-b from-indigo-500/10 via-sky-500/5 to-transparent dark:from-indigo-950/20 dark:via-transparent' />

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <header className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <div className='flex items-center gap-2.5'>
              <Image
                src={Logo}
                alt='Tasks Manager Logo'
                width={32}
                height={32}
              />
              <h1 className='text-xl font-extrabold tracking-tight text-blue-900 md:text-3xl dark:text-blue-800'>
                Task Workspace
              </h1>
            </div>
            <p className='mt-1.5 text-xs text-slate-500 md:text-sm dark:text-slate-400'>
              Streamline your workflow, manage tasks, and track statuses
              seamlessly.
            </p>
          </div>

          <div className='flex items-center gap-3 self-end sm:self-auto'>
            {/* Theme Toggle Button */}
            <Button
              variant='outline'
              size='icon'
              title='Toggle theme (d)'
              className='rounded-md border-slate-200 bg-white/80 shadow-xs dark:border-slate-800 dark:bg-gray-900/80'
              onClick={() =>
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
              }
            >
              {resolvedTheme === 'dark' ? (
                <Sun className='size-4 text-white' />
              ) : (
                <Moon className='size-4 text-indigo-600' />
              )}
            </Button>

            {/* Create Task Action */}
            <Button
              className='rounded-md bg-blue-900 font-semibold text-white shadow-md shadow-indigo-600/15 hover:cursor-pointer hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-900'
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className='size-4' />
              <span>New Task</span>
            </Button>
          </div>
        </header>

        {/* Filters & Control Panel */}
        <section className='mb-8 rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-xs backdrop-blur-md dark:border-slate-800/40 dark:bg-gray-900/60'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            {/* Search Input */}
            <div className='relative max-w-lg flex-1'>
              <Search className='absolute top-2.5 left-3 size-4 text-slate-400' />
              <Input
                type='text'
                placeholder='Search tasks by title or description...'
                value={searchQuery}
                onChange={(e) =>
                  handleFilterChange(() => setSearchQuery(e.target.value))
                }
                className='h-9.5 rounded-md border-slate-200 bg-white pl-9 text-sm dark:border-slate-800 dark:bg-gray-950'
              />
            </div>

            {/* Filter controls groups */}
            <div className='flex flex-wrap items-center gap-3.5'>
              {/* Priority Select */}
              <div className='flex items-center gap-2'>
                <Filter className='size-3.5 text-slate-400' />
                <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                  Priority:
                </span>
                <Select
                  onValueChange={(value) =>
                    handleFilterChange(() => setPriorityFilter(value))
                  }
                  value={priorityFilter}
                >
                  <SelectTrigger className='w-[180px] rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-slate-800 dark:bg-gray-950'>
                    <SelectValue placeholder='Select Priority' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value='ALL'>All Priorities</SelectItem>
                      <SelectItem value='HIGH'>High</SelectItem>
                      <SelectItem value='MEDIUM'>Medium</SelectItem>
                      <SelectItem value='LOW'>Low</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Select */}
              <div className='flex items-center gap-2'>
                <ArrowUpDown className='size-3.5 text-slate-400' />
                <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                  Sort By:
                </span>

                <Select
                  onValueChange={(value) => setSortOrder(value)}
                  value={sortOrder}
                >
                  <SelectTrigger className='w-[180px] rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-slate-800 dark:bg-gray-950'>
                    <SelectValue placeholder='Select Sort' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value='dueDate_desc'>
                        Due Date: Earliest First
                      </SelectItem>
                      <SelectItem value='dueDate_asc'>
                        Due Date: Latest First
                      </SelectItem>
                      <SelectItem value='priority_desc'>
                        Priority: High to Low
                      </SelectItem>
                      <SelectItem value='priority_asc'>
                        Priority: Low to High
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Status Tabs Filter */}
          <div className='mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 md:flex md:flex-wrap dark:border-slate-800/60'>
            {[
              { label: 'All Tasks', value: 'ALL', count: totalTasksCount },
              { label: 'To Do', value: 'TODO', count: todoCount },
              {
                label: 'In Progress',
                value: 'IN_PROGRESS',
                count: inProgressCount
              },
              { label: 'Completed', value: 'DONE', count: doneCount }
            ].map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() =>
                    handleFilterChange(() => setStatusFilter(tab.value))
                  }
                  className={cn(
                    'inline-flex items-center justify-between gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all select-none',
                    isActive
                      ? 'bg-blue-800 text-white shadow-sm shadow-indigo-600/10 dark:bg-blue-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800'
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                      isActive
                        ? 'bg-blue-900 text-white'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Tasks Grid List */}
        {paginatedTasks.length > 0 ? (
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {paginatedTasks.map((task) => (
              <TaskCard
                task={task}
                toggleTaskStatus={toggleTaskStatus}
                key={task.id}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center dark:border-slate-800 dark:bg-gray-900/50'>
            <div className='flex size-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800'>
              <AlertTriangle className='size-6 text-slate-400' />
            </div>
            <h3 className='mt-4 text-base font-bold text-slate-800 dark:text-slate-200'>
              No tasks found
            </h3>
            <p className='mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400'>
              No items match your active filters or search terms. Try refining
              your selections.
            </p>
            <Button
              className='mt-4.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
              onClick={() => {
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination controls */}
        {sortedTasks.length > ITEMS_PER_PAGE && (
          <footer className='mt-8 flex items-center justify-between border-t border-slate-200/60 pt-6 dark:border-slate-800/60'>
            <span className='text-xs text-slate-500 dark:text-slate-400'>
              Showing{' '}
              <span className='font-semibold text-slate-700 dark:text-slate-200'>
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{' '}
              to{' '}
              <span className='font-semibold text-slate-700 dark:text-slate-200'>
                {Math.min(currentPage * ITEMS_PER_PAGE, sortedTasks.length)}
              </span>{' '}
              of{' '}
              <span className='font-semibold text-slate-700 dark:text-slate-200'>
                {sortedTasks.length}
              </span>{' '}
              tasks
            </span>

            <div className='flex items-center gap-1.5'>
              <Button
                variant='outline'
                size='icon-sm'
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className='rounded-lg border-slate-200 bg-white shadow-2xs disabled:opacity-40 dark:border-slate-800 dark:bg-gray-900'
              >
                <ChevronLeft className='size-3.5' />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size='icon-sm'
                    onClick={() => goToPage(page)}
                    className={cn(
                      'rounded-lg text-xs font-bold shadow-2xs',
                      currentPage === page
                        ? 'border-transparent bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-gray-900'
                    )}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant='outline'
                size='icon-sm'
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='rounded-lg border-slate-200 bg-white shadow-2xs disabled:opacity-40 dark:border-slate-800 dark:bg-gray-900'
              >
                <ChevronRight className='size-3.5' />
              </Button>
            </div>
          </footer>
        )}
      </div>

      {/* Create Task Modal Dialog */}
      {false && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs transition-opacity duration-300 dark:bg-black/70'>
          <div className='relative w-full max-w-md animate-in rounded-2xl border border-slate-200/50 bg-white p-6 shadow-xl duration-200 zoom-in-95 fade-in dark:border-slate-800/80 dark:bg-gray-950'>
            {/* Close action */}
            <button
              onClick={() => setIsModalOpen(false)}
              className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            >
              <X className='size-4' />
            </button>

            <h2 className='bg-linear-to-r from-slate-900 to-indigo-950 bg-clip-text text-lg font-bold text-transparent dark:from-slate-50 dark:to-slate-300'>
              Create New Task
            </h2>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              Fill out the details below to add a new task to your playground.
            </p>

            <form
              onSubmit={handleCreateTask}
              className='mt-4 space-y-4'
            >
              <div className='space-y-1.5'>
                <Label htmlFor='task-title'>Task Title</Label>
                <Input
                  id='task-title'
                  type='text'
                  required
                  placeholder='e.g. Design Landing Page'
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className='rounded-lg border-slate-200 bg-slate-50/50 text-sm dark:border-slate-800 dark:bg-gray-900'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='task-desc'>Description</Label>
                <Textarea
                  id='task-desc'
                  placeholder='Provide a brief description of the work needed...'
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className='min-h-20 rounded-lg border-slate-200 bg-slate-50/50 text-sm dark:border-slate-800 dark:bg-gray-900'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='task-status'>Status</Label>
                  <select
                    id='task-status'
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className='h-8 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-sm transition-colors outline-none dark:border-slate-800 dark:bg-gray-900'
                  >
                    <option value='TODO'>To Do</option>
                    <option value='IN_PROGRESS'>In Progress</option>
                    <option value='DONE'>Completed</option>
                  </select>
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='task-priority'>Priority</Label>
                  <select
                    id='task-priority'
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as TaskPriority)
                    }
                    className='h-8 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-sm transition-colors outline-none dark:border-slate-800 dark:bg-gray-900'
                  >
                    <option value='LOW'>Low</option>
                    <option value='MEDIUM'>Medium</option>
                    <option value='HIGH'>High</option>
                  </select>
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='task-due'>Due Date</Label>
                <Input
                  id='task-due'
                  type='date'
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className='rounded-lg border-slate-200 bg-slate-50/50 text-sm dark:border-slate-800 dark:bg-gray-900'
                />
              </div>

              <div className='mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-3 dark:border-slate-900'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsModalOpen(false)}
                  className='rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-gray-900'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='rounded-xl bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                >
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <TaskDialog
        open={isModalOpen}
        onOpenChange={(open) => setIsModalOpen(open)}
      />
    </div>
  );
}
