"use client";

import { useState, useTransition } from "react";
import { recordSavingsTransactionAction } from "@/lib/actions/savings";
import { Button } from "@/components/Button";

type Transaction = {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
};

export function SavingsAccountCard({
  accountId,
  memberId,
  accountType,
  balance,
  transactions,
}: {
  accountId: string;
  memberId: string;
  accountType: string;
  balance: number;
  transactions: Transaction[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showHistory, setShowHistory] = useState(false);

  function submit(type: "DEPOSIT" | "WITHDRAWAL", formData: FormData) {
    setError(null);
    const amount = String(formData.get("amount") || "");
    const description = String(formData.get("description") || "");
    startTransition(async () => {
      const result = await recordSavingsTransactionAction(
        accountId,
        memberId,
        type,
        amount,
        description
      );
      if (!result.success) {
        setError(result.error || "Failed to record transaction.");
      } else {
        const form = document.getElementById(
          `form-${accountId}`
        ) as HTMLFormElement | null;
        form?.reset();
      }
    });
  }

  return (
    <div className="border border-line rounded-sm">
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-soft">
            {accountType}
          </p>
          <p className="font-display text-xl text-forest-dark font-mono-tab">
            KES {balance.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setShowHistory((s) => !s)}
          className="text-xs text-forest hover:underline"
        >
          {showHistory ? "Hide history" : "View history"}
        </button>
      </div>

      <div className="ledger-rule mx-5" />

      <form
        id={`form-${accountId}`}
        action={(fd) => {
          const intent = fd.get("intent");
          submit(intent === "WITHDRAWAL" ? "WITHDRAWAL" : "DEPOSIT", fd);
        }}
        className="px-5 py-4 flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-ink-soft mb-1">
            Amount (KES)
          </label>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
            className="w-full border border-line rounded-sm px-2 py-1.5 text-sm bg-paper outline-none focus:border-forest"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-ink-soft mb-1">
            Note (optional)
          </label>
          <input
            name="description"
            type="text"
            className="w-full border border-line rounded-sm px-2 py-1.5 text-sm bg-paper outline-none focus:border-forest"
          />
        </div>
        <Button
          type="submit"
          name="intent"
          value="DEPOSIT"
          disabled={pending}
          variant="primary"
        >
          Deposit
        </Button>
        <Button
          type="submit"
          name="intent"
          value="WITHDRAWAL"
          disabled={pending}
          variant="secondary"
        >
          Withdraw
        </Button>
      </form>
      {error && <p className="px-5 pb-3 text-sm text-rust">{error}</p>}

      {showHistory && (
        <div className="border-t border-line max-h-64 overflow-y-auto">
          {transactions.length === 0 ? (
            <p className="px-5 py-4 text-sm text-ink-soft">
              No transactions yet.
            </p>
          ) : (
            <div className="divide-y divide-line">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="px-5 py-2.5 flex items-center justify-between text-sm"
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
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
