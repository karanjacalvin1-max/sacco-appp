import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { getMemberFull } from "@/lib/actions/members";
import { Card, CardHeader } from "@/components/Card";
import { Stamp } from "@/components/Stamp";

export default async function PortalHomePage() {
  const session = await requireUser();
  const member = await getMemberFull(session.memberId!);
  if (!member) {
    return <p className="text-sm text-rust">Your member record could not be found.</p>;
  }

  const totalSavings = member.savingsAccounts.reduce(
    (sum, a) => sum + a.balance,
    0
  );
  const activeLoan = member.loans.find((l) => l.status === "ACTIVE");
  const pendingLoan = member.loans.find((l) => l.status === "PENDING");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-soft font-mono-tab">
          {member.memberNumber}
        </p>
        <h1 className="font-display text-2xl text-forest-dark">
          Welcome back, {member.firstName}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="px-5 py-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">
            Total savings & shares
          </p>
          <p className="font-display text-2xl text-forest-dark mt-1 font-mono-tab">
            KES {totalSavings.toLocaleString()}
          </p>
          <Link
            href="/portal/savings"
            className="text-sm text-forest hover:underline mt-2 inline-block"
          >
            View accounts →
          </Link>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-xs uppercase tracking-wide text-ink-soft">
            Loan status
          </p>
          {activeLoan ? (
            <>
              <p className="font-display text-2xl text-forest-dark mt-1 font-mono-tab">
                KES {activeLoan.outstandingBalance.toLocaleString()}
              </p>
              <p className="text-xs text-ink-soft mt-0.5">outstanding</p>
            </>
          ) : pendingLoan ? (
            <div className="mt-1">
              <Stamp label="PENDING" />
            </div>
          ) : (
            <p className="text-sm text-ink-soft mt-1">No active loan</p>
          )}
          <Link
            href="/portal/loans"
            className="text-sm text-forest hover:underline mt-2 inline-block"
          >
            View loans →
          </Link>
        </Card>
      </div>

      <Card>
        <CardHeader title="Your accounts" />
        <div className="divide-y divide-line">
          {member.savingsAccounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between px-6 py-3"
            >
              <span className="text-sm">{acc.accountType}</span>
              <span className="text-sm font-mono-tab">
                KES {acc.balance.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
