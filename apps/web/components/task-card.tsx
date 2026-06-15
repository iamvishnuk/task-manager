import { type Task, type TaskStatus } from '@task-manager/shared/schemas/task';
import Link from 'next/link';
import { Badge } from '@task-manager/ui/components/badge';
import { cn } from '@task-manager/ui/lib/utils';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Pencil,
  Paperclip
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type TaskCardProps = {
  task: Task & { id: string };
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;
  onEdit: (task: Task & { id: string }) => void;
};

const TaskCard = ({
  task,
  toggleTaskStatus,
  deleteTask,
  onEdit
}: TaskCardProps) => {
  const router = useRouter();

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

  const getDueDateStyle = (
    date: Date | string | null | undefined,
    status: TaskStatus
  ) => {
    if (!date || status === 'DONE') return 'text-slate-500 dark:text-slate-400';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (due < today) {
      return 'text-red-500 dark:text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded-md';
    }
    if (due.getTime() - today.getTime() <= 24 * 60 * 60 * 1000) {
      return 'text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md';
    }
    return 'text-slate-600 dark:text-slate-300';
  };

  const formatDueDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === -1) return 'Overdue (yesterday)';
    if (diffDays < -1) return `Overdue (${Math.abs(diffDays)} days ago)`;
    if (diffDays > 1 && diffDays <= 7) return `Due in ${diffDays} days`;

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className={cn(
        'group flex flex-col justify-between rounded-2xl border border-slate-200/50 bg-white/95 p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/20 hover:shadow-md dark:border-slate-800/40 dark:bg-gray-900/95 dark:hover:border-indigo-400/20',
        task.status === 'DONE' && 'opacity-85 hover:opacity-100'
      )}
      onClick={() => router.push(`/tasks/${task.id}`)}
    >
      <div>
        {/* Top line badges */}
        <div className='mb-3.5 flex items-center justify-between gap-2'>
          <Badge
            onClick={() => toggleTaskStatus(task.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.75 text-[10px] font-bold tracking-wider uppercase transition-colors hover:cursor-pointer',
              task.status === 'TODO' &&
                'border-blue-200/50 bg-blue-50 text-blue-600 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400',
              task.status === 'IN_PROGRESS' &&
                'border-indigo-200/50 bg-indigo-50 text-indigo-600 dark:border-indigo-900/30 dark:bg-indigo-950/20 dark:text-indigo-400',
              task.status === 'DONE' &&
                'border-emerald-200/50 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400'
            )}
            title='Click to toggle status'
          >
            {task.status === 'TODO' && (
              <Circle className='size-2.5 fill-blue-600/20' />
            )}
            {task.status === 'IN_PROGRESS' && (
              <Clock className='size-2.5 fill-indigo-600/20' />
            )}
            {task.status === 'DONE' && (
              <CheckCircle2 className='size-2.5 fill-emerald-600/20' />
            )}
            <span>{task.status.replace('_', ' ')}</span>
          </Badge>

          <Badge
            className={cn(
              'rounded-lg border px-2 py-0.75 text-[10px] font-bold tracking-wider uppercase',
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

        {/* Task details */}
        <h3
          className={cn(
            'text-base font-bold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400',
            task.status === 'DONE' &&
              'text-slate-400 line-through dark:text-slate-500'
          )}
        >
          <Link
            href={`/tasks/${task.id}`}
            className='hover:cursor-pointer hover:underline'
          >
            {task.title}
          </Link>
        </h3>

        {(task as any).userEmail && (
          <div className='mt-2 flex w-fit items-center gap-1.5 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-700/80 dark:text-indigo-400/80'>
            <span>Owner: {(task as any).userEmail}</span>
          </div>
        )}

        {task.description && (
          <p className='mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400'>
            {task.description}
          </p>
        )}

        {(task as any).attachmentUrl && (
          <div className='mt-3 flex items-center gap-1.5 overflow-hidden text-xs text-indigo-600 dark:text-indigo-400'>
            <Paperclip className='size-3.5 shrink-0' />
            <a
              href={getAttachmentUrl((task as any).attachmentUrl)}
              target='_blank'
              rel='noopener noreferrer'
              className='truncate hover:cursor-pointer hover:underline'
              title={(task as any).attachmentName || 'Download attachment'}
            >
              {(task as any).attachmentName || 'Attachment'}
            </a>
          </div>
        )}
      </div>

      {/* Footer line details */}
      <div className='mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800/55'>
        <div className='flex items-center gap-1.5 text-xs'>
          <Calendar className='size-3.5 text-slate-400' />
          <span className={getDueDateStyle(task.dueDate, task.status)}>
            {formatDueDate(task.dueDate)}
          </span>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2'>
          <button
            onClick={(e) => {
              toggleTaskStatus(task.id);
              e.stopPropagation();
            }}
            className='text-xs font-semibold text-indigo-600 hover:cursor-pointer hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300'
          >
            {task.status === 'DONE'
              ? 'Mark Incomplete'
              : task.status === 'IN_PROGRESS'
                ? 'Mark Done'
                : 'Start Task'}
          </button>
          <button
            onClick={(e) => {
              onEdit(task);
              e.stopPropagation();
            }}
            className='rounded-md p-1.5 text-slate-400 transition-colors hover:cursor-pointer hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
            title='Edit Task'
          >
            <Pencil className='size-3.5' />
          </button>
          <button
            onClick={(e) => {
              deleteTask(task.id);
              e.stopPropagation();
            }}
            className='rounded-md p-1.5 text-slate-400 transition-colors hover:cursor-pointer hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400'
            title='Delete Task'
          >
            <Trash2 className='size-3.5' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
