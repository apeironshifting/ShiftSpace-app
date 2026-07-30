
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ImageIcon,
  PlusCircle,
  Copy,
  Trash2,
  MoreVertical,
  ChevronDown,
  GripVertical,
  Palette,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useScripts, type Script, type Person, type Possession, type OptionalSection, type Place, Pet, AboutMeDetails } from '@/hooks/use-scripts.tsx';
import { useLanguage } from '@/hooks/use-language';
import { isTranslationKey, cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Block, BlockEditor } from '@/components/block-editor';
import { Textarea } from '@/components/ui/textarea';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTheme, type ThemeId, availableThemes } from '@/hooks/use-theme';
import { compressImage } from '@/lib/image-utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

const DetailListItem = ({ label, value, onChange }: { label: string; value?: string, onChange: (value: string) => void }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();
  const displayLabel = isTranslationKey(label) ? t(label) : label;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);
  
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="font-semibold text-muted-foreground pt-1 w-1/3">{displayLabel}</span>
      <Textarea 
        ref={textareaRef}
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        className="flex-1 min-w-0 bg-transparent border-0 shadow-none h-auto p-0 focus-visible:ring-0 resize-none overflow-hidden min-h-[24px] pt-1"
        rows={1}
      />
    </div>
  );
};

const SortablePetItem = ({ pet, onDuplicate, onDelete, onUpdate }: { pet: Pet; onDuplicate: () => void; onDelete: () => void; onUpdate: (updates: Partial<Pet>) => void; }) => {
  const { t } = useLanguage();
  const displayTitle = isTranslationKey(pet.name) ? t(pet.name) : (pet.name || '');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: pet.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
  <AccordionItem value={pet.id} ref={setNodeRef} style={style}>
    <div className="flex items-center group/pet w-full">
      <AccordionTrigger className="flex-1">
        <Textarea 
            value={displayTitle}
            onChange={(e) => onUpdate({ name: e.target.value.slice(0, 25) })}
            onClick={(e) => e.stopPropagation()}
            className="text-base font-medium bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden"
            rows={1}
        />
      </AccordionTrigger>
      
      <div className="flex items-center gap-1 opacity-0 group-hover/pet:opacity-100 transition-opacity pr-2">
        <button {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors">
            <GripVertical className="w-4 h-4" />
        </button>
        <AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onDuplicate}>
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

            <AccordionContent>
                <div className="pl-2">
                    <DetailListItem 
                    label="script_page.details.pet_sex"
                    value={pet.sex}
                    onChange={(newValue) => onUpdate({sex: newValue})}
                    />
                    <DetailListItem 
                    label="script_page.details.pet_species"
                    value={pet.species}
                    onChange={(newValue) => onUpdate({species: newValue})}
                    />
                    <DetailListItem 
                    label="script_page.details.pet_age"
                    value={pet.age}
                    onChange={(newValue) => onUpdate({age: newValue})}
                    />
                    <DetailListItem 
                    label="script_page.details.pet_size"
                    value={pet.size}
                    onChange={(newValue) => onUpdate({size: newValue})}
                    />
                    <DetailListItem 
                    label="script_page.details.pet_personality"
                    value={pet.personality}
                    onChange={(newValue) => onUpdate({personality: newValue})}
                    />
                    <DetailListItem 
                    label="script_page.details.pet_extras"
                    value={pet.extras}
                    onChange={(newValue) => onUpdate({extras: newValue})}
                    />
                </div>
            </AccordionContent>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('place_page.delete_description_person')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('common.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
    <AccordionContent>
        <div className="pl-2">
            <DetailListItem 
              label="script_page.details.pet_sex"
              value={pet.sex}
              onChange={(newValue) => onUpdate({sex: newValue})}
            />
            <DetailListItem 
              label="script_page.details.pet_species"
              value={pet.species}
              onChange={(newValue) => onUpdate({species: newValue})}
            />
             <DetailListItem 
              label="script_page.details.pet_age"
              value={pet.age}
              onChange={(newValue) => onUpdate({age: newValue})}
            />
            <DetailListItem 
              label="script_page.details.pet_size"
              value={pet.size}
              onChange={(newValue) => onUpdate({size: newValue})}
            />
            <DetailListItem 
              label="script_page.details.pet_personality"
              value={pet.personality}
              onChange={(newValue) => onUpdate({personality: newValue})}
            />
             <DetailListItem 
              label="script_page.details.pet_extras"
              value={pet.extras}
              onChange={(newValue) => onUpdate({extras: newValue})}
            />
        </div>
    </AccordionContent>
  </AccordionItem>
  );
};


