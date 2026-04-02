import Link from "next/link";

import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminSignInAction } from "@/features/auth/server/actions";

interface AdminLoginPageProps {
  searchParams: Promise<{
    error?: string;
    reason?: string;
  }>;
}

function getReasonMessage(reason?: string) {
  if (reason === "unauthorized") {
    return "This account is signed in but does not have admin privileges.";
  }

  if (reason === "signin" || reason === "auth") {
    return "Sign in with an admin account to continue.";
  }

  return null;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const reasonMessage = getReasonMessage(params.reason);
  const errorMessage = params.error ? decodeURIComponent(params.error) : null;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <SectionHeading
          eyebrow="Protected Admin"
          title="Only admins can access publishing, forms, and analytics."
          description="Students and faculty can create normal accounts from the public auth page, but this route is reserved for the separate admin role."
        />
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="rounded-[22px] bg-muted/50 p-4">
              <p className="text-sm font-medium">Protected routes</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                `/admin`, `/admin/forms`, `/admin/events`, `/admin/uploads`, and `/admin/analytics`
                all enforce server-side admin checks.
              </p>
            </div>
            <div className="rounded-[22px] bg-muted/50 p-4">
              <p className="text-sm font-medium">Public remains public</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Event discovery and published registration forms still work without admin access.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/events">Back to public events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={adminSignInAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin email</Label>
              <Input id="admin-email" name="email" required type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" minLength={8} name="password" required type="password" />
            </div>
            {reasonMessage ? <p className="text-sm text-muted-foreground">{reasonMessage}</p> : null}
            {errorMessage ? <p className="text-sm text-accent">{errorMessage}</p> : null}
            <Button className="w-full" type="submit">
              Continue to admin
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
