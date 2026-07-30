import { supabase } from './client';
import type { Script, JournalEntry, Place, Page, Conversation, Message } from '@/hooks/use-scripts';
import { uploadImagesInObject } from './storage';

export type AppState = {
  scripts: Script[];
  journalEntries: JournalEntry[];
  places: Place[];
  pages: Page[];
  conversations: Conversation[];
};

const emptyAppState: AppState = {
  scripts: [],
  journalEntries: [],
  places: [],
  pages: [],
  conversations: [],
};

export async function fetchAppData(userId: string): Promise<AppState> {
  const { data, error } = await supabase
    .from('user_app_data')
    .select('scripts, journal_entries, places, pages')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return { ...emptyAppState };
  }

  const conversations = await fetchConversations(userId);

  return {
    scripts: (data.scripts as Script[]) ?? [],
    journalEntries: (data.journal_entries as JournalEntry[]) ?? [],
    places: (data.places as Place[]) ?? [],
    pages: (data.pages as Page[]) ?? [],
    conversations,
  };
}

export async function saveAppData(userId: string, state: Omit<AppState, 'conversations'>): Promise<void> {
  const processed = await uploadImagesInObject(
    {
      scripts: state.scripts,
      journal_entries: state.journalEntries,
      places: state.places,
      pages: state.pages,
    },
    `users/${userId}/app`
  );

  const { error } = await supabase.from('user_app_data').upsert({
    user_id: userId,
    scripts: processed.scripts,
    journal_entries: processed.journal_entries,
    places: processed.places,
    pages: processed.pages,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to save app data', error);
  }
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const { data: convos, error } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId]);

  if (error || !convos) return [];

  const conversations: Conversation[] = [];

  for (const convo of convos) {
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convo.id)
      .order('created_at', { ascending: true });

    conversations.push({
      id: convo.id,
      participantIds: convo.participant_ids,
      messages: (messages ?? []).map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        text: m.text,
        timestamp: m.created_at,
        read: m.read,
      })),
    });
  }

  return conversations;
}

export async function findOrCreateConversation(
  userId: string,
  otherUserId: string
): Promise<Conversation | null> {
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId]);

  const match = existing?.find(
    (c) =>
      c.participant_ids.includes(userId) &&
      c.participant_ids.includes(otherUserId) &&
      c.participant_ids.length === 2
  );

  if (match) {
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', match.id)
      .order('created_at', { ascending: true });

    return {
      id: match.id,
      participantIds: match.participant_ids,
      messages: (messages ?? []).map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        text: m.text,
        timestamp: m.created_at,
        read: m.read,
      })),
    };
  }

  const { data: newConvo, error } = await supabase
    .from('conversations')
    .insert({ participant_ids: [userId, otherUserId] })
    .select('*')
    .single();

  if (error || !newConvo) return null;

  return {
    id: newConvo.id,
    participantIds: newConvo.participant_ids,
    messages: [],
  };
}

export async function addMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      text,
      read: true,
    })
    .select('*')
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    senderId: data.sender_id,
    text: data.text,
    timestamp: data.created_at,
    read: data.read,
  };
}

export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('read', false);
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await supabase.from('conversations').delete().eq('id', conversationId);
}

export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void
) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const row = payload.new as {
          id: string;
          sender_id: string;
          text: string;
          created_at: string;
          read: boolean;
        };
        onMessage({
          id: row.id,
          senderId: row.sender_id,
          text: row.text,
          timestamp: row.created_at,
          read: row.read,
        });
      }
    )
    .subscribe();
}
