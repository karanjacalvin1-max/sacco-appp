import { requireUser } from "@/lib/auth/guard";
import { getMemberFull } from "@/lib/actions/members";
import { Card, CardHeader } from "@/components/Card";
import { LoanCard } from "@/components/LoanCard";
import { NewLoanApplicationForm } from "@/components/NewLoanApplicationForm";

export default async function PortalLoansPage() {
  const session = await requireUser();
  const member = await getMemberFull(session.memberId!);
  if (!member) {
    return <p className="text-sm text-rust">Your member record could not be found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-forest-dark">Your loans</h1>
        <p className="text-sm text-ink-soft mt-1">
          Apply for a loan or track an existing one.
        </p>
      </div>

      <NewLoanApplicationForm memberId={member.id} />

      <Card>
        <CardHeader title="Loan history" />
        <div className="p-6 space-y-4">
          {member.loans.length === 0 ? (
            <p className="text-sm text-ink-soft">
              You have no loans on record yet.
            </p>
          ) : (
            member.loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} editable={false} />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
