'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { initialScriptsForHydration, defaultScriptTemplate, defaultPerson, defaultPossession, defaultOptionalSection, defaultSODetails, defaultPet, emptyScriptTemplate, wrScriptTemplate, defaultPlace, defaultPage } from '@/lib/data';
import { isTranslationKey } from '@/lib/utils';
import { useLanguage } from './use-language';
import { useDebouncedCallback } from './use-debounced-callback';
import { CheckSquare, ChevronRight, Heading1, Heading2, Heading3, ImageIcon, Info, List, ListOrdered, Minus, Music, Package, PlusCircle, Quote, Type, File, Users, Link as LinkIcon, RectangleHorizontal } from 'lucide-react';
import { useUser, type User } from './use-user';
import { ThemeId } from './use-theme';
import {
  fetchAppData,
  saveAppData,
  findOrCreateConversation as dbFindOrCreateConversation,
  addMessage as dbAddMessage,
  markMessagesAsRead,
  deleteConversation as dbDeleteConversation,
} from '@/lib/supabase/app-data';
import { arrayMove } from '@dnd-kit/sortable';
import { getWelcomeConversation } from '@/lib/chat-data';

export type BlockType = 
    | 'text' | 'h1' | 'h2' | 'h3' | 'bulleted-list' | 'numbered-list' | 'checklist' 
    | 'toggle' | 'quote' | 'callout' | 'divider' | 'places_grid' | 'possessions_list' | 'about_me_list' | 'definitions_list' | 'add_section' | 'relationship_chart' | 'relationship_chart_2' | 'spotify' | 'image'
    | 'link' | 'poster' | 'page';

export type RelationshipChartCharacter = {
  id: string;
  name: string;
  avatar: string | null;
  x: number;
  y: number;
  fullName?: string;
  linkedPerson?: {
    posterId: string;
    personId: string;
  } | null;
};

export type RelationshipType =
  | 'siblings' | 'lovers' | 'complicated' | 'other' | 'related' | 'parent/child' | 'cousins' | 'coparenting' | 'former partners' | 'sexual partners' | 'both way crush' | 'one way crush' | 'friends' | 'best friends' | 'dislike each others' | 'enemies' | 'know each other' | 'related by blood' | 'chosen family' | 'married' | 'engaged' | 'rival' | 'ok with…' | 'hook up/flirting';

export type RelationshipChartLink = {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
};

export type Block = {
  id: string;
  type: BlockType;
  content: any;
  scriptId?: string;
};

export type OptionalSection = {
  id: string;
  title: string;
  blocks: Block[];
}

export const SCRIPT_BLOCK_TYPES: { type: BlockType, label: string, icon: React.ComponentType<any> }[] = [
    { type: 'text', label: 'block_editor.text', icon: Type },
    { type: 'image', label: 'block_editor.image', icon: ImageIcon },
    { type: 'page', label: 'block_editor.page', icon: File },
    { type: 'h1', label: 'block_editor.heading_1', icon: Heading1 },
    { type: 'h2', label: 'block_editor.heading_2', icon: Heading2 },
    { type: 'h3', label: 'block_editor.heading_3', icon: Heading3 },
    { type: 'bulleted-list', label: 'block_editor.bulleted_list', icon: List },
    { type: 'numbered-list', label: 'block_editor.numbered_list', icon: ListOrdered },
    { type: 'checklist', label: 'block_editor.checklist', icon: CheckSquare },
    { type: 'toggle', label: 'block_editor.toggle', icon: ChevronRight },
    { type: 'spotify', label: 'block_editor.spotify', icon: Music },
    { type: 'link', label: 'block_editor.link', icon: LinkIcon },
    { type: 'poster', label: 'block_editor.poster', icon: RectangleHorizontal },
    { type: 'quote', label: 'block_editor.quote', icon: Quote },
    { type: 'callout', label: 'block_editor.callout', icon: Info },
    { type: 'divider', label: 'block_editor.divider', icon: Minus },
    { type: 'places_grid', label: 'block_editor.window_menu', icon: Package },
    { type: 'relationship_chart', label: 'block_editor.relationship_chart', icon: Users },
    { type: 'relationship_chart_2', label: 'block_editor.relationship_chart_2', icon: Users },
];


export type Place = {
  id: string;
  name: string;
  description: Block[];
  coverImage: string;
  coverImageHint: string;
  themeId?: ThemeId;
};

export type Page = {
  id: string;
  name: string;
  description: Block[];
  coverImage: string;
  coverImageHint: string;
  themeId?: ThemeId;
};

export type Person = {
  id: string;
  name: string;
  pronouns: string;
  nickname: string;
  relationship: string;
  content: Block[];
};

export type Pet = {
    id: string;
    name: string;
    sex: string;
    species: string;
    age: string;
    size: string;
    personality: string;
    extras: string;
};


export type Possession = {
  id: string;
  name: string;
  description: Block[];
}

export type AboutMeDetails = {
    name: string;
    nickname: string;
    pronouns: string;
    sex: string;
    gender: string;
    age: string;
    birthday: string;
    birthplace: string;
    height: string;
    sexuality: string;
    smell: string;
    species: string;
}

