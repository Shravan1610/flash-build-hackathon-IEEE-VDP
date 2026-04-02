import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, Database } from "@/types/supabase";

type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

export interface ViewerContext {
  user: User | null;
  profile: UserProfileRow | null;
  isAdmin: boolean;
}

export interface AdminAuthActionState {
  status: "idle" | "error";
  message?: string;
}

function sanitizeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "/admin";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

export async function getViewerContext(): Promise<ViewerContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      isAdmin: false,
    };
  }

  const [{ data: profile }, { data: isAdmin }] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.rpc("is_admin_user"),
  ]);

  return {
    user,
    profile,
    isAdmin: Boolean(isAdmin),
  };
}

export async function requireAdmin() {
  const viewer = await getViewerContext();

  if (!viewer.user) {
    redirect("/admin/login?reason=auth");
  }

  if (!viewer.isAdmin) {
    redirect("/admin/login?reason=unauthorized");
  }

  return viewer;
}

export async function ensureUserProfile(userId: string, role: AppRole = "student") {
  const supabase = await createSupabaseServerClient();
  await supabase.from("user_profiles").upsert({
    user_id: userId,
    role,
  });
}

export async function signInAdminAction(
  _previousState: AdminAuthActionState,
  formData: FormData,
): Promise<AdminAuthActionState> {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");
  const nextPath = sanitizeNextPath(formData.get("next"));

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return {
      status: "error",
      message: "Enter a valid admin email and password.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      status: "error",
      message: "Sign-in failed. Check your credentials and try again.",
    };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin_user");

  if (!isAdmin) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "This account does not have admin access.",
    };
  }

  revalidatePath("/", "layout");
  redirect(nextPath as never);
}

export async function signOutAdminAction() {
  "use server";

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}
