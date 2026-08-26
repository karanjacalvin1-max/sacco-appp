import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { Card, CardHeader } from "@/components/Card";
import { LoanCard } from "@/components/LoanCard";

export default async function LoansPage() {
  const loans = await db.query.loans.findMany({
    orderBy: desc(schema.loans.appliedAt),
    with: { member: true, repayments: { orderBy: desc(schema.loanRepayments.paidAt) } },
  });

  const pending = loans.filter((l) => l.status === "PENDING");
  const active = loans.filter((l) => l.status === "ACTIVE");
  const others = loans.filter(
    (l) => l.status === "CLOSED" || l.status === "REJECTED"
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-forest-dark">Loans</h1>
        <p className="text-sm text-ink-soft mt-1">
          {loans.length} loan{loans.length === 1 ? "" : "s"} on record ·{" "}
          {pending.length} pending decision
        </p>
      </div>

      {pending.length > 0 && (
        <Card>
          <CardHeader
            title="Pending applications"
            subtitle="Review and decide."
          />
          <div className="p-6 space-y-4">
            {pending.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                memberName={`${loan.member.firstName} ${loan.member.lastName}`}
                editable
              />
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Active loans"
          subtitle="Currently disbursed and being repaid."
        />
        <div className="p-6 space-y-4">
          {active.length === 0 ? (
            <p className="text-sm text-ink-soft">No active loans.</p>
          ) : (
            active.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                memberName={`${loan.member.firstName} ${loan.member.lastName}`}
                editable
              />
            ))
          )}
        </div>
      </Card>

      {others.length > 0 && (
        <Card>
          <CardHeader title="Closed & rejected" />
          <div className="p-6 space-y-4">
            {others.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                memberName={`${loan.member.firstName} ${loan.member.lastName}`}
                editable={false}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
