
'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@/hooks/use-theme';
import { LanguageProvider } from '@/hooks/use-language';
import { AppearanceProvider } from '@/hooks/use-appearance';
import { UserProvider } from '@/hooks/use-user';

export function Providers({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
      <UserProvider>
        <LanguageProvider>
          <AppearanceProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AppearanceProvider>
        </LanguageProvider>
      </UserProvider>
    );
}
