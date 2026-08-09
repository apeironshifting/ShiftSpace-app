'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { NotebookText, File, Info, BookUser, Settings, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/hooks/use-language';
import { useUser } from '@/hooks/use-user';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DashboardPage() {
    const { t } = useLanguage();
    const { user, updateUser } = useUser();
    const [newAffirmation, setNewAffirmation] = useState('');
  
  const navItems = [
    { id: 'my_scripts' as const, href: '/scripts', title: t('dashboard.my_scripts'), icon: NotebookText },
    { id: 'my_templates' as const, href: '/waiting-room', title: t('dashboard.my_templates'), icon: File },
    { id: 'infos' as const, href: '/info', title: t('dashboard.infos'), icon: Info },
    { id: 'my_journal' as const, href: '/journal', title: t('dashboard.my_journal'), icon: BookUser },
  ];

  const intervals = [1, 2, 5, 10, 12, 15, 20, 24];

  // Affirmation rotation logic
  useEffect(() => {
    if (!user.affirmations || user.affirmations.length === 0) return;

    const intervalMs = user.affirmationInterval * 60 * 60 * 1000;
    const now = Date.now();
    
    if (now - user.lastAffirmationChange >= intervalMs) {
        const nextIndex = (user.currentAffirmationIndex + 1) % user.affirmations.length;
        updateUser({
            currentAffirmationIndex: nextIndex,
            lastAffirmationChange: now
        });
    }
  }, [user.affirmations, user.affirmationInterval, user.lastAffirmationChange, user.currentAffirmationIndex, updateUser]);

  const handleAddAffirmation = () => {
    if (!newAffirmation.trim()) return;
    updateUser({
        affirmations: [...user.affirmations, newAffirmation.trim()]
    });
    setNewAffirmation('');
  };

  const handleRemoveAffirmation = (index: number) => {
    const newList = user.affirmations.filter((_, i) => i !== index);
    updateUser({
        affirmations: newList,
        currentAffirmationIndex: 0 // Reset index to avoid out of bounds
    });
  };

  const currentAffirmation = user.affirmations[user.currentAffirmationIndex] || t('dashboard.no_affirmations');

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback>{user.name?.charAt(0) || 'S'}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('dashboard.welcome')}, {user.name}!
          </h1>
        </div>
        <Button asChild variant="ghost" size="icon">
            <Link href="/settings">
                <Settings className="w-6 h-6" />
                <span className="sr-only">{t('dashboard.settings')}</span>
            </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {navItems.map((item) => {
          const CustomIcon = item.icon;
          return (
            <Link href={item.href} key={item.href} className="group">
              <Card className="h-40 sm:h-48 flex flex-col items-center justify-center text-center p-4 transition-all duration-300 ease-in-out hover:bg-card/90 hover:shadow-lg hover:border-primary/50 border-2">
                <CardHeader className="p-0">
                    <CustomIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-primary transition-transform group-hover:scale-110" />
                  <CardTitle className="text-base sm:text-lg font-semibold">{item.title}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      <Link href="/discussions" className="group block">
        <Card className="border-2 border-primary/10 hover:border-primary/30 transition-all cursor-pointer overflow-hidden group relative flex items-center justify-center bg-muted/30">
            <CardContent className="py-2 text-center">
                <p className="text-lg font-medium text-foreground">
                    {t('dashboard.my_discussions')}
                </p>
            </CardContent>
        </Card>
      </Link>

      <div className="space-y-2">
        <Dialog>
          <DialogTrigger asChild>
              <button className="w-full text-left">
                  <Card className="border-2 border-primary/10 hover:border-primary/30 transition-all cursor-pointer overflow-hidden group relative min-h-[100px] h-auto flex items-center justify-center p-6 bg-muted/30">
                      <CardContent className="p-0 text-center w-full">
                          <p className="text-lg font-medium italic text-muted-foreground leading-relaxed break-all whitespace-normal">
                              {currentAffirmation}
                          </p>
                      </CardContent>
                  </Card>
              </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md w-[95vw] overflow-hidden">
              <DialogHeader>
                  <DialogTitle>{t('dashboard.affirmations_settings')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                  <div className="space-y-2">
                      <label className="text-sm font-medium">{t('dashboard.interval_label')}</label>
                      <Select 
                          value={user.affirmationInterval.toString()} 
                          onValueChange={(val) => updateUser({ affirmationInterval: parseInt(val), lastAffirmationChange: Date.now() })}
                      >
                          <SelectTrigger className="w-full">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              {intervals.map(h => (
                                  <SelectItem key={h} value={h.toString()}>
                                      {t('dashboard.hours', { count: h.toString() })}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>

                  <div className="space-y-4">
                      <div className="flex gap-2 w-full">
                          <Input 
                              placeholder={t('dashboard.add_affirmation_placeholder')} 
                              value={newAffirmation}
                              onChange={(e) => setNewAffirmation(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddAffirmation()}
                              className="flex-1"
                              maxLength={75}
                          />
                          <Button size="icon" onClick={handleAddAffirmation} className="shrink-0">
                              <Plus className="w-4 h-4" />
                          </Button>
                      </div>
                      
                      <ScrollArea className="h-48 rounded-md border p-2 w-full">
                          <div className="space-y-2">
                              {user.affirmations.map((aff, i) => (
                                  <div key={i} className="flex items-start justify-between gap-2 p-2 bg-muted/50 rounded-lg group/item">
                                      <p className="text-sm flex-1 break-all py-1 min-w-0">{aff}</p>
                                      <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-destructive transition-opacity flex-shrink-0"
                                          onClick={() => handleRemoveAffirmation(i)}
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </Button>
                                  </div>
                              ))}
                              {user.affirmations.length === 0 && (
                                  <p className="text-center text-sm text-muted-foreground py-8">{t('dashboard.no_affirmations')}</p>
                              )}
                          </div>
                      </ScrollArea>
                  </div>
              </div>
          </DialogContent>
        </Dialog>
        <div className="text-center">
          <a 
            href="https://www.tumblr.com/apeironshiftingg?source=share" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:underline"
          >
            By Apeironshiftingg
          </a>
        </div>
      </div>
    </div>
  );
}
