import { redirect } from "next/navigation";

import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUserContext } from "@/features/auth/server/auth";
import {
  getManageableTenantWorkspace,
  inviteTenantMemberAction,
} from "@/features/tenants/server/workspace";

interface WorkspacePageProps {
  searchParams: Promise<{
    invited?: string;
    error?: string;
  }>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing-email":
      return "Enter an email address before sending the invite.";
    case "invite-exists":
      return "There is already a pending invite for this email in the current workspace.";
    case "profile-missing":
      return "Your profile was not found. Sign out and sign back in, then try again.";
    default:
      return error ? decodeURIComponent(error) : null;
  }
}

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ searchParams }: WorkspacePageProps) {
  const [params, viewer, workspace] = await Promise.all([
    searchParams,
    getCurrentUserContext(),
    getManageableTenantWorkspace(),
  ]);

  if (!viewer.user) {
    redirect("/auth?next=/workspace");
  }

  if (!viewer.canManageTenant || !workspace) {
    redirect("/events");
  }

  const errorMessage = getErrorMessage(params.error);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Tenant Workspace"
        title={`${workspace.tenant.name} coordination hub`}
        description="Faculty can invite students, assign student coordinator roles, and monitor activity inside their tenant."
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Members</p>
            <p className="text-4xl font-semibold">{workspace.metrics.totalMembers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Pending invites</p>
            <p className="text-4xl font-semibold">{workspace.metrics.pendingInvites}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Published events</p>
            <p className="text-4xl font-semibold">{workspace.metrics.publishedEvents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Form submissions</p>
            <p className="text-4xl font-semibold">{workspace.metrics.totalSubmissions}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Invite a member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={inviteTenantMemberAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" name="email" placeholder="student@college.edu" required type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Workspace role</Label>
                <select
                  className="flex h-11 w-full rounded-2xl border border-input bg-background/70 px-4 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue="student"
                  id="invite-role"
                  name="role"
                >
                  <option value="student">Student</option>
                  <option value="student_coordinator">Student coordinator</option>
                </select>
              </div>
              {params.invited ? <p className="text-sm text-primary">Invite stored. If the user signs in with that email, the tenant role will be claimed automatically.</p> : null}
              {errorMessage ? <p className="text-sm text-accent">{errorMessage}</p> : null}
              <Button className="w-full" type="submit">
                Send invite
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workspace.members.map((member) => (
              <div
                key={member.userId}
                className="flex flex-col gap-2 rounded-[22px] border border-border/70 bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{member.fullName ?? "Unnamed member"}</p>
                  <p className="text-sm text-muted-foreground">Joined {formatDate(member.joinedAt)}</p>
                </div>
                <Badge variant="outline">{member.role.replaceAll("_", " ")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Pending and accepted invites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspace.invites.length ? (
            workspace.invites.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-col gap-2 rounded-[22px] border border-border/70 bg-muted/30 px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{invite.invitedEmail}</p>
                  <p className="text-sm text-muted-foreground">
                    {invite.acceptedAt
                      ? `Accepted on ${formatDate(invite.acceptedAt)}`
                      : `Pending since ${formatDate(invite.createdAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={invite.acceptedAt ? "success" : "outline"}>
                    {invite.acceptedAt ? "accepted" : "pending"}
                  </Badge>
                  <Badge variant="outline">{invite.role.replaceAll("_", " ")}</Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No invites yet. Create one to let students or coordinators join this workspace.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
