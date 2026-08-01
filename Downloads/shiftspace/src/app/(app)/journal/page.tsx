'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical, Trash2, Lock, Unlock, File, BookText, Heart, MessageSquare, Search } from 'lucide-react';
import { useScripts, type JournalEntry, type Script } from '@/hooks/use-scripts';
import { useLanguage } from '@/hooks/use-language';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { format } from 'date-fns';
import { enUS, fr, es, pt, de, it, ru } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useUser, type User } from '@/hooks/use-user';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { cn, isTranslationKey } from '@/lib/utils';

const locales: { [key: string]: Locale } = {
  en: enUS,
  fr,
  es,
  pt,
  de,
  it,
  ru,
};


const JournalGrid = ({ 
    entries, 
    onDelete, 
    onToggleVisibility,
    showCreateCard,
    onCreate,
} : { 
    entries: JournalEntry[], 
    onDelete: (id: string) => void, 
    onToggleVisibility: (id: string) => void,
    showCreateCard: boolean,
    onCreate: () => void,
}) => {
    const { t, language } = useLanguage();
    const locale = locales[language] || enUS;
    
    if (entries.length === 0 && !showCreateCard) {
        return (
             <div className="text-center py-16 border-2 border-dashed rounded-lg col-span-full">
                <p className="text-muted-foreground">{t('journal_page.no_entries_section')}</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => {
                const displayTitle = isTranslationKey(entry.title) ? t(entry.title) : entry.title;
                return (
                <Card key={entry.id} className="group">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <Link href={`/journal/${entry.id}`}>
                                    <CardTitle className="cursor-pointer hover:underline">{displayTitle}</CardTitle>
                                </Link>
                                <CardDescription>{format(new Date(entry.date), 'PPP', { locale })}</CardDescription>
                            </div>
                            <div className="flex items-center">
                                <Button variant="ghost" size="icon" onClick={() => onToggleVisibility(entry.id)}>
                                    {entry.isPublic ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                </Button>
                                <AlertDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    {t('common.delete')}
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t('journal_page.delete_entry_desc_confirm', { title: displayTitle })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(entry.id)} className="bg-destructive hover:bg-destructive/90">
                                            {t('common.delete')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                )
            })}

           {showCreateCard && (
             <Card 
                className="border-2 border-dashed hover:border-primary hover:text-primary transition-colors h-full flex flex-col items-center justify-center text-muted-foreground cursor-pointer min-h-36"
                onClick={onCreate}
            >
                <CardContent className="p-4 text-center">
                    <PlusCircle className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-semibold">{t('journal_page.new_entry')}</p>
                </CardContent>
             </Card>
           )}
        </div>
    );
};