export type SODetails = {
  id: string;
  name: string;
  age: string;
  birthday: string;
  birthplace: string;
  species: string;
  pronouns: string;
  sex: string;
  gender: string;
  sexuality: string;
  height: string;
  are_we_together: string;
  relationship_dynamic: string;
  nicknames: string;
  backstory: Block[];
  personality: Block[];
  our_story: Block[];
  physical_appearance: Block[];
  extra_content: Block[];
}


export type Script = {
  id: string;
  userId: string;
  title: string;
  isTemplate: boolean;
  isPublic: boolean;
  isFavorite: boolean;
  color?: string;
  coverImage: string;
  coverImageHint: string;
  playlistUrl: string;
  themeId?: ThemeId;
  imageAfterMe: string | null;
  imageAfterRelationships: string | null;
  imageAfterMyLife: string | null;
  imageAfterLive: string | null;
  imageAfterDefinitions: string | null;
  imageAfterEnd: string | null;
  details: {
    about: AboutMeDetails,
    backstory: Block[],
    physical_appearance: Block[],
  };
  relationships: {
    friends: Person[],
    family: Person[],
    so: SODetails,
  },
  my_life: {
    possessions: Possession[],
    pets: Pet[],
    aesthetic: Block[],
  },
  liveDescription: Block[];
  places: Place[];
  definitions: OptionalSection[];
  optionalSections: OptionalSection[];
  extraContent: Block[];
  isEmpty?: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
};

export type Conversation = {
  id: string;
  participantIds: string[];
  messages: Message[];
};

export type JournalEntry = {
  id: string;
  userId: string;
  title: string;
  date: string;
  content: Block[];
  isPublic: boolean;
  likes: number;
  comments: any[];
  likedBy: string[];
};

interface ScriptContextType {
  scripts: Script[];
  users: User[];
  addScript: () => Script;
  addEmptyScript: () => Script;
  addWR: () => Script;
  addEmptyWR: () => Script;
  updateScript: (id: string, updates: Partial<Script>) => void;
  deleteScript: (id: string) => void;
  duplicateScript: (id: string) => Script | undefined;
  reorderScripts: (activeId: string, overId: string) => void;
  toggleFavorite: (id: string) => void;
  
  updateDetail: (scriptId: string, field: keyof AboutMeDetails, value: string) => void;
  updateDetailBlocks: (scriptId: string, section: keyof Omit<Script['details'], 'about'>, blocks: Block[]) => void;
  
  updateRelationship: (scriptId: string, type: 'friends' | 'family', personId: string, updates: Partial<Person>) => void;
  addRelationship: (scriptId: string, type: 'friends' | 'family') => void;
  duplicateRelationship: (scriptId: string, type: 'friends' | 'family', personId: string) => void;
  deleteRelationship: (scriptId: string, type: 'friends' | 'family', personId: string) => void;
  reorderRelationship: (scriptId: string, type: 'friends' | 'family', activeId: string, overId: string) => void;
  updateSO: (scriptId: string, updates: Partial<Script['relationships']['so']>) => void;
  updateSOBlocks: (scriptId: string, section: 'backstory' | 'personality' | 'our_story' | 'physical_appearance' | 'extra_content', blocks: Block[]) => void;

  updateMyLifeBlocks: (scriptId: string, section: 'aesthetic', blocks: Block[]) => void;
  updatePossession: (scriptId: string, possessionId: string, updates: Partial<Possession>) => void;
  addPossession: (scriptId: string) => void;
  duplicatePossession: (scriptId: string, possessionId: string) => void;
  deletePossession: (scriptId: string, possessionId: string) => void;
  reorderPossession: (scriptId: string, activeId: string, overId: string) => void;
  
  updatePet: (scriptId: string, petId: string, updates: Partial<Pet>) => void;
  addPet: (scriptId: string) => void;
  duplicatePet: (scriptId: string, petId: string) => void;
  deletePet: (scriptId: string, petId: string) => void;
  reorderPet: (scriptId: string, activeId: string, overId: string) => void;
  
  places: Place[];
  addPlace: (immediate?: boolean) => Place;
  updatePlace: (placeId: string, updates: Partial<Place>) => void;
  deletePlace: (placeId: string) => void;
  duplicatePlace: (placeId: string) => Place | undefined;

  pages: Page[];
  addPage: (immediate?: boolean) => Page;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;

  addPlaceToScript: (scriptId: string, immediate?: boolean) => Place;
  updatePlaceInScript: (scriptId: string, placeId: string, updates: Partial<Place>) => void;
  deletePlaceFromScript: (scriptId: string, placeId: string) => void;
  duplicatePlaceInScript: (scriptId: string, placeId: string) => Place | undefined;

  updateDefinition: (scriptId: string, sectionId: string, updates: Partial<OptionalSection>) => void;
  addDefinition: (scriptId: string) => void;
  duplicateDefinition: (scriptId: string, sectionId: string) => void;
  deleteDefinition: (scriptId: string, sectionId: string) => void;
  reorderDefinition: (scriptId: string, activeId: string, overId: string) => void;

  updateOptionalSection: (scriptId: string, sectionId: string, updates: Partial<OptionalSection>) => void;
  addOptionalSection: (scriptId: string, type: 'powers' | 'scenarios') => void;
  deleteOptionalSection: (scriptId: string, sectionId: string) => void;

