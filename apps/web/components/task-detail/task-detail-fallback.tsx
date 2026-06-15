import React from 'react';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@task-manager/ui/components/button';

export function TaskDetailLoading() {
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

interface TaskDetailErrorProps {
  message: string;
  onBack: () => void;
}

export function TaskDetailError({ message, onBack }: TaskDetailErrorProps) {
  return (
    <div className='flex min-h-svh w-full items-center justify-center bg-slate-50/70 p-4 dark:bg-gray-950'>
      <div className='flex max-w-md flex-col items-center gap-4 rounded-2xl border border-red-200/50 bg-white p-6 text-center shadow-xs dark:border-red-950/40 dark:bg-gray-900'>
        <AlertCircle className='size-10 text-red-500' />
        <div className='flex flex-col gap-1'>
          <h2 className='text-base font-bold text-slate-900 dark:text-gray-50'>
            Failed to load task
          </h2>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {message}
          </p>
        </div>
        <Button
          onClick={onBack}
          className='mt-2 inline-flex items-center gap-1.5 hover:cursor-pointer'
        >
          <ArrowLeft className='size-4' />
          <span>Back to Workspace</span>
        </Button>
      </div>
    </div>
  );
}