const JournalPostCard = ({ entry, author }: { entry: JournalEntry; author?: User }) => {
    const { user } = useUser();
    const { toggleJournalLike } = useScripts();
    const { t, language } = useLanguage();
    const locale = locales[language] || enUS;
    const contentPreview = entry.content.find(block => block.type === 'text')?.content || '';
    const displayTitle = isTranslationKey(entry.title) ? t(entry.title) : entry.title;
    
    const isLiked = user.likedJournalIds.includes(entry.id);

    return (
        <Card className="w-full max-w-2xl mx-auto border-0 sm:border bg-card text-card-foreground shadow-none sm:shadow-lg rounded-none sm:rounded-lg overflow-hidden p-4">
             <CardHeader className="p-0 mb-4">
                <Link href={`/profile/${author?.username}`} className="flex items-center gap-3 w-fit">
                    <Avatar className="w-10 h-10">
                        {author?.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
                        <AvatarFallback>{author?.name.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm hover:underline">@{author?.username || 'Unknown User'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(entry.date), 'MMM d', { locale })}</p>
                    </div>
                </Link>
            </CardHeader>

            <CardContent className="p-0">
                <h2 className="text-2xl font-bold mb-3">{displayTitle}</h2>
                <Separator className="mb-4 bg-border/50" />
                
                <div className="relative max-h-24 overflow-hidden">
                    <p className="text-muted-foreground text-base leading-relaxed">
                        {contentPreview}
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
                     <div className="absolute bottom-0 left-0 w-full flex justify-center pt-8">
                         <Button variant="link" asChild className="h-auto bg-card/80 backdrop-blur-sm rounded-full px-4 text-foreground border-2 border-blue-500 hover:bg-blue-500/10 hover:no-underline">
                           <Link href={`/journal/${entry.id}`}>{t('journal_page.view_post')}</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>

             <div className="flex items-center justify-end gap-1 p-0 pt-4">
                 <Button variant="ghost" size="icon">
                    <MessageSquare className="w-6 h-6" />
                    <span className="sr-only">{t('journal_page.comment')}</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toggleJournalLike(entry.id)}>
                    <Heart className={cn("w-6 h-6", isLiked && "fill-red-500 text-red-500")} />
                    <span className="sr-only">{t('journal_page.like')}</span>
                </Button>
            </div>
        </Card>
    )
}


const ExploreContent = () => {
    const { journalEntries, findUserById, users } = useScripts();
    const { user } = useUser();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');

    const followingUserIds = users.filter(u => user.following.includes(u.username)).map(u => u.id);

    const publicJournals = journalEntries.filter(j => 
        j.isPublic && followingUserIds.includes(j.userId)
    );

    const publicUsers = users.filter(u => u.isPublic && u.id !== user.id);

    const filteredUsers = publicUsers.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder={t('journal_page.search_placeholder')}
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {searchTerm ? (
                <div>
                    <h2 className="text-2xl font-bold mb-4">{t('journal_page.search_results')}</h2>
                     <div className="space-y-4">
                        {filteredUsers.length > 0 ? filteredUsers.map(u => (
                            <Link href={`/profile/${u.username}`} key={u.id}>
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
                            <p className="col-span-full text-center text-muted-foreground">{t('journal_page.no_users_found')}</p>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <h2 className="text-2xl font-bold mb-4">{t('explore_page.journals')}</h2>
                    <div className="space-y-6">
                        {publicJournals.length > 0 ? publicJournals.map((entry) => {
                            const author = findUserById(entry.userId);
                            return <JournalPostCard key={entry.id} entry={entry} author={author} />
                        }) : (
                             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">{t('journal_page.follow_to_see_explore')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function JournalListPage() {
    const { t } = useLanguage();
    const { journalEntries, addJournalEntry, deleteJournalEntry, toggleJournalEntryVisibility, findUserById } = useScripts();
    const { user } = useUser();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('private');

    const handleNewEntry = () => {
        const newEntry = addJournalEntry();
        router.push(`/journal/${newEntry.id}`);
    }

    const privateEntries = journalEntries.filter(e => !e.isPublic && e.userId === user.id);
    const publicEntries = journalEntries.filter(e => e.isPublic && e.userId === user.id);
    const likedEntries = journalEntries.filter(e => user.likedJournalIds.includes(e.id) && e.userId !== user.id);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('journal_page.title')}</h1>
        <p className="text-muted-foreground">{t('journal_page.description')}</p>
      </div>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="private">{t('journal_page.private_tab')}</TabsTrigger>
                <TabsTrigger value="public">{t('journal_page.public_tab')}</TabsTrigger>
                <TabsTrigger value="liked">{t('journal_page.liked_tab')}</TabsTrigger>
                <TabsTrigger value="explore">{t('journal_page.explore_tab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="private" className="mt-4">
                 <JournalGrid 
                    entries={privateEntries} 
                    onDelete={deleteJournalEntry} 
                    onToggleVisibility={toggleJournalEntryVisibility}
                    showCreateCard={true}
                    onCreate={handleNewEntry}
                />
            </TabsContent>
            <TabsContent value="public" className="mt-4">
                 <JournalGrid 
                    entries={publicEntries} 
                    onDelete={deleteJournalEntry} 
                    onToggleVisibility={toggleJournalEntryVisibility}
                    showCreateCard={false}
                    onCreate={handleNewEntry}
                 />
            </TabsContent>
            <TabsContent value="liked" className="mt-4">
                 <div className="space-y-6">
                    {likedEntries.length > 0 ? likedEntries.map((entry) => {
                        const author = findUserById(entry.userId);
                        return <JournalPostCard key={entry.id} entry={entry} author={author} />
                    }) : (
                            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">{t('journal_page.no_liked_entries')}</p>
                        </div>
                    )}
                </div>
            </TabsContent>
             <TabsContent value="explore" className="mt-4">
                <ExploreContent />
            </TabsContent>
        </Tabs>
    </div>
  );
}
