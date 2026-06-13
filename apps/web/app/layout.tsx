import { Geist, Geist_Mono, Inter } from 'next/font/google';

import '@task-manager/ui/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@task-manager/ui/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