function SpotifyEmbed({ url, onDelete }: { url: string; onDelete: () => void; }) {
  const [embedUrl, setEmbedUrl] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (url.includes('spotify.com/playlist/')) {
      try {
        const playlistId = new URL(url).pathname.split('/').pop();
        if (playlistId) {
          setEmbedUrl(`https://open.spotify.com/embed/playlist/${playlistId}`);
        }
      } catch (e) {
        setEmbedUrl('');
      }
    } else {
      setEmbedUrl('');
    }
  }, [url]);

  if (!embedUrl) return null;

  return (
    <div className="my-4 relative group">
      <iframe
        style={{ borderRadius: '12px' }}
        src={embedUrl}
        width="100%"
        height="152"
        frameBorder="0"
        allowFullScreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the Spotify playlist from your script.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                {t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

const SortablePersonItem = ({ person, onDuplicate, onDelete, onUpdate }: { person: Person; onDuplicate: () => void; onDelete: () => void; onUpdate: (updates: Partial<Person>) => void; }) => {
  const { t } = useLanguage();
  const displayTitle = isTranslationKey(person.name) ? t(person.name) : (person.name || '');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: person.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
  <AccordionItem value={person.id} ref={setNodeRef} style={style}>
    <div className="flex items-center group/person w-full">
      <AccordionTrigger className="flex-1">
        <Textarea 
            value={displayTitle}
            onChange={(e) => onUpdate({ name: e.target.value.slice(0, 25) })}
            onClick={(e) => e.stopPropagation()}
            className="text-base font-medium bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden"
            rows={1}
        />
      </AccordionTrigger>
      
      <div className="flex items-center gap-1 opacity-0 group-hover/person:opacity-100 transition-opacity pr-2">
        <button {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors">
            <GripVertical className="w-4 h-4" />
        </button>
        <AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onDuplicate}>
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
                        {t('place_page.delete_description_person')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('common.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
    <AccordionContent>
        <div className="pl-2">
           <DetailListItem 
              label="script_page.details.pronouns"
              value={person.pronouns}
              onChange={(newValue) => onUpdate({pronouns: newValue})}
            />
             <DetailListItem 
              label="script_page.details.nickname"
              value={person.nickname}
              onChange={(newValue) => onUpdate({nickname: newValue})}
            />
            <DetailListItem 
              label="script_page.details.my_relation_with_them"
              value={person.relationship}
              onChange={(newValue) => onUpdate({relationship: newValue})}
            />
            <div className="mt-4">
              <BlockEditor 
                  scriptId={""}
                  initialBlocks={person.content || []}
                  onUpdate={(newBlocks) => onUpdate({ content: newBlocks })}
              />
            </div>
        </div>
    </AccordionContent>
  </AccordionItem>
  );
};

const ImageBlock = ({ imageUrl, onImageChange }: { imageUrl: string | null; onImageChange: (dataUrl: string) => void }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressImage(reader.result as string);
                onImageChange(compressed);
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <div className="relative w-full min-h-24 my-4 py-2">
            {imageUrl ? (
                <div className="relative w-full h-64 group">
                    <Image src={imageUrl} alt={t('block_editor.image_alt')} layout="fill" objectFit="cover" className="rounded-md" />
                     <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onImageChange('')}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <>
                    <div
                        className="flex items-center justify-center flex-col gap-2 p-6 border-2 border-dashed rounded-lg text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-sm font-medium">{t('script_page.add_picture')}</span>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                </>
            )}
        </div>
    );
};

const SortablePossessionItem = ({ possession, onUpdate, onDuplicate, onDelete }: { possession: Possession; onUpdate: (updates: Partial<Possession>) => void; onDuplicate: () => void; onDelete: () => void }) => {
    const { t } = useLanguage();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: possession.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <AccordionItem value={possession.id} ref={setNodeRef} style={style}>
            <div className="flex items-center group/possession w-full">
                <AccordionTrigger className="flex-1">
                    <Textarea 
                        value={isTranslationKey(possession.name) ? t(possession.name) : (possession.name || '')}
                        onChange={(e) => onUpdate({ name: e.target.value.slice(0, 25) })}
                        onClick={(e) => e.stopPropagation()}
                        className="text-base font-medium bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden"
                        rows={1}
                    />
                </AccordionTrigger>
                <div className="flex items-center gap-1 opacity-0 group-hover/possession:opacity-100 transition-opacity pr-2">
                    <button {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors">
                        <GripVertical className="w-4 h-4" />
                    </button>
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onDuplicate}>
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
                            <AlertDialogHeader><AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle><AlertDialogDescription>{t('place_page.delete_description_person')}</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <AccordionContent>
                <BlockEditor 
                    initialBlocks={possession.description || []} 
                    onUpdate={(newBlocks) => onUpdate({ description: newBlocks })} 
                />
            </AccordionContent>
        </AccordionItem>
    );
};

