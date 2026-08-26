import Link from "next/link";
import { listMembers } from "@/lib/actions/members";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Stamp } from "@/components/Stamp";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const members = await listMembers(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-forest-dark">Members</h1>
          <p className="text-sm text-ink-soft mt-1">
            {members.length} member{members.length === 1 ? "" : "s"}{" "}
            registered
          </p>
        </div>
        <Link href="/dashboard/members/new">
          <Button>+ Register member</Button>
        </Link>
      </div>

      <form className="flex gap-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q || ""}
          placeholder="Search by name, member no., phone, or ID…"
          className="flex-1 border border-line rounded-sm px-3 py-2 text-sm bg-paper-raised outline-none focus:border-forest"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Card>
        {members.length === 0 ? (
          <p className="px-6 py-8 text-sm text-ink-soft text-center">
            No members found.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {members.map((m) => (
              <Link
                key={m.id}
                href={`/dashboard/members/${m.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-forest-light/40"
              >
                <div>
                  <p className="text-sm font-medium">
                    {m.firstName} {m.lastName}
                  </p>
                  <p className="text-xs text-ink-soft font-mono-tab">
                    {m.memberNumber} · {m.phone}
                    {m.email ? ` · ${m.email}` : ""}
                  </p>
                </div>
                <Stamp label={m.status} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
