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
      event_forms: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          event_id: string | null;
          id: string;
          published_at: string | null;
          requires_authentication: boolean;
          slug: string;
          status: Database["public"]["Enums"]["form_status"];
          success_message: string;
          tenant_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          event_id?: string | null;
          id?: string;
          published_at?: string | null;
          requires_authentication?: boolean;
          slug: string;
          status?: Database["public"]["Enums"]["form_status"];
          success_message?: string;
          tenant_id?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          event_id?: string | null;
          id?: string;
          published_at?: string | null;
          requires_authentication?: boolean;
          slug?: string;
          status?: Database["public"]["Enums"]["form_status"];
          success_message?: string;
          tenant_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_forms_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_forms_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
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
          tenant_id: string;
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
          tenant_id?: string;
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
          tenant_id?: string;
          title?: string | null;
          updated_at?: string;
          venue?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      form_fields: {
        Row: {
          created_at: string;
          field_key: string;
          field_type: Database["public"]["Enums"]["form_field_type"];
          form_id: string;
          help_text: string | null;
          id: string;
          is_required: boolean;
          label: string;
          options: Json;
          placeholder: string | null;
          settings: Json;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          field_key: string;
          field_type: Database["public"]["Enums"]["form_field_type"];
          form_id: string;
          help_text?: string | null;
          id?: string;
          is_required?: boolean;
          label: string;
          options?: Json;
          placeholder?: string | null;
          settings?: Json;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          field_key?: string;
          field_type?: Database["public"]["Enums"]["form_field_type"];
          form_id?: string;
          help_text?: string | null;
          id?: string;
          is_required?: boolean;
          label?: string;
          options?: Json;
          placeholder?: string | null;
          settings?: Json;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey";
            columns: ["form_id"];
            isOneToOne: false;
            referencedRelation: "event_forms";
            referencedColumns: ["id"];
          },
        ];
      };
      form_submissions: {
        Row: {
          answers: Json;
          auth_user_id: string | null;
          event_id: string | null;
          form_id: string;
          id: string;
          metadata: Json;
          submitted_at: string;
          submitter_email: string | null;
          submitter_name: string | null;
          submitter_phone: string | null;
          submitter_role: Database["public"]["Enums"]["app_role"] | null;
          tenant_id: string;
        };
        Insert: {
          answers?: Json;
          auth_user_id?: string | null;
          event_id?: string | null;
          form_id: string;
          id?: string;
          metadata?: Json;
          submitted_at?: string;
          submitter_email?: string | null;
          submitter_name?: string | null;
          submitter_phone?: string | null;
          submitter_role?: Database["public"]["Enums"]["app_role"] | null;
          tenant_id?: string;
        };
        Update: {
          answers?: Json;
          auth_user_id?: string | null;
          event_id?: string | null;
          form_id?: string;
          id?: string;
          metadata?: Json;
          submitted_at?: string;
          submitter_email?: string | null;
          submitter_name?: string | null;
          submitter_phone?: string | null;
          submitter_role?: Database["public"]["Enums"]["app_role"] | null;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "form_submissions_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "form_submissions_form_id_fkey";
            columns: ["form_id"];
            isOneToOne: false;
            referencedRelation: "event_forms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "form_submissions_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_invites: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          id: string;
          invite_token: string;
          invited_by: string;
          invited_email: string;
          invited_user_id: string | null;
          role: Database["public"]["Enums"]["tenant_member_role"];
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          id?: string;
          invite_token?: string;
          invited_by: string;
          invited_email: string;
          invited_user_id?: string | null;
          role?: Database["public"]["Enums"]["tenant_member_role"];
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          id?: string;
          invite_token?: string;
          invited_by?: string;
          invited_email?: string;
          invited_user_id?: string | null;
          role?: Database["public"]["Enums"]["tenant_member_role"];
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_invites_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_memberships: {
        Row: {
          created_at: string;
          id: string;
          invited_by: string | null;
          role: Database["public"]["Enums"]["tenant_member_role"];
          tenant_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          invited_by?: string | null;
          role?: Database["public"]["Enums"]["tenant_member_role"];
          tenant_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          invited_by?: string | null;
          role?: Database["public"]["Enums"]["tenant_member_role"];
          tenant_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_memberships_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenants: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      can_manage_tenant: {
        Args: {
          target_tenant_id: string;
        };
        Returns: boolean;
      };
      claim_my_pending_invites: {
        Args: never;
        Returns: number;
      };
      claim_pending_invites_for_user: {
        Args: {
          preferred_role?: Database["public"]["Enums"]["app_role"];
          target_email: string;
          target_user_id: string;
        };
        Returns: number;
      };
      current_tenant_role: {
        Args: {
          target_tenant_id: string;
        };
        Returns: Database["public"]["Enums"]["tenant_member_role"];
      };
      get_default_tenant_id: {
        Args: never;
        Returns: string;
      };
      is_admin_user: {
        Args: never;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "student" | "faculty" | "admin" | "student_coordinator";
      event_category:
        | "Membership Drive"
        | "Seminar"
        | "Workshop"
        | "Hackathon"
        | "Coding Challenge";
      event_status: "draft" | "review_required" | "published" | "rejected";
      form_field_type:
        | "text"
        | "email"
        | "phone"
        | "textarea"
        | "select"
        | "radio"
        | "checkbox"
        | "date"
        | "number";
      form_status: "draft" | "published" | "archived";
      poster_source_file_type: "image/jpeg" | "image/png" | "application/pdf";
      tenant_member_role: "student" | "student_coordinator" | "faculty";
    };
    CompositeTypes: Record<string, never>;
  };
}

export type AppRole = Database["public"]["Enums"]["app_role"];
export type EventCategory = Database["public"]["Enums"]["event_category"];
export type EventStatus = Database["public"]["Enums"]["event_status"];
export type FormFieldType = Database["public"]["Enums"]["form_field_type"];
export type FormStatus = Database["public"]["Enums"]["form_status"];
export type PosterSourceFileType = Database["public"]["Enums"]["poster_source_file_type"];
export type TenantMemberRole = Database["public"]["Enums"]["tenant_member_role"];
