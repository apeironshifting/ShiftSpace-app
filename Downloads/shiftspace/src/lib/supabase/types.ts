export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          name: string;
          bio: string;
          avatar_url: string;
          banner_url: string;
          is_public: boolean;
          following: string[];
          follower_count: number;
          shifting_status: string | null;
          liked_journal_ids: string[];
          affirmations: Json;
          affirmation_interval: number;
          current_affirmation_index: number;
          last_affirmation_change: number;
          posters: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          name?: string;
          bio?: string;
          avatar_url?: string;
          banner_url?: string;
          is_public?: boolean;
          following?: string[];
          follower_count?: number;
          shifting_status?: string | null;
          liked_journal_ids?: string[];
          affirmations?: Json;
          affirmation_interval?: number;
          current_affirmation_index?: number;
          last_affirmation_change?: number;
          posters?: Json;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      user_app_data: {
        Row: {
          user_id: string;
          scripts: Json;
          journal_entries: Json;
          places: Json;
          pages: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          scripts?: Json;
          journal_entries?: Json;
          places?: Json;
          pages?: Json;
        };
        Update: Partial<Database['public']['Tables']['user_app_data']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          participant_ids: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_ids: string[];
        };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          text: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          text: string;
          read?: boolean;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      info_sections: {
        Row: {
          id: string;
          title: string;
          blocks: Json;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string;
          blocks?: Json;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['info_sections']['Insert']>;
      };
    };
    Functions: {
      get_login_email: {
        Args: { p_username: string };
        Returns: string;
      };
    };
  };
}
