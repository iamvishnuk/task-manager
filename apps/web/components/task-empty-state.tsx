import { Button } from '@task-manager/ui/components/button';
import { AlertTriangle } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

type TaskEmptyStateProps = {
  setStatusFilter: Dispatch<SetStateAction<string>>;
  setPriorityFilter: Dispatch<SetStateAction<string>>;
  setSearchQuery: Dispatch<SetStateAction<string>>;
};

const TaskEmptyState = ({
  setStatusFilter,
  setPriorityFilter,
  setSearchQuery
}: TaskEmptyStateProps) => {
  return (
    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-12 text-center dark:border-slate-800 dark:bg-gray-900/50'>
      <div className='flex size-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800'>
        <AlertTriangle className='size-6 text-slate-400' />
      </div>
      <h3 className='mt-4 text-base font-bold text-slate-800 dark:text-slate-200'>
        No tasks found
      </h3>
      <p className='mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400'>
        No items match your active filters or search terms. Try refining your
        selections.
      </p>
      <Button
        className='mt-4.5 rounded-md bg-blue-900 text-xs font-semibold text-white hover:cursor-pointer hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-900'
        onClick={() => {
          setStatusFilter('ALL');
          setPriorityFilter('ALL');
          setSearchQuery('');
        }}
      >
        Clear Filters
      </Button>
    </div>
  );
};

export default TaskEmptyState;
