import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, TenantMemberRole } from "@/types/supabase";
import { slugify } from "@/lib/utils/slugify";

import type { UserContext } from "../types/auth";

async function listUserMemberships(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data: memberships, error } = await admin
    .from("tenant_memberships")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !memberships?.length) {
    return [];
  }

  const tenantIds = [...new Set(memberships.map((membership) => membership.tenant_id))];
  const { data: tenants } = await admin
    .from("tenants")
    .select("*")
    .in("id", tenantIds);

  const tenantMap = new Map((tenants ?? []).map((tenant) => [tenant.id, tenant]));

  return memberships.flatMap((membership) => {
    const tenant = tenantMap.get(membership.tenant_id);

    if (!tenant) {
      return [];
    }

    return [
      {
        membershipId: membership.id,
        tenantId: membership.tenant_id,
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        role: membership.role,
      },
    ];
  });
}

async function createTenantWithUniqueSlug(input: {
  createdBy: string;
  name: string;
  description?: string | null;
}) {
  const admin = createSupabaseAdminClient();
  const baseSlug = slugify(input.name) || "workspace";

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data, error } = await admin
      .from("tenants")
      .insert({
        created_by: input.createdBy,
        description: input.description ?? null,
        name: input.name,
        slug,
      })
      .select("*")
      .single();

    if (!error && data) {
      return data;
    }
  }

  throw new Error("Unable to create tenant workspace.");
}

export async function getCurrentUserContext(): Promise<UserContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      role: null,
      isAuthenticated: false,
      isAdmin: false,
      memberships: [],
      activeTenant: null,
      canManageTenant: false,
    };
  }

  const [{ data: profile }, { data: isAdmin }, memberships] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.rpc("is_admin_user"),
    listUserMemberships(user.id),
  ]);

  const activeTenant = memberships[0] ?? null;
  const role =
    isAdmin
      ? "admin"
      : activeTenant?.role === "student_coordinator"
        ? "student_coordinator"
        : profile?.role ?? (activeTenant?.role === "faculty" ? "faculty" : null);
  const canManageTenant = Boolean(isAdmin) || activeTenant?.role === "faculty";

  return {
    user,
    profile,
    role,
    isAuthenticated: true,
    isAdmin: Boolean(isAdmin),
    memberships,
    activeTenant,
    canManageTenant,
  };
}

export async function requireAuthenticatedUser() {
  const userContext = await getCurrentUserContext();

  if (!userContext.user) {
    redirect("/auth?next=/events");
  }

  return userContext;
}

export async function requireAdminUser() {
  const userContext = await getCurrentUserContext();

  if (!userContext.user) {
    redirect("/admin/login?reason=auth");
  }

  if (!userContext.isAdmin) {
    redirect("/admin/login?reason=unauthorized");
  }

  return userContext;
}

export async function createUserProfile(params: {
  userId: string;
  fullName: string | null;
  role: Extract<AppRole, "student" | "faculty" | "student_coordinator">;
}) {
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("user_profiles").upsert({
    user_id: params.userId,
    full_name: params.fullName,
    role: params.role,
  });

  if (error) {
    throw error;
  }
}

export async function getRequestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "https";

  return host ? `${proto}://${host}` : undefined;
}

async function syncProfileRoleAfterInviteClaim(params: {
  userId: string;
  preferredRole?: Extract<AppRole, "student" | "faculty">;
}) {
  const admin = createSupabaseAdminClient();
  const [{ data: profile }, memberships] = await Promise.all([
    admin.from("user_profiles").select("*").eq("user_id", params.userId).maybeSingle(),
    listUserMemberships(params.userId),
  ]);

  const membershipRoles = memberships.map((membership) => membership.role);
  let resolvedRole: AppRole = "student";

  if (profile?.role === "admin") {
    resolvedRole = "admin";
  } else if (membershipRoles.includes("faculty")) {
    resolvedRole = "faculty";
  } else if (membershipRoles.includes("student_coordinator")) {
    resolvedRole = "student_coordinator";
  } else if (membershipRoles.includes("student")) {
    resolvedRole = "student";
  } else if (params.preferredRole === "faculty") {
    resolvedRole = "faculty";
  } else if (profile?.role === "faculty" || profile?.role === "student_coordinator") {
    resolvedRole = profile.role;
  }

  const { error } = await admin.from("user_profiles").upsert({
    user_id: params.userId,
    full_name: profile?.full_name ?? null,
    role: resolvedRole,
  });

  if (error) {
    throw error;
  }
}

export async function claimPendingInvitesForCurrentUser(params?: {
  preferredRole?: Extract<AppRole, "student" | "faculty">;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return 0;
  }

  const { data, error } = await supabase.rpc("claim_pending_invites_for_user", {
    preferred_role: params?.preferredRole,
    target_email: user.email,
    target_user_id: user.id,
  });

  if (error) {
    console.error("Failed to claim pending invites for the current user.", error);
    return 0;
  }

  await syncProfileRoleAfterInviteClaim({
    userId: user.id,
    preferredRole: params?.preferredRole,
  });

  return Number(data ?? 0);
}

export async function ensureFacultyWorkspace(params: {
  userId: string;
  fullName: string | null;
}) {
  const admin = createSupabaseAdminClient();
  const { data: existingMembership } = await admin
    .from("tenant_memberships")
    .select("id")
    .eq("user_id", params.userId)
    .limit(1)
    .maybeSingle();

  if (existingMembership) {
    return;
  }

  const workspaceName =
    `${params.fullName?.trim() || "Faculty"} Workspace`;
  const tenant = await createTenantWithUniqueSlug({
    createdBy: params.userId,
    description: "Faculty-managed workspace for event publishing and student coordination.",
    name: workspaceName,
  });

  const { error } = await admin.from("tenant_memberships").insert({
    invited_by: params.userId,
    role: "faculty" satisfies TenantMemberRole,
    tenant_id: tenant.id,
    user_id: params.userId,
  });

  if (error) {
    throw error;
  }
}