const SortableDefinitionItem = ({ def, onUpdate, onDuplicate, onDelete }: { def: OptionalSection; onUpdate: (updates: Partial<OptionalSection>) => void; onDuplicate: () => void; onDelete: () => void }) => {
    const { t } = useLanguage();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: def.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <AccordionItem value={def.id} ref={setNodeRef} style={style}>
            <div className="flex items-center group/def w-full">
                <AccordionTrigger className="flex-1">
                    <Textarea 
                        value={isTranslationKey(def.title) ? t(def.title) : (def.title || '')}
                        onChange={(e) => onUpdate({ title: e.target.value.slice(0, 25) })}
                        onClick={(e) => e.stopPropagation()}
                        className="text-lg font-semibold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden"
                        rows={1}
                    />
                </AccordionTrigger>
                <div className="flex items-center gap-1 opacity-0 group-hover/def:opacity-100 transition-opacity pr-2">
                    <button {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors">
                        <GripVertical className="w-4 h-4" />
                    </button>
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onDuplicate}><Copy className="mr-2 h-4 w-4" />{t('common.duplicate')}</DropdownMenuItem>
                                <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />{t('common.delete')}</DropdownMenuItem></AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle><AlertDialogDescription>{t('script_page.delete_section_description')}</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><AlertDialogAction onClick={onDelete}>{t('common.delete')}</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <AccordionContent>
                <BlockEditor initialBlocks={def.blocks || []} onUpdate={(newBlocks) => onUpdate({ blocks: newBlocks })} />
            </AccordionContent>
        </AccordionItem>
    );
};

