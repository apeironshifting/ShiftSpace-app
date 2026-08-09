'use client';
import { useScripts, type User, type Conversation } from '@/hooks/use-scripts';
import { useUser } from '@/hooks/use-user';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronRight, Plus, Trash2, Infinity as InfinityIcon, ArrowLeft } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isTranslationKey } from '@/lib/utils';
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

const formatTimestamp = (date: Date) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    if (date.getTime() >= startOfToday.getTime()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (date.getTime() >= startOfYesterday.getTime()) {
        return 'Yesterday';
    }
    const diffDays = Math.floor((startOfToday.getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 6) { // It's been less than a week
        return date.toLocaleDateString([], { weekday: 'long' });
    }
    
    return date.toLocaleDateString();
}

const ConversationItem = ({ convo }: { convo: (Conversation & { otherUser: User | null, lastMessage: any })}) => {
  const { deleteConversation } = useScripts();
  const { t } = useLanguage();
  const router = useRouter();
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const itemRef = useRef<HTMLDivElement>(null);
  const MAX_SWIPE = -80; // Width of the delete button

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    currentX.current = e.clientX;
    itemRef.current?.setPointerCapture(e.pointerId);
    setIsSwiping(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isSwiping) return;

    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;

    if (Math.abs(deltaY) > Math.abs(deltaX) && translateX === 0) {
        setIsSwiping(false);
        return;
    }

    currentX.current = e.clientX;
    
    if (deltaX < 0) {
      setTranslateX(Math.max(deltaX, MAX_SWIPE));
    } else if (translateX !== 0) {
        setTranslateX(Math.min(0, deltaX + MAX_SWIPE));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    itemRef.current?.releasePointerCapture(e.pointerId);
    if (!isSwiping) return;

    setIsSwiping(false);
    
    const deltaX = currentX.current - startX.current;
    const deltaY = e.clientY - startY.current;

    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      if (translateX === 0) {
        router.push(`/discussions/${convo.id}`);
      } else {
        setTranslateX(0);
      }
      return;
    }
    
    if (deltaX < MAX_SWIPE / 2) {
      setTranslateX(MAX_SWIPE);
    } else {
      setTranslateX(0);
    }
  };

  const handleDelete = () => {
    deleteConversation(convo.id);
  };

  const lastMessageText = convo.lastMessage?.text || '';
  const displayLastMessage = isTranslationKey(lastMessageText) ? t(lastMessageText) : lastMessageText;

  return (
    <div className="relative bg-background overflow-hidden border-b">
        <div className="absolute top-0 right-0 h-full">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                     <Button 
                        variant="destructive" 
                        className="h-full w-[80px] rounded-none flex items-center justify-center"
                        style={{ transform: `translateX(${80 + translateX}px)`, transition: 'transform 0.2s ease-out' }}
                      >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('discussions.delete_confirm')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setTranslateX(0)}>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        <div
            ref={itemRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ transform: `translateX(${translateX}px)`, transition: isSwiping ? 'none' : 'transform 0.2s ease-out' }}
            className="w-full bg-background touch-pan-y cursor-pointer"
        >
            <div className="flex items-center gap-3 p-3 hover:bg-muted/50">
              {convo.lastMessage && !convo.lastMessage.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center shrink-0"></div>}
              <Avatar className="w-14 h-14">
                <AvatarImage src={convo.otherUser?.avatar} />
                <AvatarFallback>{convo.otherUser?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{convo.otherUser?.name}</p>
                  {convo.otherUser?.id === 'apeiron-user' ? (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <InfinityIcon className="w-5 h-5" />
                      </p>
                  ) : convo.lastMessage ? (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {formatTimestamp(new Date(convo.lastMessage.timestamp))}
                          <ChevronRight className="w-4 h-4" />
                      </p>
                  ) : null}
                </div>
                {convo.lastMessage && <p className="text-sm text-muted-foreground truncate">{displayLastMessage}</p>}
              </div>
            </div>
        </div>
    </div>
  );
}

export default function DiscussionsPage() {
  const { conversations, findUserById, users, findOrCreateConversation } = useScripts();
  const { user: currentUser } = useUser();
  const { t } = useLanguage();
  const router = useRouter();
  const [isNewConvoDialogOpen, setIsNewConvoDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const myConversations = (conversations || [])
    .filter(c => c.participantIds.includes(currentUser.id))
    .map(c => {
      const otherUserId = c.participantIds.find(id => id !== currentUser.id);
      const otherUser = otherUserId ? findUserById(otherUserId) : null;
      const lastMessage = c.messages[c.messages.length - 1];
      const unreadCount = c.messages.filter(m => m.senderId !== currentUser.id && !m.read).length;
      return { ...c, otherUser, lastMessage, unreadCount };
    })
    .filter(c => {
        if (!c.otherUser) return false;
        if (c.otherUser.id === 'apeiron-user') return true;
        
        const isMutual = currentUser.following.includes(c.otherUser.username) && c.otherUser.following?.includes(currentUser.username);
        return isMutual;
    })
    .sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    });

    const mutuals = users.filter(u =>
        u.id !== currentUser.id &&
        u.id !== 'apeiron-user' &&
        currentUser.following.includes(u.username) &&
        u.following?.includes(currentUser.username)
    );

    const filteredMutuals = mutuals.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStartConversation = (otherUserId: string) => {
        const conversation = findOrCreateConversation(otherUserId);
        setIsNewConvoDialogOpen(false);
        setSearchTerm('');
        router.push(`/discussions/${conversation.id}`);
    }

  return (
    <div className="bg-background text-foreground flex flex-col h-screen">
      <header className="p-4 flex items-center gap-2 border-b shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">{t('discussions.title')}</h1>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div>
          {myConversations.map(convo => (
            <ConversationItem key={convo.id} convo={convo} />
          ))}
        </div>
      </main>
      <footer className="p-2 border-t shrink-0 flex items-center justify-end">
        <Dialog open={isNewConvoDialogOpen} onOpenChange={setIsNewConvoDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Plus className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('discussions.new_discussion')}</DialogTitle>
                    <DialogDescription>{t('discussions.new_discussion_desc')}</DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <Input 
                        placeholder={t('discussions.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <ScrollArea className="h-72 mt-4">
                        <div className="space-y-2 pr-4">
                            {filteredMutuals.length > 0 ? filteredMutuals.map(user => (
                                <div key={user.id} onClick={() => handleStartConversation(user.id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                                    <Avatar>
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-muted-foreground pt-8">{t('discussions.no_mutuals')}</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
      </footer>
    </div>
  );
}
