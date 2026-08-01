
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser, type PosterPerson, type PosterMetadata } from '@/hooks/use-user';
import { useLanguage } from '@/hooks/use-language';
import { GripVertical, Trash2, Plus, Camera, MoreVertical, Link as LinkIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn, isTranslationKey } from '@/lib/utils';
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
import { compressImage } from '@/lib/image-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BlockEditor } from '@/components/block-editor';

const SortableMetadataItem = ({ 
    item, 
    onUpdate, 
    onDelete 
}: { 
    item: PosterMetadata; 
    onUpdate: (updates: Partial<PosterMetadata>) => void;
    onDelete: () => void;
}) => {
    const { t } = useLanguage();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const displayLabel = isTranslationKey(item.label) ? t(item.label) : item.label;

    return (
        <div ref={setNodeRef} style={style} className="relative group/meta flex items-start gap-2 py-1 first:pt-0 min-h-0">
             <div className="pt-1 opacity-0 group-hover/meta:opacity-100 transition-opacity">
                 <button 
                    {...attributes} 
                    {...listeners} 
                    className="h-7 w-7 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-colors bg-muted/50 hover:bg-muted rounded-full"
                >
                    <GripVertical className="w-3.5 h-3.5" />
                </button>
             </div>
            <div className="grid grid-cols-2 items-start gap-4 flex-1 pr-8">
                <div className="min-w-0">
                    <Textarea 
                        value={displayLabel}
                        onChange={(e) => onUpdate({ label: e.target.value.slice(0, 25) })}
                        className="w-full bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto font-bold text-muted-foreground/60 placeholder:opacity-20 text-[10px] uppercase tracking-widest resize-none overflow-hidden min-h-0 pt-1"
                        placeholder={t('poster_page.metadata.new_section')}
                        rows={1}
                    />
                </div>
                <div className="min-w-0">
                    <Textarea 
                        value={item.value || ''}
                        onChange={(e) => onUpdate({ value: e.target.value })}
                        className="w-full bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto placeholder:opacity-20 min-h-0 resize-none font-medium text-base leading-snug break-all pt-1"
                        placeholder="..."
                        rows={1}
                    />
                </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 flex items-center opacity-0 group-hover/meta:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-full bg-muted/50 hover:bg-muted"
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={onDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('common.delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default function PersonPage({ params: rawParams }: { params: { id: string, personId: string } }) {
    const params = React.use(rawParams);
    const { user, updatePersonInPoster } = useUser();
    const { t } = useLanguage();
    const [person, setPerson] = useState<PosterPerson | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const poster = user.posters.find(p => p.id === params.id);
        const found = poster?.people.find(p => p.id === params.personId);
        if (found) setPerson(found);
    }, [params.id, params.personId, user.posters]);

    const handleUpdate = (updates: Partial<PosterPerson>) => {
        if (person && params.id) {
            updatePersonInPoster(params.id, person.id, updates);
        }
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressedDataUrl = await compressImage(reader.result as string);
                handleUpdate({ image: compressedDataUrl });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleMetadataUpdate = (itemId: string, updates: Partial<PosterMetadata>) => {
        if (person) {
            const newMetadata = person.metadata.map(m => m.id === itemId ? { ...m, ...updates } : m);
            handleUpdate({ metadata: newMetadata });
        }
    };

    const handleAddMetadata = () => {
        if (person) {
            const newItem = { id: `pm-${Date.now()}`, label: 'poster_page.metadata.new_section', value: '' };
            handleUpdate({ metadata: [...person.metadata, newItem] });
        }
    };

    const handleDeleteMetadata = (itemId: string) => {
        if (person) {
            handleUpdate({ metadata: person.metadata.filter(m => m.id !== itemId) });
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!person || !over || active.id === over.id) return;
        const oldIndex = person.metadata.findIndex((m) => m.id === active.id);
        const newIndex = person.metadata.findIndex((m) => m.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            handleUpdate({ metadata: arrayMove(person.metadata, oldIndex, newIndex) });
        }
    };

    if (!person) return null;

    const displayTitle = isTranslationKey(person.name) ? t(person.name) : (person.name || '');

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-4xl mx-auto p-6 sm:p-10 space-y-10">
                <div className="flex flex-row items-start gap-8 flex-nowrap">
                    <div className="w-7/12 space-y-4 pr-4">
                        <div className="min-w-0">
                            <Textarea 
                                value={displayTitle}
                                onChange={(e) => handleUpdate({ name: e.target.value.slice(0, 25) })}
                                placeholder={t('poster_page.new_person')}
                                className="text-4xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden text-left"
                                rows={1}
                            />
                        </div>
                    </div>

                    <div className="w-5/12 shrink-0">
                        <div className="relative aspect-square w-full shadow-xl rounded-xl overflow-hidden border-2 border-muted bg-muted group cursor-pointer" onClick={() => imageInputRef.current?.click()}>
                            <Image 
                                src={person.image} 
                                alt={person.name} 
                                fill 
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera className="text-white w-8 h-8" />
                            </div>
                        </div>
                        <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    </div>
                </div>

                <div className="space-y-1 pt-10 border-t border-primary/5">
                    <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <SortableContext 
                            items={person.metadata.map(m => m.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {(person.metadata || []).map((item) => (
                                <SortableMetadataItem 
                                    key={item.id} 
                                    item={item} 
                                    onUpdate={(updates) => handleMetadataUpdate(item.id, updates)}
                                    onDelete={() => handleDeleteMetadata(item.id)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAddMetadata}
                        className="text-muted-foreground hover:text-primary h-8 px-2 -ml-2 mt-2"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        {t('poster_page.add_detail')}
                    </Button>
                </div>

                <div className="pt-10 border-t border-primary/10 space-y-6">
                    <Textarea 
                        value={person.description}
                        onChange={(e) => handleUpdate({ description: e.target.value })}
                        placeholder={t('poster_page.write_something_person')}
                        className="w-full bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto min-h-[150px] resize-none leading-relaxed text-lg"
                    />
                    
                    <BlockEditor 
                        initialBlocks={person.content}
                        onUpdate={(blocks) => handleUpdate({ content: blocks })}
                        excludedTypes={['h1', 'h2', 'h3', 'places_grid', 'page']}
                    />
                </div>
            </div>
        </div>
    );
}
