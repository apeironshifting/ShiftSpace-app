import { supabase } from './client';
import type { User } from '@/hooks/use-user';
import { profileRowToUser, userToProfileUpdate } from './profiles';

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  username: string
): Promise<{ user: User | null; error: string | null }> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .maybeSingle();

  if (existing) {
    return { user: null, error: 'Username already taken.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, username },
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: 'Signup failed.' };
  }

  await supabase
    .from('profiles')
    .update({ name, username })
    .eq('id', data.user.id);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    user: profile ? profileRowToUser(profile) : null,
    error: null,
  };
}

export async function signInWithUsername(
  username: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  const { data: email, error: rpcError } = await supabase.rpc('get_login_email', {
    p_username: username,
  });

  if (rpcError || !email) {
    return { user: null, error: 'User not found.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: 'Login failed.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    user: profile ? profileRowToUser(profile) : null,
    error: null,
  };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function deleteAccount(): Promise<void> {
  await supabase.rpc('delete_user_account');
  await supabase.auth.signOut();
}

export function onAuthStateChange(callback: (userId: string | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user?.id ?? null);
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}
