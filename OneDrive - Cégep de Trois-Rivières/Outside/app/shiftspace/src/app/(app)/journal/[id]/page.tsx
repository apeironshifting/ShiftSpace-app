'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useScripts, type JournalEntry, Block } from '@/hooks/use-scripts';
import { Textarea } from '@/components/ui/textarea';
import { BlockEditor } from '@/components/block-editor';
import { format } from 'date-fns';
import { useLanguage } from '@/hooks/use-language';
import { Calendar } from 'lucide-react';
import React from 'react';
import { isTranslationKey } from '@/lib/utils';
import { enUS, fr, es, pt, de, it, ru } from 'date-fns/locale';
import type { Locale } from 'date-fns';

const locales: { [key: string]: Locale } = {
  en: enUS,
  fr,
  es,
  pt,
  de,
  it,
  ru,
};

export default function JournalEntryPage({ params: rawParams }: { params: { id: string } }) {
    const params = React.use(rawParams);
    const router = useRouter();
    const { journalEntries, updateJournalEntry } = useScripts();
    const [entry, setEntry] = useState<JournalEntry | null>(null);
    const { t, language } = useLanguage();

    useEffect(() => {
        const foundEntry = journalEntries.find(e => e.id === params.id);
        if (foundEntry) {
            setEntry(foundEntry);
        }
    }, [params.id, journalEntries]);

    const handleUpdate = useCallback((updates: Partial<JournalEntry>) => {
        if (entry) {
            updateJournalEntry(entry.id, updates);
        }
    }, [entry, updateJournalEntry]);

    const handleContentUpdate = useCallback((blocks: Block[]) => {
        handleUpdate({ content: blocks });
    }, [handleUpdate]);

    if (!entry) {
        return null;
    }

    const displayTitle = isTranslationKey(entry.title) ? t(entry.title) : entry.title;
    const locale = locales[language] || enUS;

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <p>{format(new Date(entry.date), 'PPPP', { locale })}</p>
                </div>
            </div>
            
            <Textarea
                value={displayTitle}
                onChange={(e) => handleUpdate({ title: e.target.value.slice(0, 25) })}
                placeholder={t('journal_page.entry_title_placeholder')}
                className="text-4xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto mb-8 w-full resize-none overflow-hidden"
                rows={1}
            />
            
            <BlockEditor
                initialBlocks={entry.content}
                onUpdate={handleContentUpdate}
                context="journal"
                excludedTypes={['link', 'page']}
            />
        </div>
    );
}
