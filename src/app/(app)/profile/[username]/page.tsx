
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useScripts, type Script, type JournalEntry } from '@/hooks/use-scripts';
import { useUser, type User, type Poster } from '@/hooks/use-user';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { File, Lock, Unlock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { isTranslationKey } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { format } from 'date-fns';
import { enUS, fr, es, pt, de, it, ru } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';

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

const PublicPosterCarousel = ({ posters }: { posters: Poster[] }) => {
    const { t } = useLanguage();
    const [emblaRef, emblaApi] = useEmblaCarousel({ 
        loop: true, 
        align: 'center',
        slidesToScroll: 1,
        skipSnaps: false,
        duration: 30
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

    return (
        <div className="w-full space-y-12 py-12 relative overflow-hidden">
            <div className="embla px-4 sm:px-12" ref={emblaRef}>
                <div className="flex -ml-4">
                    {posters.map((poster, index) => {
                        const isSelected = selectedIndex === index;
                        const displayTitle = isTranslationKey(poster.title) ? t(poster.title) : (poster.title || '');

                        return (
                            <div key={poster.id} className="flex-[0_0_280px] sm:flex-[0_0_350px] min-w-0 pl-4 relative flex flex-col items-center">
                                <div className={cn(
                                    "relative aspect-[3/4] w-full rounded-2xl overflow-hidden transition-all duration-500 shadow-xl border-4 border-card",
                                    isSelected ? "scale-110 z-10 opacity-100" : "scale-90 opacity-40 rotate-y-12 grayscale-[0.5]"
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
        </div>
    );
};

export default function UserProfilePage({ params: rawParams }: { params: { username: string } }) {
    const params = React.use(rawParams);
    const { scripts, journalEntries } = useScripts();
    const { user: currentUser, users, toggleFollow } = useUser();
    const { t } = useLanguage();

    const profileUser = useMemo(() => 
        users.find(u => u.username.toLowerCase() === params.username.toLowerCase()), 
    [users, params.username]);

    if (!profileUser) {
        return null;
    }

    const isFollowing = currentUser.following.includes(profileUser.username);
    const isMe = currentUser.id === profileUser.id;
    const canViewContent = profileUser.isPublic || isFollowing || isMe;

    const userPublicTemplates = scripts.filter(s => s.userId === profileUser.id && s.isTemplate && s.isPublic);
    const userPublicJournals = journalEntries.filter(j => j.userId === profileUser.id && j.isPublic);
    const userPublicPosters = (profileUser.posters || []).filter(p => p.isPublic || isMe);

    return (
        <div className="max-w-4xl mx-auto pb-20">
             <header className="mb-16">
                <div className="relative h-48 w-full bg-muted">
                    {profileUser.bannerImage && (
                        <Image
                            src={profileUser.bannerImage}
                            alt={`${profileUser.name}'s banner`}
                            fill
                            className="object-cover"
                        />
                    )}
                </div>
                <div className="px-4">
                    <div className="flex flex-col items-center -mt-16">
                        <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background">
                            <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                            <AvatarFallback className="text-4xl">{profileUser.name ? profileUser.name.charAt(0) : '?'}</AvatarFallback>
                        </Avatar>
                        <div className="w-full pt-4 text-center">
                           <h1 className="text-3xl font-bold">{profileUser.name || t('profile.unknown_user')}</h1>
                            <p className="text-lg text-muted-foreground">@{profileUser.username}</p>
                            <div className="flex items-center gap-4 mt-2 justify-center">
                                <p className="text-sm"><span className="font-bold">{profileUser.followerCount || 0}</span> {t('profile.followers')}</p>
                                <p className="text-sm"><span className="font-bold">{profileUser.following?.length || 0}</span> {t('profile.following')}</p>
                            </div>
                            <p className="mt-2 text-sm px-4">{profileUser.bio}</p>

                            {profileUser.shiftingStatus && (
                                <div className="flex justify-center mt-4">
                                    <Badge variant={profileUser.shiftingStatus === 'shifted' ? 'default' : 'secondary'} className="gap-2">
                                        {profileUser.shiftingStatus === 'shifted' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        {profileUser.shiftingStatus === 'shifted' ? t('profile.status_shifted') : t('profile.status_not_shifted')}
                                    </Badge>
                                </div>
                            )}

                            {!isMe && (
                                <Button
                                    onClick={() => toggleFollow(profileUser.username)}
                                    className="mt-4 mb-4"
                                    variant={isFollowing ? 'secondary' : 'default'}
                                >
                                    {isFollowing ? t('profile.unfollow') : t('profile.follow')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-4 sm:p-6 pt-0">
                {canViewContent ? (
                    <Tabs defaultValue="posters" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="posters">{t('profile.posters_tab')}</TabsTrigger>
                            <TabsTrigger value="templates">{t('profile.templates_tab')}</TabsTrigger>
                            <TabsTrigger value="journals">{t('profile.journals_tab')}</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="posters" className="mt-4">
                            {userPublicPosters.length > 0 ? (
                                <PublicPosterCarousel posters={userPublicPosters} />
                            ) : (
                                <p className="text-center text-muted-foreground py-8">{t('profile.user_no_posters')}</p>
                            )}
                        </TabsContent>

                        <TabsContent value="templates" className="mt-4">
                            {userPublicTemplates.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {userPublicTemplates.map(template => (
                                        <TemplateCard key={template.id} template={template} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">{t('profile.user_no_templates')}</p>
                            )}
                        </TabsContent>
                        <TabsContent value="journals" className="mt-4">
                            {userPublicJournals.length > 0 ? (
                                <div className="space-y-4">
                                    {userPublicJournals.map(entry => (
                                        <JournalPostCard key={entry.id} entry={entry} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">{t('profile.user_no_journals')}</p>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-semibold">{t('profile.account_private_title')}</h2>
                        <p className="text-muted-foreground">{t('profile.account_private_desc')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
