import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@task-manager/ui/components/button';
import { cn } from '@task-manager/ui/lib/utils';

type WorkspacePaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

const WorkspacePagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange
}: WorkspacePaginationProps) => {
  return (
    <footer className='mt-8 flex items-center justify-between border-t border-slate-200/60 pt-6 dark:border-slate-800/60'>
      <span className='text-xs text-slate-500 dark:text-slate-400'>
        Showing{' '}
        <span className='font-semibold text-slate-700 dark:text-slate-200'>
          {(currentPage - 1) * itemsPerPage + 1}
        </span>{' '}
        to{' '}
        <span className='font-semibold text-slate-700 dark:text-slate-200'>
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span>{' '}
        of{' '}
        <span className='font-semibold text-slate-700 dark:text-slate-200'>
          {totalItems}
        </span>{' '}
        tasks
      </span>

      <div className='flex items-center gap-1.5'>
        <Button
          variant='outline'
          size='icon-sm'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='rounded-lg border-slate-200 bg-white shadow-2xs disabled:opacity-40 dark:border-slate-800 dark:bg-gray-900'
        >
          <ChevronLeft className='size-3.5' />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size='icon-sm'
            onClick={() => onPageChange(page)}
            className={cn(
              'rounded-lg text-xs font-bold shadow-2xs hover:cursor-pointer',
              currentPage === page
                ? 'border-transparent bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-gray-900'
            )}
          >
            {page}
          </Button>
        ))}

        <Button
          variant='outline'
          size='icon-sm'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='rounded-lg border-slate-200 bg-white shadow-2xs disabled:opacity-40 dark:border-slate-800 dark:bg-gray-900'
        >
          <ChevronRight className='size-3.5' />
        </Button>
      </div>
    </footer>
  );
};

export default WorkspacePagination;
