import type { TenantMemberRole } from "@/types/supabase";

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface TenantMembershipSummary {
  id: string;
  tenantId: string;
  role: TenantMemberRole;
  tenant: TenantSummary;
}

export interface TenantInviteSummary {
  id: string;
  invitedEmail: string;
  role: TenantMemberRole;
  createdAt: string;
  acceptedAt: string | null;
}

export interface TenantMemberDirectoryEntry {
  id: string;
  userId: string;
  role: TenantMemberRole;
  fullName: string | null;
}

export interface TenantWorkspaceRecord {
  activeMembership: TenantMembershipSummary | null;
  memberships: TenantMembershipSummary[];
  members: TenantMemberDirectoryEntry[];
  pendingInvites: TenantInviteSummary[];
  canManageInvites: boolean;
}

export interface TenantWorkspaceSnapshot {
  tenant: TenantSummary;
  members: Array<{
    userId: string;
    fullName: string | null;
    role: TenantMemberRole;
    joinedAt: string;
  }>;
  invites: Array<{
    id: string;
    invitedEmail: string;
    role: TenantMemberRole;
    inviteToken: string;
    acceptedAt: string | null;
    createdAt: string;
  }>;
  metrics: {
    totalMembers: number;
    pendingInvites: number;
    publishedEvents: number;
    totalForms: number;
    totalSubmissions: number;
  };
}
