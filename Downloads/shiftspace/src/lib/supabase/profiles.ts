import { supabase } from './client';
import type { User, Poster } from '@/hooks/use-user';
import type { Database } from './types';
import { uploadImagesInObject } from './storage';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export function profileRowToUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    bio: row.bio,
    avatar: row.avatar_url,
    bannerImage: row.banner_url,
    isPublic: row.is_public,
    following: row.following ?? [],
    followerCount: row.follower_count ?? 0,
    shiftingStatus: row.shifting_status as User['shiftingStatus'],
    likedJournalIds: row.liked_journal_ids ?? [],
    affirmations: (row.affirmations as string[]) ?? [],
    affirmationInterval: row.affirmation_interval ?? 5,
    currentAffirmationIndex: row.current_affirmation_index ?? 0,
    lastAffirmationChange: row.last_affirmation_change ?? Date.now(),
    posters: (row.posters as Poster[]) ?? [],
  };
}

export function userToProfileUpdate(user: Partial<User>): Database['public']['Tables']['profiles']['Update'] {
  const update: Database['public']['Tables']['profiles']['Update'] = {};
  if (user.name !== undefined) update.name = user.name;
  if (user.username !== undefined) update.username = user.username;
  if (user.bio !== undefined) update.bio = user.bio;
  if (user.avatar !== undefined) update.avatar_url = user.avatar;
  if (user.bannerImage !== undefined) update.banner_url = user.bannerImage;
  if (user.isPublic !== undefined) update.is_public = user.isPublic;
  if (user.following !== undefined) update.following = user.following;
  if (user.followerCount !== undefined) update.follower_count = user.followerCount;
  if (user.shiftingStatus !== undefined) update.shifting_status = user.shiftingStatus;
  if (user.likedJournalIds !== undefined) update.liked_journal_ids = user.likedJournalIds;
  if (user.affirmations !== undefined) update.affirmations = user.affirmations;
  if (user.affirmationInterval !== undefined) update.affirmation_interval = user.affirmationInterval;
  if (user.currentAffirmationIndex !== undefined) update.current_affirmation_index = user.currentAffirmationIndex;
  if (user.lastAffirmationChange !== undefined) update.last_affirmation_change = user.lastAffirmationChange;
  if (user.posters !== undefined) update.posters = user.posters as Database['public']['Tables']['profiles']['Update']['posters'];
  update.updated_at = new Date().toISOString();
  return update;
}

export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return profileRowToUser(data);
}

export async function fetchPublicProfiles(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_public', true);

  if (error || !data) return [];
  return data.map(profileRowToUser);
}

export async function fetchAllProfiles(): Promise<User[]> {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error || !data) return [];
  return data.map(profileRowToUser);
}

export async function saveProfile(userId: string, user: Partial<User>): Promise<User | null> {
  let processed = user;
  if (user.avatar || user.bannerImage || user.posters) {
    processed = await uploadImagesInObject(user, `users/${userId}`);
  }

  const update = userToProfileUpdate(processed);
  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId)
    .select('*')
    .single();

  if (error || !data) {
    console.error('Failed to save profile', error);
    return null;
  }
  return profileRowToUser(data);
}

export async function updateFollowCounts(
  targetUsername: string,
  delta: number
): Promise<void> {
  const { data: target } = await supabase
    .from('profiles')
    .select('id, follower_count')
    .eq('username', targetUsername)
    .single();

  if (target) {
    await supabase
      .from('profiles')
      .update({
        follower_count: Math.max(0, (target.follower_count ?? 0) + delta),
        updated_at: new Date().toISOString(),
      })
      .eq('id', target.id);
  }
}
