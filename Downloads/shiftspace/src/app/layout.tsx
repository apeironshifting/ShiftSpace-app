
import type { Metadata } from 'next';
import { Inter, Roboto, Lato, Lora } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Providers } from './providers';
import Script from 'next/script';

export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});


export const metadata: Metadata = {
  title: 'ShiftSpace',
  description: 'Your personal journey through reality shifting.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
          "antialiased",
          inter.variable,
          roboto.variable,
          lato.variable,
          lora.variable
        )}>
        <Providers>
            {children}
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}
