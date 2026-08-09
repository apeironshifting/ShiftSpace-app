'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, MoreVertical, Copy, Trash2, File, FilePlus, Heart, Star, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { useRouter } from 'next/navigation';
import { useScripts, type Script } from '@/hooks/use-scripts.tsx';
import { useLanguage } from '@/hooks/use-language';
import { isTranslationKey } from '@/lib/utils';
import { useState } from 'react';
import { cn } from '@/lib/utils';
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
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableScriptCard = ({ script, onDelete, onDuplicate }: { script: Script, onDelete: (id: string) => void, onDuplicate: (id: string) => void }) => {
    const { t } = useLanguage();
    const displayTitle = isTranslationKey(script.title) ? t(script.title) : script.title;
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

                {/* 3-dot menu at top right */}
                <div className="absolute top-2 right-2 z-20">
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/50">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
                </div>

                {/* 6-dot drag handle at bottom right */}
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

export default function ScriptsPage() {
  const { scripts, addScript, deleteScript, duplicateScript, addWR, addEmptyScript, addEmptyWR, toggleFavorite, reorderScripts } = useScripts();
  const router = useRouter();
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleNewScript = (type: 'empty') => {
    const newScript = addEmptyScript();
    router.push(`/scripts/${newScript.id}`);
    setIsDialogOpen(false);
  };

  const handleSelectTemplate = (templateId: string) => {
    const newScript = duplicateScript(templateId);
    if(newScript) {
        router.push(`/scripts/${newScript.id}`);
    }
    setIsTemplateSelectorOpen(false);
    setIsDialogOpen(false);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderScripts(active.id as string, over.id as string);
  };

  const mainScripts = scripts.filter(script => !script.isTemplate);
  const favoriteTemplates = scripts.filter(script => script.isTemplate && script.isFavorite);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6">{t('scripts_page.title')}</h1>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <SortableContext 
            items={mainScripts.map(s => s.id)}
            strategy={rectSortingStrategy}
          >
            {mainScripts.map((script) => (
              <SortableScriptCard 
                key={script.id} 
                script={script} 
                onDelete={deleteScript} 
                onDuplicate={duplicateScript} 
              />
            ))}
          </SortableContext>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Card 
              className="border-2 border-dashed hover:border-primary hover:text-primary transition-colors h-full flex flex-col items-center justify-center text-muted-foreground cursor-pointer min-h-[160px]"
              onClick={() => setIsDialogOpen(true)}
              >
                  <CardContent className="p-4 text-center">
                      <PlusCircle className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-semibold">{t('scripts_page.new_script')}</p>
                  </CardContent>
              </Card>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>{t('scripts_page.create_new_script')}</DialogTitle>
                      <DialogDescription>
                         {t('scripts_page.create_new_script_description')}
                      </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                       <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleNewScript('empty')}>
                          <CardHeader>
                              <FilePlus className="w-8 h-8 mb-2 text-primary"/>
                              <CardTitle>{t('scripts_page.create_empty_script')}</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <p className="text-sm text-muted-foreground">{t('scripts_page.create_empty_script_description')}</p>
                          </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsTemplateSelectorOpen(true)}>
                          <CardHeader>
                              <Star className="w-8 h-8 mb-2 text-primary"/>
                              <CardTitle>{t('scripts_page.from_favorite')}</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <p className="text-sm text-muted-foreground">{t('scripts_page.from_favorite_description')}</p>
                          </CardContent>
                      </Card>
                  </div>
              </DialogContent>
          </Dialog>
        </div>
      </DndContext>

      <Dialog open={isTemplateSelectorOpen} onOpenChange={setIsTemplateSelectorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('scripts_page.select_favorite_title')}</DialogTitle>
            <DialogDescription>{t('scripts_page.select_favorite_description')}</DialogDescription>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {favoriteTemplates.length > 0 ? favoriteTemplates.map(template => {
               const displayTitle = isTranslationKey(template.title) ? t(template.title) : template.title;
               return (
                <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSelectTemplate(template.id)}>
                  <CardHeader className="p-0 relative h-24 bg-muted flex items-center justify-center">
                    {template.coverImage ? (
                      <Image
                        src={template.coverImage}
                        alt={displayTitle}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <File className="w-8 h-8 text-muted-foreground" />
                    )}
                  </CardHeader>
                  <CardContent className="p-3">
                    <CardTitle className="text-base font-semibold truncate">{displayTitle}</CardTitle>
                  </CardContent>
                </Card>
               )
            }) : (
              <p className="col-span-2 text-center text-muted-foreground">{t('scripts_page.no_favorites')}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
