
'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

type ThemeMode = 'dark' | 'light';

type Theme = {
  name: string;
  mode: ThemeMode;
  preview: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    'primary-foreground': string;
    secondary: string;
    'secondary-foreground': string;
    muted: string;
    'muted-foreground': string;
    accent: string;
    'accent-foreground': string;
    destructive: string;
    'destructive-foreground': string;
    border: string;
    input: string;
    ring: string;
  };
};

export const availableThemes = {
  // Dark Themes
  default: {
    name: 'Default',
    mode: 'dark',
    preview: 'linear-gradient(135deg, hsl(258, 44%, 53%), hsl(270, 70%, 75%))',
    colors: {
      background: '258 10% 10%',
      foreground: '0 0% 96.1%',
      primary: '258 100% 87%',
      'primary-foreground': '258 10% 10%',
      secondary: '258 10% 15%',
      'secondary-foreground': '0 0% 96.1%',
      muted: '258 10% 15%',
      'muted-foreground': '0 0% 63.9%',
      accent: '270 70% 75%',
      'accent-foreground': '258 10% 10%',
      destructive: '0 62.8% 30.6%',
      'destructive-foreground': '0 0% 98%',
      border: '258 10% 20%',
      input: '258 10% 20%',
      ring: '258 100% 87%',
    },
  },
  ink: {
    name: 'Ink',
    mode: 'dark',
    preview: 'linear-gradient(135deg, hsl(0, 0%, 8%), hsl(0, 0%, 15%))',
    colors: {
      background: '0 0% 4%',
      foreground: '0 0% 98%',
      primary: '0 0% 98%',
      'primary-foreground': '0 0% 4%',
      secondary: '0 0% 10%',
      'secondary-foreground': '0 0% 98%',
      muted: '0 0% 10%',
      'muted-foreground': '0 0% 65%',
      accent: '0 0% 18%',
      'accent-foreground': '0 0% 98%',
      destructive: '0 70% 50%',
      'destructive-foreground': '0 0% 98%',
      border: '0 0% 15%',
      input: '0 0% 15%',
      ring: '0 0% 98%',
    },
  },
  abyss: {
    name: 'Abyss',
    mode: 'dark',
    preview: 'linear-gradient(135deg, #000428, #004e92)',
    colors: {
      background: '230 100% 4%',
      foreground: '220 20% 90%',
      primary: '210 100% 75%',
      'primary-foreground': '230 50% 10%',
      secondary: '225 40% 10%',
      'secondary-foreground': '220 20% 90%',
      muted: '225 40% 10%',
      'muted-foreground': '220 10% 60%',
      accent: '210 80% 40%',
      'accent-foreground': '210 10% 95%',
      destructive: '0 70% 50%',
      'destructive-foreground': '0 0% 98%',
      border: '225 30% 20%',
      input: '225 30% 20%',
      ring: '210 100% 75%',
    },
  },
  'misty-forest': {
    name: 'Misty Forest',
    mode: 'dark',
    preview: 'linear-gradient(135deg, hsl(160, 10%, 8%), hsl(150, 30%, 30%))',
    colors: {
      background: '160 10% 8%',
      foreground: '150 15% 92%',
      primary: '155 40% 60%',
      'primary-foreground': '160 20% 10%',
      secondary: '160 12% 12%',
      'secondary-foreground': '150 15% 92%',
      muted: '160 12% 12%',
      'muted-foreground': '150 10% 60%',
      accent: '150 30% 30%',
      'accent-foreground': '150 15% 92%',
      destructive: '0 62.8% 30.6%',
      'destructive-foreground': '0 0% 98%',
      border: '160 10% 20%',
      input: '160 10% 20%',
      ring: '155 40% 60%',
    },
  },
  dusk: {
    name: 'Dusk',
    mode: 'dark',
    preview: 'linear-gradient(135deg, #2C3E50, #4CA1AF)',
    colors: {
        background: '210 14% 10%',
        foreground: '210 10% 95%',
        primary: '190 50% 70%',
        'primary-foreground': '210 14% 10%',
        secondary: '210 14% 15%',
        'secondary-foreground': '210 10% 95%',
        muted: '210 14% 15%',
        'muted-foreground': '210 5% 65%',
        accent: '200 20% 30%',
        'accent-foreground': '210 10% 95%',
        destructive: '0 70% 50%',
        'destructive-foreground': '0 0% 98%',
        border: '210 14% 25%',
        input: '210 14% 25%',
        ring: '190 50% 70%',
    }
  },
  royal: {
      name: 'Royal',
      mode: 'dark',
      preview: 'linear-gradient(135deg, #4743e0, #8A2BE2)',
      colors: {
          background: '250 30% 10%',
          foreground: '250 15% 95%',
          primary: '260 70% 75%',
          'primary-foreground': '250 30% 10%',
          secondary: '250 25% 15%',
          'secondary-foreground': '250 15% 95%',
          muted: '250 25% 15%',
          'muted-foreground': '250 10% 65%',
          accent: '275 60% 50%',
          'accent-foreground': '275 15% 95%',
          destructive: '0 70% 50%',
          'destructive-foreground': '0 0% 98%',
          border: '250 25% 25%',
          input: '250 25% 25%',
          ring: '260 70% 75%',
      }
  },
  'synthwave-dark': {
    name: 'Synthwave',
    mode: 'dark',
    preview: 'linear-gradient(135deg, #F92C86, #3E43F8)',
    colors: {
      background: '246 35% 8%',
      foreground: '246 10% 94%',
      primary: '330 90% 65%',
      'primary-foreground': '330 10% 10%',
      secondary: '246 25% 15%',
      'secondary-foreground': '246 10% 94%',
      muted: '246 25% 15%',
      'muted-foreground': '246 10% 60%',
      accent: '200 90% 60%',
      'accent-foreground': '200 10% 10%',
      destructive: '0 80% 60%',
      'destructive-foreground': '0 0% 98%',
      border: '246 25% 22%',
      input: '246 25% 22%',
      ring: '330 90% 65%',
    },
  },
  moss: {
      name: 'Moss',
      mode: 'dark',
      preview: 'linear-gradient(135deg, hsl(100, 15%, 8%), hsl(85, 20%, 25%))',
      colors: {
          background: '100 15% 8%',
          foreground: '90 25% 90%',
          primary: '90 40% 60%',
          'primary-foreground': '90 20% 10%',
          secondary: '100 10% 12%',
          'secondary-foreground': '90 25% 90%',
          muted: '100 10% 12%',
          'muted-foreground': '90 15% 55%',
          accent: '85 20% 25%',
          'accent-foreground': '85 25% 90%',
          destructive: '0 70% 50%',
          'destructive-foreground': '0 0% 98%',
          border: '100 10% 20%',
          input: '100 10% 20%',
          ring: '90 40% 60%',
      }
  },
  'matrix-dark': {
    name: 'Matrix',
    mode: 'dark',
    preview: 'linear-gradient(135deg, hsl(130, 30%, 15%), hsl(130, 100%, 50%))',
    colors: {
      background: '0 0% 4%',
      foreground: '130 100% 70%',
      primary: '130 100% 50%',
      'primary-foreground': '0 0% 0%',
      secondary: '130 20% 8%',
      'secondary-foreground': '130 100% 70%',
      muted: '130 20% 8%',
      'muted-foreground': '130 50% 40%',
      accent: '130 100% 35%',
      'accent-foreground': '0 0% 0%',
      destructive: '0 100% 50%',
      'destructive-foreground': '0 0% 0%',
      border: '130 30% 15%',
      input: '130 30% 15%',
      ring: '130 100% 50%',
    },
  },
  chocolate: {
      name: 'Chocolate',
      mode: 'dark',
      preview: 'linear-gradient(135deg, hsl(30, 25%, 8%), hsl(25, 35%, 30%))',
      colors: {
          background: '30 25% 8%',
          foreground: '30 15% 92%',
          primary: '30 50% 65%',
          'primary-foreground': '30 20% 10%',
          secondary: '30 20% 12%',
          'secondary-foreground': '30 15% 92%',
          muted: '30 20% 12%',
          'muted-foreground': '30 10% 60%',
          accent: '25 35% 30%',
          'accent-foreground': '25 15% 92%',
          destructive: '0 70% 50%',
          'destructive-foreground': '0 0% 98%',
          border: '30 15% 22%',
          input: '30 15% 22%',
          ring: '30 50% 65%',
      }
  },
  // Light Themes
  paper: {
    name: 'Paper',
    mode: 'light',
    preview: 'linear-gradient(135deg, hsl(40, 20%, 99%), hsl(40, 15%, 94%))',
    colors: {
        background: '40 20% 99%',
        foreground: '40 10% 20%',
        primary: '40 10% 20%',
        'primary-foreground': '40 20% 99%',
        secondary: '40 15% 94%',
        'secondary-foreground': '40 10% 20%',
        muted: '40 15% 94%',
        'muted-foreground': '40 5% 45%',
        accent: '40 20% 90%',
        'accent-foreground': '40 10% 20%',
        destructive: '0 84.2% 60.2%',
        'destructive-foreground': '0 0% 98%',
        border: '40 10% 88%',
        input: '40 10% 88%',
        ring: '40 10% 20%',
    }
  },
  candy: {
      name: 'Candy',
      mode: 'light',
      preview: 'linear-gradient(135deg, #ffc3a0, #ffafbd)',
      colors: {
          background: '10 60% 98%',
          foreground: '350 40% 35%',
          primary: '340 80% 70%',
          'primary-foreground': '340 30% 15%',
          secondary: '350 70% 94%',
          'secondary-foreground': '350 40% 35%',
          muted: '350 70% 94%',
          'muted-foreground': '350 20% 55%',
          accent: '10 80% 92%',
          'accent-foreground': '10 30% 30%',
          destructive: '0 84.2% 60.2%',
          'destructive-foreground': '0 0% 98%',
          border: '350 50% 90%',
          input: '350 50% 90%',
          ring: '340 80% 70%',
      }
  },
  'baby-blue': {
      name: 'Baby Blue',
      mode: 'light',
      preview: 'linear-gradient(135deg, hsl(205, 70%, 98%), hsl(210, 80%, 65%))',
      colors: {
          background: '205 70% 98%',
          foreground: '210 30% 25%',
          primary: '210 80% 65%',
          'primary-foreground': '210 20% 98%',
          secondary: '205 60% 93%',
          'secondary-foreground': '210 30% 25%',
          muted: '205 60% 93%',
          'muted-foreground': '210 15% 50%',
          accent: '200 70% 88%',
          'accent-foreground': '200 25% 20%',
          destructive: '0 84.2% 60.2%',
          'destructive-foreground': '0 0% 98%',
          border: '205 40% 88%',
          input: '205 40% 88%',
          ring: '210 80% 65%',
      }
  },
  'rose-gold': {
    name: 'Rose Gold',
    mode: 'light',
    preview: 'linear-gradient(135deg, hsl(25, 33%, 95%), hsl(350, 60%, 55%))',
    colors: {
      background: '25 33% 95%',
      foreground: '25 15% 20%',
      primary: '350 60% 55%',
      'primary-foreground': '0 0% 100%',
      secondary: '25 25% 90%',
      'secondary-foreground': '25 15% 20%',
      muted: '25 25% 90%',
      'muted-foreground': '25 15% 45%',
      accent: '350 70% 85%',
      'accent-foreground': '350 20% 20%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '0 0% 98%',
      border: '25 20% 85%',
      input: '25 20% 85%',
      ring: '350 60% 55%',
    },
  },
  'sakura-light': {
    name: 'Sakura',
    mode: 'light',
    preview: 'linear-gradient(135deg, hsl(340, 40%, 95%), hsl(340, 90%, 65%))',
    colors: {
      background: '0 0% 100%',
      foreground: '340 10% 30%',
      primary: '340 90% 65%',
      'primary-foreground': '0 0% 100%',
      secondary: '340 40% 95%',
      'secondary-foreground': '340 10% 30%',
      muted: '340 40% 95%',
      'muted-foreground': '340 5% 55%',
      accent: '340 80% 93%',
      'accent-foreground': '340 10% 30%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '0 0% 98%',
      border: '340 20% 90%',
      input: '340 20% 90%',
      ring: '340 90% 65%',
    },
  },
  peach: {
      name: 'Peach',
      mode: 'light',
      preview: 'linear-gradient(135deg, #FFDAB9, #FFBFAB)',
      colors: {
          background: '30 80% 97%',
          foreground: '20 40% 30%',
          primary: '25 80% 65%',
          'primary-foreground': '25 20% 15%',
          secondary: '30 70% 92%',
          'secondary-foreground': '20 40% 30%',
          muted: '30 70% 92%',
          'muted-foreground': '20 20% 55%',
          accent: '35 85% 88%',
          'accent-foreground': '35 30% 25%',
          destructive: '0 84.2% 60.2%',
          'destructive-foreground': '0 0% 98%',
          border: '30 50% 88%',
          input: '30 50% 88%',
          ring: '25 80% 65%',
      }
  },
  'stone-light': {
    name: 'Stone',
    mode: 'light',
    preview: 'linear-gradient(135deg, hsl(240, 4.8%, 95.9%), hsl(240, 5.9%, 10%))',
    colors: {
      background: '0 0% 100%',
      foreground: '240 5.9% 10%',
      primary: '240 5.9% 10%',
      'primary-foreground': '0 0% 98%',
      secondary: '240 4.8% 95.9%',
      'secondary-foreground': '240 5.9% 10%',
      muted: '240 4.8% 95.9%',
      'muted-foreground': '240 3.8% 46.1%',
      accent: '240 4.8% 95.9%',
      'accent-foreground': '240 5.9% 10%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '0 0% 98%',
      border: '240 5.9% 90%',
      input: '240 5.9% 90%',
      ring: '240 5.9% 10%',
    },
  },
  'lavender-light': {
    name: 'Lavender',
    mode: 'light',
    preview: 'linear-gradient(135deg, hsl(250, 50%, 98%), hsl(250, 60%, 60%))',
    colors: {
      background: '250 50% 98%',
      foreground: '250 20% 25%',
      primary: '250 60% 60%',
      'primary-foreground': '0 0% 100%',
      secondary: '250 40% 94%',
      'secondary-foreground': '250 20% 25%',
      muted: '250 40% 94%',
      'muted-foreground': '250 10% 50%',
      accent: '250 50% 96%',
      'accent-foreground': '250 20% 25%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '0 0% 98%',
      border: '250 30% 90%',
      input: '250 30% 90%',
      ring: '250 60% 60%',
    },
  },
  'mint-light': {
    name: 'Mint',
    mode: 'light',
    preview: 'linear-gradient(135deg, hsl(150, 30%, 94%), hsl(150, 60%, 45%))',
    colors: {
      background: '150 40% 99%',
      foreground: '150 20% 20%',
      primary: '150 60% 45%',
      'primary-foreground': '0 0% 100%',
      secondary: '150 30% 94%',
      'secondary-foreground': '150 20% 20%',
      muted: '150 30% 94%',
      'muted-foreground': '150 10% 45%',
      accent: '150 50% 94%',
      'accent-foreground': '150 20% 20%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '0 0% 98%',
      border: '150 20% 88%',
      input: '150 20% 88%',
      ring: '150 60% 45%',
    },
  },
  'matcha-light': {
    name: 'Matcha',
    mode: 'light',
    preview: 'linear-gradient(135deg, hsl(80, 15%, 94%), hsl(80, 30%, 45%))',
    colors: {
      background: '80 20% 98%',
      foreground: '80 15% 25%',
      primary: '80 30% 45%',
      'primary-foreground': '80 10% 98%',
      secondary: '80 15% 94%',
      'secondary-foreground': '80 15% 25%',
      muted: '80 15% 94%',
      'muted-foreground': '80 10% 50%',
      accent: '80 20% 95%',
      'accent-foreground': '80 15% 25%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '0 0% 98%',
      border: '80 10% 88%',
      input: '80 10% 88%',
      ring: '80 30% 45%',
    },
  },
};

export type ThemeId = keyof typeof availableThemes;

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('stone-light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem('themeId') as ThemeId | null;
    if (storedTheme && availableThemes[storedTheme]) {
      setThemeState(storedTheme);
    } else {
        setThemeState('stone-light');
    }
  }, []);

  const setTheme = (newThemeId: ThemeId) => {
    setThemeState(newThemeId);
    if (isMounted) {
      localStorage.setItem('themeId', newThemeId);
    }
  };
  
  useEffect(() => {
    if(isMounted) {
      const selectedTheme = availableThemes[theme];
      document.documentElement.className = selectedTheme.mode;

      const root = document.documentElement;
      Object.entries(selectedTheme.colors).forEach(([name, value]) => {
          root.style.setProperty(`--${name}`, value);
      });
    }
  }, [theme, isMounted]);

  const value = useMemo(() => ({
    theme,
    setTheme,
  }), [theme]);

  if (!isMounted) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
