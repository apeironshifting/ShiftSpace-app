'use client';
import { useScripts } from '@/hooks/use-scripts';
import { useUser, type User } from '@/hooks/use-user';
import { useLanguage } from '@/hooks/use-language';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Conversation } from '@/hooks/use-scripts';
import { cn, isTranslationKey } from '@/lib/utils';
import React from 'react';

export default function ChatPage({ params: rawParams }: { params: { id: string } }) {
    const params = React.use(rawParams);
    const { conversations, findUserById, addMessageToConversation, markConversationAsRead } = useScripts();
    const { user: currentUser } = useUser();
    const { t } = useLanguage();
    const router = useRouter();
    const [convo, setConvo] = useState<Conversation | null>(null);
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const renderMessageText = (text: string) => {
        const displayBody = isTranslationKey(text) ? t(text) : text;
        const parts = displayBody.split(/(@apeironshiftingg)/g);
        return parts.map((part, index) => {
          if (part === '@apeironshiftingg') {
            return (
              <a
                key={index}
                href="https://www.tumblr.com/apeironshiftingg"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                @apeironshiftingg
              </a>
            );
          }
          return part;
        });
    };

    useEffect(() => {
        const foundConvo = conversations.find(c => c.id === params.id);
        if (foundConvo) {
            setConvo(foundConvo);
            if (foundConvo.participantIds.includes(currentUser.id)) {
              markConversationAsRead(foundConvo.id);
            }
            const otherUserId = foundConvo.participantIds.find(id => id !== currentUser.id);
            if (otherUserId) {
                setOtherUser(findUserById(otherUserId) || null);
            }
        }
    }, [params.id, conversations, currentUser.id, findUserById, markConversationAsRead]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [convo?.messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !convo || otherUser?.id === 'apeiron-user') return;
        addMessageToConversation(convo.id, newMessage.trim());
        setNewMessage('');
    };
    
    if (!convo || !otherUser) {
        return null;
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="flex items-center p-2 border-b gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <Avatar className="w-10 h-10">
                    <AvatarImage src={otherUser.id === 'apeiron-user' ? undefined : otherUser.avatar} />
                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="font-semibold">{otherUser.name}</h2>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {convo.messages.map(message => (
                    <div key={message.id} className={cn("flex gap-2 items-end", message.senderId === currentUser.id ? "justify-end" : "justify-start")}>
                        {message.senderId !== currentUser.id && (
                             <Avatar className="w-8 h-8">
                                <AvatarImage src={otherUser.id === 'apeiron-user' ? undefined : otherUser.avatar} />
                                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn("max-w-xs md:max-w-md p-3 rounded-2xl", message.senderId === currentUser.id ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                            <div className="whitespace-pre-wrap break-words">{renderMessageText(message.text)}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-2 border-t shrink-0">
                 {otherUser.id !== 'apeiron-user' ? (
                    <div className="flex gap-2">
                        <Input 
                            placeholder={t('discussions.message_placeholder')} 
                            className="flex-1 rounded-full" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <Button size="icon" className="rounded-full" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                            <Send />
                        </Button>
                    </div>
                 ) : (
                    <div className="text-center text-sm text-muted-foreground p-2">
                        {t('discussions.cannot_chat')}
                    </div>
                 )}
            </footer>
        </div>
    )
}
