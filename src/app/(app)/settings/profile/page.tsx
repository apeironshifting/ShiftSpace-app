'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle, XCircle, ImageIcon, Plus, MoreVertical, Trash2, Unlock, Lock, File, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser, type User, type Poster } from '@/hooks/use-user';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useScripts, type Script, type JournalEntry } from '@/hooks/use-scripts';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';
import Image from 'next/image';
import { isTranslationKey } from '@/lib/utils';
import { format } from 'date-fns';
import { enUS, fr, es, pt, de, it, ru } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { ScrollArea } from '@/components/ui/scroll-area';
import useEmblaCarousel from 'embla-carousel-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { compressImage } from '@/lib/image-utils';

const locales: { [key: string]: Locale } = {
  en: enUS,
  fr,
  es,
  pt,
  de,
  it,
  ru,
};

const TemplateCard = ({ template }: { template: Script }) => {
    const { t } = useLanguage();
    const displayTitle = isTranslationKey(template.title) ? t(template.title) : (template.title || '');

    return (
        <Card className="overflow-hidden transition-transform transform-gpu hover:-translate-y-1 hover:shadow-xl group relative aspect-square">
            <Link href={`/scripts/${template.id}`} className="flex flex-col h-full">
                <div className="relative w-full h-full">
                    {template.coverImage ? (
                        <Image
                            src={template.coverImage}
                            alt={displayTitle}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover"
                        />
                    ) : (
                         <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                            <File className="w-10 h-10" />
                        </div>
                    )}
                </div>
                 <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                    <CardTitle className="text-lg font-semibold text-white">{displayTitle}</CardTitle>
                </div>
            </Link>
        </Card>
    );
};

const JournalPostCard = ({ entry }: { entry: JournalEntry }) => {
    const { t, language } = useLanguage();
    const locale = locales[language] || enUS;
    const contentPreview = entry.content.find(block => block.type === 'text')?.content || '';
    const displayTitle = isTranslationKey(entry.title) ? t(entry.title) : (entry.title || '');

    return (
        <Card className="w-full">
            <CardHeader>
                <Link href={`/journal/${entry.id}`}>
                    <CardTitle className="cursor-pointer hover:underline">{displayTitle}</CardTitle>
                </Link>
                <p className="text-sm text-muted-foreground">{format(new Date(entry.date), 'PPPP', { locale })}</p>
            </CardHeader>
            <CardContent>
                <p className="line-clamp-3 text-muted-foreground">{contentPreview}</p>
            </CardContent>
        </Card>
    );
}

