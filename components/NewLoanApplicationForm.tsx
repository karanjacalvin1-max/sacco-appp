"use client";

import { useState, useTransition } from "react";
import { applyLoanAction } from "@/lib/actions/loans";
import { Button } from "@/components/Button";

export function NewLoanApplicationForm({ memberId }: { memberId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    const principal = String(formData.get("principal") || "");
    const termMonths = String(formData.get("termMonths") || "");
    const purpose = String(formData.get("purpose") || "");
    startTransition(async () => {
      const result = await applyLoanAction(
        memberId,
        principal,
        termMonths,
        purpose
      );
      if (!result.success) {
        setError(result.error || "Failed to submit application.");
      } else {
        setOpen(false);
        (
          document.getElementById("new-loan-form") as HTMLFormElement | null
        )?.reset();
      }
    });
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        + Apply for a loan
      </Button>
    );
  }

  return (
    <form
      id="new-loan-form"
      action={submit}
      className="border border-line rounded-sm p-5 space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-ink-soft mb-1">
            Amount (KES)
          </label>
          <input
            name="principal"
            type="number"
            min="0"
            step="0.01"
            required
            className="w-full border border-line rounded-sm px-2 py-1.5 text-sm bg-paper outline-none focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-xs text-ink-soft mb-1">
            Term (months)
          </label>
          <input
            name="termMonths"
            type="number"
            min="1"
            max="120"
            required
            className="w-full border border-line rounded-sm px-2 py-1.5 text-sm bg-paper outline-none focus:border-forest"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-ink-soft mb-1">
            Purpose
          </label>
          <input
            name="purpose"
            type="text"
            className="w-full border border-line rounded-sm px-2 py-1.5 text-sm bg-paper outline-none focus:border-forest"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting…" : "Submit application"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {error && <p className="text-sm text-rust">{error}</p>}
    </form>
  );
}
