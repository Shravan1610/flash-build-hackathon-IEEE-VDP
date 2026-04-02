import type { AppRole, Database, FormFieldType, FormStatus, Json } from "@/types/supabase";

export type EventFormRow = Database["public"]["Tables"]["event_forms"]["Row"];
export type FormFieldRow = Database["public"]["Tables"]["form_fields"]["Row"];
export type FormSubmissionRow = Database["public"]["Tables"]["form_submissions"]["Row"];

export interface FormFieldDefinition {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: FormFieldType;
  placeholder: string | null;
  helpText: string | null;
  isRequired: boolean;
  options: string[];
  settings: Record<string, Json>;
  sortOrder: number;
}

export interface EventFormRecord {
  id: string;
  eventId: string | null;
  title: string;
  slug: string;
  description: string | null;
  status: FormStatus;
  requiresAuthentication: boolean;
  successMessage: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  fields: FormFieldDefinition[];
}

export interface FormSubmissionRecord {
  id: string;
  formId: string;
  eventId: string | null;
  authUserId: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  submitterPhone: string | null;
  submitterRole: AppRole | null;
  answers: Record<string, Json>;
  metadata: Record<string, Json>;
  submittedAt: string;
}

export interface FormBuilderFieldInput {
  fieldKey: string;
  label: string;
  fieldType: FormFieldType;
  placeholder?: string;
  helpText?: string;
  isRequired?: boolean;
  options?: string[];
}

