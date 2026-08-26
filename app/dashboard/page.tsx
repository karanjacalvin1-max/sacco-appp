import Link from "next/link";
import { db, schema } from "@/lib/db";
import { sql, eq, desc } from "drizzle-orm";
import { Card, CardHeader } from "@/components/Card";
import { Stamp } from "@/components/Stamp";

export default async function DashboardOverviewPage() {
  const [memberCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.members);

  const [savingsTotal] = await db
    .select({ total: sql<number>`coalesce(sum(balance), 0)` })
    .from(schema.savingsAccounts);

  const [activeLoans] = await db
    .select({
      count: sql<number>`count(*)`,
      outstanding: sql<number>`coalesce(sum(outstanding_balance), 0)`,
    })
    .from(schema.loans)
    .where(eq(schema.loans.status, "ACTIVE"));

  const pendingLoans = await db.query.loans.findMany({
    where: eq(schema.loans.status, "PENDING"),
    orderBy: desc(schema.loans.appliedAt),
    with: { member: true },
    limit: 8,
  });

  const recentMembers = await db
    .select()
    .from(schema.members)
    .orderBy(desc(schema.members.createdAt))
    .limit(5);

  const stats = [
    { label: "Total members", value: memberCount?.count ?? 0 },
    {
      label: "Total savings & shares",
      value: `KES ${Number(savingsTotal?.total ?? 0).toLocaleString()}`,
    },
    { label: "Active loans", value: activeLoans?.count ?? 0 },
    {
      label: "Outstanding balance",
      value: `KES ${Number(activeLoans?.outstanding ?? 0).toLocaleString()}`,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-forest-dark">Overview</h1>
        <p className="text-sm text-ink-soft mt-1">
          A snapshot of the SACCO&apos;s books today.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              {s.label}
            </p>
            <p className="font-display text-2xl text-forest-dark mt-1 font-mono-tab">
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Pending loan applications"
          subtitle={`${pendingLoans.length} awaiting a decision`}
          action={
            <Link
              href="/dashboard/loans"
              className="text-sm text-forest hover:underline"
            >
              View all loans →
            </Link>
          }
        />
        {pendingLoans.length === 0 ? (
          <p className="px-6 py-6 text-sm text-ink-soft">
            Nothing waiting — every application has been decided.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {pendingLoans.map((loan) => (
              <Link
                key={loan.id}
                href={`/dashboard/members/${loan.memberId}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-forest-light/40"
              >
                <div>
                  <p className="text-sm font-medium">
                    {loan.member.firstName} {loan.member.lastName}{" "}
                    <span className="text-ink-soft font-mono-tab">
                      · {loan.loanNumber}
                    </span>
                  </p>
                  <p className="text-xs text-ink-soft">
                    Requested KES {loan.principal.toLocaleString()} over{" "}
                    {loan.termMonths} months
                  </p>
                </div>
                <Stamp label="PENDING" />
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Recently joined members"
          action={
            <Link
              href="/dashboard/members"
              className="text-sm text-forest hover:underline"
            >
              View all members →
            </Link>
          }
        />
        <div className="divide-y divide-line">
          {recentMembers.map((m) => (
            <Link
              key={m.id}
              href={`/dashboard/members/${m.id}`}
              className="flex items-center justify-between px-6 py-3 hover:bg-forest-light/40"
            >
              <div>
                <p className="text-sm font-medium">
                  {m.firstName} {m.lastName}
                </p>
                <p className="text-xs text-ink-soft font-mono-tab">
                  {m.memberNumber} · {m.phone}
                </p>
              </div>
              <Stamp label={m.status} />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
