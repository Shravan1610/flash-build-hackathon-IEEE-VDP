import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserContext } from "@/features/auth/server/auth";
import type { AppRole, TenantMemberRole } from "@/types/supabase";

import type { TenantWorkspaceSnapshot } from "../types/tenant";

const MANAGER_ROLES: TenantMemberRole[] = ["faculty"];

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeTenantRole(value: FormDataEntryValue | null): TenantMemberRole {
  if (value === "student_coordinator" || value === "student") {
    return value;
  }

  return "student";
}

function membershipRoleToAppRole(role: TenantMemberRole): Extract<AppRole, "student" | "faculty" | "student_coordinator"> {
  if (role === "student_coordinator") {
    return "student_coordinator";
  }

  return "student";
}

export async function getManageableTenantWorkspace(): Promise<TenantWorkspaceSnapshot | null> {
  const viewer = await getCurrentUserContext();

  if (!viewer.user || !viewer.canManageTenant || !viewer.activeTenant) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const tenantId = viewer.activeTenant.tenantId;

  const [
    { data: tenant },
    { data: memberships },
    { data: invites },
    { data: profiles },
    { data: events },
    { data: forms },
    { data: submissions },
  ] = await Promise.all([
    admin.from("tenants").select("*").eq("id", tenantId).maybeSingle(),
    admin.from("tenant_memberships").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: true }),
    admin.from("tenant_invites").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false }),
    admin.from("user_profiles").select("user_id, full_name"),
    admin.from("events").select("id, status").eq("tenant_id", tenantId),
    admin.from("event_forms").select("id").eq("tenant_id", tenantId),
    admin.from("form_submissions").select("id").eq("tenant_id", tenantId),
  ]);

  if (!tenant) {
    return null;
  }

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.user_id, profile.full_name]));

  return {
    tenant,
    members: (memberships ?? []).map((membership) => ({
      userId: membership.user_id,
      fullName: profileMap.get(membership.user_id) ?? null,
      role: membership.role,
      joinedAt: membership.created_at,
    })),
    invites: (invites ?? []).map((invite) => ({
      id: invite.id,
      invitedEmail: invite.invited_email,
      role: invite.role,
      inviteToken: invite.invite_token,
      acceptedAt: invite.accepted_at,
      createdAt: invite.created_at,
    })),
    metrics: {
      totalMembers: memberships?.length ?? 0,
      pendingInvites: (invites ?? []).filter((invite) => !invite.accepted_at).length,
      publishedEvents: (events ?? []).filter((event) => event.status === "published").length,
      totalForms: forms?.length ?? 0,
      totalSubmissions: submissions?.length ?? 0,
    },
  };
}

export async function inviteTenantMemberAction(formData: FormData) {
  "use server";

  const viewer = await getCurrentUserContext();

  if (!viewer.user || !viewer.activeTenant || !viewer.canManageTenant) {
    redirect("/auth?next=/workspace");
  }

  if (!viewer.isAdmin && !MANAGER_ROLES.includes(viewer.activeTenant.role)) {
    redirect("/events");
  }

  const invitedEmail = normalizeEmail(formData.get("email"));
  const tenantRole = normalizeTenantRole(formData.get("role"));

  if (!invitedEmail) {
    redirect("/workspace?error=missing-email");
  }

  const admin = createSupabaseAdminClient();

  const { data: existingInvite } = await admin
    .from("tenant_invites")
    .select("id")
    .eq("tenant_id", viewer.activeTenant.tenantId)
    .eq("invited_email", invitedEmail)
    .is("accepted_at", null)
    .maybeSingle();

  if (existingInvite) {
    redirect("/workspace?error=invite-exists");
  }

  const { data: existingProfile } = await admin
    .from("user_profiles")
    .select("user_id")
    .eq("user_id", viewer.user.id)
    .maybeSingle();

  if (!existingProfile) {
    redirect("/workspace?error=profile-missing");
  }

  const { data: userRecord } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const matchedUser = userRecord.users.find((candidate) => candidate.email?.toLowerCase() === invitedEmail);

  const { error } = await admin.from("tenant_invites").insert({
    invite_token: randomUUID(),
    invited_by: viewer.user.id,
    invited_email: invitedEmail,
    invited_user_id: matchedUser?.id ?? null,
    role: tenantRole,
    tenant_id: viewer.activeTenant.tenantId,
  });

  if (error) {
    redirect(`/workspace?error=${encodeURIComponent(error.message)}`);
  }

  if (matchedUser?.id) {
    await admin.rpc("claim_pending_invites_for_user", {
      preferred_role: membershipRoleToAppRole(tenantRole),
      target_email: invitedEmail,
      target_user_id: matchedUser.id,
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/workspace");
  redirect("/workspace?invited=1");
}
