import Link from "next/link";
import { ReactNode } from "react";
import { requireStaff } from "@/lib/auth/guard";
import { logoutAction } from "@/lib/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireStaff();

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-line bg-paper-raised">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-forest text-forest font-display text-sm">
              U
            </span>
            <span className="font-display text-lg text-forest-dark">
              Umoja SACCO Manager
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="text-ink-soft hover:text-forest">
              Overview
            </Link>
            <Link
              href="/dashboard/members"
              className="text-ink-soft hover:text-forest"
            >
              Members
            </Link>
            <Link
              href="/dashboard/loans"
              className="text-ink-soft hover:text-forest"
            >
              Loans
            </Link>
            <span className="text-line">|</span>
            <span className="text-ink-soft">{session.email}</span>
            <form action={logoutAction}>
              <button className="text-rust hover:underline" type="submit">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
