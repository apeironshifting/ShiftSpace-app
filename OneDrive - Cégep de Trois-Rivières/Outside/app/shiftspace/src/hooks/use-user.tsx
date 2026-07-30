
'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { type Block } from './use-scripts';
import { ThemeId } from './use-theme';
import {
  signInWithUsername,
  signUpWithEmail,
  signOut,
  onAuthStateChange,
} from '@/lib/supabase/auth';
import {
  fetchProfile,
  fetchAllProfiles,
  saveProfile,
  updateFollowCounts,
} from '@/lib/supabase/profiles';
import { apeironUser } from '@/lib/chat-data';

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
  bio: string;
  avatar: string;
  bannerImage: string;
  isPublic: boolean;
  following: string[];
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
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (name: string, username: string, email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
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
  const [registry, setRegistry] = useState<User[]>([apeironUser]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [undoableState, setUndoableState] = useState({
    history: [defaultUser] as User[],
    currentIndex: 0
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { history, currentIndex } = undoableState;
  const user = history[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const loadAllProfiles = useCallback(async () => {
    const profiles = await fetchAllProfiles();
    setRegistry([apeironUser, ...profiles.filter((p) => p.id !== apeironUser.id)]);
  }, []);

  const loadUserSession = useCallback(async (userId: string) => {
    const profile = await fetchProfile(userId);
    if (profile) {
      setCurrentUserId(userId);
      setUndoableState({ history: [profile], currentIndex: 0 });
    }
    await loadAllProfiles();
  }, [loadAllProfiles]);

  useEffect(() => {
    setIsMounted(true);

    const { data: { subscription } } = onAuthStateChange(async (userId) => {
      if (userId) {
        await loadUserSession(userId);
      } else {
        setCurrentUserId(null);
        setUndoableState({ history: [defaultUser], currentIndex: 0 });
      }
      setIsLoading(false);
    });

    loadAllProfiles();

    return () => subscription.unsubscribe();
  }, [loadUserSession, loadAllProfiles]);

  const persistProfile = useCallback(async (userState: User) => {
    if (!currentUserId || currentUserId === 'default-user') return;
    const saved = await saveProfile(currentUserId, userState);
    if (saved) {
      setRegistry((prev) => prev.map((u) => (u.id === currentUserId ? saved : u)));
    }
  }, [currentUserId]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUndoableState(current => {
      const prevState = current.history[current.currentIndex];
      const newState = { ...prevState, ...updates };
      const newHistory = [...current.history.slice(0, current.currentIndex + 1), newState];

      if (isMounted && currentUserId) {
        persistProfile(newState);
        setRegistry((prev) => prev.map((u) => (u.id === currentUserId ? newState : u)));
      }

      return {
        history: newHistory,
        currentIndex: newHistory.length - 1
      };
    });
  }, [isMounted, currentUserId, persistProfile]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const { user: loggedInUser, error } = await signInWithUsername(username, password);
    if (error || !loggedInUser) return false;

    setCurrentUserId(loggedInUser.id);
    setUndoableState({ history: [loggedInUser], currentIndex: 0 });
    await loadAllProfiles();
    return true;
  };

  const signup = async (
    name: string,
    username: string,
    email: string,
    password: string
  ): Promise<User | null> => {
    const { user: newUser, error } = await signUpWithEmail(email, password, name, username);
    if (error || !newUser) return null;

    setCurrentUserId(newUser.id);
    setUndoableState({ history: [newUser], currentIndex: 0 });
    await loadAllProfiles();
    return newUser;
  };

  const logout = async () => {
    await signOut();
    setCurrentUserId(null);
    setUndoableState({ history: [defaultUser], currentIndex: 0 });
  };

  const toggleFollow = useCallback((username: string) => {
    const isFollowing = user.following.includes(username);
    const newFollowing = isFollowing
      ? user.following.filter(f => f !== username)
      : [...user.following, username];

    updateUser({ following: newFollowing });
    updateFollowCounts(username, isFollowing ? -1 : 1);
    loadAllProfiles();
  }, [user.following, updateUser, loadAllProfiles]);

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
    isLoading,
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
  }), [user, registry, isLoading, updateUser, toggleFollow, updateShiftingStatus, addPoster, updatePoster, deletePoster, togglePosterVisibility, addPersonToPoster, updatePersonInPoster, deletePersonFromPoster, undo, redo, canUndo, canRedo]);

  if (!isMounted) {
     return <UserContext.Provider value={{
       user: defaultUser,
       users: [apeironUser],
       isLoading: true,
       login: async () => false,
       signup: async () => null,
       logout: async () => {},
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
