import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guard";
import { logoutAction } from "@/lib/actions/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireUser();
  if (session.role !== "MEMBER" || !session.memberId) {
    redirect("/dashboard");
  }

  const member = await db.query.members.findFirst({
    where: eq(schema.members.id, session.memberId),
  });

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-line bg-paper-raised">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-forest text-forest font-display text-sm">
              U
            </span>
            <span className="font-display text-lg text-forest-dark">
              Umoja SACCO
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/portal" className="text-ink-soft hover:text-forest">
              Home
            </Link>
            <Link
              href="/portal/savings"
              className="text-ink-soft hover:text-forest"
            >
              Savings
            </Link>
            <Link
              href="/portal/loans"
              className="text-ink-soft hover:text-forest"
            >
              Loans
            </Link>
            <span className="text-line">|</span>
            <span className="text-ink-soft">
              {member ? `${member.firstName} ${member.lastName}` : session.email}
            </span>
            <form action={logoutAction}>
              <button className="text-rust hover:underline" type="submit">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
