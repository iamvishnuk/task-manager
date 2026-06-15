import { Geist, Geist_Mono, Inter } from 'next/font/google';

import '@task-manager/ui/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@task-manager/ui/lib/utils';
import QueryProvider from '@/components/query-provider';
import { Toaster } from '@/components/sonner';
import { Metadata } from 'next';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: 'Task Manager',
    template: '%s | Task Manager'
  },
  description: 'Task Manager is a web application for managing tasks.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn(
        'antialiased',
        'font-inter',
        fontMono.variable,
        geist.variable,
        inter.variable
      )}
    >
      <body className='w-full max-w-svw overflow-x-hidden bg-white dark:bg-gray-950'>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
          <Toaster
            richColors
            position='bottom-right'
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
