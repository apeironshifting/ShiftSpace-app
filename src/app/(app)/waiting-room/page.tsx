
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, MoreVertical, Copy, Trash2, File, Heart, Lock, Unlock, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useRouter } from 'next/navigation';
import { useScripts, type Script } from '@/hooks/use-scripts.tsx';
import { useLanguage } from '@/hooks/use-language';
import { isTranslationKey } from '@/lib/utils';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TemplateCard = ({ 
    script, 
    onDelete, 
    onDuplicate, 
    onToggleFavorite, 
    onToggleVisibility 
}: { 
    script: Script, 
    onDelete: (id: string) => void, 
    onDuplicate: (id: string) => void, 
    onToggleFavorite: (id: string) => void, 
    onToggleVisibility: (id: string) => void 
}) => {
    const { t } = useLanguage();
    const { user } = useUser();
    const displayTitle = isTranslationKey(script.title) ? t(script.title) : script.title;
    const isOwnTemplate = script.userId === user.id;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: script.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className={cn("relative group h-full", isDragging && "opacity-50")}>
            <Card className="overflow-hidden transition-transform transform-gpu hover:-translate-y-1 hover:shadow-xl h-full flex flex-col relative">
                <Link href={`/scripts/${script.id}`} className="flex flex-col flex-1">
                    <CardHeader className="p-0 relative h-32 bg-muted flex items-center justify-center">
                        {script.coverImage ? (
                            <Image
                                src={script.coverImage}
                                alt={displayTitle}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover"
                                data-ai-hint={script.coverImageHint}
                            />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                                <File className="w-10 h-10" />
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-4 flex-1">
                        <CardTitle className="text-lg font-semibold">{displayTitle || t('defaults.untitled_script')}</CardTitle>
                    </CardContent>
                </Link>

                {/* Top Right Management Cluster */}
                <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                    <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/50" 
                        onClick={(e) => { e.preventDefault(); onToggleFavorite(script.id); }}
                    >
                        <Heart className={cn("w-4 h-4", script.isFavorite ? "fill-red-500 text-red-500" : "text-foreground")} />
                    </Button>

                    {isOwnTemplate && (
                        <div className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/50 flex items-center justify-center text-foreground/60">
                            {script.isPublic ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </div>
                    )}

                    {isOwnTemplate && (
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/50">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onToggleVisibility(script.id)}>
                                        {script.isPublic ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                                        {script.isPublic ? t('common.make_private') : t('common.make_public')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDuplicate(script.id)}>
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
                                        {t('scripts_page.delete_description', { title: displayTitle })}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(script.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        {t('common.delete')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>

                {/* Bottom Right Drag Handle */}
                {isOwnTemplate && (
                    <div className="absolute bottom-2 right-2 z-20">
                        <button 
                            {...attributes} 
                            {...listeners} 
                            className="h-8 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-primary transition-colors bg-background/80 backdrop-blur-sm rounded-full shadow-sm border border-border/50"
                        >
                            <GripVertical className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
};


export default function WaitingRoomPage() {
  const { scripts, deleteScript, duplicateScript, addEmptyWR, toggleFavorite, updateScript, reorderScripts } = useScripts();
  const { user } = useUser();
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("my-templates");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleNewWR = () => {
    const newWR = addEmptyWR();
    router.push(`/scripts/${newWR.id}`);
  };

  const handleToggleVisibility = (id: string) => {
    const script = scripts.find(s => s.id === id);
    if (script) {
        updateScript(id, { isPublic: !script.isPublic });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderScripts(active.id as string, over.id as string);
  };

  const myTemplates = scripts.filter(script => script.isTemplate && script.userId === user.id);
  const likedTemplates = scripts.filter(script => script.isTemplate && script.userId !== user.id && script.isFavorite);

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('dashboard.my_templates')}</h1>
        <p className="text-muted-foreground mb-6">{t('waiting_room.description')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-templates">{t('waiting_room.my_templates')}</TabsTrigger>
                <TabsTrigger value="liked">{t('waiting_room.liked')}</TabsTrigger>
            </TabsList>
            <TabsContent value="my-templates" className="mt-4">
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        <SortableContext 
                            items={myTemplates.map(s => s.id)}
                            strategy={rectSortingStrategy}
                        >
                            {myTemplates.map((script) => (
                                <TemplateCard 
                                    key={script.id} 
                                    script={script} 
                                    onDelete={deleteScript} 
                                    onDuplicate={duplicateScript} 
                                    onToggleFavorite={toggleFavorite}
                                    onToggleVisibility={handleToggleVisibility}
                                />
                            ))}
                        </SortableContext>
                        <Card 
                            className="border-2 border-dashed hover:border-primary hover:text-primary transition-colors h-full flex flex-col items-center justify-center text-muted-foreground cursor-pointer min-h-[160px]"
                            onClick={handleNewWR}
                        >
                            <CardContent className="p-4 text-center">
                            <PlusCircle className="w-12 h-12 mx-auto mb-2" />
                            <p className="font-semibold">{t('templates_page.create_new')}</p>
                            </CardContent>
                        </Card>
                    </div>
                </DndContext>
            </TabsContent>
            <TabsContent value="liked" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {likedTemplates.length > 0 ? (
                        likedTemplates.map((script) => (
                            <TemplateCard 
                                key={script.id} 
                                script={script} 
                                onDelete={deleteScript} 
                                onDuplicate={duplicateScript} 
                                onToggleFavorite={toggleFavorite}
                                onToggleVisibility={handleToggleVisibility}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">{t('waiting_room.no_liked_templates')}</p>
                        </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