const PosterCarousel = ({ posters }: { posters: Poster[] }) => {
    const { deletePoster, togglePosterVisibility, addPoster } = useUser();
    const { t } = useLanguage();
    const posterInputRef = useRef<HTMLInputElement>(null);
    
    const [emblaRef, emblaApi] = useEmblaCarousel({ 
        loop: true, 
        align: 'center',
        containScroll: false,
        slidesToScroll: 1,
        skipSnaps: false,
        duration: 40
    });

    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        
        const onSelect = () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        };

        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        
        onSelect();
    }, [emblaApi]);

    const handlePosterAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressImage(reader.result as string);
                addPoster(compressed);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full space-y-12 py-12 relative">
            <div className="embla px-4 sm:px-12" ref={emblaRef}>
                <div className="flex -ml-4">
                    {posters.map((poster, index) => {
                        const isSelected = selectedIndex === index;
                        const displayTitle = isTranslationKey(poster.title) ? t(poster.title) : (poster.title || '');
                        
                        return (
                            <div key={poster.id} className="flex-[0_0_280px] sm:flex-[0_0_350px] min-w-0 pl-4 relative group flex flex-col items-center">
                                <div className="relative w-full">
                                    <Link href={`/posters/${poster.id}`} className="w-full">
                                        <div className={cn(
                                            "relative aspect-[3/4] w-full rounded-2xl overflow-hidden transition-all duration-500 shadow-xl border-4 border-card",
                                            isSelected ? "scale-110 z-10 opacity-100" : "scale-90 opacity-40 grayscale-[0.5] rotate-y-12"
                                        )}>
                                            <Image src={poster.image} alt="Poster" fill className="object-cover" />
                                            
                                            <div className="absolute top-3 left-3 z-20">
                                                <div className="bg-background/80 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-border/50 text-foreground">
                                                    {poster.isPublic ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "mt-8 text-center transition-all duration-500 px-4",
                                            isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                        )}>
                                            <p className="text-xl font-bold text-foreground break-words">{displayTitle}</p>
                                        </div>
                                    </Link>
                                    
                                    <div className="absolute top-4 right-4 z-30">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full shadow-lg border border-border/50 bg-background/80 backdrop-blur-md hover:scale-110 transition-transform">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => togglePosterVisibility(poster.id)}>
                                                    {poster.isPublic ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                                                    {poster.isPublic ? t('common.make_private') : t('common.make_public')}
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            {t('common.delete')}
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
                                                            <AlertDialogDescription>{t('poster_page.delete_desc')}</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deletePoster(poster.id)} className="bg-destructive">{t('common.delete')}</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {posters.length > 1 && (
                <>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute left-2 top-[40%] -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40"
                        onClick={scrollPrev}
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-[40%] -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40"
                        onClick={scrollNext}
                    >
                        <ChevronRight className="h-8 w-8" />
                    </Button>
                </>
            )}

            <div className="flex justify-center pt-4">
                <Button 
                    onClick={() => posterInputRef.current?.click()}
                    size="icon" 
                    className="h-14 w-14 rounded-full shadow-lg border-4 border-background"
                >
                    <Plus className="w-8 h-8" />
                </Button>
                <input type="file" ref={posterInputRef} onChange={handlePosterAdd} className="hidden" accept="image/*" />
            </div>
        </div>
    );
};

export default function ProfileSettingsPage() {
  const { user, updateUser, addPoster } = useUser();
  const { scripts, journalEntries, findUserByUsername, users: allUsers } = useScripts();
  const { t } = useLanguage();
  const [isFollowingDialogOpen, setIsFollowingDialogOpen] = useState(false);
  const [isFollowersDialogOpen, setIsFollowersDialogOpen] = useState(false);
  const emptyPosterInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'bannerImage') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressedDataUrl = await compressImage(reader.result as string);
        updateUser({ [field]: compressedDataUrl });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleEmptyPosterAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const compressed = await compressImage(reader.result as string);
            addPoster(compressed);
        };
        reader.readAsDataURL(file);
    }
  };
  
  const userPublicTemplates = scripts.filter(s => s.userId === user.id && s.isTemplate && s.isPublic);
  const userPublicJournals = journalEntries.filter(j => j.userId === user.id && j.isPublic);

  const followingUsers = user.following.map(username => findUserByUsername(username)).filter(Boolean) as User[];
  const followers = allUsers.filter(u => u.following?.includes(user.username));

  return (
    <div className="max-w-4xl mx-auto pb-20">
       <header className="mb-16">
          <div className="relative h-48 w-full bg-muted group">
              {user.bannerImage ? (
                  <Image
                      src={user.bannerImage}
                      alt="User banner"
                      fill
                      className="object-cover"
                  />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                </div>
              )}
               <div 
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  <div className="text-center text-white">
                      <Camera className="w-8 h-8 mx-auto" />
                      <p>{t('profile.change_banner')}</p>
                  </div>
              </div>
              <input type="file" ref={bannerInputRef} onChange={(e) => handleImageChange(e, 'bannerImage')} className="hidden" accept="image/*" />
          </div>
          <div className="px-4">
              <div className="flex flex-col items-center -mt-16">
                    <div className="relative group">
                        <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-4xl">{user.name?.charAt(0) || 'S'}</AvatarFallback>
                        </Avatar>
                        <div 
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity cursor-pointer"
                        onClick={() => avatarInputRef.current?.click()}
                        >
                            <Camera className="w-8 h-8" />
                        </div>
                        <input type="file" ref={avatarInputRef} onChange={(e) => handleImageChange(e, 'avatar')} className="hidden" accept="image/*" />
                  </div>
                  <div className="w-full pt-4 text-center">
                      <Textarea 
                        id="name" 
                        value={user.name || ''} 
                        onChange={(e) => updateUser({ name: e.target.value.slice(0, 35) })}
                        className="text-3xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto mb-1 text-center w-full resize-none overflow-hidden"
                        placeholder={t('signup.name_label')}
                        rows={1}
                      />
                      <div className="flex items-center justify-center text-lg text-muted-foreground">
                        <p>@{user.username}</p>
                      </div>

                      <div className="flex items-center gap-4 mt-2 justify-center">
                          <Dialog open={isFollowersDialogOpen} onOpenChange={setIsFollowersDialogOpen}>
                            <DialogTrigger asChild>
                              <p className="text-sm cursor-pointer hover:underline"><span className="font-bold">{followers.length}</span> {t('profile.followers')}</p>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t('profile.followers')}</DialogTitle>
                              </DialogHeader>
                              <ScrollArea className="max-h-72">
                                <div className="space-y-4 pr-6">
                                  {followers.length > 0 ? followers.map(u => (
                                      <Link href={`/profile/${u.username}`} key={u.id} onClick={() => setIsFollowersDialogOpen(false)}>
                                          <Card className="hover:bg-muted/50">
                                              <CardHeader className="flex flex-row items-center gap-4 p-4">
                                                  <Avatar>
                                                      <AvatarImage src={u.avatar} alt={u.name} />
                                                      <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                                  </Avatar>
                                                  <div>
                                                      <p className="font-semibold">{u.name}</p>
                                                      <p className="text-sm text-muted-foreground">@{u.username}</p>
                                                  </div>
                                              </CardHeader>
                                          </Card>
                                      </Link>
                                  )) : (
                                      <p className="col-span-full text-center text-muted-foreground">{t('profile.no_followers')}</p>
                                  )}
                              </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                          <Dialog open={isFollowingDialogOpen} onOpenChange={setIsFollowingDialogOpen}>
                            <DialogTrigger asChild>
                              <p className="text-sm cursor-pointer hover:underline"><span className="font-bold">{followingUsers.length}</span> {t('profile.following')}</p>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t('profile.following')}</DialogTitle>
                              </DialogHeader>
                              <ScrollArea className="max-h-72">
                                <div className="space-y-4 pr-6">
                                  {followingUsers.length > 0 ? followingUsers.map(u => (
                                      <Link href={`/profile/${u.username}`} key={u.id} onClick={() => setIsFollowingDialogOpen(false)}>
                                          <Card className="hover:bg-muted/50">
                                              <CardHeader className="flex flex-row items-center gap-4 p-4">
                                                  <Avatar>
                                                      <AvatarImage src={u.avatar} alt={u.name} />
                                                      <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                                  </Avatar>
                                                  <div>
                                                      <p className="font-semibold">{u.name}</p>
                                                      <p className="text-sm text-muted-foreground">@{u.username}</p>
                                                  </div>
                                              </CardHeader>
                                          </Card>
                                      </Link>
                                  )) : (
                                      <p className="col-span-full text-center text-muted-foreground">{t('profile.no_following')}</p>
                                  )}
                              </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                      </div>

                      <Textarea 
                        id="bio" 
                        placeholder={t('profile.bio_placeholder')}
                        value={user.bio || ''} 
                        onChange={(e) => updateUser({ bio: e.target.value.slice(0, 200) })}
                        maxLength={200}
                        className="mt-2 text-sm bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto resize-none text-center"
                      />
                      {user.shiftingStatus && (
                        <div className="flex justify-center mt-4">
                            <Badge variant={user.shiftingStatus === 'shifted' ? 'default' : 'secondary'} className="gap-2">
                                {user.shiftingStatus === 'shifted' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                {user.shiftingStatus === 'shifted' ? t('profile.status_shifted') : t('profile.status_not_shifted')}
                            </Badge>
                        </div>
                    )}
                  </div>
              </div>
          </div>
      </header>
      
      <div className="space-y-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.privacy_settings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Label htmlFor="privacy-switch" className="text-base">
                        {user.isPublic ? t('profile.public_profile') : t('profile.private_profile')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        {user.isPublic 
                          ? t('profile.privacy_description_public')
                          : t('profile.privacy_description_private')
                        }
                    </p>
                </div>
                  <Switch
                    id="privacy-switch"
                    checked={user.isPublic}
                    onCheckedChange={(checked) => updateUser({ isPublic: checked })}
                    aria-label="Toggle profile privacy"
                />
            </div>
            <Separator />
             <div>
                <Label className="text-base">{t('profile.shifting_status')}</Label>
                <p className="text-sm text-muted-foreground mb-3">
                    {t('profile.shifting_status_description')}
                </p>
                <RadioGroup 
                    value={user.shiftingStatus || 'none'} 
                    onValueChange={(value) => updateUser({ shiftingStatus: value as any === 'none' ? null : value as any })}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="shifted" id="shifted" />
                        <Label htmlFor="shifted">{t('profile.status_shifted')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="not-shifted" id="not-shifted" />
                        <Label htmlFor="not-shifted">{t('profile.status_not_shifted')}</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none">{t('profile.status_none')}</Label>
                    </div>
                </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />
      
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">{t('profile.public_facing_profile')}</h2>
      </div>

      <Tabs defaultValue="posters" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posters">{t('profile.posters_tab')}</TabsTrigger>
              <TabsTrigger value="templates">{t('profile.templates_tab')}</TabsTrigger>
              <TabsTrigger value="journals">{t('profile.journals_tab')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posters" className="mt-4">
              {user.posters && user.posters.length > 0 ? (
                  <PosterCarousel posters={user.posters} />
              ) : (
                  <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/20">
                      <p className="text-muted-foreground mb-4">{t('profile.own_no_posters')}</p>
                      <Button onClick={() => emptyPosterInputRef.current?.click()} variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          {t('profile.add_poster')}
                      </Button>
                      <input type="file" ref={emptyPosterInputRef} onChange={handleEmptyPosterAdd} className="hidden" accept="image/*" />
                  </div>
              )}
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {userPublicTemplates.length > 0 ? (
                    userPublicTemplates.map(template => (
                        <TemplateCard key={template.id} template={template} />
                    ))
                ) : (
                    <p className="col-span-full text-center text-muted-foreground py-8">{t('profile.own_no_templates')}</p>
                )}
              </div>
          </TabsContent>
          <TabsContent value="journals" className="mt-4">
              {userPublicJournals.length > 0 ? (
                  <div className="space-y-4">
                      {userPublicJournals.map(entry => (
                          <JournalPostCard key={entry.id} entry={entry} />
                      ))}
                  </div>
              ) : (
                  <p className="col-span-full text-center text-muted-foreground py-8">{t('profile.own_no_journals')}</p>
              )}
          </TabsContent>
      </Tabs>
    </div>
  );
}
