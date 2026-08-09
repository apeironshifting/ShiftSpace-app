
'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, Trash2, ChevronRight, File, Music, Link as LinkIcon, Camera, ZoomIn, ZoomOut, Plus, Book, MoreVertical, Package, Users, GripVertical, Copy, PlusCircle, Eye, Minus, ExternalLink, Edit2, Check, RectangleHorizontal, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/hooks/use-language';
import { ScrollArea } from './ui/scroll-area';
import { type Block, type BlockType, SCRIPT_BLOCK_TYPES, useScripts, Place, RelationshipChartCharacter, RelationshipChartLink, Page } from '@/hooks/use-scripts';
import { isTranslationKey, cn } from '@/lib/utils';
import Link from 'next/link';
import * as AccordionPrimitive from "@radix-ui/react-accordion";

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
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Card, CardContent, CardHeader } from './ui/card';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from './ui/dialog';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useUser } from '@/hooks/use-user';
import { compressImage } from '@/lib/image-utils';

const SortablePlaceCard = ({ 
  place,
  scriptId,
  onDelete, 
  onDuplicate,
}: { 
  place: Place, 
  scriptId?: string;
  onDelete: () => void, 
  onDuplicate: () => void,
}) => {
    const { t } = useLanguage();
    const displayTitle = isTranslationKey(place.name) ? t(place.name) : place.name;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: place.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };
    
    const placeUrl = scriptId ? `/scripts/${scriptId}/places/${place.id}` : `/places/${place.id}`;

    return (
        <div ref={setNodeRef} style={style} className={cn("relative group h-full", isDragging && "opacity-50")}>
            <Card className="overflow-hidden transition-transform transform-gpu hover:-translate-y-1 hover:shadow-xl h-full flex flex-col relative">
                <Link href={placeUrl} className="flex flex-col flex-1">
                    <div className="relative h-24 bg-muted">
                      {place.coverImage ? <Image src={place.coverImage} alt={displayTitle} fill className="object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground"><Package className="w-8 h-8" /></div> }
                    </div>
                    <CardContent className="p-3 flex-1">
                      <h4 className="font-semibold break-words">{displayTitle}</h4>
                    </CardContent>
                </Link>

                <div className="absolute top-2 right-2 z-20">
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/50">
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
                                    {t('block_editor.remove_from_grid_description')}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    {t('common.delete')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                
                <div className="absolute bottom-2 right-2 z-20">
                    <button 
                        {...attributes} 
                        {...listeners} 
                        className="h-8 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-primary transition-colors bg-background/80 backdrop-blur-sm rounded-full shadow-sm border border-border/50"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                </div>
            </Card>
        </div>
    );
};


