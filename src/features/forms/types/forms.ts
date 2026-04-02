import type { Json } from "@/types/supabase";
import type { AppRole, FormFieldType, FormStatus } from "@/types/supabase";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldRecord {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: FormFieldType;
  placeholder: string | null;
  helpText: string | null;
  isRequired: boolean;
  options: FormFieldOption[];
  settings: Json;
  sortOrder: number;
}

export interface FormEventSummary {
  id: string;
  slug: string | null;
  title: string | null;
  eventDate: string | null;
  venue: string | null;
  category: string | null;
  status?: string | null;
}

export interface EventFormRecord {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  description: string | null;
  status: FormStatus;
  requiresAuthentication: boolean;
  successMessage: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  event: FormEventSummary | null;
  fields: FormFieldRecord[];
}

export interface EventFormSummary {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  status: FormStatus;
  publishedAt: string | null;
  requiresAuthentication: boolean;
  event: FormEventSummary | null;
  fieldCount: number;
  submissionCount: number;
  publicUrl: string;
}

export interface EventOption {
  id: string;
  title: string;
  slug: string | null;
  eventDate: string | null;
  status: string;
}

export interface FormSubmissionInput {
  formId: string;
  eventId: string | null;
  tenantId: string;
  authUserId: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  submitterPhone: string | null;
  submitterRole: AppRole | null;
  answers: Record<string, Json>;
  metadata?: Record<string, Json>;
}

export interface EventFormUpsertInput {
  id?: string;
  title: string;
  slug: string;
  description: string | null;
  eventId: string | null;
  status: FormStatus;
  requiresAuthentication: boolean;
  successMessage: string;
  fields: Array<{
    id?: string;
    fieldKey: string;
    label: string;
    fieldType: FormFieldType;
    placeholder?: string | null;
    helpText?: string | null;
    isRequired?: boolean;
    options?: FormFieldOption[];
    settings?: Json;
    sortOrder: number;
  }>;
}
