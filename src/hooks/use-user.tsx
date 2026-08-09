
'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { type Block } from './use-scripts';
import { saveToStorage, getFromStorage } from '@/lib/storage';
import { ThemeId } from './use-theme';
import { supabase } from '@/lib/supabase';

export type ShiftingStatus = 'shifted' | 'not-shifted' | null;

export type PosterMetadata = {
  id: string;
  label: string;
  value: string;
};

export type PosterPerson = {
  id: string;
  name: string;
  image: string;
  description: string;
  content: Block[];
  metadata: PosterMetadata[];
  themeId?: ThemeId;
};

export type Poster = {
  id: string;
  title: string;
  image: string;
  description: string;
  content: Block[];
  rating: number;
  isPublic: boolean;
  createdAt: string;
  themeId?: ThemeId;
  metadata: PosterMetadata[];
  people: PosterPerson[];
};

export type User = {
  id: string;
  name: string;
  username: string;
  password?: string; // Stored locally for the registry
  bio: string;
  avatar: string;
  bannerImage: string;
  isPublic: boolean;
  following: string[]; // List of usernames
  followerCount: number;
  shiftingStatus: ShiftingStatus;
  likedJournalIds: string[];
  affirmations: string[];
  affirmationInterval: number;
  currentAffirmationIndex: number;
  lastAffirmationChange: number;
  posters: Poster[];
};

const defaultUser: User = {
  id: 'default-user',
  name: 'Shifter',
  username: 'shifter',
  bio: '',
  avatar: '',
  bannerImage: '',
  isPublic: false,
  following: [],
  followerCount: 0,
  shiftingStatus: null,
  likedJournalIds: [],
  affirmations: [],
  affirmationInterval: 5,
  currentAffirmationIndex: 0,
  lastAffirmationChange: Date.now(),
  posters: [],
};