  journalEntries: JournalEntry[];
  addJournalEntry: () => JournalEntry;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  toggleJournalEntryVisibility: (id: string) => void;
  toggleJournalLike: (journalId: string) => void;
  
  conversations: Conversation[];
  findUserById: (userId: string) => User | undefined;
  findUserByUsername: (username: string) => User | undefined;
  findOrCreateConversation: (otherUserId: string) => Promise<Conversation>;
  addMessageToConversation: (conversationId: string, text: string) => void;
  deleteConversation: (conversationId: string) => void;
  markConversationAsRead: (conversationId: string) => void;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

type AppState = {
  scripts: Script[];
  journalEntries: JournalEntry[];
  places: Place[];
  pages: Page[];
  conversations: Conversation[];
};

export function ScriptProvider({ children }: { children: React.ReactNode }) {
  const { user, users } = useUser();
  const [undoableState, setUndoableState] = useState<{history: AppState[], currentIndex: number}>({
    history: [{ scripts: [], journalEntries: [], places: [], pages: [], conversations: [] }],
    currentIndex: 0
  });
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLanguage();

  const { history, currentIndex } = undoableState;
  const appState = history[currentIndex];
  const scripts = appState.scripts;
  const journalEntries = appState.journalEntries || [];
  const places = appState.places || [];
  const pages = appState.pages || [];
  const conversations = appState.conversations || [];
  
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  useEffect(() => {
    setIsMounted(true);
    const loadState = async () => {
      if (!user.id || user.id === 'default-user') {
        setUndoableState({ history: [{ scripts: [], journalEntries: [], places: [], pages: [], conversations: [] }], currentIndex: 0 });
        return;
      }

      try {
        const savedState = await fetchAppData(user.id);

        const hasApeiron = savedState.conversations.some(
          (c) => c.participantIds.includes('apeiron-user') && c.participantIds.includes(user.id)
        );
        if (!hasApeiron) {
          savedState.conversations.push(getWelcomeConversation(user.id));
        }

        setUndoableState({ history: [savedState], currentIndex: 0 });
      } catch (error) {
        console.error("Failed to load app state", error);
      }
    };
    loadState();
  }, [user.id]);

  const debouncedSave = useDebouncedCallback(async (stateToSave: AppState) => {
    if (!user.id || user.id === 'default-user') return;
    await saveAppData(user.id, {
      scripts: stateToSave.scripts,
      journalEntries: stateToSave.journalEntries,
      places: stateToSave.places,
      pages: stateToSave.pages,
    });
  }, 1000);

  useEffect(() => {
    if (isMounted && user.id && user.id !== 'default-user') {
      debouncedSave(appState);
    }
  }, [appState.scripts, appState.journalEntries, appState.places, appState.pages, isMounted, user.id, debouncedSave]);

  const setState = useCallback((updater: (prevState: AppState) => AppState, immediate = false) => {
    setUndoableState(current => {
      const prevState = current.history[current.currentIndex];
      const newState = updater(prevState);
      const newHistory = [...current.history.slice(0, current.currentIndex + 1), newState];

      if (immediate && user.id && user.id !== 'default-user') {
        saveAppData(user.id, {
          scripts: newState.scripts,
          journalEntries: newState.journalEntries,
          places: newState.places,
          pages: newState.pages,
        });
      }
      
      return {
        history: newHistory,
        currentIndex: newHistory.length - 1
      };
    });
  }, [user.id]);
  
  const addScript = () => {
    let newScript: Script | undefined;
    setState(prev => {
        newScript = {
            ...JSON.parse(JSON.stringify(defaultScriptTemplate)),
            id: `script-${Date.now()}`,
            userId: user.id,
            title: 'defaults.new_script',
            isTemplate: false,
        };
        return { ...prev, scripts: [...prev.scripts, newScript!] };
    }, true);
    return newScript!;
  };
  
  const addEmptyScript = () => {
    let newScript: Script | undefined;
    setState(prev => {
        newScript = {
            ...JSON.parse(JSON.stringify(emptyScriptTemplate)),
            id: `script-${Date.now()}`,
            userId: user.id,
            title: 'defaults.new_script',
            isTemplate: false,
            isEmpty: true,
        };
        return { ...prev, scripts: [...prev.scripts, newScript!] };
    }, true);
    return newScript!;
  };

   const addWR = () => {
    let newScript: Script | undefined;
    setState(prev => {
        newScript = {
            ...JSON.parse(JSON.stringify(wrScriptTemplate)),
            id: `script-${Date.now()}`,
            userId: user.id,
            title: 'defaults.template',
            isTemplate: true,
            isEmpty: true,
        };
        return { ...prev, scripts: [...prev.scripts, newScript!] };
    }, true);
    return newScript!;
  };

  const addEmptyWR = () => {
    let newScript: Script | undefined;
    setState(prev => {
        newScript = {
            ...JSON.parse(JSON.stringify(emptyScriptTemplate)),
            id: `script-${Date.now()}`,
            userId: user.id,
            title: 'defaults.template',
            isTemplate: true,
            isEmpty: true,
        };
        return { ...prev, scripts: [...prev.scripts, newScript!] };
    }, true);
    return newScript!;
  };

  const updateScript = (id: string, updates: Partial<Script>) => {
    setState(prev => ({
        ...prev,
        scripts: prev.scripts.map(script =>
            script.id === id ? { ...script, ...updates } : script
        )
    }));
  };
  
  const deleteScript = (id: string) => {
    setState(prev => ({ ...prev, scripts: prev.scripts.filter(script => script.id !== id) }), true);
  };
  
  const duplicateScript = (id: string): Script | undefined => {
    let newScript: Script | undefined;
    setState(prev => {
        const scriptToDuplicate = prev.scripts.find(s => s.id === id);
        if (scriptToDuplicate) {
            const originalTitle = isTranslationKey(scriptToDuplicate.title) ? t(scriptToDuplicate.title) : scriptToDuplicate.title;
            newScript = {
                ...JSON.parse(JSON.stringify(scriptToDuplicate)),
                id: `script-${Date.now()}`,
                userId: user.id,
                title: `${originalTitle} (${t('common.copy')})`.slice(0, 25),
                isTemplate: false,
            };
            return { ...prev, scripts: [...prev.scripts, newScript] };
        }
        return prev;
    }, true);
    return newScript;
  };

  const reorderScripts = (activeId: string, overId: string) => {
    setState(prev => {
      const oldIndex = prev.scripts.findIndex(s => s.id === activeId);
      const newIndex = prev.scripts.findIndex(s => s.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        return {
          ...prev,
          scripts: arrayMove(prev.scripts, oldIndex, newIndex)
        };
      }
      return prev;
    }, true);
  };

  const toggleFavorite = (id: string) => {
    setState(prev => ({
        ...prev,
        scripts: prev.scripts.map(script =>
            script.id === id ? { ...script, isFavorite: !script.isFavorite } : script
        )
    }), true);
  };

  const updateDetail = (scriptId: string, field: keyof AboutMeDetails, value: string) => {
    setState(prev => ({
        ...prev,
        scripts: prev.scripts.map(s => {
            if (s.id === scriptId) {
                const newAbout = { ...s.details.about, [field]: value };
                return { ...s, details: { ...s.details, about: newAbout } };
            }
            return s;
        })
    }));
  }

  const updateDetailBlocks = (scriptId: string, section: keyof Omit<Script['details'], 'about'>, blocks: Block[]) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  const newDetails = { ...s.details, [section]: blocks || [] };
                  return { ...s, details: newDetails };
              }
              return s;
          })
      }));
  }
  
  const addRelationship = (scriptId: string, type: 'friends' | 'family') => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  const newPerson = { ...JSON.parse(JSON.stringify(defaultPerson)), id: `${type}-${Date.now()}` };
                  const list = s.relationships[type] || [];
                  return { ...s, relationships: { ...s.relationships, [type]: [...list, newPerson] }};
              }
              return s;
          })
      }), true);
  }

  const updateRelationship = (scriptId: string, type: 'friends' | 'family', personId: string, updates: Partial<Person>) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                const updatedList = s.relationships[type].map(p => p.id === personId ? { ...p, ...updates } : p);
                return { ...s, relationships: { ...s.relationships, [type]: updatedList }};
              }
              return s;
          })
      }));
  }

  const duplicateRelationship = (scriptId: string, type: 'friends' | 'family', personId: string) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  const list = s.relationships[type];
                  const personToDuplicate = list.find(p => p.id === personId);
                  if (personToDuplicate) {
                      const originalName = isTranslationKey(personToDuplicate.name) ? t(personToDuplicate.name) : personToDuplicate.name;
                      const newPerson = {
                          ...JSON.parse(JSON.stringify(personToDuplicate)),
                          id: `${type}-copy-${Date.now()}`,
                          name: `${originalName} (${t('common.copy')})`.slice(0, 25),
                      };
                      const personIndex = list.findIndex(p => p.id === personId);
                      const newList = [...list];
                      newList.splice(personIndex + 1, 0, newPerson);
                      return { ...s, relationships: { ...s.relationships, [type]: newList }};
                  }
              }
              return s;
          })
      }), true);
  }

  const deleteRelationship = (scriptId: string, type: 'friends' | 'family', personId: string) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                const newList = s.relationships[type].filter(p => p.id !== personId);
                return { ...s, relationships: { ...s.relationships, [type]: newList }};
              }
              return s;
          })
      }), true);
  }

  const reorderRelationship = (scriptId: string, type: 'friends' | 'family', activeId: string, overId: string) => {
    setState(prev => ({
      ...prev,
      scripts: prev.scripts.map(s => {
        if (s.id === scriptId) {
          const list = s.relationships[type];
          const oldIndex = list.findIndex(p => p.id === activeId);
          const newIndex = list.findIndex(p => p.id === overId);
          if (oldIndex !== -1 && newIndex !== -1) {
            return {
              ...s,
              relationships: {
                ...s.relationships,
                [type]: arrayMove(list, oldIndex, newIndex)
              }
            };
          }
        }
        return s;
      })
    }));
  };
  
  const updateSO = (scriptId: string, updates: Partial<Script['relationships']['so']>) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  return { ...s, relationships: { ...s.relationships, so: { ...s.relationships.so, ...updates } }};
              }
              return s;
          })
      }));
  }

  const updateSOBlocks = (scriptId: string, section: 'backstory' | 'personality' | 'our_story' | 'physical_appearance' | 'extra_content', blocks: Block[]) => {
       setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  return { ...s, relationships: { ...s.relationships, so: { ...s.relationships.so, [section]: blocks || [] } }};
              }
              return s;
          })
      }));
  }
  
  const updateMyLifeBlocks = (scriptId: string, section: 'aesthetic', blocks: Block[]) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  return { ...s, my_life: { ...s.my_life, [section]: blocks || [] }};
              }
              return s;
          })
      }));
  }
  
  const addPossession = (scriptId: string) => {
       setState(prev => ({
           ...prev,
           scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  const newPossession = { ...defaultPossession, id: `possession-${Date.now()}` };
                  return { ...s, my_life: { ...s.my_life, possessions: [...s.my_life.possessions, newPossession] }};
              }
              return s;
          })
      }), true);
  }

  const updatePossession = (scriptId: string, possessionId: string, updates: Partial<Possession>) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  const updatedList = s.my_life.possessions.map(p => p.id === possessionId ? { ...p, ...updates } : p);
                  return { ...s, my_life: { ...s.my_life, possessions: updatedList }};
              }
              return s;
          })
      }));
  }

  const duplicatePossession = (scriptId: string, possessionId: string) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  const list = s.my_life.possessions;
                  const possessionToDuplicate = list.find(p => p.id === possessionId);
                  if (possessionToDuplicate) {
                      const originalName = isTranslationKey(possessionToDuplicate.name) ? t(possessionToDuplicate.name) : possessionToDuplicate.name;
                      const newPossession = {
                          ...JSON.parse(JSON.stringify(possessionToDuplicate)),
                          id: `possession-copy-${Date.now()}`,
                          name: `${originalName} (${t('common.copy')})`.slice(0, 25),
                      };
                      const possessionIndex = list.findIndex(p => p.id === possessionId);
                      const newList = [...list];
                      newList.splice(possessionIndex + 1, 0, newPossession);
                      return { ...s, my_life: { ...s.my_life, possessions: newList }};
                  }
              }
              return s;
          })
      }), true);
  }

  const deletePossession = (scriptId: string, possessionId: string) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  const newList = s.my_life.possessions.filter(p => p.id !== possessionId);
                  return { ...s, my_life: { ...s.my_life, possessions: newList }};
              }
              return s;
          })
      }), true);
  }

  const reorderPossession = (scriptId: string, activeId: string, overId: string) => {
    setState(prev => ({
      ...prev,
      scripts: prev.scripts.map(s => {
        if (s.id === scriptId) {
          const list = s.my_life.possessions;
          const oldIndex = list.findIndex(p => p.id === activeId);
          const newIndex = list.findIndex(p => p.id === overId);
          if (oldIndex !== -1 && newIndex !== -1) {
            return {
              ...s,
              my_life: {
                ...s.my_life,
                possessions: arrayMove(list, oldIndex, newIndex)
              }
            };
          }
        }
        return s;
      })
    }));
  };

  const addPet = (scriptId: string) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  const newPet = { ...JSON.parse(JSON.stringify(defaultPet)), id: `pet-${Date.now()}` };
                  const list = s.my_life.pets || [];
                  return { ...s, my_life: { ...s.my_life, pets: [...list, newPet] }};
              }
              return s;
          })
      }), true);
  }

  const updatePet = (scriptId: string, petId: string, updates: Partial<Pet>) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  const updatedList = s.my_life.pets.map(p => p.id === petId ? { ...p, ...updates } : p);
                  return { ...s, my_life: { ...s.my_life, pets: updatedList }};
              }
              return s;
          })
      }));
  }

  const duplicatePet = (scriptId: string, petId: string) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  const list = s.my_life.pets;
                  const petToDuplicate = list.find(p => p.id === petId);
                  if (petToDuplicate) {
                      const originalName = isTranslationKey(petToDuplicate.name) ? t(petToDuplicate.name) : petToDuplicate.name;
                      const newPet = {
                          ...JSON.parse(JSON.stringify(petToDuplicate)),
                          id: `pet-copy-${Date.now()}`,
                          name: `${originalName} (${t('common.copy')})`.slice(0, 25),
                      };
                      const petIndex = list.findIndex(p => p.id === petId);
                      const newList = [...list];
                      newList.splice(petIndex + 1, 0, newPet);
                      return { ...s, my_life: { ...s.my_life, pets: newList }};
                  }
              }
              return s;
          })
      }), true);
  }

  const deletePet = (scriptId: string, petId: string) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  const newList = s.my_life.pets.filter(p => p.id !== petId);
                  return { ...s, my_life: { ...s.my_life, pets: newList }};
              }
              return s;
          })
      }), true);
  }

  const reorderPet = (scriptId: string, activeId: string, overId: string) => {
    setState(prev => ({
      ...prev,
      scripts: prev.scripts.map(s => {
        if (s.id === scriptId) {
          const list = s.my_life.pets;
          const oldIndex = list.findIndex(p => p.id === activeId);
          const newIndex = list.findIndex(p => p.id === overId);
          if (oldIndex !== -1 && newIndex !== -1) {
            return {
              ...s,
              my_life: {
                ...s.my_life,
                pets: arrayMove(list, oldIndex, newIndex)
              }
            };
          }
        }
        return s;
      })
    }));
  };

    const addPlace = (immediate = false): Place => {
        const newPlace: Place = { ...defaultPlace, id: `place-${Date.now()}` };
        setState(prev => {
            return { ...prev, places: [...(prev.places || []), newPlace] };
        }, immediate);
        return newPlace;
    };
  
    const updatePlace = (placeId: string, updates: Partial<Place>) => {
        setState(prev => ({
            ...prev,
            places: (prev.places || []).map(p => p.id === placeId ? {...p, ...updates} : p)
        }));
    };

    const deletePlace = (placeId: string) => {
        setState(prev => ({
            ...prev,
            places: (prev.places || []).filter(p => p.id !== placeId)
        }), true);
    };

    const duplicatePlace = (placeId: string): Place | undefined => {
        const placeToDuplicate = history[currentIndex].places.find(p => p.id === placeId);
        if (!placeToDuplicate) return undefined;
        
        const originalName = isTranslationKey(placeToDuplicate.name) ? t(placeToDuplicate.name) : placeToDuplicate.name;
        const newPlace: Place = {
            ...JSON.parse(JSON.stringify(placeToDuplicate)),
            id: `place-${Date.now()}`,
            name: `${originalName} (${t('common.copy')})`.slice(0, 25)
        };

        setState(prev => {
            const placeIndex = (prev.places || []).findIndex(p => p.id === placeId);
            const newPlaces = [...(prev.places || [])];
            if (placeIndex > -1) {
                newPlaces.splice(placeIndex + 1, 0, newPlace);
            } else {
                newPlaces.push(newPlace);
            }
            return { ...prev, places: newPlaces };
        }, true);
        
        return newPlace;
    };

  const addPage = (immediate = false): Page => {
      const newPage: Page = { ...defaultPage, id: `page-${Date.now()}` };
      setState(prev => {
          return { ...prev, pages: [...(prev.pages || []), newPage] };
      }, immediate);
      return newPage;
  };

  const updatePage = (pageId: string, updates: Partial<Page>) => {
      setState(prev => ({
          ...prev,
          pages: (prev.pages || []).map(p => p.id === pageId ? {...p, ...updates} : p)
      }));
  };

  const deletePage = (pageId: string) => {
      setState(prev => ({
          ...prev,
          pages: (prev.pages || []).filter(p => p.id !== pageId)
      }), true);
  };

  const addPlaceToScript = (scriptId: string, immediate = false): Place => {
    const newPlace: Place = {
        id: `place-${Date.now()}`,
        name: 'defaults.new_page',
        description: [],
        coverImage: '',
        coverImageHint: '',
    };
    setState(prev => {
        const newScripts = prev.scripts.map(script => {
            if (script.id === scriptId) {
                return {
                    ...script,
                    places: [...script.places, newPlace],
                };
            }
            return script;
        });
        return { ...prev, scripts: newScripts };
    }, immediate);
    return newPlace;
};

  const updatePlaceInScript = (scriptId: string, placeId: string, updates: Partial<Place>) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(script => {
            if(script.id === scriptId) {
                return {
                    ...script,
                    places: script.places.map(p => p.id === placeId ? {...p, ...updates} : p)
                }
            }
            return script;
          })
      }));
  };
  
  const deletePlaceFromScript = (scriptId: string, placeId: string) => {
    setState(prev => ({
        ...prev,
        scripts: prev.scripts.map(script => {
            if(script.id === scriptId) {
                return {
                    ...script,
                    places: script.places.filter(p => p.id !== placeId)
                }
            }
            return script;
        })
    }), true);
  };

  const duplicatePlaceInScript = (scriptId: string, placeId: string): Place | undefined => {
    const script = history[currentIndex].scripts.find(s => s.id === scriptId);
    const placeToDuplicate = script?.places.find(p => p.id === placeId);
    if (!script || !placeToDuplicate) return undefined;

    const originalName = isTranslationKey(placeToDuplicate.name) ? t(placeToDuplicate.name) : placeToDuplicate.name;
    const newPlace: Place = {
        ...JSON.parse(JSON.stringify(placeToDuplicate)),
        id: `place-${Date.now()}`,
        name: `${originalName} (${t('common.copy')})`.slice(0, 25)
    };

    setState(prev => ({
        ...prev,
        scripts: prev.scripts.map(s => {
          if (s.id === scriptId) {
            const placeIndex = s.places.findIndex(p => p.id === placeId);
            const newPlaces = [...s.places];
            if (placeIndex > -1) {
              newPlaces.splice(placeIndex + 1, 0, newPlace);
            } else {
              newPlaces.push(newPlace);
            }
            return { ...s, places: newPlaces };
          }
          return s;
        })
    }), true);

    return newPlace;
  };
  
  const addDefinition = (scriptId: string) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if(s.id === scriptId) {
                  const newDef = { ...defaultOptionalSection, id: `def-${Date.now()}`, title: "defaults.definitions" };
                  return { ...s, definitions: [...s.definitions, newDef] };
              }
              return s;
          })
      }), true);
  }

  const updateDefinition = (scriptId: string, sectionId: string, updates: Partial<OptionalSection>) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  return { ...s, definitions: s.definitions.map(def => def.id === sectionId ? {...def, ...updates} : def) };
              }
              return s;
          })
      }));
  }

  const duplicateDefinition = (scriptId: string, sectionId: string) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  const sectionToDuplicate = s.definitions.find(sec => sec.id === sectionId);
                  if (sectionToDuplicate) {
                      const originalTitle = isTranslationKey(sectionToDuplicate.title) ? t(sectionToDuplicate.title) : sectionToDuplicate.title;
                      const newSection = {
                          ...JSON.parse(JSON.stringify(sectionToDuplicate)),
                          id: `def-copy-${Date.now()}`,
                          title: `${originalTitle} (${t('common.copy')})`.slice(0, 25)
                      };
                      const sectionIndex = s.definitions.findIndex(sec => sec.id === sectionId);
                      const newSections = [...s.definitions];
                      newSections.splice(sectionIndex + 1, 0, newSection);
                      return { ...s, definitions: newSections };
                  }
              }
              return s;
          })
      }), true);
  }

  const deleteDefinition = (scriptId: string, sectionId: string) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  return { ...s, definitions: s.definitions.filter(def => def.id !== sectionId) };
              }
              return s;
          })
      }), true);
  }

  const reorderDefinition = (scriptId: string, activeId: string, overId: string) => {
    setState(prev => ({
      ...prev,
      scripts: prev.scripts.map(s => {
        if (s.id === scriptId) {
          const list = s.definitions;
          const oldIndex = list.findIndex(p => p.id === activeId);
          const newIndex = list.findIndex(p => p.id === overId);
          if (oldIndex !== -1 && newIndex !== -1) {
            return {
              ...s,
              definitions: arrayMove(list, oldIndex, newIndex)
            };
          }
        }
        return s;
      })
    }));
  };

  const addOptionalSection = (scriptId: string, type: 'powers' | 'scenarios') => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  if (s.optionalSections.find(sec => sec.id === type)) {
                      return s;
                  }
                  const newSection: OptionalSection = { 
                    id: type,
                    title: `script_page.${type}`,
                    blocks: []
                  };
                  return { ...s, optionalSections: [...s.optionalSections, newSection] };
              }
              return s;
          })
      }), true);
  }

  const updateOptionalSection = (scriptId: string, sectionId: string, updates: Partial<OptionalSection>) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  return { ...s, optionalSections: s.optionalSections.map(sec => sec.id === sectionId ? {...sec, ...updates} : sec) };
              }
              return s;
          })
      }));
  }

  const deleteOptionalSection = (scriptId: string, sectionId: string) => {
      setState(prev => ({
          ...prev,
          scripts: prev.scripts.map(s => {
              if (s.id === scriptId) {
                  return { ...s, optionalSections: s.optionalSections.filter(sec => sec.id !== sectionId) };
              }
              return s;
          })
      }), true);
  }

  const addJournalEntry = () => {
    let newEntry: JournalEntry | undefined;
    setState(prev => {
        newEntry = {
            id: `journal-${Date.now()}`,
            userId: user.id,
            title: 'defaults.untitled_entry',
            date: new Date().toISOString(),
            content: [{id: `initial-${Date.now()}`, type: 'text', content: ''}],
            isPublic: false,
            likes: 0,
            comments: [],
            likedBy: [],
        };
        return { ...prev, journalEntries: [...(prev.journalEntries || []), newEntry] };
    }, true);
    return newEntry!;
  };

  const updateJournalEntry = (id: string, updates: Partial<JournalEntry>) => {
    setState(prev => ({
        ...prev,
        journalEntries: prev.journalEntries.map(entry =>
            entry.id === id ? { ...entry, ...updates } : entry
        )
    }));
  };

  const deleteJournalEntry = (id: string) => {
    setState(prev => ({
        ...prev,
        journalEntries: prev.journalEntries.filter(entry => entry.id !== id)
    }), true);
  };

  const toggleJournalEntryVisibility = (id: string) => {
    setState(prev => ({
        ...prev,
        journalEntries: prev.journalEntries.map(entry =>
            entry.id === id ? { ...entry, isPublic: !entry.isPublic } : entry
        )
    }), true);
  };
  
  const toggleJournalLike = (journalId: string) => {
    const isLiked = user.likedJournalIds.includes(journalId);

    setState(prev => ({
        ...prev,
        journalEntries: prev.journalEntries.map(entry => {
            if (entry.id === journalId) {
                const newLikedBy = isLiked
                    ? entry.likedBy.filter(uid => uid !== user.id)
                    : [...entry.likedBy, user.id];
                return { ...entry, likedBy: newLikedBy, likes: newLikedBy.length };
            }
            return entry;
        })
    }), true);
  };

  const findUserById = useCallback((userId: string): User | undefined => {
    return users.find(u => u.id === userId);
  }, [users]);

  const findUserByUsername = useCallback((username: string): User | undefined => {
    return users.find(u => u.username === username);
  }, [users]);

  const findOrCreateConversation = async (otherUserId: string): Promise<Conversation> => {
    if (otherUserId === 'apeiron-user') {
      const existing = conversations.find(
        (c) => c.participantIds.includes(user.id) && c.participantIds.includes('apeiron-user')
      );
      if (existing) return existing;
      const welcome = getWelcomeConversation(user.id);
      setState((prev) => ({ ...prev, conversations: [...prev.conversations, welcome] }), true);
      return welcome;
    }

    const existing = conversations.find(
      (c) => c.participantIds.includes(user.id) && c.participantIds.includes(otherUserId)
    );
    if (existing) return existing;

    const dbConvo = await dbFindOrCreateConversation(user.id, otherUserId);
    if (dbConvo) {
      setState((prev) => ({ ...prev, conversations: [...prev.conversations, dbConvo] }), true);
      return dbConvo;
    }

    const fallback: Conversation = {
      id: `conv-${Date.now()}`,
      participantIds: [user.id, otherUserId],
      messages: [],
    };
    setState((prev) => ({ ...prev, conversations: [...prev.conversations, fallback] }), true);
    return fallback;
  };

  const addMessageToConversation = (conversationId: string, text: string) => {
    const optimisticMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      text,
      timestamp: new Date().toISOString(),
      read: true,
    };

    setState(prev => {
      const newConversations = prev.conversations.map(convo => {
        if (convo.id === conversationId) {
          return { ...convo, messages: [...convo.messages, optimisticMessage] };
        }
        return convo;
      });
      return { ...prev, conversations: newConversations };
    }, true);

    if (!conversationId.startsWith('apeiron')) {
      dbAddMessage(conversationId, user.id, text);
    }
  };

  const deleteConversation = (conversationId: string) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.filter(c => c.id !== conversationId)
    }), true);

    if (!conversationId.startsWith('apeiron')) {
      dbDeleteConversation(conversationId);
    }
  };

  const markConversationAsRead = useCallback((conversationId: string) => {
    setState(prev => {
        let conversationChanged = false;
        const newConversations = prev.conversations.map(convo => {
            if (convo.id === conversationId) {
                const hasUnread = convo.messages.some(m => m.senderId !== user.id && !m.read);
                if (!hasUnread) {
                    return convo;
                }

                const updatedMessages = convo.messages.map(m => {
                    if (m.senderId !== user.id && !m.read) {
                        return {...m, read: true};
                    }
                    return m;
                });
                conversationChanged = true;
                return {...convo, messages: updatedMessages};
            }
            return convo;
        });

        if (conversationChanged) {
            return { ...prev, conversations: newConversations };
        }
        return prev;
    });

    if (!conversationId.startsWith('apeiron')) {
      markMessagesAsRead(conversationId, user.id);
    }
  }, [setState, user.id]);

  const undo = () => {
    if (canUndo) {
      setUndoableState(prev => ({...prev, currentIndex: prev.currentIndex - 1 }));
    }
  };

  const redo = () => {
    if (canRedo) {
      setUndoableState(prev => ({...prev, currentIndex: prev.currentIndex + 1 }));
    }
  };


  const value: ScriptContextType = {
    scripts,
    users,
    addScript,
    addEmptyScript,
    addWR,
    addEmptyWR,
    updateScript,
    deleteScript,
    duplicateScript,
    reorderScripts,
    toggleFavorite,
    updateDetail,
    updateDetailBlocks,
    addRelationship,
    updateRelationship,
    duplicateRelationship,
    deleteRelationship,
    reorderRelationship,
    updateSO,
    updateSOBlocks,
    updateMyLifeBlocks,
    addPossession,
    updatePossession,
    duplicatePossession,
    deletePossession,
    reorderPossession,
    updatePet,
    addPet,
    duplicatePet,
    deletePet,
    reorderPet,
    places,
    addPlace,
    updatePlace,
    deletePlace,
    duplicatePlace,
    pages,
    addPage,
    updatePage,
    deletePage,
    addPlaceToScript,
    updatePlaceInScript,
    deletePlaceFromScript,
    duplicatePlaceInScript,
    addDefinition,
    updateDefinition,
    duplicateDefinition,
    deleteDefinition,
    reorderDefinition,
    addOptionalSection,
    updateOptionalSection,
    deleteOptionalSection,
    journalEntries,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    toggleJournalEntryVisibility,
    toggleJournalLike,
    conversations,
    findUserById,
    findUserByUsername,
    findOrCreateConversation,
    addMessageToConversation,
    deleteConversation,
    markConversationAsRead,
    undo,
    redo,
    canUndo,
    canRedo,
  };

  if (!isMounted) {
    const shellValue: ScriptContextType = {
        ...value,
        scripts: [],
        users: [],
        journalEntries: [],
        places: [],
        pages: [],
        conversations: [],
        canUndo: false,
        canRedo: false,
    };
    return React.createElement(ScriptContext.Provider, { value: shellValue }, children);
  }

  return React.createElement(ScriptContext.Provider, { value }, children);
}

export function useScripts() {
  const context = useContext(ScriptContext);
  if (context === undefined) {
    throw new Error('useScripts must be used within a ScriptProvider');
  }
  return context;
}
