

'use client';
import Link from 'next/link';
import { ArrowLeft, Redo, Undo, Palette, Check, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScriptProvider, useScripts } from '@/hooks/use-scripts.tsx';
import { useLanguage } from '@/hooks/use-language';
import { usePathname } from 'next/navigation';
import { useTheme, type ThemeId, availableThemes } from '@/hooks/use-theme';
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const { canUndo, undo, canRedo, redo, scripts, updateScript } = useScripts();
  const { theme } = useTheme();
  const pathname = usePathname();

  const pathParts = pathname.split('/').filter(p => p);
  
  // Correctly identify the scriptId for any nested script routes
  const scriptId = pathParts[0] === 'scripts' && pathParts.length > 1 ? pathParts[1] : null;
  const currentScript = scriptId ? scripts.find(s => s.id === scriptId) : null;
  
  // This is for showing the script-specific menu in the header. Only for main script pages.
  const isScriptPage = pathParts[0] === 'scripts' && pathParts.length > 1 && pathParts[2] !== 'places';
  
  const showUndoRedo = 
    pathname.startsWith('/scripts');
    
  const getBackLink = () => {
    if (pathname === '/settings/profile') {
      return '/settings';
    }

    if (pathParts[0] === 'places' && pathParts.length > 1) {
      // For now, standalone places go back to info. A more robust solution might use router history.
      return '/info';
    }
    
    if (pathParts[0] === 'scripts' && pathParts.length > 2 && pathParts[2] === 'places') {
        return `/scripts/${pathParts[1]}`;
    }

    if (pathParts.length > 1 && pathParts[0] === 'scripts') {
      const foundScript = scripts.find(s => s.id === pathParts[1]);
      if (foundScript) {
        if (foundScript.isTemplate) {
          return '/waiting-room';
        } else {
          return '/scripts';
        }
      }
    }

    // Default to dashboard from top-level pages
    if (['scripts', 'info', 'journal', 'waiting-room', 'settings'].includes(pathParts[0])) {
      return '/dashboard';
    }
    
    // Fallback for any other case
    return '/dashboard';
  }

  const handleScriptThemeChange = (newThemeId: ThemeId) => {
    if (scriptId) {
      updateScript(scriptId, { themeId: newThemeId });
    }
  }

  const handleRemoveCoverImage = () => {
    if (scriptId) {
      updateScript(scriptId, { coverImage: '' });
    }
  };
  
  const currentThemeId = currentScript?.themeId || theme;

  // Handle script-specific themes
  useEffect(() => {
    // The theme to apply is either the script-specific one or the global one.
    const activeThemeId = currentScript?.themeId || theme;
    
    const selectedTheme = availableThemes[activeThemeId];
    if (selectedTheme) {
        document.documentElement.className = selectedTheme.mode;
        const root = document.documentElement;
        Object.entries(selectedTheme.colors).forEach(([name, value]) => {
            root.style.setProperty(`--${name}`, value);
        });
    }

  }, [currentScript, theme]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            {pathname !== '/dashboard' && (
              <Button variant="ghost" size="icon" asChild>
              <Link href={getBackLink()}>
                  <ArrowLeft className="w-5 h-5" />
                  <span className="sr-only">{t('common.back')}</span>
              </Link>
              </Button>
            )}
        </div>
        
        <div className="flex items-center gap-2">
            {showUndoRedo && (
            <>
                <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo}>
                <Undo className="w-5 h-5" />
                <span className="sr-only">{t('common.undo')}</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo}>
                <Redo className="w-5 h-5" />
                <span className="sr-only">{t('common.redo')}</span>
                </Button>
            </>
            )}
            {isScriptPage && currentScript && (
                 <Dialog>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DialogTrigger asChild>
                        <DropdownMenuItem>
                            <Palette className="w-4 h-4 mr-2" />
                            Change Theme
                        </DropdownMenuItem>
                        </DialogTrigger>
                        {currentScript?.coverImage && (
                            <DropdownMenuItem onClick={handleRemoveCoverImage} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove Cover Image
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                    </DropdownMenu>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change Script Theme</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                            {Object.entries(availableThemes).map(([id, themeOption]) => {
                                const isActive = currentThemeId === id;
                                return (
                                    <button
                                        key={id}
                                        onClick={() => handleScriptThemeChange(id as ThemeId)}
                                        className={cn(
                                            "relative h-16 w-16 rounded-full border-2 transition-transform duration-200 ease-in-out hover:scale-110",
                                            isActive ? 'border-primary ring-2 ring-primary/50' : 'border-muted'
                                        )}
                                        aria-label={`Set theme to ${themeOption.name}`}
                                    >
                                        <div 
                                            className="h-full w-full rounded-full" 
                                            style={{ background: themeOption.preview }}
                                        />
                                        {isActive && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                                                <Check className="w-6 h-6 text-white" />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScriptProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </ScriptProvider>
  );
}
