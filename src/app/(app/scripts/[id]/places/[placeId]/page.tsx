

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageIcon, MoreVertical, Copy, Trash2, Palette, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useScripts, type Place } from '@/hooks/use-scripts.tsx';
import { useRouter } from 'next/navigation';
import { Block, BlockEditor } from '@/components/block-editor';
import { useLanguage } from '@/hooks/use-language';
import { isTranslationKey } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTheme, type ThemeId, availableThemes } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';


export default function PlacePage({ params: rawParams }: { params: { id: string, placeId: string } }) {
    const params = React.use(rawParams);
    const router = useRouter();
    const { id: scriptId, placeId } = params;
    const { scripts, updatePlaceInScript } = useScripts();
    const [place, setPlace] = useState<Place | null>(null);
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [isCoverDialog, setIsCoverDialog] = useState(false);
    const [coverUrl, setCoverUrl] = useState('');

  useEffect(() => {
    const script = scripts.find(s => s.id === scriptId);
    const foundPlace = script?.places.find(p => p.id === placeId);
    if(foundPlace){
        setPlace(foundPlace);
    }
  }, [scriptId, placeId, scripts]);


  const handleUpdate = useCallback((updates: Partial<Place>) => {
    if (place) {
      updatePlaceInScript(scriptId, placeId, updates);
    }
  }, [place, scriptId, placeId, updatePlaceInScript]);

  const handleCoverSave = () => {
    handleUpdate({ coverImage: coverUrl });
    setIsCoverDialog(false);
  };
  
  const handleRemoveCoverImage = () => {
    handleUpdate({ coverImage: '' });
  };

  const handleDescriptionChange = useCallback((blocks: Block[]) => {
      handleUpdate({ description: blocks });
  }, [handleUpdate]);

  const script = scripts.find(s => s.id === scriptId);
  
  const handlePlaceThemeChange = (newThemeId: ThemeId) => {
    updatePlaceInScript(scriptId, placeId, { themeId: newThemeId });
  };
  
  const currentThemeId = place?.themeId || script?.themeId || theme;

  if (!place) {
    return null; // or a loading skeleton
  }

  const displayTitle = isTranslationKey(place.name) ? t(place.name) : place.name;
  
  return (
    <div className="pb-12">
      <div className="relative h-48 w-full group">
        {place.coverImage ? (
          <>
            <Image
              src={place.coverImage}
              alt={displayTitle}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="outline" onClick={() => { setCoverUrl(place.coverImage || ''); setIsCoverDialog(true); }}>
                <ImageIcon className="w-4 h-4 mr-2" />
                {t('place_page.change_cover')}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-muted h-full flex items-center justify-center border-b">
            <Button variant="secondary" onClick={() => { setCoverUrl(''); setIsCoverDialog(true); }}>
              <ImageIcon className="w-4 h-4 mr-2" />
              {t('place_page.add_cover')}
            </Button>
          </div>
        )}
        <div className="absolute top-4 right-4 z-10">
          <Dialog>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon">
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
                      {place.coverImage && (
                          <DropdownMenuItem onClick={handleRemoveCoverImage} className="text-destructive focus:text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Cover Image
                          </DropdownMenuItem>
                      )}
                  </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Change Page Theme</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                      {Object.entries(availableThemes).map(([id, themeOption]) => {
                          const isActive = currentThemeId === id;
                          return (
                              <button
                                  key={id}
                                  onClick={() => handlePlaceThemeChange(id as ThemeId)}
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
        </div>
      </div>


      <div className="px-4 sm:px-6 pt-8">
        <Input
          value={displayTitle}
          onChange={(e) => handleUpdate({ name: e.target.value })}
          placeholder={t('place_page.place_name_placeholder')}
          className="text-3xl sm:text-4xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto"
        />
        <div className="mt-8">
          <BlockEditor onUpdate={handleDescriptionChange} initialBlocks={place.description} />
        </div>
      </div>
      <Dialog open={isCoverDialog} onOpenChange={setIsCoverDialog}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Update Cover Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                  <Label htmlFor="coverUrl">Image URL</Label>
                  <Input id="coverUrl" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
              </div>
              <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsCoverDialog(false)}>Cancel</Button>
                  <Button onClick={handleCoverSave}>Save</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
