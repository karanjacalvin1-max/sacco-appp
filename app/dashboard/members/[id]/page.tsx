import { notFound } from "next/navigation";
import { getMemberFull } from "@/lib/actions/members";
import { requireStaff } from "@/lib/auth/guard";
import { Card, CardHeader } from "@/components/Card";
import { SavingsAccountCard } from "@/components/SavingsAccountCard";
import { LoanCard } from "@/components/LoanCard";
import { NewLoanApplicationForm } from "@/components/NewLoanApplicationForm";
import { MemberStatusControl } from "@/components/MemberStatusControl";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const member = await getMemberFull(id);
  if (!member) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-soft font-mono-tab">
            {member.memberNumber}
          </p>
          <h1 className="font-display text-2xl text-forest-dark">
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            {member.phone}
            {member.email ? ` · ${member.email}` : ""}
          </p>
        </div>
        <MemberStatusControl memberId={member.id} status={member.status} />
      </div>

      <Card>
        <CardHeader title="Member details" />
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 px-6 py-5 text-sm">
          <div>
            <dt className="text-xs text-ink-soft">National ID</dt>
            <dd>{member.nationalId}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-soft">Date joined</dt>
            <dd>{new Date(member.dateJoined).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-soft">Address</dt>
            <dd>{member.address || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-soft">Next of kin</dt>
            <dd>
              {member.nextOfKinName || "—"}
              {member.nextOfKinPhone ? ` · ${member.nextOfKinPhone}` : ""}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader
          title="Savings & shares"
          subtitle="Record deposits and withdrawals against each account."
        />
        <div className="p-6 space-y-4">
          {member.savingsAccounts.map((acc) => (
            <SavingsAccountCard
              key={acc.id}
              accountId={acc.id}
              memberId={member.id}
              accountType={acc.accountType}
              balance={acc.balance}
              transactions={acc.transactions}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Loans"
          subtitle="Applications, approvals, and repayments."
        />
        <div className="p-6 space-y-4">
          <NewLoanApplicationForm memberId={member.id} />
          {member.loans.length === 0 ? (
            <p className="text-sm text-ink-soft">No loans on record.</p>
          ) : (
            member.loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} editable />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