interface UserContextType {
  user: User;
  users: User[];
  login: (username: string) => boolean;
  signup: (name: string, username: string) => User;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  toggleFollow: (username: string) => void;
  updateShiftingStatus: (status: ShiftingStatus | 'none') => void;
  addPoster: (image: string) => Poster;
  updatePoster: (id: string, updates: Partial<Poster>) => void;
  deletePoster: (id: string) => void;
  togglePosterVisibility: (id: string) => void;
  addPersonToPoster: (posterId: string, image: string) => void;
  updatePersonInPoster: (posterId: string, personId: string, updates: Partial<PosterPerson>) => void;
  deletePersonFromPoster: (posterId: string, personId: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [registry, setRegistry] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [undoableState, setUndoableState] = useState({
    history: [defaultUser] as User[],
    currentIndex: 0
  });
  const [isMounted, setIsMounted] = useState(false);

  const { history, currentIndex } = undoableState;
  const user = history[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Load Registry and Session
  useEffect(() => {
    setIsMounted(true);
    const loadData = async () => {
      try {
        const savedRegistry = await getFromStorage<User[]>('userRegistry');
        const savedSession = localStorage.getItem('currentUserId');
        
        if (savedRegistry) {
          setRegistry(savedRegistry);
        } else {
          // Add Apeiron as a default community member
          const apeiron: User = {
            ...defaultUser,
            id: 'apeiron-user',
            name: 'Apeiron',
            username: 'apeiron',
            bio: 'Your guide to ShiftSpace.',
            bannerImage: 'https://picsum.photos/seed/apeiron-banner/1200/400',
            isPublic: true,
            followerCount: 999,
          };
          setRegistry([apeiron]);
          await saveToStorage('userRegistry', [apeiron]);
        }

        if (savedSession) {
          setCurrentUserId(savedSession);
          const savedUser = await getFromStorage<User>(`userProfile_${savedSession}`);
          if (savedUser) {
            setUndoableState({ history: [savedUser], currentIndex: 0 });
          }
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      }
    };
    loadData();
  }, []);

  const saveRegistry = async (newRegistry: User[]) => {
    setRegistry(newRegistry);
    await saveToStorage('userRegistry', newRegistry);
  };

  const updateUser = useCallback((updates: Partial<User>) => {
    setUndoableState(current => {
      const prevState = current.history[current.currentIndex];
      const newState = { ...prevState, ...updates };
      const newHistory = [...current.history.slice(0, current.currentIndex + 1), newState];
      
      if (isMounted && currentUserId) {
        saveToStorage(`userProfile_${currentUserId}`, newState);
        // Sync back to registry
        const newRegistry = registry.map(u => u.id === currentUserId ? newState : u);
        saveRegistry(newRegistry);
      }
      
      return {
        history: newHistory,
        currentIndex: newHistory.length - 1
      };
    });
  }, [isMounted, currentUserId, registry]);

  const login = (username: string) => {
    const found = registry.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (found) {
      setCurrentUserId(found.id);
      localStorage.setItem('currentUserId', found.id);
      setUndoableState({ history: [found], currentIndex: 0 });
      saveToStorage(`userProfile_${found.id}`, found);
      return true;
    }
    return false;
  };

const signup = async (name: string, username: string, email?: string, password?: string) => {
// 1. Register the user in Supabase Authentication securely
if (email && password) {
const { data: authData, error: authError } = await supabase.auth.signUp({
email,
password,
options: {
data: {
display\_name: name,
username: username
}
}
});

  if (authError) {
    console.error("Supabase Auth Error:", authError.message);
    throw authError;
  }
}

// 2. Keep the local state sync happy so the template layout functions
const newUser: User = {
  ...defaultUser,
  id: `user-${Date.now()}`,
  name,
  username,
};

const { error: tableError } = await supabase
  .from('profiles')
  .insert([{ id: newUser.id, name, username }]);

if (tableError) {
  console.error("Profiles Table Error:", tableError.message);
}

const newRegistry = [...registry, newUser];
saveRegistry(newRegistry);

setCurrentUserId(newUser.id);
localStorage.setItem('currentUserId', newUser.id);
setUndoableState({ history: [newRegistry], currentIndex: 0 });
saveToStorage(`userProfile_${newUser.id}`, newUser);
return newUser;

};
  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem('currentUserId');
    setUndoableState({ history: [defaultUser], currentIndex: 0 });
  };
  
  const toggleFollow = useCallback((username: string) => {
    const isFollowing = user.following.includes(username);
    const newFollowing = isFollowing
      ? user.following.filter(f => f !== username)
      : [...user.following, username];
    
    updateUser({ following: newFollowing });

    // Update target user's follower count in registry
    const targetUser = registry.find(u => u.username === username);
    if (targetUser) {
        const newRegistry = registry.map(u => {
            if (u.username === username) {
                return { ...u, followerCount: Math.max(0, (u.followerCount || 0) + (isFollowing ? -1 : 1)) };
            }
            return u;
        });
        saveRegistry(newRegistry);
    }
  }, [user.following, updateUser, registry]);
  
  const updateShiftingStatus = useCallback((status: ShiftingStatus | 'none') => {
      if (status === 'none') {
        updateUser({ shiftingStatus: null });
      } else {
        updateUser({ shiftingStatus: status });
      }
  }, [updateUser]);

  const addPoster = useCallback((image: string) => {
    const newPoster: Poster = {
      id: `poster-${Date.now()}`,
      title: 'poster_page.untitled',
      image,
      description: '',
      content: [],
      rating: 0,
      isPublic: false,
      createdAt: new Date().toISOString(),
      people: [],
      metadata: [
        { id: `m1-${Date.now()}`, label: 'poster_page.metadata.date', value: '' },
        { id: `m2-${Date.now()}`, label: 'poster_page.metadata.country', value: '' },
        { id: `m3-${Date.now()}`, label: 'poster_page.metadata.main_language', value: '' },
      ],
    };
    updateUser({ posters: [newPoster, ...user.posters] });
    return newPoster;
  }, [user.posters, updateUser]);

  const updatePoster = useCallback((id: string, updates: Partial<Poster>) => {
    updateUser({
      posters: user.posters.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  }, [user.posters, updateUser]);

  const deletePoster = useCallback((id: string) => {
    updateUser({
      posters: user.posters.filter(p => p.id !== id)
    });
  }, [user.posters, updateUser]);

  const togglePosterVisibility = useCallback((id: string) => {
    updateUser({
      posters: user.posters.map(p => p.id === id ? { ...p, isPublic: !p.isPublic } : p)
    });
  }, [user.posters, updateUser]);

  const addPersonToPoster = useCallback((posterId: string, image: string) => {
    const newPerson: PosterPerson = {
      id: `person-${Date.now()}`,
      name: 'poster_page.new_person',
      image,
      description: '',
      content: [],
      metadata: [
        { id: `pm1-${Date.now()}`, label: 'poster_page.details.nickname', value: '' },
        { id: `pm2-${Date.now()}`, label: 'poster_page.details.age', value: '' },
        { id: `pm3-${Date.now()}`, label: 'poster_page.details.gender', value: '' },
        { id: `pm4-${Date.now()}`, label: 'poster_page.details.bio_sex', value: '' },
        { id: `pm5-${Date.now()}`, label: 'poster_page.details.ethnicity', value: '' },
        { id: `pm6-${Date.now()}`, label: 'poster_page.details.species', value: '' },
      ],
    };
    updateUser({
      posters: user.posters.map(p => 
        p.id === posterId 
          ? { ...p, people: [...(p.people || []), newPerson] } 
          : p
      )
    });
  }, [user.posters, updateUser]);

  const updatePersonInPoster = useCallback((posterId: string, personId: string, updates: Partial<PosterPerson>) => {
    updateUser({
      posters: user.posters.map(p => 
        p.id === posterId 
          ? { ...p, people: (p.people || []).map(per => per.id === personId ? { ...per, ...updates } : per) } 
          : p
      )
    });
  }, [user.posters, updateUser]);

  const deletePersonFromPoster = useCallback((posterId: string, personId: string) => {
    updateUser({
      posters: user.posters.map(p => 
        p.id === posterId 
          ? { ...p, people: (p.people || []).filter(per => per.id !== personId) } 
          : p
      )
    });
  }, [user.posters, updateUser]);

  const undo = useCallback(() => {
    if (canUndo) setUndoableState(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) setUndoableState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
  }, [canRedo]);

  const value = useMemo(() => ({
    user,
    users: registry,
    login,
    signup,
    logout,
    updateUser,
    toggleFollow,
    updateShiftingStatus,
    addPoster,
    updatePoster,
    deletePoster,
    togglePosterVisibility,
    addPersonToPoster,
    updatePersonInPoster,
    deletePersonFromPoster,
    undo,
    redo,
    canUndo,
    canRedo
  }), [user, registry, updateUser, toggleFollow, updateShiftingStatus, addPoster, updatePoster, deletePoster, togglePosterVisibility, addPersonToPoster, updatePersonInPoster, deletePersonFromPoster, undo, redo, canUndo, canRedo]);

  if (!isMounted) {
     return <UserContext.Provider value={{ 
       user: defaultUser, 
       users: [],
       login: () => false,
       signup: () => defaultUser,
       logout: () => {},
       updateUser: () => {}, 
       toggleFollow: () => {}, 
       updateShiftingStatus: () => {},
       addPoster: () => ({} as Poster),
       updatePoster: () => {},
       deletePoster: () => {},
       togglePosterVisibility: () => {},
       addPersonToPoster: () => {},
       updatePersonInPoster: () => {},
       deletePersonFromPoster: () => {},
       undo: () => {},
       redo: () => {},
       canUndo: false,
       canRedo: false
     }}>{children}</UserContext.Provider>;
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
