"use client";

import { useState, useTransition } from "react";
import { decideLoanAction, recordRepaymentAction } from "@/lib/actions/loans";
import { calculateLoanTotals, DEFAULT_INTEREST_RATE } from "@/lib/loan-calc";
import { Button } from "@/components/Button";
import { Stamp } from "@/components/Stamp";

type Repayment = {
  id: string;
  amount: number;
  balanceAfter: number;
  paidAt: string;
};

type Loan = {
  id: string;
  loanNumber: string;
  memberId: string;
  principal: number;
  interestRate: number;
  termMonths: number;
  purpose: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "CLOSED";
  outstandingBalance: number;
  appliedAt: string;
  rejectionReason: string | null;
  repayments?: Repayment[];
};

export function LoanCard({
  loan,
  memberName,
  editable,
}: {
  loan: Loan;
  memberName?: string;
  editable: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showDecide, setShowDecide] = useState(false);
  const [showRepay, setShowRepay] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [rate, setRate] = useState(String(DEFAULT_INTEREST_RATE));

  const preview =
    loan.status === "PENDING"
      ? calculateLoanTotals(
          loan.principal,
          parseFloat(rate) || 0,
          loan.termMonths
        )
      : null;

  function decide(decision: "APPROVED" | "REJECTED", formData: FormData) {
    setError(null);
    const reason = String(formData.get("reason") || "");
    startTransition(async () => {
      const result = await decideLoanAction(
        loan.id,
        loan.memberId,
        decision,
        rate,
        reason
      );
      if (!result.success) setError(result.error || "Failed to decide.");
      else setShowDecide(false);
    });
  }

  function repay(formData: FormData) {
    setError(null);
    const amount = String(formData.get("amount") || "");
    startTransition(async () => {
      const result = await recordRepaymentAction(loan.id, loan.memberId, amount);
      if (!result.success) setError(result.error || "Failed to record repayment.");
      else setShowRepay(false);
    });
  }

  return (
    <div className="border border-line rounded-sm">
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">
            {memberName && <span>{memberName} · </span>}
            <span className="font-mono-tab">{loan.loanNumber}</span>
          </p>
          <p className="text-xs text-ink-soft mt-0.5">
            KES {loan.principal.toLocaleString()} over {loan.termMonths}{" "}
            months
            {loan.purpose ? ` · ${loan.purpose}` : ""}
          </p>
          {loan.status === "ACTIVE" && (
            <p className="text-sm font-mono-tab text-forest-dark mt-1">
              Outstanding: KES {loan.outstandingBalance.toLocaleString()} @{" "}
              {loan.interestRate}% p.a.
            </p>
          )}
          {loan.status === "REJECTED" && loan.rejectionReason && (
            <p className="text-xs text-rust mt-1">
              Reason: {loan.rejectionReason}
            </p>
          )}
        </div>
        <Stamp label={loan.status} />
      </div>

      {editable && loan.status === "PENDING" && (
        <div className="border-t border-line px-5 py-3">
          {!showDecide ? (
            <Button
              variant="secondary"
              onClick={() => setShowDecide(true)}
              type="button"
            >
              Review application
            </Button>
          ) : (
            <form
              action={(fd) => {
                const intent = fd.get("intent");
                decide(intent === "REJECTED" ? "REJECTED" : "APPROVED", fd);
              }}
              className="space-y-3"
            >
              <div className="flex items-end gap-3 flex-wrap">
                <div>
                  <label className="block text-xs text-ink-soft mb-1">
                    Interest rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    step="0.1"
                    min="0"
                    className="w-32 border border-line rounded-sm px-2 py-1.5 text-sm bg-paper outline-none focus:border-forest"
                  />
                </div>
                {preview && (
                  <p className="text-xs text-ink-soft">
                    Monthly installment ≈ KES{" "}
                    {preview.monthlyInstallment.toLocaleString()} · Total
                    payable KES {preview.totalPayable.toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-ink-soft mb-1">
                  Rejection reason (only needed if rejecting)
                </label>
                <input
                  name="reason"
                  type="text"
                  className="w-full border border-line rounded-sm px-2 py-1.5 text-sm bg-paper outline-none focus:border-forest"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  name="intent"
                  value="APPROVED"
                  disabled={pending}
                >
                  Approve & disburse
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="REJECTED"
                  variant="danger"
                  disabled={pending}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowDecide(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {editable && loan.status === "ACTIVE" && (
        <div className="border-t border-line px-5 py-3">
          {!showRepay ? (
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowRepay(true)}
            >
              Record repayment
            </Button>
          ) : (
            <form action={repay} className="flex items-end gap-3">
              <div>
                <label className="block text-xs text-ink-soft mb-1">
                  Amount (KES)
                </label>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="w-40 border border-line rounded-sm px-2 py-1.5 text-sm bg-paper outline-none focus:border-forest"
                />
              </div>
              <Button type="submit" disabled={pending}>
                Record
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowRepay(false)}
              >
                Cancel
              </Button>
            </form>
          )}
        </div>
      )}

      {loan.repayments && loan.repayments.length > 0 && (
        <div className="border-t border-line">
          <button
            onClick={() => setShowHistory((s) => !s)}
            className="w-full text-left px-5 py-2 text-xs text-forest hover:underline"
          >
            {showHistory
              ? "Hide repayment history"
              : `View repayment history (${loan.repayments.length})`}
          </button>
          {showHistory && (
            <div className="divide-y divide-line max-h-48 overflow-y-auto">
              {loan.repayments.map((r) => (
                <div
                  key={r.id}
                  className="px-5 py-2 flex items-center justify-between text-sm"
                >
                  <span className="text-forest">
                    +KES {r.amount.toLocaleString()}
                  </span>
                  <span className="text-xs text-ink-soft font-mono-tab">
                    balance KES {r.balanceAfter.toLocaleString()} ·{" "}
                    {new Date(r.paidAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="px-5 pb-3 text-sm text-rust">{error}</p>}
    </div>
  );
}
