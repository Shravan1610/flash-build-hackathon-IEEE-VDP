export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          category: Database["public"]["Enums"]["event_category"] | null;
          created_at: string;
          description_raw_text: string | null;
          end_time: string | null;
          event_date: string | null;
          extraction_confidence: number | null;
          id: string;
          ocr_text: string | null;
          poster_public_url: string | null;
          poster_storage_path: string;
          published_at: string | null;
          slug: string | null;
          source_file_type: Database["public"]["Enums"]["poster_source_file_type"];
          start_time: string | null;
          status: Database["public"]["Enums"]["event_status"];
          title: string | null;
          updated_at: string;
          venue: string | null;
        };
        Insert: {
          category?: Database["public"]["Enums"]["event_category"] | null;
          created_at?: string;
          description_raw_text?: string | null;
          end_time?: string | null;
          event_date?: string | null;
          extraction_confidence?: number | null;
          id?: string;
          ocr_text?: string | null;
          poster_public_url?: string | null;
          poster_storage_path: string;
          published_at?: string | null;
          slug?: string | null;
          source_file_type: Database["public"]["Enums"]["poster_source_file_type"];
          start_time?: string | null;
          status?: Database["public"]["Enums"]["event_status"];
          title?: string | null;
          updated_at?: string;
          venue?: string | null;
        };
        Update: {
          category?: Database["public"]["Enums"]["event_category"] | null;
          created_at?: string;
          description_raw_text?: string | null;
          end_time?: string | null;
          event_date?: string | null;
          extraction_confidence?: number | null;
          id?: string;
          ocr_text?: string | null;
          poster_public_url?: string | null;
          poster_storage_path?: string;
          published_at?: string | null;
          slug?: string | null;
          source_file_type?: Database["public"]["Enums"]["poster_source_file_type"];
          start_time?: string | null;
          status?: Database["public"]["Enums"]["event_status"];
          title?: string | null;
          updated_at?: string;
          venue?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin_user: {
        Args: never;
        Returns: boolean;
      };
    };
    Enums: {
      event_category:
        | "Membership Drive"
        | "Seminar"
        | "Workshop"
        | "Hackathon"
        | "Coding Challenge";
      event_status: "draft" | "review_required" | "published" | "rejected";
      poster_source_file_type: "image/jpeg" | "image/png" | "application/pdf";
    };
    CompositeTypes: Record<string, never>;
  };
}

export type EventCategory = Database["public"]["Enums"]["event_category"];
export type EventStatus = Database["public"]["Enums"]["event_status"];
export type PosterSourceFileType = Database["public"]["Enums"]["poster_source_file_type"];
