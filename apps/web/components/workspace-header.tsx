import Image from 'next/image';
import { Plus, Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@task-manager/ui/components/button';
import Logo from '@/images/logo.png';
import { useAuth } from '@/components/auth-provider';

type WorkspaceHeaderProps = {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  onNewTaskClick: () => void;
};

const WorkspaceHeader = ({
  theme,
  setTheme,
  onNewTaskClick
}: WorkspaceHeaderProps) => {
  const { user, logout } = useAuth();

  return (
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
            {user?.role === 'ADMIN' ? 'Admin Workspace' : 'Task Workspace'}
          </h1>
        </div>
        <p className='mt-1.5 text-xs text-slate-500 md:text-sm dark:text-slate-400'>
          {user?.role === 'ADMIN'
            ? `Viewing all tasks across the workspace as Administrator (${user.email}).`
            : 'Streamline your workflow, manage tasks, and track statuses seamlessly.'}
        </p>
      </div>

      <div className='flex items-center gap-3 self-end sm:self-auto'>
        {/* Theme Toggle Button */}
        <Button
          variant='outline'
          size='icon'
          title='Toggle theme (d)'
          className='rounded-md border-slate-200 bg-white/80 shadow-xs dark:border-slate-800 dark:bg-gray-900/80'
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className='size-4 text-white' />
          ) : (
            <Moon className='size-4 text-indigo-600' />
          )}
        </Button>

        {/* Logout Button */}
        <Button
          variant='outline'
          size='icon'
          title='Logout'
          className='rounded-md border-slate-200 bg-white/80 shadow-xs hover:cursor-pointer hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:bg-gray-900/80 dark:hover:bg-red-950/30 dark:hover:text-red-400'
          onClick={logout}
        >
          <LogOut className='size-4' />
        </Button>

        {/* Create Task Action */}
        <Button
          disabled={user?.role === 'ADMIN'}
          className='rounded-md bg-blue-900 font-semibold text-white shadow-md shadow-indigo-600/15 hover:cursor-pointer hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-800 dark:hover:bg-blue-900'
          onClick={onNewTaskClick}
        >
          <Plus className='size-4' />
          <span>New Task</span>
        </Button>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
