'use client';
import Link from 'next/link';
import { ArrowLeft, Redo, Undo, Palette, Check, MoreVertical, Trash2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScriptProvider, useScripts } from '@/hooks/use-scripts.tsx';
import { useLanguage } from '@/hooks/use-language';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme, type ThemeId, availableThemes } from '@/hooks/use-theme';
import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { compressImage } from '@/lib/image-utils';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const { canUndo: canUndoScripts, undo: undoScripts, canRedo: canRedoScripts, redo: redoScripts, scripts, updateScript, places, pages } = useScripts();
  const { user, undo: undoUser, redo: redoUser, canUndo: canUndoUser, canRedo: canRedoUser, updatePoster, updatePersonInPoster } = useUser();
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const posterImageInputRef = useRef<HTMLInputElement>(null);

  const pathParts = pathname.split('/').filter(p => p);
  
  const scriptId = pathParts[0] === 'scripts' && pathParts.length > 1 ? pathParts[1] : null;
  const currentScript = scriptId ? scripts.find(s => s.id === scriptId) : null;
  
  const isScriptPage = pathParts[0] === 'scripts' && pathParts.length > 1 && !pathParts.includes('places');
  const isPosterPage = pathParts[0] === 'posters' && pathParts.length > 1;
  const isPersonPage = isPosterPage && pathParts.includes('people') && pathParts.length > 3;
  
  const currentPosterId = isPosterPage ? pathParts[1] : null;
  const currentPoster = currentPosterId ? user.posters.find(p => p.id === currentPosterId) : null;
  
  const currentPersonId = isPersonPage ? pathParts[3] : null;
  const currentPerson = (currentPoster && currentPersonId) ? currentPoster.people.find(p => p.id === currentPersonId) : null;

  const showUndoRedo = pathname.startsWith('/scripts') || pathname.startsWith('/posters');
  
  const handleUndo = () => {
    if (pathname.startsWith('/posters')) undoUser();
    else undoScripts();
  };

  const handleRedo = () => {
    if (pathname.startsWith('/posters')) redoUser();
    else redoScripts();
  };

  const canUndo = pathname.startsWith('/posters') ? canUndoUser : canUndoScripts;
  const canRedo = pathname.startsWith('/posters') ? canRedoUser : canRedoScripts;

  const handleScriptThemeChange = (newThemeId: ThemeId) => {
    if (scriptId) {
      updateScript(scriptId, { themeId: newThemeId });
    }
  }

  const handlePosterThemeChange = (newThemeId: ThemeId) => {
    if (currentPersonId && currentPosterId) {
        updatePersonInPoster(currentPosterId, currentPersonId, { themeId: newThemeId });
    } else if (currentPosterId) {
      updatePoster(currentPosterId, { themeId: newThemeId });
    }
  };

  const handleRemoveCoverImage = () => {
    if (scriptId) {
      updateScript(scriptId, { coverImage: '' });
    }
  };

  const handlePosterImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentPosterId) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        if (currentPersonId) {
            updatePersonInPoster(currentPosterId, currentPersonId, { image: compressed });
        } else {
            updatePoster(currentPosterId, { image: compressed });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const currentThemeIdForMenu = isPersonPage 
    ? (currentPerson?.themeId || currentPoster?.themeId || theme)
    : isPosterPage 
        ? (currentPoster?.themeId || theme) 
        : (currentScript?.themeId || theme);

  // Handle theme hierarchy: Person Theme > Poster Theme > Page Theme > Script Theme > Global theme
  useEffect(() => {
    const pathParts = pathname.split('/').filter(p => p);
    
    let activeThemeId: ThemeId = theme;

    const isPosterRoute = pathParts[0] === 'posters' && pathParts.length > 1;
    const isScriptPlacePage = pathParts[0] === 'scripts' && pathParts.length > 3 && pathParts[2] === 'places';
    const isStandalonePlacePage = pathParts[0] === 'places' && pathParts.length > 1;
    const isStandalonePagePage = pathParts[0] === 'pages' && pathParts.length > 1;
    const isMainScriptPage = pathParts[0] === 'scripts' && pathParts.length > 1 && !pathParts.includes('places');

    if (isPosterRoute) {
        const posterId = pathParts[1];
        const poster = user.posters.find(p => p.id === posterId);
        const isPersonSubRoute = pathParts.includes('people') && pathParts.length > 3;
        if (isPersonSubRoute) {
            const personId = pathParts[3];
            const person = poster?.people.find(p => p.id === personId);
            activeThemeId = person?.themeId || poster?.themeId || theme;
        } else {
            activeThemeId = poster?.themeId || theme;
        }
    } else if (isScriptPlacePage) {
        const placeId = pathParts[3];
        const scriptId = pathParts[1];
        const currentScript = scripts.find(s => s.id === scriptId);
        const currentPlace = currentScript?.places.find(p => p.id === placeId);
        activeThemeId = currentPlace?.themeId || theme;
    } else if (isStandalonePlacePage) {
        const placeId = pathParts[1];
        const currentPlace = places.find(p => p.id === placeId);
        activeThemeId = currentPlace?.themeId || theme;
    } else if (isStandalonePagePage) {
        const pageId = pathParts[1];
        const currentPage = pages.find(p => p.id === pageId);
        activeThemeId = currentPage?.themeId || theme;
    } else if (isMainScriptPage) {
        const scriptId = pathParts[1];
        const currentScript = scripts.find(s => s.id === scriptId);
        activeThemeId = currentScript?.themeId || theme;
    }
    
    const selectedTheme = availableThemes[activeThemeId];
    if (selectedTheme) {
        document.documentElement.className = selectedTheme.mode;
        const root = document.documentElement;
        Object.entries(selectedTheme.colors).forEach(([name, value]) => {
            root.style.setProperty(`--${name}`, value);
        });
    }

  }, [pathname, scripts, places, pages, theme, user.posters]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            {pathname !== '/dashboard' && (
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="w-5 h-5" />
                  <span className="sr-only">{t('common.back')}</span>
              </Button>
            )}
        </div>
        
        <div className="flex items-center gap-2">
            {showUndoRedo && (
            <>
                <Button variant="ghost" size="icon" onClick={handleUndo} disabled={!canUndo}>
                <Undo className="w-5 h-5" />
                <span className="sr-only">{t('common.undo')}</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleRedo} disabled={!canRedo}>
                <Redo className="w-5 h-5" />
                <span className="sr-only">{t('common.redo')}</span>
                </Button>
            </>
            )}
            
            {(isScriptPage || isPosterPage) && (
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
                            {t('script_page.change_theme')}
                        </DropdownMenuItem>
                        </DialogTrigger>
                        
                        {isPosterPage && (
                            <>
                                <DropdownMenuItem onClick={() => posterImageInputRef.current?.click()}>
                                    <Camera className="w-4 h-4 mr-2" />
                                    {t('poster_page.change_image')}
                                </DropdownMenuItem>
                                <input type="file" ref={posterImageInputRef} onChange={handlePosterImageChange} className="hidden" accept="image/*" />
                            </>
                        )}

                        {isScriptPage && currentScript?.coverImage && (
                            <DropdownMenuItem onClick={handleRemoveCoverImage} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('script_page.remove_cover')}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                    </DropdownMenu>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('script_page.change_theme')}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                            {Object.entries(availableThemes).map(([id, themeOption]) => {
                                const isActive = currentThemeIdForMenu === id;
                                return (
                                    <button
                                        key={id}
                                        onClick={() => isPosterPage ? handlePosterThemeChange(id as ThemeId) : handleScriptThemeChange(id as ThemeId)}
                                        className={cn(
                                            "relative h-16 w-16 rounded-full border-2 transition-transform duration-200 ease-in-out hover:scale-110",
                                            isActive ? 'border-primary ring-2 ring-primary/50' : 'border-muted'
                                        )}
                                        aria-label={t('settings.themes.set_theme_aria', { name: themeOption.name })}
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
