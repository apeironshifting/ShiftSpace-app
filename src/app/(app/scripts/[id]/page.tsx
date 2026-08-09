

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
  Check,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useScripts, type Script, type Person, type Possession, type OptionalSection, type Place, Pet } from '@/hooks/use-scripts.tsx';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useTheme, type ThemeId, availableThemes } from '@/hooks/use-theme';
import { Label } from '@/components/ui/label';

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
        className="flex-1 bg-transparent border-0 shadow-none h-auto p-0 focus-visible:ring-0 resize-none overflow-hidden min-h-[24px] pt-1"
        rows={1}
      />
    </div>
  );
};

const PetTemplate = ({ pet, onDuplicate, onDelete, onUpdate }: { pet: Pet; onDuplicate: () => void; onDelete: () => void; onUpdate: (updates: Partial<Pet>) => void; }) => {
  const { t } = useLanguage();
  const displayTitle = isTranslationKey(pet.name) ? t(pet.name) : pet.name;

  return (
  <AccordionItem value={pet.id}>
    <div className="flex items-center group/person w-full">
      <AccordionTrigger className="flex-1">
        <Input 
            value={displayTitle}
            onChange={(e) => onUpdate({ name: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="text-base font-medium bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto"
        />
      </AccordionTrigger>
      <AlertDialog>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 opacity-0 group-hover/person:opacity-100 focus:opacity-100 transition-opacity">
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

const PersonTemplate = ({ person, onDuplicate, onDelete, onUpdate }: { person: Person; onDuplicate: () => void; onDelete: () => void; onUpdate: (updates: Partial<Person>) => void; }) => {
  const { t } = useLanguage();
  const displayTitle = isTranslationKey(person.name) ? t(person.name) : person.name;

  return (
  <AccordionItem value={person.id}>
    <div className="flex items-center group/person w-full">
      <AccordionTrigger className="flex-1">
        <Input 
            value={displayTitle}
            onChange={(e) => onUpdate({ name: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="text-base font-medium bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto"
        />
      </AccordionTrigger>
      <AlertDialog>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 opacity-0 group-hover/person:opacity-100 focus:opacity-100 transition-opacity">
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

const ImageBlock = ({ imageUrl, onImageChange }: { imageUrl: string | null; onImageChange: (url: string) => void }) => {
    const { t } = useLanguage();

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
                <div className="flex items-center gap-2 p-2 border-2 border-dashed rounded-lg text-muted-foreground focus-within:border-primary focus-within:text-primary">
                    <LinkIcon className="w-5 h-5" />
                    <Input
                        placeholder="Paste image URL and press Enter"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onImageChange(e.currentTarget.value);
                                e.preventDefault();
                            }
                        }}
                        className="bg-transparent border-0 shadow-none focus-visible:ring-0 h-auto"
                    />
                </div>
            )}
        </div>
    );
};

function FullScriptContent({ script: currentScript }: { script: Script }) {
  const { updateScript, updateDetail, updateDetailBlocks, updateRelationship, addRelationship, duplicateRelationship, deleteRelationship, updateSO, updateSOBlocks, updateMyLifeBlocks, updatePossession, addPossession, duplicatePossession, deletePossession, addPlaceToScript, updatePlace, deletePlace, updateDefinition, addDefinition, duplicateDefinition, deleteDefinition, updateOptionalSection, addOptionalSection, deleteOptionalSection, updatePet, addPet, duplicatePet, deletePet } = useScripts();
  const [script, setScript] = useState(currentScript);
  const { t } = useLanguage();
  const { theme, setTheme: setGlobalTheme } = useTheme();
  const [isCoverDialog, setIsCoverDialog] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');

  useEffect(() => {
    setScript(currentScript);
  }, [currentScript]);


  const handleUpdate = (updates: Partial<Script>) => {
    if (script) {
      updateScript(script.id, updates);
    }
  };

  const handleScriptThemeChange = (newThemeId: ThemeId) => {
    handleUpdate({ themeId: newThemeId });
  }

  if (!script) {
    return null;
  }
  
  const handleDetailUpdate = (field: keyof Script['details']['about'], value: string) => {
    if (script) {
        updateDetail(script.id, field, value);
    }
  };

  const handleSOUpdate = (field: keyof Script['relationships']['so'], value: string) => {
    if (script) {
        updateSO(script.id, { [field]: value });
    }
  };

  const handleCoverSave = () => {
    handleUpdate({ coverImage: coverUrl });
    setIsCoverDialog(false);
  };
  
  const displayTitle = isTranslationKey(script.title) ? t(script.title) : script.title;

  const availableSectionsToAdd: ('powers' | 'scenarios')[] = ['powers', 'scenarios'].filter(
    sectionId => !script.optionalSections.find(s => s.id === sectionId)
  );
  
  const currentThemeId = script.themeId || theme;


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
                <Button variant="outline" onClick={() => { setCoverUrl(script.coverImage || ''); setIsCoverDialog(true); }}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {t('script_page.change_cover')}
                </Button>
            </div>
          </>
        ) : (
          <div className="bg-muted h-full flex items-center justify-center border-b">
            <Button variant="secondary" onClick={() => { setCoverUrl(''); setIsCoverDialog(true); }}>
                <ImageIcon className="w-4 h-4 mr-2" />
                {t('script_page.add_cover')}
            </Button>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 pt-8">
        <Input
          value={displayTitle}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          className="text-3xl sm:text-4xl font-bold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto"
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
                                onChange={(newValue) => handleDetailUpdate(key as keyof Script['details']['about'], newValue)}
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
                    <Accordion type="multiple" className="w-full">
                        {script.relationships.friends.map(person => (
                            <PersonTemplate 
                                key={person.id} 
                                person={person}
                                onUpdate={(updates) => updateRelationship(script.id, 'friends', person.id, updates)}
                                onDuplicate={() => duplicateRelationship(script.id, 'friends', person.id)}
                                onDelete={() => deleteRelationship(script.id, 'friends', person.id)}
                            />
                        ))}
                    </Accordion>
                    <Button variant="ghost" className="mt-2" onClick={() => addRelationship(script.id, 'friends')}><PlusCircle className="mr-2 h-4 w-4" />{t('script_page.add_person')}</Button>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="family">
                <AccordionTrigger className="text-lg font-semibold">{t('script_page.close_family')}</AccordionTrigger>
                <AccordionContent>
                    <Accordion type="multiple" className="w-full">
                        {script.relationships.family.map(person => (
                            <PersonTemplate 
                                key={person.id} 
                                person={person}
                                onUpdate={(updates) => updateRelationship(script.id, 'family', person.id, updates)}
                                onDuplicate={() => duplicateRelationship(script.id, 'family', person.id)}
                                onDelete={() => deleteRelationship(script.id, 'family', person.id)}
                            />
                        ))}
                    </Accordion>
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
                    <Accordion type="multiple" className="w-full">
                        {script.my_life.possessions.map(possession => (
                             <AccordionItem key={possession.id} value={possession.id}>
                                <div className="flex items-center group/possession w-full">
                                    <AccordionTrigger className="flex-1">
                                      <Input 
                                          value={isTranslationKey(possession.name) ? t(possession.name) : possession.name}
                                          onChange={(e) => updatePossession(script.id, possession.id, { name: e.target.value })}
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-base font-medium bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto"
                                      />
                                    </AccordionTrigger>
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="ml-2 opacity-0 group-hover/possession:opacity-100 focus:opacity-100 transition-opacity">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => duplicatePossession(script.id, possession.id)}>
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
                                          <AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => deletePossession(script.id, possession.id)} className="bg-destructive hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                <AccordionContent>
                                    <BlockEditor scriptId={script.id} initialBlocks={possession.description || []} onUpdate={(newBlocks) => updatePossession(script.id, possession.id, { description: newBlocks })} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <Button variant="ghost" className="mt-2" onClick={() => addPossession(script.id)}><PlusCircle className="mr-2 h-4 w-4" />{t('script_page.add_object')}</Button>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pets">
                <AccordionTrigger className="text-lg font-semibold">{t('script_page.pets')}</AccordionTrigger>
                <AccordionContent>
                     <Accordion type="multiple" className="w-full">
                        {(script.my_life.pets || []).map(pet => (
                           <PetTemplate
                                key={pet.id}
                                pet={pet}
                                onUpdate={(updates) => updatePet(script.id, pet.id, updates)}
                                onDuplicate={() => duplicatePet(script.id, pet.id)}
                                onDelete={() => deletePet(script.id, pet.id)}
                           />
                        ))}
                    </Accordion>
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
        <Accordion type="multiple" className="w-full space-y-4">
            {script.definitions.map(def => (
                <AccordionItem key={def.id} value={def.id}>
                    <div className="flex items-center group w-full">
                        <AccordionTrigger className="flex-1">
                            <Input 
                                value={isTranslationKey(def.title) ? t(def.title) : def.title}
                                onChange={(e) => updateDefinition(script.id, def.id, { title: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                className="text-lg font-semibold bg-transparent border-0 shadow-none p-0 focus-visible:ring-0 h-auto"
                            />
                        </AccordionTrigger>
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"><MoreVertical /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => duplicateDefinition(script.id, def.id)}><Copy className="mr-2 h-4 w-4" />{t('common.duplicate')}</DropdownMenuItem>
                                    <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />{t('common.delete')}</DropdownMenuItem></AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle><AlertDialogDescription>{t('script_page.delete_section_description')}</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => deleteDefinition(script.id, def.id)}>{t('common.delete')}</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <AccordionContent>
                        <BlockEditor scriptId={script.id} initialBlocks={def.blocks || []} onUpdate={(newBlocks) => updateDefinition(script.id, def.id, { blocks: newBlocks })} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
        <Button variant="ghost" onClick={() => addDefinition(script.id)}><PlusCircle className="mr-2 h-4 w-4" />{t('script_page.add_definition')}</Button>

        <ImageBlock imageUrl={script.imageAfterEnd || null} onImageChange={(url) => handleUpdate({ imageAfterEnd: url })} />

      </main>
      <Dialog open={isCoverDialog} onOpenChange={setIsCoverDialog}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Update Cover Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                  <Label htmlFor="coverUrl">Image URL</Label>
                  <Input id="coverUrl" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
              </div>
              <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsCoverDialog(false)}>Cancel</Button>
                  <Button onClick={handleCoverSave}>Save</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
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
    } else if (scripts.length > 0 && id !== 'new') {
      // router.push('/scripts'); // Optional: redirect if script not found
    }
  }, [id, scripts, router]);

  if (!script) {
    return null; // or a loading skeleton
  }

  return <FullScriptContent script={script} />;
}