function FullScriptContent({ script: currentScript }: { script: Script }) {
  const { updateScript, updateDetail, updateDetailBlocks, updateRelationship, addRelationship, duplicateRelationship, deleteRelationship, reorderRelationship, updateSO, updateSOBlocks, updateMyLifeBlocks, updatePossession, addPossession, duplicatePossession, deletePossession, reorderPossession, addPlaceToScript, updatePlace, deletePlace, updateDefinition, addDefinition, duplicateDefinition, deleteDefinition, reorderDefinition, updateOptionalSection, addOptionalSection, deleteOptionalSection, updatePet, addPet, duplicatePet, deletePet, reorderPet } = useScripts();
  const [script, setScript] = useState(currentScript);
  const { t } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    setScript(currentScript);
  }, [currentScript]);


  const handleUpdate = (updates: Partial<Script>) => {
    if (script) {
      updateScript(script.id, updates);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, type: 'friends' | 'family' | 'possessions' | 'pets' | 'definitions') => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (type === 'friends' || type === 'family') {
        reorderRelationship(script.id, type, active.id as string, over.id as string);
    } else if (type === 'possessions') {
        reorderPossession(script.id, active.id as string, over.id as string);
    } else if (type === 'pets') {
        reorderPet(script.id, active.id as string, over.id as string);
    } else if (type === 'definitions') {
        reorderDefinition(script.id, active.id as string, over.id as string);
    }
  };

  if (!script) {
    return null;
  }
  
  const handleDetailUpdate = (field: keyof AboutMeDetails, value: string) => {
    if (script) {
        updateDetail(script.id, field, field === 'name' ? value.slice(0, 25) : value);
    }
  };

  const handleSOUpdate = (field: keyof Script['relationships']['so'], value: string) => {
    if (script) {
        updateSO(script.id, { [field]: (field === 'name' ? value.slice(0, 25) : value) });
    }
  };

  const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        handleUpdate({ coverImage: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  const coverImageInputRef = useRef<HTMLInputElement>(null);
  
  const displayTitle = isTranslationKey(script.title) ? t(script.title) : (script.title || '');

  const availableSectionsToAdd: ('powers' | 'scenarios')[] = ['powers', 'scenarios'].filter(
    sectionId => !script.optionalSections.find(s => s.id === sectionId)
  );
  
  return (
    <div className="pb-24">
       <div className="relative h-48 w-full group">
        {script.coverImage ? (
          <>
            <Image
              src={script.coverImage}
              alt={t('script_page.cover_image_alt')}
              fill
              className="object-cover"
            />
             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="outline" onClick={() => coverImageInputRef.current?.click()}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {t('script_page.change_cover')}
                </Button>
            </div>
          </>
        ) : (
          <div className="bg-muted h-full flex items-center justify-center border-b">
            <Button variant="secondary" onClick={() => coverImageInputRef.current?.click()}>
                <ImageIcon className="w-4 h-4 mr-2" />
                {t('script_page.add_cover')}
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
      </div>

      <div className="px-4 sm:px-6 pt-8">
        <Textarea
          value={displayTitle}
          onChange={(e) => handleUpdate({ title: e.target.value.slice(0, 25) })}
          className="text-3xl sm:text-4xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden"
          rows={1}
        />
        <div className="mt-4">
          <Input
            id="playlist"
            placeholder={t('script_page.playlist_placeholder')}
            value={script.playlistUrl}
            onChange={(e) => handleUpdate({ playlistUrl: e.target.value })}
            className="bg-transparent"
          />
          {script.playlistUrl && <SpotifyEmbed url={script.playlistUrl} onDelete={() => handleUpdate({ playlistUrl: '' })} />}
        </div>
      </div>
      
      <main className="px-4 sm:px-6 mt-8 space-y-4">
        
        {/* ME SECTION */}
        <h2 className="text-2xl font-bold">{t('script_page.me')}</h2>
        <Accordion type="multiple" className="w-full space-y-4">
            <AccordionItem value="about-me">
                <AccordionTrigger className="text-lg font-semibold">{t('script_page.about_me')}</AccordionTrigger>
                <AccordionContent>
                    <div className="pl-2">
                        {Object.entries(script.details.about).map(([key, value]) => (
                            <DetailListItem 
                                key={key}
                                label={`script_page.details.${key}`}
                                value={value}
                                onChange={(newValue) => handleDetailUpdate(key as keyof AboutMeDetails, newValue)}
                            />
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="my-backstory">
                <AccordionTrigger className="text-lg font-semibold">{t('script_page.my_backstory')}</AccordionTrigger>
                <AccordionContent>
                    <BlockEditor scriptId={script.id} initialBlocks={script.details.backstory || []} onUpdate={(newBlocks) => updateDetailBlocks(script.id, 'backstory', newBlocks)} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="my-physical-appearance">
                <AccordionTrigger className="text-lg font-semibold">{t('script_page.my_physical_appearance')}</AccordionTrigger>
                <AccordionContent>
                    <BlockEditor scriptId={script.id} initialBlocks={script.details.physical_appearance || []} onUpdate={(newBlocks) => updateDetailBlocks(script.id, 'physical_appearance', newBlocks)} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        <ImageBlock imageUrl={script.imageAfterMe || null} onImageChange={(url) => handleUpdate({ imageAfterMe: url })} />
        
        <Accordion type="multiple" className="w-full space-y-4">
            {script.optionalSections.map(section => (
                <AccordionItem key={section.id} value={section.id}>
                    <div className="flex items-center group w-full">
                        <AccordionTrigger className="flex-1">
                            <span className="text-lg font-semibold">{isTranslationKey(section.title) ? t(section.title) : section.title}</span>
                        </AccordionTrigger>
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"><MoreVertical /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />{t('common.delete')}</DropdownMenuItem></AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle><AlertDialogDescription>{t('script_page.delete_section_description')}</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => deleteOptionalSection(script.id, section.id)}>{t('common.delete')}</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <AccordionContent>
                        <BlockEditor scriptId={script.id} initialBlocks={section.blocks || []} onUpdate={(newBlocks) => updateOptionalSection(script.id, section.id, { blocks: newBlocks })} />
                    </AccordionContent>
                </AccordionItem>
            ))}
             <AccordionItem value="extra">
                <AccordionTrigger className="text-lg font-semibold">{t('script_page.extra')}</AccordionTrigger>
                <AccordionContent>
                    <BlockEditor scriptId={script.id} initialBlocks={script.extraContent || []} onUpdate={(newBlocks) => updateScript(script.id, { extraContent: newBlocks })} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        {availableSectionsToAdd.length > 0 && (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-muted-foreground">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('script_page.add_section')}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {availableSectionsToAdd.map(sectionId => (
                        <DropdownMenuItem key={sectionId} onClick={() => addOptionalSection(script.id, sectionId)}>
                           {t(`script_page.${sectionId}`)}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        )}

        <ImageBlock imageUrl={script.imageAfterRelationships || null} onImageChange={(url) => handleUpdate({ imageAfterRelationships: url })} />

        {/* RELATIONSHIPS SECTION */}
        <h2 className="text-2xl font-bold pt-4">{t('script_page.relationships')}</h2>
        <Accordion type="multiple" className="w-full space-y-4">
            <AccordionItem value="friends">
                <AccordionTrigger className="text-lg font-semibold">{t('script_page.friends')}</AccordionTrigger>
                <AccordionContent>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'friends')} modifiers={[restrictToVerticalAxis]}>
                        <SortableContext items={script.relationships.friends.map(p => p.id)} strategy={verticalListSortingStrategy}>
                            <Accordion type="multiple" className="w-full">
                                {script.relationships.friends.map(person => (
                                    <SortablePersonItem 
                                        key={person.id} 
                                        person={person}
                                        onUpdate={(updates) => updateRelationship(script.id, 'friends', person.id, updates)}
                                        onDuplicate={() => duplicateRelationship(script.id, 'friends', person.id)}
                                        onDelete={() => deleteRelationship(script.id, 'friends', person.id)}
                                    />
                                ))}
                            </Accordion>
                        </SortableContext>
                    </DndContext>
                    <Button variant="ghost" className="mt-2" onClick={() => addRelationship(script.id, 'friends')}><PlusCircle className="mr-2 h-4 w-4" />{t('script_page.add_person')}</Button>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="family">
                <AccordionTrigger className="text-lg font-semibold">{t('script_page.close_family')}</AccordionTrigger>
                <AccordionContent>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'family')} modifiers={[restrictToVerticalAxis]}>
                        <SortableContext items={script.relationships.family.map(p => p.id)} strategy={verticalListSortingStrategy}>
                            <Accordion type="multiple" className="w-full">
                                {script.relationships.family.map(person => (
                                    <SortablePersonItem 
                                        key={person.id} 
                                        person={person}
                                        onUpdate={(updates) => updateRelationship(script.id, 'family', person.id, updates)}
                                        onDuplicate={() => duplicateRelationship(script.id, 'family', person.id)}
                                        onDelete={() => deleteRelationship(script.id, 'family', person.id)}
                                    />
                                ))}
                            </Accordion>
                        </SortableContext>
                    </DndContext>
                    <Button variant="ghost" className="mt-2" onClick={() => addRelationship(script.id, 'family')}><PlusCircle className="mr-2 h-4 w-4" />{t('script_page.add_person')}</Button>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="so">
              <AccordionTrigger className="text-lg font-semibold">{t('script_page.so')}</AccordionTrigger>
              <AccordionContent>
                 <div className="pl-2">
                  {Object.entries(script.relationships.so)
                    .filter(([key]) => !['content', 'backstory', 'our_story', 'personality', 'physical_appearance', 'extra_content', 'id'].includes(key))
                    .map(([key, value]) => (
                      <DetailListItem
                        key={key}
                        label={`script_page.details.so_${key}`}
                        value={value as string}
                        onChange={(newValue) => handleSOUpdate(key as keyof Script['relationships']['so'], newValue)}
                      />
                  ))}
                </div>
                 <Accordion type="multiple" className="w-full mt-4 space-y-4">
                    <AccordionItem value="so-backstory"><AccordionTrigger>{t('script_page.backstory')}</AccordionTrigger><AccordionContent><BlockEditor scriptId={script.id} initialBlocks={script.relationships.so.backstory || []} onUpdate={(newBlocks) => updateSOBlocks(script.id, 'backstory', newBlocks)} /></AccordionContent></AccordionItem>
                    <AccordionItem value="so-personality"><AccordionTrigger>{t('script_page.personality')}</AccordionTrigger><AccordionContent><BlockEditor scriptId={script.id} initialBlocks={script.relationships.so.personality || []} onUpdate={(newBlocks) => updateSOBlocks(script.id, 'personality', newBlocks)} /></AccordionContent></AccordionItem>
                    <AccordionItem value="so-our-story"><AccordionTrigger>{t('script_page.our_story')}</AccordionTrigger><AccordionContent><BlockEditor scriptId={script.id} initialBlocks={script.relationships.so.our_story || []} onUpdate={(newBlocks) => updateSOBlocks(script.id, 'our_story', newBlocks)} /></AccordionContent></AccordionItem>
                    <AccordionItem value="so-physical-appearance"><AccordionTrigger>{t('script_page.physical_appearance')}</AccordionTrigger><AccordionContent><BlockEditor scriptId={script.id} initialBlocks={script.relationships.so.physical_appearance || []} onUpdate={(newBlocks) => updateSOBlocks(script.id, 'physical_appearance', newBlocks)} /></AccordionContent></AccordionItem>
                    <AccordionItem value="so-extra"><AccordionTrigger>{t('script_page.extra')}</AccordionTrigger><AccordionContent><BlockEditor scriptId={script.id} initialBlocks={script.relationships.so.extra_content || []} onUpdate={(newBlocks) => updateSOBlocks(script.id, 'extra_content', newBlocks)} /></AccordionContent></AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>
        </Accordion>

        <ImageBlock imageUrl={script.imageAfterMyLife || null} onImageChange={(url) => handleUpdate({ imageAfterMyLife: url })} />

        {/* OTHERS SECTION */}
        <h2 className="text-2xl font-bold pt-4">{t('script_page.others')}</h2>
        <Accordion type="multiple" className="w-full space-y-4">
            <AccordionItem value="possessions">
                <AccordionTrigger className="text-lg font-semibold">{t('script_page.principal_possessions')}</AccordionTrigger>
                <AccordionContent>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'possessions')} modifiers={[restrictToVerticalAxis]}>
                        <SortableContext items={script.my_life.possessions.map(p => p.id)} strategy={verticalListSortingStrategy}>
                            <Accordion type="multiple" className="w-full">
                                {script.my_life.possessions.map(possession => (
                                    <SortablePossessionItem 
                                        key={possession.id} 
                                        possession={possession}
                                        onUpdate={(updates) => updatePossession(script.id, possession.id, updates)}
                                        onDuplicate={() => duplicatePossession(script.id, possession.id)}
                                        onDelete={() => deletePossession(script.id, possession.id)}
                                    />
                                ))}
                            </Accordion>
                        </SortableContext>
                    </DndContext>
                    <Button variant="ghost" className="mt-2" onClick={() => addPossession(script.id)}><PlusCircle className="mr-2 h-4 w-4" />{t('script_page.add_object')}</Button>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pets">
                <AccordionTrigger className="text-lg font-semibold">{t('script_page.pets')}</AccordionTrigger>
                <AccordionContent>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'pets')} modifiers={[restrictToVerticalAxis]}>
                        <SortableContext items={(script.my_life.pets || []).map(p => p.id)} strategy={verticalListSortingStrategy}>
                            <Accordion type="multiple" className="w-full">
                                {(script.my_life.pets || []).map(pet => (
                                <SortablePetItem
                                        key={pet.id}
                                        pet={pet}
                                        onUpdate={(updates) => updatePet(script.id, pet.id, updates)}
                                        onDuplicate={() => duplicatePet(script.id, pet.id)}
                                        onDelete={() => deletePet(script.id, pet.id)}
                                />
                                ))}
                            </Accordion>
                        </SortableContext>
                    </DndContext>
                    <Button variant="ghost" className="mt-2" onClick={() => addPet(script.id)}><PlusCircle className="mr-2 h-4 w-4" />{t('script_page.add_pet')}</Button>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="my-aesthetic">
                <AccordionTrigger className="text-lg font-semibold">{t('script_page.my_aesthetic')}</AccordionTrigger>
                <AccordionContent>
                    <BlockEditor scriptId={script.id} initialBlocks={script.my_life.aesthetic || []} onUpdate={(newBlocks) => updateMyLifeBlocks(script.id, 'aesthetic', newBlocks)} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <ImageBlock imageUrl={script.imageAfterLive || null} onImageChange={(url) => handleUpdate({ imageAfterLive: url })} />

        {/* PLACES SECTION */}
        <BlockEditor scriptId={script.id} initialBlocks={script.liveDescription || []} onUpdate={(newBlocks) => updateScript(script.id, { liveDescription: newBlocks })} />

        <ImageBlock imageUrl={script.imageAfterDefinitions || null} onImageChange={(url) => handleUpdate({ imageAfterDefinitions: url })} />
        
        {/* DEFINITIONS SECTION */}
        <h2 className="text-2xl font-bold pt-4">{t('script_page.definitions')}</h2>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'definitions')} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={script.definitions.map(d => d.id)} strategy={verticalListSortingStrategy}>
                <Accordion type="multiple" className="w-full space-y-4">
                    {script.definitions.map(def => (
                        <SortableDefinitionItem 
                            key={def.id} 
                            def={def}
                            onUpdate={(updates) => updateDefinition(script.id, def.id, updates)}
                            onDuplicate={() => duplicateDefinition(script.id, def.id)}
                            onDelete={() => deleteDefinition(script.id, def.id)}
                        />
                    ))}
                </Accordion>
            </SortableContext>
        </DndContext>
        <Button variant="ghost" className="mt-4" onClick={() => addDefinition(script.id)}><PlusCircle className="mr-2 h-4 w-4" />{t('script_page.add_definition')}</Button>

        <ImageBlock imageUrl={script.imageAfterEnd || null} onImageChange={(url) => handleUpdate({ imageAfterEnd: url })} />

      </main>
    </div>
  );
}

export default function ScriptPageWrapper({ params: rawParams }: { params: { id: string } }) {
  const params = React.use(rawParams);
  const router = useRouter();
  const id = params.id;
  const { scripts } = useScripts();
  const [script, setScript] = useState<Script | null>(null);

  useEffect(() => {
    const foundScript = scripts.find(s => s.id === id);
    if (foundScript) {
      if (foundScript.isEmpty) {
        router.replace(`/scripts/${id}/empty`);
        return;
      }
      setScript(foundScript);
    }
  }, [id, scripts, router]);

  if (!script) {
    return null; // or a loading skeleton
  }

  return <FullScriptContent script={script} />;
}
