import { redirect } from "next/navigation";
import { getSession, SessionPayload } from "./session";

/** Require any logged-in user. Redirects to /login if not authenticated. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Require staff or admin role. Redirects members to their portal. */
export async function requireStaff(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role !== "ADMIN" && session.role !== "STAFF") {
    redirect("/portal");
  }
  return session;
}

/** Require admin role specifically. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}
