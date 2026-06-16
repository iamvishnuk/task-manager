'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { cn } from '@task-manager/ui/lib/utils';
import taskManagerDark from '@/images/task-manager.png';
import taskmanagerWhite from '@/images/task-manager-white.png';

const AuthImage = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <Image
      src={isDark ? taskManagerDark : taskmanagerWhite}
      alt='Task Manager image'
      className={cn(
        'rounded-lg border',
        isDark
          ? 'mask-r-from-70% mask-b-from-80%'
          : 'mask-r-from-70% mask-b-from-50%'
      )}
      width={1900}
      height={1000}
    />
  );
};

export default AuthImage;
