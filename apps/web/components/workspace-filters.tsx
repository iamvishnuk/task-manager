import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { Input } from '@task-manager/ui/components/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@task-manager/ui/components/select';
import { cn } from '@task-manager/ui/lib/utils';

type WorkspaceFiltersProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  sortOrder: string;
  setSortOrder: (sort: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  stats: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
    total: number;
  };
};

const WorkspaceFilters = ({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  sortOrder,
  setSortOrder,
  statusFilter,
  setStatusFilter,
  stats
}: WorkspaceFiltersProps) => {
  return (
    <section className='mb-8 rounded-2xl border border-slate-200/50 bg-white/70 p-5 shadow-xs backdrop-blur-md dark:border-slate-800/40 dark:bg-gray-900/60'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        {/* Search Input */}
        <div className='relative max-w-lg flex-1'>
          <Search className='absolute top-2.5 left-3 size-4 text-slate-400' />
          <Input
            type='text'
            placeholder='Search tasks by title or description...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              onValueChange={setPriorityFilter}
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
              onValueChange={setSortOrder}
              value={sortOrder}
            >
              <SelectTrigger className='w-[180px] rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-slate-800 dark:bg-gray-950'>
                <SelectValue placeholder='Select Sort' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='dueDate_asc'>
                    Due Date: Earliest First
                  </SelectItem>
                  <SelectItem value='dueDate_desc'>
                    Due Date: Latest First
                  </SelectItem>
                  <SelectItem value='priority_desc'>
                    Priority: High to Low
                  </SelectItem>
                  <SelectItem value='priority_asc'>
                    Priority: Low to High
                  </SelectItem>
                  <SelectItem value='createdAt_desc'>
                    Created Date: Newest First
                  </SelectItem>
                  <SelectItem value='createdAt_asc'>
                    Created Date: Oldest First
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
          { label: 'All Tasks', value: 'ALL', count: stats.total },
          { label: 'To Do', value: 'TODO', count: stats.TODO },
          {
            label: 'In Progress',
            value: 'IN_PROGRESS',
            count: stats.IN_PROGRESS
          },
          { label: 'Completed', value: 'DONE', count: stats.DONE }
        ].map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'inline-flex items-center justify-between gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all select-none hover:cursor-pointer',
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
  );
};

export default WorkspaceFilters;
