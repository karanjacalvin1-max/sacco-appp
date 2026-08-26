import { requireUser } from "@/lib/auth/guard";
import { getMemberFull } from "@/lib/actions/members";
import { Card, CardHeader } from "@/components/Card";

export default async function PortalSavingsPage() {
  const session = await requireUser();
  const member = await getMemberFull(session.memberId!);
  if (!member) {
    return <p className="text-sm text-rust">Your member record could not be found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-forest-dark">
          Your savings & shares
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Deposits and withdrawals are recorded by SACCO staff. Contact the
          office to make a transaction.
        </p>
      </div>

      {member.savingsAccounts.map((acc) => (
        <Card key={acc.id}>
          <CardHeader
            title={acc.accountType}
            subtitle={`Balance: KES ${acc.balance.toLocaleString()}`}
          />
          {acc.transactions.length === 0 ? (
            <p className="px-6 py-6 text-sm text-ink-soft">
              No transactions yet.
            </p>
          ) : (
            <div className="divide-y divide-line">
              {acc.transactions.map((t) => (
                <div
                  key={t.id}
                  className="px-6 py-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <span
                      className={
                        t.type === "DEPOSIT" ? "text-forest" : "text-rust"
                      }
                    >
                      {t.type === "DEPOSIT" ? "+" : "−"}KES{" "}
                      {t.amount.toLocaleString()}
                    </span>
                    {t.description && (
                      <span className="text-ink-soft"> · {t.description}</span>
                    )}
                  </div>
                  <span className="text-xs text-ink-soft font-mono-tab">
                    balance KES {t.balanceAfter.toLocaleString()} ·{" "}
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
