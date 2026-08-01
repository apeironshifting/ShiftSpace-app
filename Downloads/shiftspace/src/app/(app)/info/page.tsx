
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PlusCircle, ImageIcon, Copy, Trash2, MoreVertical, Type, CheckSquare, ChevronRight, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Table, Minus, Info } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { isTranslationKey } from '@/lib/utils';
import { BlockEditor, type Block, type BlockType } from '@/components/block-editor';
import { useScripts } from '@/hooks/use-scripts';
import { fetchInfoSections, saveInfoSections } from '@/lib/supabase/info-sections';

type InfoSectionType = {
  id: string;
  title: string;
  blocks: Block[];
};

const InfoSection = ({ 
  section, 
  onBlockContentChange,
  onDuplicate,
  onDelete,
  onTitleChange,
}: { 
  section: InfoSectionType;
  onBlockContentChange: (sectionId: string, blocks: Block[]) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
}) => {
  const { t } = useLanguage();
  const displayTitle = isTranslationKey(section.title) ? t(section.title) : section.title;
  const { scripts } = useScripts();

  return (
  <AccordionItem value={section.id} className="group border rounded-lg p-2 bg-card">
    <div className="flex items-center w-full">
      <AccordionTrigger className="flex-1">
        <Textarea 
          value={displayTitle}
          onChange={(e) => onTitleChange(section.id, e.target.value.slice(0, 25))}
          onClick={(e) => e.stopPropagation()}
          className="text-lg font-semibold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden"
          rows={1}
        />
      </AccordionTrigger>
      
      <AlertDialog>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                    <MoreVertical className="w-5 h-5" />
                    <span className="sr-only">{t('info_page.section_options')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDuplicate(section.id)}>
                    <Copy className="w-4 h-4 mr-2" />
                    {t('common.duplicate')}
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
                    {t('info_page.delete_description', { title: displayTitle })}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(section.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t('common.delete')}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    </div>
    <AccordionContent className="space-y-2 pt-2">
       <BlockEditor 
        initialBlocks={section.blocks}
        onUpdate={(newBlocks) => onBlockContentChange(section.id, newBlocks)}
        context="info"
       />
    </AccordionContent>
  </AccordionItem>
  )
};

export default function InfoPage() {
  const { t } = useLanguage();
  const [sections, setSections] = useState<InfoSectionType[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const loadInfo = async () => {
      try {
        const savedSections = await fetchInfoSections();
        setSections(savedSections || []);
        setHasLoaded(true);
      } catch (error) {
        console.error("Failed to load info sections", error);
      }
    };
    loadInfo();
  }, []);

  useEffect(() => {
    if (isMounted && hasLoaded) {
      saveInfoSections(sections);
    }
  }, [sections, isMounted, hasLoaded]);

  const handleBlockContentChange = (sectionId: string, newBlocks: Block[]) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            blocks: newBlocks
          };
        }
        return section;
      })
    );
  };

  const handleTitleChange = (id: string, title: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, title } : s));
  };


  const handleAddSection = () => {
    const newSection: InfoSectionType = {
      id: `section-${Date.now()}`,
      title: 'defaults.new_section',
      blocks: [{ id: `block-${Date.now()}`, type: 'text', content: '' }]
    };
    setSections([...sections, newSection]);
  };

  const handleDuplicateSection = (id: string) => {
    const sectionToDuplicate = sections.find(s => s.id === id);
    if (sectionToDuplicate) {
      const originalTitle = isTranslationKey(sectionToDuplicate.title) ? t(sectionToDuplicate.title) : sectionToDuplicate.title;
      const newSection: InfoSectionType = {
        ...sectionToDuplicate,
        id: `section-${Date.now()}`,
        title: `${originalTitle} (${t('common.copy')})`.slice(0, 25),
        blocks: sectionToDuplicate.blocks.map(b => ({...b, id: `block-${Date.now()}-${Math.random()}`}))
      };
      const index = sections.findIndex(s => s.id === id);
      const newSections = [...sections];
      newSections.splice(index + 1, 0, newSection);
      setSections(newSections);
    }
  };
  
  const handleDeleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-2">{t('info_page.title')}</h1>
      <p className="text-muted-foreground mb-6">{t('info_page.description')}</p>
     
      <Accordion type="multiple" className="w-full space-y-4">
        {sections.map(section => (
          <InfoSection 
            key={section.id} 
            section={section} 
            onBlockContentChange={handleBlockContentChange}
            onDuplicate={handleDuplicateSection}
            onDelete={handleDeleteSection}
            onTitleChange={handleTitleChange}
          />
        ))}
      </Accordion>

      <Button variant="ghost" className="mt-4 w-full justify-start text-muted-foreground" onClick={handleAddSection}>
        <PlusCircle className="w-4 h-4 mr-2" />
        {t('info_page.add_new_section')}
      </Button>
    </div>
  );
}
