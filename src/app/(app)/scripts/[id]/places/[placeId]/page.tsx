
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, MoreVertical, Trash2, Palette, Check } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTheme, type ThemeId, availableThemes } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { compressImage } from '@/lib/image-utils';


export default function PlacePage({ params: rawParams }: { params: { id: string, placeId: string } }) {
    const params = React.use(rawParams);
    const router = useRouter();
    const { id: scriptId, placeId } = params;
    const { scripts, updatePlaceInScript } = useScripts();
    const [place, setPlace] = useState<Place | null>(null);
    const { t } = useLanguage();
    const { theme } = useTheme();
    const coverImageInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileRead = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
    });
  }

  const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageDataUrl = await handleFileRead(file);
      const compressed = await compressImage(imageDataUrl);
      handleUpdate({ coverImage: compressed });
    }
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
  
  const currentThemeId = place?.themeId || theme;

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
              <Button variant="outline" onClick={() => coverImageInputRef.current?.click()}>
                <ImageIcon className="w-4 h-4 mr-2" />
                {t('place_page.change_cover')}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-muted h-full flex items-center justify-center border-b">
            <Button variant="secondary" onClick={() => coverImageInputRef.current?.click()}>
              <ImageIcon className="w-4 h-4 mr-2" />
              {t('place_page.add_cover')}
            </Button>
          </div>
        )}
         <input 
            type="file" 
            ref={coverImageInputRef} 
            onChange={handleCoverImageChange} 
            className="hidden" 
            accept="image/*"
        />
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
                              {t('script_page.change_theme')}
                          </DropdownMenuItem>
                        </DialogTrigger>
                      {place.coverImage && (
                          <DropdownMenuItem onClick={handleRemoveCoverImage} className="text-destructive focus:text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('script_page.remove_cover')}
                          </DropdownMenuItem>
                      )}
                  </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>{t('script_page.change_page_theme')}</DialogTitle>
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
        </div>
      </div>


      <div className="px-4 sm:px-6 pt-8">
        <Textarea
          value={displayTitle}
          onChange={(e) => handleUpdate({ name: e.target.value.slice(0, 25) })}
          placeholder={t('place_page.place_name_placeholder')}
          className="text-3xl sm:text-4xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden"
          rows={1}
        />
        <div className="mt-8">
          <BlockEditor onUpdate={handleDescriptionChange} initialBlocks={place.description} />
        </div>
      </div>
    </div>
  );
}
