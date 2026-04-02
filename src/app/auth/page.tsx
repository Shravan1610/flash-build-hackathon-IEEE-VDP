import Link from "next/link";

import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction, signUpAction } from "@/features/auth/server/actions";

interface AuthPageProps {
  searchParams: Promise<{
    mode?: string;
    error?: string;
    message?: string;
    next?: string;
  }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "login";

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <SectionHeading
          eyebrow="Identity"
          title="Sign in if you want a saved student or faculty identity."
          description="Public browsing and anonymous form submissions stay open. Accounts are optional and mainly help with faster registrations, tenant invites, and role-aware analytics."
        />
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="rounded-[22px] bg-muted/50 p-4">
              <p className="text-sm font-medium">Student accounts</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Best for repeat event registrations and saved profile details.
              </p>
            </div>
            <div className="rounded-[22px] bg-muted/50 p-4">
              <p className="text-sm font-medium">Faculty accounts</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Uses the same public portal, but also creates a faculty-managed workspace for inviting students and coordinators.
              </p>
            </div>
            <div className="rounded-[22px] bg-muted/50 p-4">
              <p className="text-sm font-medium">Student coordinator</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This role is assigned through a faculty or admin invite and becomes active automatically after sign-in.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/events">Continue without logging in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className={mode === "login" ? "ring-2 ring-ring" : undefined}>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={signInAction} className="space-y-4">
              <input name="next" type="hidden" value={params.next ?? "/events"} />
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" name="email" required type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" name="password" required type="password" />
              </div>
              {params.error && mode === "login" ? (
                <p className="text-sm text-accent">{decodeURIComponent(params.error)}</p>
              ) : null}
              <Button className="w-full" type="submit">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className={mode === "signup" ? "ring-2 ring-ring" : undefined}>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={signUpAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-full-name">Full name</Label>
                <Input id="signup-full-name" name="fullName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" name="email" required type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" minLength={8} name="password" required type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-role">Role</Label>
                <select
                  className="flex h-11 w-full rounded-2xl border border-input bg-background/70 px-4 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue="student"
                  id="signup-role"
                  name="role"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              {params.error && mode === "signup" ? (
                <p className="text-sm text-accent">{decodeURIComponent(params.error)}</p>
              ) : null}
              <Button className="w-full" type="submit">
                Create account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
