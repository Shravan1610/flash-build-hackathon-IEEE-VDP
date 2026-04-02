import type { User } from "@supabase/supabase-js";

import type { AppRole, Database, TenantMemberRole } from "@/types/supabase";

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type TenantMembership = Database["public"]["Tables"]["tenant_memberships"]["Row"];
export type TenantRecord = Database["public"]["Tables"]["tenants"]["Row"];

export interface UserTenantMembership {
  membershipId: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  role: TenantMemberRole;
}

export interface UserContext {
  user: User | null;
  profile: UserProfile | null;
  role: AppRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  memberships: UserTenantMembership[];
  activeTenant: UserTenantMembership | null;
  canManageTenant: boolean;
}
