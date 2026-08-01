
'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

type FontId = 'inter' | 'roboto' | 'lato' | 'lora';

const availableFonts: Record<FontId, { name: string; variable: string }> = {
  inter: { name: 'Inter', variable: "var(--font-inter)" },
  roboto: { name: 'Roboto', variable: "var(--font-roboto)" },
  lato: { name: 'Lato', variable: "var(--font-lato)" },
  lora: { name: 'Lora', variable: "var(--font-lora)" },
};

interface AppearanceContextType {
  font: FontId;
  setFont: (font: FontId) => void;
  availableFonts: typeof availableFonts;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [font, setFontState] = useState<FontId>('inter');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedFont = localStorage.getItem('font') as FontId | null;
    if (storedFont && availableFonts[storedFont]) {
      setFontState(storedFont);
    }
  }, []);

  const setFont = (newFont: FontId) => {
    setFontState(newFont);
    localStorage.setItem('font', newFont);
  };

  useEffect(() => {
    if (isMounted) {
      document.body.style.fontFamily = availableFonts[font].variable;
    }
  }, [font, isMounted]);

  const value = useMemo(() => ({
    font,
    setFont,
    availableFonts,
  }), [font]);

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
}