const SpotifyEmbed = ({ url, onUrlChange, isEditing, setIsEditing }: { url: string; onUrlChange: (newUrl: string) => void; isEditing: boolean; setIsEditing: (val: boolean) => void; }) => {
    const [embedUrl, setEmbedUrl] = useState('');
    const { t } = useLanguage();
    
    useEffect(() => {
        if (url && typeof url === 'string' && url.includes('spotify.com/')) {
            try {
                let playlistId = '';
                if (url.includes('/playlist/')) {
                    playlistId = url.split('/playlist/')[1].split('?')[0];
                    setEmbedUrl(`https://open.spotify.com/embed/playlist/${playlistId}`);
                } else if (url.includes('/album/')) {
                    playlistId = url.split('/album/')[1].split('?')[0];
                    setEmbedUrl(`https://open.spotify.com/embed/album/${playlistId}`);
                } else if (url.includes('/track/')) {
                    playlistId = url.split('/track/')[1].split('?')[0];
                    setEmbedUrl(`https://open.spotify.com/embed/track/${playlistId}`);
                } else {
                    setEmbedUrl('');
                }
            } catch (e) {
                setEmbedUrl('');
            }
        } else {
            setEmbedUrl('');
        }
    }, [url]);
    
    if (!embedUrl || isEditing) {
       return (
            <div className="flex gap-2 items-center bg-muted/50 p-2 border rounded-xl shadow-sm my-2">
                <Music className="w-5 h-5 text-primary shrink-0 ml-2" />
                <Input
                    placeholder={t('script_page.playlist_placeholder')}
                    value={url || ''}
                    onChange={(e) => onUrlChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                    className="bg-transparent border-0 shadow-none focus-visible:ring-0"
                    autoFocus
                />
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 shrink-0 text-primary hover:text-primary hover:bg-primary/10 mr-1"
                    onClick={() => setIsEditing(false)}
                >
                    <Check className="w-5 h-5" />
                </Button>
            </div>
       )
    }

    return (
        <div className="my-4 relative group rounded-xl overflow-hidden shadow-lg border-2 border-primary/10">
            <iframe
                style={{ borderRadius: '12px' }}
                src={embedUrl}
                width="100%"
                height="352"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
            ></iframe>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};


const BlockRenderer = ({ 
  block, 
  onContentChange, 
  onDelete, 
  onAddBlockBelow,
  scriptId,
  blocks,
  index
}: { 
  block: Block; 
  onContentChange?: (newContent: any) => void; 
  onDelete?: (id: string) => void; 
  onAddBlockBelow?: (type: BlockType) => void;
  scriptId?: string;
  blocks: Block[];
  index: number;
}) => {
  const { t } = useLanguage();
  const { scripts, places, pages, addPlace, addPlaceToScript, duplicatePlace, duplicatePlaceInScript, updatePlaceInScript, deletePlaceFromScript, updateScript } = useScripts();
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (block.type === 'spotify') {
        if (!block.content) {
            setIsEditing(true);
        }
    }
  }, [block.type, block.content]);

  const script = scriptId ? scripts.find(s => s.id === scriptId) : null;
  
  const allPlaces = script ? script.places : places;

  const place = (allPlaces || []).find(p => p.id === block.content);


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const continuableTypes: BlockType[] = ['text', 'bulleted-list', 'numbered-list', 'checklist', 'h1', 'h2', 'h3', 'quote', 'callout'];
      if (continuableTypes.includes(block.type)) {
        e.preventDefault();
        onAddBlockBelow?.(block.type);
      }
    }
  };

  const renderBlock = () => {
    const getContent = (content: any) => {
        if (typeof content === 'string' && isTranslationKey(content)) {
            return t(content);
        }
        return content;
    };

    switch (block.type) {
      case 'text':
        return (
          <Textarea
            placeholder={t('block_editor.add_text')}
            className="min-h-0 h-auto w-full bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 resize-none overflow-hidden leading-6"
            value={getContent(block.content)}
            onChange={(e) => onContentChange && onContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
        );
      case 'h1':
        return <Textarea value={getContent(block.content)} onChange={e => onContentChange && onContentChange(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('block_editor.heading_1')} className="text-3xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden" rows={1} />
      case 'h2':
        return <Textarea value={getContent(block.content)} onChange={e => onContentChange && onContentChange(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('block_editor.heading_2')} className="text-2xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden" rows={1} />
      case 'h3':
        return <Textarea value={getContent(block.content)} onChange={e => onContentChange && onContentChange(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('block_editor.heading_3')} className="text-xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden" rows={1} />
      case 'bulleted-list':
         return (
          <div className="flex items-start gap-2">
            <span className="h-6 flex items-center shrink-0">•</span>
            <Textarea
              placeholder={t('block_editor.add_item')}
              className="flex-1 bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 resize-none overflow-hidden min-h-[24px] leading-6"
              value={getContent(block.content)}
              onChange={(e) => onContentChange && onContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>
        );
      case 'numbered-list': {
        const getNumber = () => {
            let count = 1;
            for (let i = index - 1; i >= 0; i--) {
                if (blocks[i] && blocks[i].type === 'numbered-list') {
                    count++;
                } else {
                    break;
                }
            }
            return count;
        };
        return (
          <div className="flex items-start gap-2">
            <span className="h-6 flex items-center shrink-0 font-medium">{getNumber()}.</span>
            <Textarea
              placeholder={t('block_editor.add_item')}
              className="flex-1 bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 resize-none overflow-hidden min-h-[24px] leading-6"
              value={getContent(block.content)}
              onChange={(e) => onContentChange && onContentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>
        );
      }
      case 'checklist':
        return (
          <div className="flex items-start gap-2">
            <div className="h-6 flex items-center shrink-0">
                <Checkbox
                    checked={block.content.checked}
                    onCheckedChange={(checked) => onContentChange && onContentChange({ ...block.content, checked })}
                />
            </div>
            <Textarea
              value={getContent(block.content.text)}
              onChange={(e) => onContentChange && onContentChange({ ...block.content, text: e.target.value })}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-6 leading-6 w-full resize-none overflow-hidden"
              placeholder={t('block_editor.add_item')}
              rows={1}
            />
          </div>
        );
      case 'toggle':
        return (
          <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={block.id} className="border-b-0">
                  <div className="flex items-center py-2 font-medium">
                      <AccordionPrimitive.Trigger
                          className="p-1 [&[data-state=open]>svg]:rotate-90"
                      >
                          <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                      </AccordionPrimitive.Trigger>
                      <Textarea
                          value={getContent(block.content.summary)}
                          onChange={(e) => onContentChange && onContentChange({ ...block.content, summary: e.target.value })}
                          placeholder={t('block_editor.toggle_summary')}
                          className="flex-1 bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto font-medium w-full resize-none overflow-hidden"
                          rows={1}
                      />
                  </div>
                  <AccordionContent className="pl-6">
                      <BlockEditor 
                        initialBlocks={block.content.details || []}
                        onUpdate={(newBlocks) => onContentChange && onContentChange({...block.content, details: newBlocks})}
                        scriptId={scriptId}
                      />
                  </AccordionContent>
              </AccordionItem>
          </Accordion>
        );
      case 'page': {
          const pageId = block.content;
          const page = pages.find(p => p.id === pageId);
      
          if (!page) {
              return null;
          }
      
          const displayTitle = isTranslationKey(page.name) ? t(page.name) : page.name;
      
          return (
              <Link href={`/pages/${pageId}`} className="flex items-center gap-2 text-foreground hover:bg-muted/50 p-2 rounded-md transition-colors my-1 -mx-2 group/page">
                  <File className="w-5 h-5 shrink-0 text-muted-foreground group-hover/page:text-primary" />
                  <div className="font-medium underline-offset-4 group-hover/page:underline">{displayTitle}</div>
              </Link>
          );
      }
      case 'image': {
        const mediaSrc = block.content;
        const isVideo = typeof mediaSrc === 'string' && (mediaSrc.includes('video/mp4') || mediaSrc.includes('video/webm') || mediaSrc.includes('video/ogg') || mediaSrc.includes('data:video'));
        const isImage = typeof mediaSrc === 'string' && !isVideo;
        const fileInputRef = React.useRef<HTMLInputElement>(null);

        const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file && onContentChange) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const compressed = await compressImage(reader.result as string);
                    onContentChange(compressed);
                };
                reader.readAsDataURL(file);
            }
        };

        return (
            <div className="relative w-full min-h-24 my-4">
                {mediaSrc ? (
                    <div className="relative w-full group">
                        {isImage && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="relative w-full cursor-zoom-in">
                                <Image
                                  src={mediaSrc}
                                  alt={t('block_editor.image_alt')}
                                  width={0}
                                  height={0}
                                  sizes="100vw"
                                  style={{ width: '100%', height: 'auto' }}
                                  className="rounded-md"
                                />
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl w-[90vw] h-[90vh] bg-black/80 backdrop-blur-sm p-0 border-none shadow-none">
                               <DialogHeader>
                                <DialogTitle className="sr-only">{t('block_editor.image_alt')}</DialogTitle>
                              </DialogHeader>
                              <Image src={mediaSrc} alt={t('block_editor.image_alt')} layout="fill" objectFit="contain" />
                              <DialogClose className="absolute right-4 top-4 rounded-sm p-1 opacity-80 hover:opacity-100 transition-opacity bg-black/30">
                                  <X className="h-6 w-6 text-red-500" />
                              </DialogClose>
                            </DialogContent>
                          </Dialog>
                        )}
                        {isVideo && (
                          <>
                            <video src={mediaSrc} controls className="rounded-md w-full" />
                          </>
                        )}
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
                            accept="image/*,video/*"
                        />
                    </>
                )}
            </div>
        );
      }
      case 'spotify':
        return <SpotifyEmbed url={block.content || ''} onUrlChange={(newUrl) => onContentChange && onContentChange(newUrl)} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'link':
        const linkData = block.content || { title: '', url: '' };
        return (
            <div className="my-2 group/link">
                <div className="flex flex-col gap-2 p-4 border rounded-xl bg-card hover:border-primary/50 transition-all shadow-sm">
                    <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-primary" />
                        <Textarea
                            placeholder={t('block_editor.link_title_placeholder')}
                            value={linkData.title || ''}
                            onChange={(e) => onContentChange && onContentChange({ ...linkData, title: e.target.value })}
                            className="bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto font-bold text-lg w-full resize-none overflow-hidden"
                            rows={1}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder={t('block_editor.link_url_placeholder')}
                            value={linkData.url || ''}
                            onChange={(e) => onContentChange && onContentChange({ ...linkData, url: e.target.value })}
                            className="bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto text-sm text-muted-foreground"
                        />
                        {linkData.url && typeof linkData.url === 'string' && linkData.url.startsWith('http') && (
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
                                <a href={linkData.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
      case 'poster': {
          const posterId = block.content;
          const poster = user.posters.find(p => p.id === posterId);
          const [isDialogOpen, setIsDialogOpen] = useState(false);
      
          if (!poster) {
              return (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                              <RectangleHorizontal className="w-4 h-4 mr-2" />
                              {t('block_editor.select_poster')}
                          </Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>{t('block_editor.select_poster')}</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-96">
                              <div className="grid grid-cols-2 gap-4 py-4">
                                  {user.posters.length > 0 ? user.posters.map(p => (
                                      <Card key={p.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                                          onContentChange && onContentChange(p.id);
                                          setIsDialogOpen(false);
                                      }}>
                                          <CardHeader className="p-0 relative h-32 bg-muted">
                                              <Image src={p.image} alt={p.title} fill className="object-cover" />
                                          </CardHeader>
                                          <CardContent className="p-3">
                                              <p className="font-semibold break-words">{isTranslationKey(p.title) ? t(p.title) : p.title}</p>
                                          </CardContent>
                                      </Card>
                                  )) : (
                                      <p className="col-span-2 text-center text-muted-foreground">{t('profile.own_no_posters')}</p>
                                  )}
                              </div>
                          </ScrollArea>
                      </DialogContent>
                  </Dialog>
              );
          }
      
          const displayTitle = isTranslationKey(poster.title) ? t(poster.title) : (poster.title || '');
      
          return (
              <div className="my-2 group/poster relative">
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover/poster:opacity-100 transition-opacity">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onContentChange && onContentChange(null)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        {t('common.edit')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Link href={`/posters/${poster.id}`}>
                    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                        <div className="flex items-center gap-4 p-4">
                            <div className="w-16 h-24 relative flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                <Image src={poster.image} alt={displayTitle} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg break-words">{displayTitle}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{poster.description}</p>
                            </div>
                        </div>
                    </Card>
                </Link>
              </div>
          );
      }
      case 'quote':
        return (
            <div className="border-l-4 border-primary pl-4 my-2">
                 <Textarea
                    placeholder={t('block_editor.quote_placeholder')}
                    className="min-h-0 bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 italic leading-6"
                    value={getContent(block.content)}
                    onChange={(e) => onContentChange && onContentChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                />
            </div>
        );
      case 'callout':
        return (
            <div className="bg-muted p-4 rounded-lg flex items-start gap-3 my-2">
                <Textarea
                    placeholder={t('block_editor.callout_placeholder')}
                    className="flex-1 min-h-0 bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 leading-6"
                    value={getContent(block.content)}
                    onChange={(e) => onContentChange && onContentChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                />
            </div>
        );
      case 'divider':
        return <hr className="my-4" />;
      case 'places_grid':
        const placeIds = Array.isArray(block.content) ? block.content : [];
        const sourceOfPlaces = script ? script.places : places;
        const placesToShow = placeIds.map(id => (sourceOfPlaces || []).find(p => p.id === id)).filter(Boolean) as Place[];

        const handleAddPlaceForGrid = () => {
            const newPlace = scriptId ? addPlaceToScript(scriptId, true) : addPlace(true);
            if (newPlace && onContentChange) {
                onContentChange([...placeIds, newPlace.id]);
            }
        };
        
        const handleDeletePlaceFromGrid = (placeId: string) => {
            if (onContentChange) {
                onContentChange(placeIds.filter(id => id !== placeId));
            }
        }

        const handleDuplicatePlaceInGrid = (placeId: string) => {
            if (onContentChange) {
                const newDuplicatedPlace = scriptId ? duplicatePlaceInScript(scriptId, placeId) : duplicatePlace(placeId);
                if(newDuplicatedPlace) {
                    const index = placeIds.indexOf(placeId);
                    const newPlaceIds = [...placeIds];
                    newPlaceIds.splice(index + 1, 0, newDuplicatedPlace.id);
                    onContentChange(newPlaceIds);
                }
            }
        }
        
        const sensors = useSensors(
            useSensor(PointerSensor),
            useSensor(KeyboardSensor, {
              coordinateGetter: sortableKeyboardCoordinates,
            })
        );

        const handleDragEndPlaces = (event: DragEndEvent) => {
            const { active, over } = event;
            if (onContentChange && over && active.id !== over.id) {
                const oldIndex = placeIds.findIndex(id => id === active.id);
                const newIndex = placeIds.findIndex(id => id === over.id);
                if (oldIndex > -1 && newIndex > -1) {
                    onContentChange(arrayMove(placeIds, oldIndex, newIndex));
                }
            }
        };

        return (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndPlaces}>
                <div className="my-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <SortableContext items={placeIds} strategy={rectSortingStrategy}>
                        {placesToShow.map((place: Place) => (
                            <SortablePlaceCard
                                key={place.id}
                                place={place}
                                scriptId={scriptId}
                                onDelete={() => handleDeletePlaceFromGrid(place.id)}
                                onDuplicate={() => handleDuplicatePlaceInGrid(place.id)}
                            />
                        ))}
                    </SortableContext>
                    <Card 
                        className="border-2 border-dashed hover:border-primary hover:text-primary transition-colors h-full flex flex-col items-center justify-center text-muted-foreground cursor-pointer min-h-[124px]"
                        onClick={handleAddPlaceForGrid}
                    >
                        <CardContent className="p-4 text-center">
                            <PlusCircle className="w-8 h-8 mx-auto mb-1" />
                            <p className="font-semibold text-sm">{t('info_page.add_new_section')}</p>
                        </CardContent>
                    </Card>
                </div>
            </DndContext>
        );
      case 'relationship_chart':
        return <RelationshipChart content={block.content} onContentChange={onContentChange} />;
      case 'relationship_chart_2':
        return <RelationshipChart2 content={block.content} onContentChange={onContentChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="py-1" data-block-id={block.id}>
      {renderBlock()}
    </div>
  )
};

function SortableBlock({ block, onDelete, onDuplicate, onClearContent, children }: { block: Block; onDelete: () => void; onDuplicate: () => void; onClearContent?: () => void; children: React.ReactNode }) {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/block bg-background flex items-center w-full">
      <div className="absolute -left-10 h-full flex items-center justify-center opacity-0 group-hover/block:opacity-100 transition-opacity">
        <button {...attributes} {...listeners} className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 w-full min-w-0">
        {children}
      </div>

      <div className="absolute -right-8 h-full flex items-center justify-center opacity-0 group-hover/block:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 v-6">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              {t('common.duplicate')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

const relationshipTypes = {
    siblings: { label: 'chart.rel_type.siblings', color: '#00ced1' }, 
    lovers: { label: 'chart.rel_type.lovers', color: '#ff69b4' }, 
    complicated: { label: 'chart.rel_type.complicated', color: '#ff4500' }, 
    other: { label: 'chart.rel_type.other', color: '#808080' }, 
    related: { label: 'chart.rel_type.related', color: '#228b22' }, 
    'parent/child': { label: 'chart.rel_type.parent_child', color: '#4682b4' }, 
    cousins: { label: 'chart.rel_type.cousins', color: '#9acd32' }, 
    coparenting: { label: 'chart.rel_type.coparenting', color: '#6a5acd' }, 
    'former partners': { label: 'chart.rel_type.former_partners', color: '#d2b48c' }, 
    'sexual partners': { label: 'chart.rel_type.sexual_partners', color: '#dc143c' }, 
    'both way crush': { label: 'chart.rel_type.both_way_crush', color: '#ff1493' }, 
    'one way crush': { label: 'chart.rel_type.one_way_crush', color: '#ffb6c1' }, 
    friends: { label: 'chart.rel_type.friends', color: '#3cb371' }, 
    'best friends': { label: 'chart.rel_type.best_friends', color: '#2e8b57' }, 
    'dislike each others': { label: 'chart.rel_type.dislike_each_other', color: '#a52a2a' }, 
    enemies: { label: 'chart.rel_type.enemies', color: '#8b0000' }, 
    'know each other': { label: 'chart.rel_type.know_each_other', color: '#d3d3d3' }, 
    'related by blood': { label: 'chart.rel_type.related_by_blood', color: '#800000' }, 
    'chosen family': { label: 'chart.rel_type.chosen_family', color: '#daa520' }, 
    married: { label: 'chart.rel_type.married', color: '#ba55d3' }, 
    engaged: { label: 'chart.rel_type.engaged', color: '#dda0dd' }, 
    rival: { label: 'chart.rel_type.rival', color: '#ff8c00' }, 
    'ok with…': { label: 'chart.rel_type.ok_with', color: '#778899' }, 
    'hook up/flirting': { label: 'chart.rel_type.hook_up_flirting', color: '#ff6347' }, 
};
type RelationshipTypeKey = keyof typeof relationshipTypes;


const RelationshipChart = ({ content, onContentChange }: { content: any; onContentChange: (newContent: any) => void; }) => {
    const { t } = useLanguage();
    const { user } = useUser();
    const { characters = [], relationships = [] } = content || {};
    const chartRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(0.8);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [hasPanned, setHasPanned] = useState(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });
    
    const activePointers = useRef<Map<number, { x: number, y: number }>>(new Map());
    const initialPinchDistance = useRef<number | null>(null);
    const initialPinchZoom = useRef<number>(1);

    const [editingCharacter, setEditingCharacter] = useState<RelationshipChartCharacter | null>(null);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [isLinkPersonDialogOpen, setIsLinkPersonDialogOpen] = useState(false);
    const [selectedPosterId, setSelectedPosterId] = useState<string | null>(null);
    const [isSeeRelationshipsDialogOpen, setIsSeeRelationshipsDialogOpen] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleUpdate = (newContent: any) => {
        if (onContentChange) {
            onContentChange(newContent);
        }
    }
    
    const handleAddCharacterClick = () => {
        const chartWidth = chartRef.current?.clientWidth || 500;
        const chartHeight = chartRef.current?.clientHeight || 500;
        const avatarSize = 96;
        const minDistance = 150;
    
        let x, y;
        let spiralAttempts = 0;
        let radius = 0;
        let angle = characters.length * 0.5;
        const angleIncrement = 0.8;
        const radiusIncrement = 15;
    
        do {
            angle += angleIncrement;
            radius += radiusIncrement * angleIncrement / (2 * Math.PI);
            x = chartWidth / 2 + radius * Math.cos(angle) - avatarSize / 2;
            y = chartHeight / 2 + radius * Math.sin(angle) - avatarSize / 2;
            spiralAttempts++;
        } while (
            characters.some((char: RelationshipChartCharacter) => {
                const distance = Math.sqrt(Math.pow(char.x - x, 2) + Math.pow(char.y - y, 2));
                return distance < minDistance;
            }) && spiralAttempts < 5000
        );
    
        const newCharacter: RelationshipChartCharacter = {
            id: `char-${Date.now()}-${Math.random()}`,
            name: 'defaults.new_character',
            avatar: null,
            x,
            y,
            fullName: '',
            linkedPerson: null,
        };
    
        handleUpdate({
            ...content,
            characters: [...(characters || []), newCharacter],
        });
    };
    
    const handleCharacterClick = (character: RelationshipChartCharacter) => {
        setEditingCharacter(character);
        setSelectedPosterId(character.linkedPerson?.posterId || null);
    };

    const handleDeleteCharacter = (characterId: string) => {
        const newCharacters = characters.filter((c: RelationshipChartCharacter) => c.id !== characterId);
        const newRelationships = relationships.filter((r: RelationshipChartLink) => r.source !== characterId && r.target !== characterId);
        handleUpdate({ ...content, characters: newCharacters, relationships: newRelationships });
        setEditingCharacter(null);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editingCharacter) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newCharacters = characters.map((c: RelationshipChartCharacter) =>
                    c.id === editingCharacter.id ? { ...c, avatar: reader.result as string } : c
                );
                handleUpdate({ ...content, characters: newCharacters });
                setEditingCharacter(prev => prev ? { ...prev, avatar: reader.result as string } : null);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleCreateLink = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const targetId = formData.get('targetCharacter') as string;
        const type = formData.get('relationshipType') as RelationshipTypeKey;

        if (!editingCharacter || !targetId || !type || editingCharacter.id === targetId) {
            setIsLinkDialogOpen(false);
            return;
        };

        const newRelationship: RelationshipChartLink = {
            id: `rel-${editingCharacter.id}-${targetId}-${Date.now()}`,
            source: editingCharacter.id,
            target: targetId,
            type: type,
        };

        const newRelationships = [...(relationships || []), newRelationship];
        handleUpdate({ ...content, relationships: newRelationships });
        setIsLinkDialogOpen(false);
    };

    const handleDeleteRelationship = (relationshipId: string) => {
        const newRelationships = relationships.filter((r: RelationshipChartLink) => r.id !== relationshipId);
        handleUpdate({ ...content, relationships: newRelationships });
    };

    const handleLinkPerson = (posterId: string, personId: string) => {
        if (!editingCharacter) return;
        const newCharacters = characters.map((c: any) =>
            c.id === editingCharacter.id ? { ...c, linkedPerson: { posterId, personId } } : c
        );
        handleUpdate({ ...content, characters: newCharacters });
        setEditingCharacter(prev => prev ? { ...prev, linkedPerson: { posterId, personId } } : null);
    };
    
    const handleRemoveLink = () => {
        if (!editingCharacter) return;
        const newCharacters = characters.map((c: any) =>
            c.id === editingCharacter.id ? { ...c, linkedPerson: null } : c
        );
        handleUpdate({ ...content, characters: newCharacters });
        setEditingCharacter(prev => prev ? { ...prev, linkedPerson: null } : null);
    };

    const getCharacterById = (id: string): RelationshipChartCharacter | undefined => characters.find((c: RelationshipChartCharacter) => c.id === id);
    
    const getPathForRelationship = (rel: RelationshipChartLink) => {
        const source = getCharacterById(rel.source);
        const target = getCharacterById(rel.target);
        if (!source || !target) return "";
    
        const avatarRadius = 48;
        const sourceCenterX = source.x + avatarRadius;
        const sourceCenterY = source.y + avatarRadius;
        const targetCenterX = target.x + avatarRadius;
        const targetCenterY = target.y + avatarRadius;
    
        const dx = targetCenterX - sourceCenterX;
        const dy = targetCenterY - sourceCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
    
        if (dist === 0) return "";
    
        const nx = dx / dist;
        const ny = dy / dist;
    
        const startX = sourceCenterX + nx * avatarRadius;
        const startY = sourceCenterY + ny * avatarRadius;
        const endX = targetCenterX - nx * avatarRadius;
        const endY = targetCenterY - ny * avatarRadius;
    
        return `M ${startX} ${startY} L ${endX} ${endY}`;
    };


    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        
        if (activePointers.current.size === 1) {
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
            setIsPanning(true);
            setHasPanned(false);
        } else if (activePointers.current.size === 2) {
            const pointers = Array.from(activePointers.current.values());
            initialPinchDistance.current = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
            initialPinchZoom.current = zoom;
            setIsPanning(false);
        }
        chartRef.current?.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!activePointers.current.has(e.pointerId)) return;
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (activePointers.current.size === 1 && isPanning) {
            const dx = e.clientX - lastPanPoint.current.x;
            const dy = e.clientY - lastPanPoint.current.y;
            
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                setHasPanned(true);
            }
            
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        } else if (activePointers.current.size === 2 && initialPinchDistance.current !== null) {
            const pointers = Array.from(activePointers.current.values());
            const currentDistance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
            const scale = currentDistance / initialPinchDistance.current;
            const newZoom = Math.max(0.1, Math.min(3, initialPinchZoom.current * scale));
            setZoom(newZoom);
            setHasPanned(true);
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!hasPanned && activePointers.current.size === 1) {
            const element = document.elementFromPoint(e.clientX, e.clientY);
            const charDiv = element?.closest('.character-avatar');
            if (charDiv) {
                const charId = charDiv.getAttribute('data-char-id');
                const char = characters.find((c: any) => c.id === charId);
                if (char) handleCharacterClick(char);
            }
        }

        activePointers.current.delete(e.pointerId);
        if (activePointers.current.size < 2) {
            initialPinchDistance.current = null;
        }
        if (activePointers.current.size === 0) {
            setIsPanning(false);
        } else if (activePointers.current.size === 1) {
            const remaining = activePointers.current.values().next().value;
            if (remaining) {
                lastPanPoint.current = { x: remaining.x, y: remaining.y };
                setIsPanning(true);
            }
        }
        chartRef.current?.releasePointerCapture(e.pointerId);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY;
            const zoomAmount = delta > 0 ? 0.9 : 1.1;
            setZoom(prev => Math.max(0.1, Math.min(3, prev * zoomAmount)));
        }
    };

    const resetView = () => {
        if (!characters.length || !chartRef.current) {
           setPan({ x: 0, y: 0 });
           setZoom(0.8);
           return;
        }

        const chartRect = chartRef.current.getBoundingClientRect();
        const avatarSize = 96;
        const padding = 60;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        characters.forEach((char: RelationshipChartCharacter) => {
            minX = Math.min(minX, char.x);
            minY = Math.min(minY, char.y);
            maxX = Math.max(maxX, char.x + avatarSize);
            maxY = Math.max(maxY, char.y + avatarSize);
        });
        
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        
        if (contentWidth <= 0 || contentHeight <= 0) {
            setPan({ x: 0, y: 0 });
            setZoom(0.8);
            return;
        }

        const scaleX = (chartRect.width - padding * 2) / contentWidth;
        const scaleY = (chartRect.height - padding * 2) / contentHeight;
        const newZoom = Math.min(scaleX, scaleY, 1.2); 

        const contentCenterX = minX + contentWidth / 2;
        const contentCenterY = minY + contentHeight / 2;
        
        const newPanX = (chartRect.width / 2) - (contentCenterX * newZoom);
        const newPanY = (chartRect.height / 2) - (contentCenterY * newZoom);

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
    };

    const linkedPoster = useMemo(() => user.posters.find(p => p.id === editingCharacter?.linkedPerson?.posterId), [user.posters, editingCharacter?.linkedPerson]);
    const linkedPerson = useMemo(() => linkedPoster?.people.find(p => p.id === editingCharacter?.linkedPerson?.personId), [linkedPoster, editingCharacter?.linkedPerson]);

    return (
        <div className="w-full border-2 border-dashed rounded-lg bg-muted/20 my-4 p-2">
            <div className="flex justify-between items-center mb-2 px-2 gap-2">
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(3, z * 1.1))}>
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.1, z * 0.9))}>
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={resetView}>
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleAddCharacterClick}>
                        <Plus className="w-4 h-4" />
                    </Button>
                 </div>
                 <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                             <Button variant="outline" size="icon">
                                <Book className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <div className="p-4 grid gap-2 text-sm max-h-64 overflow-y-auto">
                                {Object.entries(relationshipTypes).map(([key, {label, color}]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                        <span>{t(label)}</span>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                 </div>
            </div>
             <div 
                ref={chartRef}
                className="relative aspect-square w-full overflow-hidden border rounded-md bg-background cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onWheel={handleWheel}
             >
                    <div 
                        className="absolute inset-0 origin-top-left"
                        style={{ 
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                        }}
                    >
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            <g>
                                {(relationships || []).map((rel: RelationshipChartLink) => {
                                    const color = (relationshipTypes as any)[rel.type]?.color || 'hsl(var(--foreground))';
                                    const path = getPathForRelationship(rel);
                                    if (!path) return null;
                                    return (
                                        <path
                                            key={rel.id}
                                            d={path}
                                            stroke={color}
                                            strokeWidth="2"
                                            fill="none"
                                        />
                                    );
                                })}
                            </g>
                        </svg>
                        {characters.map((char: RelationshipChartCharacter) => {
                             const charName = isTranslationKey(char.name) ? t(char.name) : char.name;
                             return (
                                <div 
                                    key={char.id}
                                    data-char-id={char.id}
                                    style={{ left: char.x, top: char.y }}
                                    className="character-avatar absolute flex flex-col items-center w-24 z-10"
                                >
                                    <Avatar className="w-24 h-24 border-4 border-background shadow-md pointer-events-none">
                                        <AvatarImage src={char.avatar || undefined} />
                                        <AvatarFallback>{charName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="mt-1 text-sm font-medium bg-background/80 px-2 py-0.5 rounded-full break-words w-full text-center pointer-events-none">{charName}</p>
                                </div>
                             )
                        })}
                    </div>
            </div>

            <Dialog open={isSeeRelationshipsDialogOpen} onOpenChange={setIsSeeRelationshipsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCharacter ? t('chart.relationships_for', { name: isTranslationKey(editingCharacter.name) ? t(editingCharacter.name) : editingCharacter.name }) : ''}
                        </DialogTitle>
                    </DialogHeader>
                    {editingCharacter && (
                        <ScrollArea className="max-h-72 -mr-6">
                            <div className="space-y-4 pr-6">
                                {relationships.filter((rel: RelationshipChartLink) => rel.source === editingCharacter.id || rel.target === editingCharacter.id).length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">{t('chart.no_relationships')}</p>
                                ) : (
                                    relationships.filter((rel: RelationshipChartLink) => rel.source === editingCharacter.id || rel.target === editingCharacter.id).map((rel: RelationshipChartLink) => {
                                        const otherCharacterId = rel.source === editingCharacter!.id ? rel.target : rel.source;
                                        const otherCharacter = getCharacterById(otherCharacterId);
                                        if (!otherCharacter) return null;
                                        
                                        const relTypeLabel = t((relationshipTypes as any)[rel.type]?.label || rel.type);

                                        return (
                                            <div key={rel.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Avatar>
                                                        <AvatarImage src={otherCharacter.avatar || undefined} />
                                                        <AvatarFallback>{(isTranslationKey(otherCharacter.name) ? t(otherCharacter.name) : otherCharacter.name).charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{isTranslationKey(otherCharacter.name) ? t(otherCharacter.name) : otherCharacter.name}</p>
                                                        <p className="text-sm text-muted-foreground">{relTypeLabel}</p>
                                                    </div>
                                                </div>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {t('chart.delete_relationship_desc')}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteRelationship(rel.id)} className="bg-destructive hover:bg-destructive/90">
                                                                {t('common.delete')}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
             </Dialog>
            
             <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('chart.add_relationship')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateLink} className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="sourceCharacter">{t('chart.rel_from')}</Label>
                           <Input 
                                name="sourceCharacter" 
                                readOnly 
                                value={editingCharacter ? (isTranslationKey(editingCharacter.name) ? t(editingCharacter.name) : editingCharacter.name) : ''} 
                                className="bg-muted"
                           />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="targetCharacter">{t('chart.rel_to')}</Label>
                             <Select name="targetCharacter" required>
                                <SelectTrigger id="targetCharacter">
                                    <SelectValue placeholder={t('chart.select_character')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {characters.filter((c:any) => c.id !== editingCharacter?.id).map((c: RelationshipChartCharacter) => (
                                        <SelectItem key={c.id} value={c.id}>{isTranslationKey(c.name) ? t(c.name) : c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="relationshipType">{t('chart.rel_type')}</Label>
                             <Select name="relationshipType" required>
                                <SelectTrigger id="relationshipType">
                                    <SelectValue placeholder={t('chart.select_type')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(relationshipTypes).map(([key, {label}]) => (
                                        <SelectItem key={key} value={key}>{t(label)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>


                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsLinkDialogOpen(false)}>{t('common.cancel')}</Button>
                            <Button type="submit">{t('chart.create_link')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
             </Dialog>

             <Dialog open={!!editingCharacter && !isLinkDialogOpen && !isSeeRelationshipsDialogOpen && !isLinkPersonDialogOpen} onOpenChange={(open) => !open && setEditingCharacter(null)}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('chart.edit_character')}</DialogTitle>
                    </DialogHeader>
                    {editingCharacter && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-6">
                                 <div className="relative group">
                                    <Avatar className="w-32 h-32 border-4 border-muted shadow-lg">
                                        <AvatarImage src={editingCharacter.avatar || undefined} />
                                        <AvatarFallback className="text-2xl">{(isTranslationKey(editingCharacter.name) ? t(editingCharacter.name) : editingCharacter.name).charAt(0)}</AvatarFallback>
                                    </Avatar>
                                     <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full w-full h-full transition-opacity"
                                        onClick={() => avatarInputRef.current?.click()}
                                    >
                                        <Camera className="w-8 h-8" />
                                    </Button>
                                    <input 
                                        type="file" 
                                        ref={avatarInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <div className="w-full space-y-4">
                                     <div className="space-y-2 text-center">
                                        <Label htmlFor="characterName">{t('chart.character_name')}</Label>
                                        <Textarea
                                            id="characterName"
                                            value={isTranslationKey(editingCharacter.name) ? t(editingCharacter.name) : editingCharacter.name}
                                            maxLength={15}
                                            onChange={(e) => {
                                                const newName = e.target.value;
                                                setEditingCharacter(prev => prev ? { ...prev, name: newName } : null);
                                                const newCharacters = characters.map((c: any) =>
                                                    c.id === editingCharacter.id ? { ...c, name: newName } : c
                                                );
                                                handleUpdate({ ...content, characters: newCharacters });
                                            }}
                                            className="text-center text-xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden"
                                            rows={1}
                                        />
                                     </div>
                                </div>
                            </div>
                            <div className="w-full space-y-2">
                                <Label htmlFor="characterFullName">{t('chart.full_name')}</Label>
                                <Textarea
                                    id="characterFullName"
                                    value={editingCharacter.fullName || ''}
                                    maxLength={75}
                                    onChange={(e) => {
                                        const newFullName = e.target.value;
                                        setEditingCharacter(prev => prev ? { ...prev, fullName: newFullName } : null);
                                        const newCharacters = characters.map((c: any) =>
                                            c.id === editingCharacter.id ? { ...c, fullName: newFullName } : c
                                        );
                                        handleUpdate({ ...content, characters: newCharacters });
                                    }}
                                    className="text-sm"
                                    placeholder={t('chart.full_name_placeholder')}
                                />
                            </div>
                            
                            <div className="space-y-2 pt-4 border-t">
                                <Label>{t('chart.link_to_person')}</Label>
                                {editingCharacter.linkedPerson && linkedPerson && linkedPoster ? (
                                    <div className="space-y-2">
                                        <Link href={`/posters/${linkedPoster.id}/people/${linkedPerson.id}`} onClick={() => setEditingCharacter(null)}>
                                            <Card className="hover:bg-muted/50 cursor-pointer">
                                                <CardHeader className="flex flex-row items-center gap-4 p-3">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarImage src={linkedPerson.image} />
                                                        <AvatarFallback>{linkedPerson.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{linkedPerson.name}</p>
                                                        <p className="text-xs text-muted-foreground">{isTranslationKey(linkedPoster.title) ? t(linkedPoster.title) : linkedPoster.title}</p>
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        </Link>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => {
                                                setSelectedPosterId(linkedPoster.id);
                                                setIsLinkPersonDialogOpen(true);
                                            }}>{t('common.edit')}</Button>
                                            <Button variant="destructive" size="sm" onClick={handleRemoveLink}>{t('common.delete')}</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button variant="outline" className="w-full" onClick={() => setIsLinkPersonDialogOpen(true)}>
                                        <LinkIcon className="w-4 h-4 mr-2" />
                                        {t('chart.link_to_person')}
                                    </Button>
                                )}
                            </div>


                            <div className="flex flex-col gap-2 pt-4 border-t">
                                 <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => {
                                        setIsLinkDialogOpen(true);
                                    }}
                                >
                                    <LinkIcon className="w-4 h-4 mr-2" />
                                    {t('chart.add_relationship')}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setIsSeeRelationshipsDialogOpen(true)}
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    {t('chart.see_relationships')}
                                </Button>
                                
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full mt-4">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            {t('common.delete')}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t('place_page.delete_description_person')}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDeleteCharacter(editingCharacter.id)}
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                {t('common.delete')}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                        </div>
                    )}
                </DialogContent>
             </Dialog>
              <Dialog open={isLinkPersonDialogOpen} onOpenChange={setIsLinkPersonDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('chart.link_to_person')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('block_editor.select_poster')}</Label>
                            <Select onValueChange={setSelectedPosterId} value={selectedPosterId || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('block_editor.select_poster')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {user.posters.map(poster => (
                                        <SelectItem key={poster.id} value={poster.id}>{isTranslationKey(poster.title) ? t(poster.title) : poster.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedPosterId && (
                            <div className="space-y-2">
                                <Label>{t('poster_page.people')}</Label>
                                <Select onValueChange={(personId) => {
                                    if (personId) {
                                        handleLinkPerson(selectedPosterId, personId);
                                    }
                                    setIsLinkPersonDialogOpen(false);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('chart.select_character')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(user.posters.find(p => p.id === selectedPosterId)?.people || []).map(person => (
                                            <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

const RelationshipChart2 = ({ content, onContentChange }: { content: any; onContentChange: (newContent: any) => void; }) => {
    const { t } = useLanguage();
    const { user } = useUser();
    const { characters = [], relationships = [] } = content || {};
    const chartRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(0.8);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [hasPanned, setHasPanned] = useState(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });
    
    const activePointers = useRef<Map<number, { x: number, y: number }>>(new Map());
    const initialPinchDistance = useRef<number | null>(null);
    const initialPinchZoom = useRef<number>(1);

    const [editingCharacter, setEditingCharacter] = useState<RelationshipChartCharacter | null>(null);
    const [isLinkPersonDialogOpen, setIsLinkPersonDialogOpen] = useState(false);
    const [selectedPosterId, setSelectedPosterId] = useState<string | null>(null);
    const [isSeeRelationshipsDialogOpen, setIsSeeRelationshipsDialogOpen] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const centralCharacter = characters.length > 0 ? characters[0] : null;
    const orbitingCharacters = characters.length > 1 ? characters.slice(1) : [];

    const handleUpdate = (newContent: any) => {
        if (onContentChange) {
            onContentChange(newContent);
        }
    }

    const handleAddCharacterClick = () => {
        const newCharacter: RelationshipChartCharacter = {
            id: `char-${Date.now()}-${Math.random()}`,
            name: 'defaults.new_character',
            avatar: null,
            x: 0,
            y: 0,
            fullName: '',
            linkedPerson: null,
        };

        handleUpdate({
            ...content,
            characters: [...(characters || []), newCharacter],
        });
    };
    
    useEffect(() => {
    if (!chartRef.current) return;

    const chartWidth = chartRef.current.clientWidth;
    const chartHeight = chartRef.current.clientHeight;
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;
    
    let newCharacters = [...characters];

    if (centralCharacter) {
        const centralAvatarSize = 128;
        newCharacters[0] = {
            ...newCharacters[0],
            x: centerX - centralAvatarSize / 2,
            y: centerY - centralAvatarSize / 2,
        };
    }
    
    if (orbitingCharacters.length > 0) {
        const orbitingAvatarSize = 96;
        const centralAvatarSize = 128;
        const characterSpacing = orbitingAvatarSize + 48;
        
        const minGap = 40; 
        const minRadius = (centralAvatarSize / 2) + minGap + (orbitingAvatarSize / 2);
        
        const requiredCircumference = orbitingCharacters.length * characterSpacing;
        const calculatedRadius = requiredCircumference / (2 * Math.PI);
        
        const radius = Math.max(minRadius, calculatedRadius);

        orbitingCharacters.forEach((char, index) => {
            const angle = (index / orbitingCharacters.length) * 2 * Math.PI - Math.PI / 2;
            const charX = centerX + radius * Math.cos(angle) - orbitingAvatarSize / 2;
            const charY = centerY + radius * Math.sin(angle) - orbitingAvatarSize / 2;

            const charIndexInMainArray = characters.findIndex((c:any) => c.id === char.id);
            if (charIndexInMainArray !== -1) {
                newCharacters[charIndexInMainArray] = { ...newCharacters[charIndexInMainArray], x: charX, y: charY };
            }
        });
    }
    
    if (JSON.stringify(newCharacters) !== JSON.stringify(characters)) {
        handleUpdate({ ...content, characters: newCharacters });
    }
    
}, [characters.length, centralCharacter?.id, chartRef.current?.clientWidth]);


    const handleCharacterClick = (character: RelationshipChartCharacter) => {
        setEditingCharacter(character);
        setSelectedPosterId(character.linkedPerson?.posterId || null);
    };

    const handleDeleteCharacter = (characterId: string) => {
        const newCharacters = characters.filter((c: RelationshipChartCharacter) => c.id !== characterId);
        const newRelationships = relationships.filter((r: RelationshipChartLink) => r.source !== characterId && r.target !== characterId);
        handleUpdate({ ...content, characters: newCharacters, relationships: newRelationships });
        setEditingCharacter(null);
    };
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editingCharacter) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newCharacters = characters.map((c: RelationshipChartCharacter) =>
                    c.id === editingCharacter.id ? { ...c, avatar: reader.result as string } : c
                );
                handleUpdate({ ...content, characters: newCharacters });
                setEditingCharacter(prev => prev ? { ...prev, avatar: reader.result as string } : null);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleCreateLink = (sourceId: string, type: RelationshipTypeKey) => {
        if (!centralCharacter || sourceId === centralCharacter.id) return;

        const otherRelationships = relationships.filter((r: RelationshipChartLink) => r.source !== sourceId);

        const newRelationship: RelationshipChartLink = {
            id: `rel-${sourceId}-${centralCharacter.id}-${Date.now()}`,
            source: sourceId,
            target: centralCharacter.id,
            type: type,
        };

        const newRelationships = [...otherRelationships, newRelationship];
        handleUpdate({ ...content, relationships: newRelationships });
    };

    const handleDeleteRelationship = (relationshipId: string) => {
        const newRelationships = relationships.filter((r: RelationshipChartLink) => r.id !== relationshipId);
        handleUpdate({ ...content, relationships: newRelationships });
    };
    
    const handleLinkPerson = (posterId: string, personId: string) => {
        if (!editingCharacter) return;
        const newCharacters = characters.map((c: any) =>
            c.id === editingCharacter.id ? { ...c, linkedPerson: { posterId, personId } } : c
        );
        handleUpdate({ ...content, characters: newCharacters });
        setEditingCharacter(prev => prev ? { ...prev, linkedPerson: { posterId, personId } } : null);
    };
    
    const handleRemoveLink = () => {
        if (!editingCharacter) return;
        const newCharacters = characters.map((c: any) =>
            c.id === editingCharacter.id ? { ...c, linkedPerson: null } : c
        );
        handleUpdate({ ...content, characters: newCharacters });
        setEditingCharacter(prev => prev ? { ...prev, linkedPerson: null } : null);
    };
    
    const getCharacterById = (id: string): RelationshipChartCharacter | undefined => characters.find((c: RelationshipChartCharacter) => c.id === id);

    const getPathForRelationship = (rel: RelationshipChartLink) => {
        const source = getCharacterById(rel.source);
        const target = getCharacterById(rel.target);
        if (!source || !target) return "";
    
        const sourceAvatarSize = 96;
        const targetAvatarSize = 128;
        const sourceRadius = sourceAvatarSize / 2;
        const targetRadius = targetAvatarSize / 2;

        const sourceCenterX = source.x + sourceRadius;
        const sourceCenterY = source.y + sourceRadius;
        const targetCenterX = target.x + targetRadius;
        const targetCenterY = target.y + targetRadius;
    
        const dx = targetCenterX - sourceCenterX;
        const dy = targetCenterY - sourceCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
    
        if (dist === 0) return "";
    
        const nx = dx / dist;
        const ny = dy / dist;
    
        const startX = sourceCenterX + nx * sourceRadius;
        const startY = sourceCenterY + ny * sourceRadius;
        const endX = targetCenterX - nx * targetRadius;
        const endY = targetCenterY - ny * targetRadius;
    
        return `M ${startX} ${startY} L ${endX} ${endY}`;
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        
        if (activePointers.current.size === 1) {
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
            setIsPanning(true);
            setHasPanned(false);
        } else if (activePointers.current.size === 2) {
            const pointers = Array.from(activePointers.current.values());
            initialPinchDistance.current = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
            initialPinchZoom.current = zoom;
            setIsPanning(false);
        }
        chartRef.current?.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!activePointers.current.has(e.pointerId)) return;
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (activePointers.current.size === 1 && isPanning) {
            const dx = e.clientX - lastPanPoint.current.x;
            const dy = e.clientY - lastPanPoint.current.y;
            
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                setHasPanned(true);
            }
            
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        } else if (activePointers.current.size === 2 && initialPinchDistance.current !== null) {
            const pointers = Array.from(activePointers.current.values());
            const currentDistance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
            const scale = currentDistance / initialPinchDistance.current;
            const newZoom = Math.max(0.1, Math.min(3, initialPinchZoom.current * scale));
            setZoom(newZoom);
            setHasPanned(true);
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!hasPanned && activePointers.current.size === 1) {
            const element = document.elementFromPoint(e.clientX, e.clientY);
            const charDiv = element?.closest('.character-avatar');
            if (charDiv) {
                const charId = charDiv.getAttribute('data-char-id');
                const char = characters.find((c: any) => c.id === charId);
                if (char) handleCharacterClick(char);
            }
        }

        activePointers.current.delete(e.pointerId);
        if (activePointers.current.size < 2) {
            initialPinchDistance.current = null;
        }
        if (activePointers.current.size === 0) {
            setIsPanning(false);
        } else if (activePointers.current.size === 1) {
            const remaining = activePointers.current.values().next().value;
            if (remaining) {
                lastPanPoint.current = { x: remaining.x, y: remaining.y };
                setIsPanning(true);
            }
        }
        chartRef.current?.releasePointerCapture(e.pointerId);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY;
            const zoomAmount = delta > 0 ? 0.9 : 1.1;
            setZoom(prev => Math.max(0.1, Math.min(3, prev * zoomAmount)));
        }
    };

    const resetView = () => {
      if (!characters.length || !chartRef.current) {
          setPan({ x: 0, y: 0 });
          setZoom(0.8);
          return;
      }
  
      const chartRect = chartRef.current.getBoundingClientRect();
      const padding = 60;
  
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      characters.forEach((char: RelationshipChartCharacter, index: number) => {
          const avatarSize = index === 0 ? 128 : 96;
          minX = Math.min(minX, char.x);
          minY = Math.min(minY, char.y);
          maxX = Math.max(maxX, char.x + avatarSize);
          maxY = Math.max(maxY, char.y + avatarSize);
      });
      
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      
      if (contentWidth <= 0 || contentHeight <= 0) {
          setPan({ x: 0, y: 0 });
          setZoom(0.8);
          return;
      }
  
      const scaleX = (chartRect.width - padding * 2) / contentWidth;
      const scaleY = (chartRect.height - padding * 2) / contentHeight;
      const newZoom = Math.min(scaleX, scaleY, 1.2); 
  
      const contentCenterX = minX + contentWidth / 2;
      const contentCenterY = minY + contentHeight / 2;
      
      const newPanX = (chartRect.width / 2) - (contentCenterX * newZoom);
      const newPanY = (chartRect.height / 2) - (contentCenterY * newZoom);
  
      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    const linkedPoster = useMemo(() => user.posters.find(p => p.id === editingCharacter?.linkedPerson?.posterId), [user.posters, editingCharacter?.linkedPerson]);
    const linkedPerson = useMemo(() => linkedPoster?.people.find(p => p.id === editingCharacter?.linkedPerson?.personId), [linkedPoster, editingCharacter?.linkedPerson]);
    
    return (
        <div className="w-full border-2 border-dashed rounded-lg bg-muted/20 my-4 p-2">
            <div className="flex justify-between items-center mb-2 px-2 gap-2">
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(3, z * 1.1))}>
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.1, z * 0.9))}>
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={resetView}>
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleAddCharacterClick}>
                        <Plus className="w-4 h-4" />
                    </Button>
                 </div>
                 <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                             <Button variant="outline" size="icon">
                                <Book className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <div className="p-4 grid gap-2 text-sm max-h-64 overflow-y-auto">
                                {Object.entries(relationshipTypes).map(([key, {label, color}]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                        <span>{t(label)}</span>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                 </div>
            </div>
             <div 
                ref={chartRef}
                className="relative aspect-square w-full overflow-hidden border rounded-md bg-background touch-none cursor-grab active:cursor-grabbing"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onWheel={handleWheel}
             >
                 <div 
                    className="absolute inset-0 origin-top-left"
                    style={{ 
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                    }}
                >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <g>
                            {(relationships || []).map((rel: RelationshipChartLink) => {
                                const color = (relationshipTypes as any)[rel.type]?.color || 'hsl(var(--foreground))';
                                const path = getPathForRelationship(rel);
                                if (!path) return null;
                                return (
                                    <path
                                        key={rel.id}
                                        d={path}
                                        stroke={color}
                                        strokeWidth="2"
                                        fill="none"
                                        markerEnd="url(#arrowhead)"
                                    />
                                );
                            })}
                        </g>
                         <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" />
                            </marker>
                        </defs>
                    </svg>
                     {characters.map((char: RelationshipChartCharacter) => {
                         const charName = isTranslationKey(char.name) ? t(char.name) : char.name;
                         return (
                            <div 
                                key={char.id}
                                data-char-id={char.id}
                                style={{ left: char.x, top: char.y }}
                                className="character-avatar absolute flex flex-col items-center cursor-pointer z-10"
                            >
                                <Avatar className={cn(
                                    "border-4 border-background shadow-md pointer-events-none",
                                    char.id === centralCharacter?.id ? "w-32 h-32" : "w-24 h-24"
                                )}>
                                    <AvatarImage src={char.avatar || undefined} />
                                    <AvatarFallback>{charName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="mt-1 text-sm font-medium bg-background/80 px-2 py-0.5 rounded-full break-words max-w-full text-center pointer-events-none">{charName}</p>
                            </div>
                         )
                    })}
                </div>
            </div>

            <Dialog open={isSeeRelationshipsDialogOpen} onOpenChange={setIsSeeRelationshipsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCharacter ? t('chart.relationships_for', { name: isTranslationKey(editingCharacter.name) ? t(editingCharacter.name) : editingCharacter.name }) : ''}
                        </DialogTitle>
                    </DialogHeader>
                    {editingCharacter && (
                        <ScrollArea className="max-h-72 -mr-6">
                            <div className="space-y-4 pr-6">
                                {relationships.filter((rel: RelationshipChartLink) => rel.source === editingCharacter.id || rel.target === editingCharacter.id).length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">{t('chart.no_relationships')}</p>
                                ) : (
                                    relationships.filter((rel: RelationshipChartLink) => rel.source === editingCharacter.id || rel.target === editingCharacter.id).map((rel: RelationshipChartLink) => {
                                        const otherCharacterId = rel.source === editingCharacter!.id ? rel.target : rel.source;
                                        const otherCharacter = getCharacterById(otherCharacterId);
                                        if (!otherCharacter) return null;
                                        
                                        const relTypeLabel = t((relationshipTypes as any)[rel.type]?.label || rel.type);

                                        return (
                                            <div key={rel.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Avatar>
                                                        <AvatarImage src={otherCharacter.avatar || undefined} />
                                                        <AvatarFallback>{(isTranslationKey(otherCharacter.name) ? t(otherCharacter.name) : otherCharacter.name).charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{isTranslationKey(otherCharacter.name) ? t(otherCharacter.name) : otherCharacter.name}</p>
                                                        <p className="text-sm text-muted-foreground">{relTypeLabel}</p>
                                                    </div>
                                                </div>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {t('chart.delete_relationship_desc')}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteRelationship(rel.id)} className="bg-destructive hover:bg-destructive/90">
                                                                {t('common.delete')}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
             </Dialog>

            <Dialog open={!!editingCharacter && !isSeeRelationshipsDialogOpen && !isLinkPersonDialogOpen} onOpenChange={(open) => !open && setEditingCharacter(null)}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('chart.edit_character')}</DialogTitle>
                    </DialogHeader>
                    {editingCharacter && (
                        <div className="space-y-6">
                             <div className="flex flex-col items-center gap-6">
                                 <div className="relative group">
                                    <Avatar className="w-32 h-32 border-4 border-muted shadow-lg">
                                        <AvatarImage src={editingCharacter.avatar || undefined} />
                                        <AvatarFallback className="text-2xl">{(isTranslationKey(editingCharacter.name) ? t(editingCharacter.name) : editingCharacter.name).charAt(0)}</AvatarFallback>
                                    </Avatar>
                                     <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full w-full h-full transition-opacity"
                                        onClick={() => avatarInputRef.current?.click()}
                                    >
                                        <Camera className="w-8 h-8" />
                                    </Button>
                                    <input 
                                        type="file" 
                                        ref={avatarInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <div className="w-full space-y-4">
                                     <div className="space-y-2 text-center">
                                        <Label htmlFor="characterName">{t('chart.character_name')}</Label>
                                        <Textarea
                                            id="characterName"
                                            value={isTranslationKey(editingCharacter.name) ? t(editingCharacter.name) : editingCharacter.name}
                                            maxLength={15}
                                            onChange={(e) => {
                                                const newName = e.target.value;
                                                setEditingCharacter(prev => prev ? { ...prev, name: newName } : null);
                                                const newCharacters = characters.map((c: any) =>
                                                    c.id === editingCharacter.id ? { ...c, name: newName } : c
                                                );
                                                handleUpdate({ ...content, characters: newCharacters });
                                            }}
                                            className="text-center text-xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto w-full resize-none overflow-hidden"
                                            rows={1}
                                        />
                                     </div>
                                </div>
                            </div>

                            <div className="w-full space-y-2">
                                <Label htmlFor="characterFullName">{t('chart.full_name')}</Label>
                                <Textarea
                                    id="characterFullName"
                                    value={editingCharacter.fullName || ''}
                                    maxLength={75}
                                    onChange={(e) => {
                                        const newFullName = e.target.value;
                                        setEditingCharacter(prev => prev ? { ...prev, fullName: newFullName } : null);
                                        const newCharacters = characters.map((c: any) =>
                                            c.id === editingCharacter.id ? { ...c, fullName: newFullName } : c
                                        );
                                        handleUpdate({ ...content, characters: newCharacters });
                                    }}
                                    className="text-sm"
                                    placeholder={t('chart.full_name_placeholder')}
                                />
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label>{t('chart.link_to_person')}</Label>
                                {editingCharacter.linkedPerson && linkedPerson && linkedPoster ? (
                                    <div className="space-y-2">
                                        <Link href={`/posters/${linkedPoster.id}/people/${linkedPerson.id}`} onClick={() => setEditingCharacter(null)}>
                                            <Card className="hover:bg-muted/50 cursor-pointer">
                                                <CardHeader className="flex flex-row items-center gap-4 p-3">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarImage src={linkedPerson.image} />
                                                        <AvatarFallback>{linkedPerson.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{linkedPerson.name}</p>
                                                        <p className="text-xs text-muted-foreground">{isTranslationKey(linkedPoster.title) ? t(linkedPoster.title) : linkedPoster.title}</p>
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        </Link>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => {
                                                setSelectedPosterId(linkedPoster.id);
                                                setIsLinkPersonDialogOpen(true);
                                            }}>{t('common.edit')}</Button>
                                            <Button variant="destructive" size="sm" onClick={handleRemoveLink}>{t('common.delete')}</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button variant="outline" className="w-full" onClick={() => setIsLinkPersonDialogOpen(true)}>
                                        <LinkIcon className="w-4 h-4 mr-2" />
                                        {t('chart.link_to_person')}
                                    </Button>
                                )}
                            </div>
                            
                            {editingCharacter.id !== centralCharacter?.id && centralCharacter && (
                                <div className="space-y-2 pt-4 border-t">
                                     <Label>{t('chart.rel_to_central', { name: isTranslationKey(centralCharacter.name) ? t(centralCharacter.name) : centralCharacter.name })}</Label>
                                      <Select onValueChange={(value) => handleCreateLink(editingCharacter.id, value as RelationshipTypeKey)}
                                        value={relationships.find((r: RelationshipChartLink) => r.source === editingCharacter.id)?.type}
                                      >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('chart.set_relationship')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(relationshipTypes).map(([key, {label}]) => (
                                                <SelectItem key={key} value={key}>{t(label)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                             <div className="pt-4 border-t space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setIsSeeRelationshipsDialogOpen(true)}
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    {t('chart.see_relationships')}
                                </Button>
                             </div>

                             <div className="flex gap-2 pt-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            {t('common.delete')}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t('place_page.delete_description_person')}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDeleteCharacter(editingCharacter.id)}
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                {t('common.delete')}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={isLinkPersonDialogOpen} onOpenChange={setIsLinkPersonDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('chart.link_to_person')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('block_editor.select_poster')}</Label>
                            <Select onValueChange={setSelectedPosterId} value={selectedPosterId || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('block_editor.select_poster')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {user.posters.map(poster => (
                                        <SelectItem key={poster.id} value={poster.id}>{isTranslationKey(poster.title) ? t(poster.title) : poster.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedPosterId && (
                            <div className="space-y-2">
                                <Label>{t('poster_page.people')}</Label>
                                <Select onValueChange={(personId) => {
                                    if (personId) {
                                        handleLinkPerson(selectedPosterId, personId);
                                    }
                                    setIsLinkPersonDialogOpen(false);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('chart.select_character')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(user.posters.find(p => p.id === selectedPosterId)?.people || []).map(person => (
                                            <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}


export function BlockEditor({ initialBlocks, onUpdate, scriptId, hideAddButton = false, excludedTypes = [] }: { initialBlocks?: Block[], onUpdate: (blocks: Block[]) => void, scriptId?: string, sectionId?: string, context?: 'journal' | 'script' | 'info', hideAddButton?: boolean, excludedTypes?: BlockType[] }) {
    const safeInitialBlocks = Array.isArray(initialBlocks) ? initialBlocks : [];
    const [blocks, setBlocks] = useState(safeInitialBlocks);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const { t } = useLanguage();
    const { addPlaceToScript, addPlace, addPage } = useScripts();

    useEffect(() => {
        setBlocks(Array.isArray(initialBlocks) ? initialBlocks : []);
    }, [initialBlocks]);

    const debouncedUpdate = useDebouncedCallback(onUpdate, 500);

    const handleUpdate = useCallback((newBlocks: Block[]) => {
      setBlocks(newBlocks);
      debouncedUpdate(newBlocks);
    }, [debouncedUpdate]);

    const filteredBlockTypes = useMemo(() => {
        return SCRIPT_BLOCK_TYPES.filter(bt => !excludedTypes.includes(bt.type));
    }, [excludedTypes]);

    const handleAddBlock = (type: BlockType) => {
        let content: any;

        if (type === 'page') {
            const newPage = addPage(true);
            content = newPage.id;
        } else if (type === 'checklist') {
            content = { text: '', checked: false };
        } else if (type === 'toggle') {
            content = { summary: '', details: [] };
        } else if (type === 'relationship_chart' || type === 'relationship_chart_2') {
            content = { characters: [], relationships: [] };
        } else if (type === 'link') {
            content = { title: '', url: '' };
        } else if (type === 'poster') {
            content = null;
        } else {
            content = '';
        }

        const newBlock: Block = {
            id: `block-${Date.now()}-${Math.random()}`,
            type,
            content,
        };

        const newBlocks = [...blocks, newBlock];
        handleUpdate(newBlocks);
        
        setIsAddMenuOpen(false);
    };

    const handleAddBlockAt = (type: BlockType, atIndex: number) => {
        const newId = `block-${Date.now()}-${Math.random()}`;
        const newBlock: Block = {
            id: newId,
            type,
            content: type === 'checklist' ? { text: '', checked: false } : type === 'toggle' ? { summary: '', details: [] } : type === 'relationship_chart' || type === 'relationship_chart_2' ? { characters: [], relationships: [] } : type === 'link' ? { title: '', url: '' } : type === 'poster' ? null : '',
        };
        const newBlocks = [...blocks];
        newBlocks.splice(atIndex, 0, newBlock);
        handleUpdate(newBlocks);
        
        setTimeout(() => {
            const container = document.querySelector(`[data-block-id="${newId}"]`);
            const target = container?.querySelector('textarea, input') as HTMLElement;
            target?.focus();
        }, 50);
    };

    const handleContentChange = (blockId: string, newContent: any) => {
        const newBlocks = blocks.map(block =>
            block.id === blockId ? { ...block, content: newContent } : block
        );
        handleUpdate(newBlocks);
    };

    const handleDuplicate = (blockId: string) => {
        const index = blocks.findIndex(b => b.id === blockId);
        if (index !== -1) {
            const blockToDuplicate = blocks[index];
            const newBlock = { ...JSON.parse(JSON.stringify(blockToDuplicate)), id: `block-copy-${Date.now()}` };
            const newBlocks = [...blocks];
            newBlocks.splice(index + 1, 0, newBlock);
            handleUpdate(newBlocks);
        }
    };

    const handleDelete = (blockId: string) => {
        handleUpdate(blocks.filter(b => b.id !== blockId));
    };
    
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (over && active.id !== over.id) {
          setBlocks((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const newArray = arrayMove(items, oldIndex, newIndex);
            debouncedUpdate(newArray);
            return newArray;
          });
        }
      }

    return (
        <div className="space-y-1 ml-10 pr-10">
          <DndContext 
             sensors={sensors}
             collisionDetection={closestCenter}
             onDragEnd={handleDragEnd}
             modifiers={[restrictToVerticalAxis]}
            >
            <SortableContext 
                items={blocks}
                strategy={verticalListSortingStrategy}
            >
                {blocks.map((block, idx) => (
                     <SortableBlock 
                        key={block.id} 
                        block={block} 
                        onDelete={() => handleDelete(block.id)}
                        onDuplicate={() => handleDuplicate(block.id)}
                        onClearContent={block.type === 'poster' ? () => handleContentChange(block.id, null) : undefined}
                     >
                        <BlockRenderer 
                            block={block} 
                            onContentChange={(newContent) => handleContentChange(block.id, newContent)}
                            onDelete={handleDelete}
                            onAddBlockBelow={(type) => handleAddBlockAt(type, idx + 1)}
                            scriptId={scriptId}
                            blocks={blocks}
                            index={idx}
                        />
                    </SortableBlock>
                ))}
            </SortableContext>
          </DndContext>

          {!hideAddButton && (
            <Popover open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                <PopoverTrigger asChild>
                <Button variant="ghost" className="mt-4 text-muted-foreground w-full justify-start pl-0 hover:bg-transparent">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    {t('block_editor.add_block')}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                <ScrollArea className="h-72">
                    <div className="grid gap-1">
                    {filteredBlockTypes.map((blockType) => {
                        const Icon = blockType.icon;
                        return (
                        <Button
                            key={blockType.type}
                            variant="ghost"
                            className="justify-start h-9 px-2"
                            onClick={() => handleAddBlock(blockType.type)}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            {t(blockType.label)}
                        </Button>
                        );
                    })}
                    </div>
                </ScrollArea>
                </PopoverContent>
            </Popover>
          )}
        </div>
    )
}
