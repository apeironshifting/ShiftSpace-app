import { type Conversation } from '@/hooks/use-scripts';
import { type User } from '@/hooks/use-user';

export const apeironUser: User = {
  id: 'apeiron-user',
  name: 'Apeiron',
  username: 'apeiron',
  bio: 'Your guide to ShiftSpace.',
  avatar: '',
  bannerImage: 'https://picsum.photos/seed/apeiron-banner/1200/400',
  isPublic: true,
  following: [],
  followerCount: 999,
  shiftingStatus: null,
  likedJournalIds: [],
  affirmations: [],
  affirmationInterval: 0,
  currentAffirmationIndex: 0,
  lastAffirmationChange: 0,
  posters: [],
};

export const getWelcomeConversation = (currentUserId: string): Conversation => ({
  id: 'apeiron-convo-1',
  participantIds: [currentUserId, apeironUser.id],
  messages: [
    {
      id: 'apeiron-msg-1',
      senderId: apeironUser.id,
      text: 'chat.apeiron_welcome',
      timestamp: new Date().toISOString(),
      read: false,
    },
  ],
});
