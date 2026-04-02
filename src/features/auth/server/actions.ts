"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  claimPendingInvitesForCurrentUser,
  createUserProfile,
  ensureFacultyWorkspace,
} from "./auth";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/events";
  }

  return value;
}

export async function signInAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const next = sanitizeNextPath(getString(formData, "next") || "/events");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/auth?mode=login&error=${encodeURIComponent(error.message)}`);
  }

  await claimPendingInvitesForCurrentUser();
  revalidatePath("/", "layout");
  redirect(next as never);
}

export async function signUpAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const fullName = getString(formData, "fullName");
  const role = getString(formData, "role") === "faculty" ? "faculty" : "student";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    redirect(`/auth?mode=signup&error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await createUserProfile({
      userId: data.user.id,
      fullName: fullName || null,
      role,
    });
  }

  if (data.session && data.user) {
    await claimPendingInvitesForCurrentUser();

    if (role === "faculty") {
      await ensureFacultyWorkspace({
        userId: data.user.id,
        fullName: fullName || null,
      });
    }
  }

  revalidatePath("/", "layout");

  redirect(data.session ? "/events" : "/auth?mode=login");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function adminSignInAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login?error=session-unavailable");
  }

  const { data: isAdmin } = await supabase.rpc("is_admin_user");

  if (!isAdmin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=admin-only");
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}
