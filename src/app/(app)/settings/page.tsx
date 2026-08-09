
'use client';

import { useTheme, type ThemeId, availableThemes } from '@/hooks/use-theme';
import { Languages, Type, Palette, User, ChevronRight, LogOut, Trash2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAppearance } from '@/hooks/use-appearance';
import { CardDescription, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { setTheme, theme: currentTheme } = useTheme();
  const { 
    setFont,
    font,
    availableFonts
  } = useAppearance();
  const { t, setLanguage, language, availableLanguages } = useLanguage();
  const router = useRouter();
  const [isDeleteSecondConfirmOpen, setIsDeleteSecondConfirmOpen] = useState(false);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    const DB_NAME = 'ShiftSpaceDB';
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    
    deleteRequest.onsuccess = () => {
        localStorage.clear();
        window.location.href = '/login';
    };
    
    deleteRequest.onerror = () => {
        localStorage.clear();
        window.location.href = '/login';
    };
  };
  
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto flex flex-col min-h-screen pb-20">
      <h1 className="text-3xl font-bold mb-6">{t('settings.title')}</h1>
      
      <div className="space-y-4 flex-1">

        <Link href="/settings/profile">
          <div className="flex items-center p-4 border rounded-lg bg-card text-card-foreground hover:bg-muted/50 cursor-pointer shadow-sm">
            <User className="w-5 h-5 mr-4" />
            <div className="flex-1">
              <p className="font-semibold">{t('settings.account.title')}</p>
              <p className="text-sm text-muted-foreground">{t('settings.account.description')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Link>
        

        <Accordion type="multiple" className="w-full space-y-4">
          <AccordionItem value="language" className="border rounded-lg bg-card overflow-hidden shadow-sm">
              <AccordionTrigger className="p-6 hover:no-underline">
                  <div className="flex flex-col items-start text-left">
                      <CardTitle className="flex items-center gap-2 text-lg">
                          <Languages className="w-5 h-5" />
                          {t('settings.language.title')}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {t('settings.language.description')}
                      </CardDescription>
                  </div>
              </AccordionTrigger>
              <AccordionContent>
                  <div className="px-6 pb-6">
                      <Select onValueChange={(value) => setLanguage(value as any)} defaultValue={language}>
                        <SelectTrigger className="w-[280px]">
                          <SelectValue placeholder={t('settings.language.select_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(availableLanguages).map(([code, name]) => (
                            <SelectItem key={code} value={code}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
              </AccordionContent>
          </AccordionItem>

          <AccordionItem value="appearance" className="border rounded-lg bg-card overflow-hidden shadow-sm">
              <AccordionTrigger className="p-6 hover:no-underline">
                  <div className="flex flex-col items-start text-left">
                      <CardTitle className="flex items-center gap-2 text-lg">
                          <Type className="w-5 h-5" />
                          {t('settings.appearance.title')}
                      </CardTitle>
                      <CardDescription className="mt-1">
                          {t('settings.appearance.description')}
                      </CardDescription>
                  </div>
              </AccordionTrigger>
              <AccordionContent>
                   <div className="px-6 pb-6 space-y-6">
                      <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium"><Type className="w-4 h-4" /> {t('settings.appearance.font_style')}</label>
                          <Select onValueChange={(value) => setFont(value as any)} defaultValue={font}>
                              <SelectTrigger className="w-[280px]">
                                  <SelectValue placeholder={t('settings.appearance.font_placeholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                  {Object.entries(availableFonts).map(([id, fontOption]) => (
                                      <SelectItem key={id} value={id}>
                                          <span style={{ fontFamily: fontOption.variable }}>{fontOption.name}</span>
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
              </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="theme" className="border rounded-lg bg-card overflow-hidden shadow-sm">
              <AccordionTrigger className="p-6 hover:no-underline">
                  <div className="flex flex-col items-start text-left">
                       <CardTitle className="flex items-center gap-2 text-lg">
                          <Palette className="w-5 h-5" />
                          {t('settings.themes.title')}
                      </CardTitle>
                      <CardDescription className="mt-1">
                          {t('settings.themes.description')}
                      </CardDescription>
                  </div>
              </AccordionTrigger>
              <AccordionContent>
                  <div className="px-6 pb-6">
                       <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-4">
                          {Object.entries(availableThemes).map(([id, themeOption]) => {
                              const isActive = currentTheme === id;
                              return (
                                   <button
                                      key={id}
                                      onClick={() => setTheme(id as ThemeId)}
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
                  </div>
              </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="mt-12 flex flex-col gap-2 border-t pt-6">
          <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-fit text-muted-foreground hover:text-foreground pl-0">
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('settings.logout.button')}
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>{t('settings.logout.confirm_title')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('settings.logout.confirm_desc')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>{t('settings.logout.button')}</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-fit text-destructive hover:text-destructive hover:bg-destructive/10 pl-0">
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('settings.delete_account.button')}
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>{t('settings.delete_account.confirm_title_1')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('settings.delete_account.confirm_desc_1')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => setIsDeleteSecondConfirmOpen(true)} className="bg-destructive hover:bg-destructive/90">
                          {t('common.delete')}
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={isDeleteSecondConfirmOpen} onOpenChange={setIsDeleteSecondConfirmOpen}>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive">{t('settings.delete_account.confirm_title_2')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('settings.delete_account.confirm_desc_2')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                          {t('settings.delete_account.button')}
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
      </div>
    </div>
  );
}
