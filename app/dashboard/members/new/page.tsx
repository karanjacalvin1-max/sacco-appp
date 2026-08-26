"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMemberAction } from "@/lib/actions/members";
import { Card, CardHeader } from "@/components/Card";
import { Button } from "@/components/Button";

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs uppercase tracking-wide text-ink-soft mb-1"
      >
        {label}
        {required && <span className="text-rust"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-paper focus:bg-paper-raised outline-none focus:border-forest"
      />
    </div>
  );
}

export default function NewMemberPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [createLogin, setCreateLogin] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createMemberAction(formData);
      if (!result.success) {
        setError(result.error || "Something went wrong.");
        return;
      }
      router.push(`/dashboard/members/${result.id}`);
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-forest-dark">
          Register a member
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Opens a Shares and a Savings account automatically.
        </p>
      </div>

      <form action={handleSubmit}>
        <Card>
          <CardHeader title="Personal details" />
          <div className="p-6 grid grid-cols-2 gap-4">
            <Field label="First name" name="firstName" required />
            <Field label="Last name" name="lastName" required />
            <Field label="Phone" name="phone" required />
            <Field label="National ID" name="nationalId" required />
            <Field label="Email" name="email" type="email" />
            <div className="col-span-2">
              <Field label="Address" name="address" />
            </div>
            <Field label="Next of kin name" name="nextOfKinName" />
            <Field label="Next of kin phone" name="nextOfKinPhone" />
          </div>

          <CardHeader
            title="Member login (optional)"
            subtitle="Lets this member sign in to view their own savings and loans."
          />
          <div className="p-6 space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="createLogin"
                checked={createLogin}
                onChange={(e) => setCreateLogin(e.target.checked)}
                className="accent-forest"
              />
              Create a self-service login for this member
            </label>
            {createLogin && (
              <div className="grid grid-cols-2 gap-4">
                <p className="col-span-2 text-xs text-ink-soft -mt-2">
                  Uses the email above as the login. A national email is
                  required.
                </p>
                <Field
                  label="Temporary password"
                  name="password"
                  type="password"
                  required={createLogin}
                />
              </div>
            )}
          </div>

          <div className="p-6 border-t border-line flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Register member"}
            </Button>
            {error && <p className="text-sm text-rust">{error}</p>}
          </div>
        </Card>
      </form>
    </div>
  );
}
