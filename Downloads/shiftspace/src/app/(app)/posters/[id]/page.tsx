
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, type Poster, type PosterMetadata, type PosterPerson } from '@/hooks/use-user';
import { useLanguage } from '@/hooks/use-language';
import { Star, GripVertical, Trash2, Plus, Camera, MoreVertical, Edit2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
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
  rectSortingStrategy,
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
                        onChange={(e) => onUpdate({ label: e.target.value })}
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

const SortablePersonItem = ({ 
    person, 
    posterId,
    onUpdate, 
    onDelete 
}: { 
    person: PosterPerson; 
    posterId: string;
    onUpdate: (updates: Partial<PosterPerson>) => void;
    onDelete: () => void;
}) => {
    const { t } = useLanguage();
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
    };

    return (
        <div ref={setNodeRef} style={style} className={cn("flex flex-col gap-2 group relative", isDragging && "opacity-50")}>
            <div className="relative w-full px-2">
                <Link href={`/posters/${posterId}/people/${person.id}`}>
                    <div 
                        className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-muted bg-muted shadow-sm transition-transform hover:scale-105 duration-200 cursor-pointer"
                    >
                        <Image src={person.image} alt={person.name} fill className="object-cover" />
                    </div>
                </Link>
                
                <div className="absolute right-4 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    className="h-8 w-8 text-white/80 hover:text-white bg-black/40 backdrop-blur-sm rounded-full transition-colors border-0"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/posters/${posterId}/people/${person.id}`}>
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        {t('common.edit')}
                                    </Link>
                                </DropdownMenuItem>
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
                                <AlertDialogDescription>{t('place_page.delete_description_person')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <div className="absolute right-4 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button 
                        {...attributes} 
                        {...listeners} 
                        className="h-8 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-white/80 hover:text-white bg-black/40 backdrop-blur-sm rounded-full transition-colors"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <Textarea 
                value={isTranslationKey(person.name) ? t(person.name) : person.name}
                onChange={(e) => onUpdate({ name: e.target.value.slice(0, 25) })}
                className="text-[10px] font-bold text-center bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto placeholder:opacity-20 uppercase tracking-wider resize-none overflow-hidden"
                placeholder={t('poster_page.new_person')}
                rows={1}
            />
        </div>
    );
};

export default function PosterPage({ params: rawParams }: { params: { id: string } }) {
    const params = React.use(rawParams);
    const { user, updatePoster, addPersonToPoster, updatePersonInPoster, deletePersonFromPoster } = useUser();
    const { t } = useLanguage();
    const [poster, setPoster] = useState<Poster | null>(null);
    const personInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const found = user.posters.find(p => p.id === params.id);
        if (found) setPoster(found);
    }, [params.id, user.posters]);

    const handleRating = (r: number) => {
        if (poster) updatePoster(poster.id, { rating: r });
    };

    const handleMetadataUpdate = (itemId: string, updates: Partial<PosterMetadata>) => {
        if (poster) {
            const newMetadata = poster.metadata.map(m => m.id === itemId ? { ...m, ...updates } : m);
            updatePoster(poster.id, { metadata: newMetadata });
        }
    };

    const handleAddMetadata = () => {
        if (poster) {
            const newItem = { id: `m-${Date.now()}`, label: 'poster_page.metadata.new_section', value: '' };
            updatePoster(poster.id, { metadata: [...poster.metadata, newItem] });
        }
    };

    const handleDeleteMetadata = (itemId: string) => {
        if (poster) {
            updatePoster(poster.id, { metadata: poster.metadata.filter(m => m.id !== itemId) });
        }
    };

    const handlePersonAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && poster) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressImage(reader.result as string);
                addPersonToPoster(poster.id, compressed);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEndMetadata = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!poster || !over || active.id === over.id) return;
        const oldIndex = poster.metadata.findIndex((m) => m.id === active.id);
        const newIndex = poster.metadata.findIndex((m) => m.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            updatePoster(poster.id, { metadata: arrayMove(poster.metadata, oldIndex, newIndex) });
        }
    };

    const handleDragEndPeople = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!poster || !over || active.id === over.id) return;
        const oldIndex = poster.people.findIndex((p) => p.id === active.id);
        const newIndex = poster.people.findIndex((p) => p.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            updatePoster(poster.id, { people: arrayMove(poster.people, oldIndex, newIndex) });
        }
    };

    if (!poster) return null;

    const displayTitle = isTranslationKey(poster.title) ? t(poster.title) : (poster.title || '');

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-4xl mx-auto p-6 sm:p-10 space-y-10">
                <div className="flex flex-row items-start gap-8 flex-nowrap">
                    <div className="w-1/2 pr-4 space-y-4">
                        <div className="min-w-0">
                            <Textarea 
                                value={displayTitle}
                                onChange={(e) => updatePoster(poster.id, { title: e.target.value.slice(0, 25) })}
                                placeholder={t('poster_page.untitled')}
                                className="text-4xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden text-left"
                                rows={1}
                            />
                        </div>
                        
                        <div className="flex justify-start gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRating(star)}
                                    className="focus:outline-none transition-transform active:scale-90"
                                >
                                    <Star 
                                        className={cn(
                                            "w-6 h-6 transition-colors",
                                            star <= poster.rating ? "fill-primary text-primary" : "text-muted-foreground/20"
                                        )} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-1/2">
                        <div className="relative aspect-[2/3] w-full shadow-xl rounded-lg overflow-hidden border-2 border-muted bg-muted group">
                            <Image 
                                src={poster.image} 
                                alt="Poster" 
                                fill 
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="space-y-1 pt-10 border-t border-primary/5">
                    <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEndMetadata}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <SortableContext 
                            items={poster.metadata.map(m => m.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {(poster.metadata || []).map((item) => (
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
                        className="text-muted-foreground hover:text-primary h-8 px-2 -ml-2"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        {t('poster_page.add_detail')}
                    </Button>
                </div>

                <div className="pt-10 border-t border-primary/10 space-y-6">
                    <Textarea 
                        value={poster.description}
                        onChange={(e) => updatePoster(poster.id, { description: e.target.value })}
                        placeholder={t('poster_page.write_something')}
                        className="w-full bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto min-h-[150px] resize-none leading-relaxed text-lg"
                    />
                    
                    <BlockEditor 
                        initialBlocks={poster.content}
                        onUpdate={(blocks) => updatePoster(poster.id, { content: blocks })}
                        hideAddButton={true}
                    />
                </div>

                <div className="pt-10 border-t border-primary/10">
                    <h2 className="text-2xl font-bold mb-6 text-foreground/80">{t('poster_page.people')}</h2>
                    
                    <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEndPeople}
                    >
                        <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                            <SortableContext 
                                items={poster.people.map(p => p.id)}
                                strategy={rectSortingStrategy}
                            >
                                {(poster.people || []).map((person) => (
                                    <SortablePersonItem 
                                        key={person.id}
                                        person={person}
                                        posterId={poster.id}
                                        onUpdate={(updates) => updatePersonInPoster(poster.id, person.id, updates)}
                                        onDelete={() => deletePersonFromPoster(poster.id, person.id)}
                                    />
                                ))}
                            </SortableContext>
                            
                            <div className="px-2">
                                <div 
                                    className="aspect-square w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground/40 cursor-pointer hover:border-primary hover:text-primary hover:bg-primary/5 transition-all p-4 text-center group"
                                    onClick={() => personInputRef.current?.click()}
                                >
                                    <div className="p-2 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors mb-2">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('poster_page.new_person')}</span>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={personInputRef} 
                                onChange={handlePersonAdd} 
                                className="hidden" 
                                accept="image/*" 
                            />
                        </div>
                    </DndContext>
                </div>
            </div>
        </div>
    );
}
