import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import {
  claimPendingInvitesForCurrentUser,
  ensureFacultyWorkspace,
} from "@/features/auth/server/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = "/auth";
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        await claimPendingInvitesForCurrentUser();

        if (user.user_metadata?.role === "faculty") {
          await ensureFacultyWorkspace({
            userId: user.id,
            fullName:
              typeof user.user_metadata?.full_name === "string"
                ? user.user_metadata.full_name
                : null,
          });
        }
      }

      redirectTo.searchParams.set("message", "confirmed");
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.searchParams.set("error", "confirmation-failed");
  return NextResponse.redirect(redirectTo);
}
