"use client";

import { useTransition } from "react";
import { updateMemberStatusAction } from "@/lib/actions/members";
import { Stamp } from "@/components/Stamp";

const OPTIONS = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;

export function MemberStatusControl({
  memberId,
  status,
}: {
  memberId: string;
  status: (typeof OPTIONS)[number];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <Stamp label={status} />
      <select
        defaultValue={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as (typeof OPTIONS)[number];
          startTransition(async () => {
            await updateMemberStatusAction(memberId, next);
          });
        }}
        className="text-xs border border-line rounded-sm px-2 py-1 bg-paper-raised outline-none focus:border-forest"
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o}>
            Set {o.toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
