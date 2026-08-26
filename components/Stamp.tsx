const STAMP_COLORS: Record<string, string> = {
  ACTIVE: "text-forest",
  APPROVED: "text-forest",
  CLOSED: "text-ink-soft",
  PENDING: "text-gold",
  REJECTED: "text-rust",
  SUSPENDED: "text-rust",
  INACTIVE: "text-ink-soft",
};

export function Stamp({ label }: { label: string }) {
  const colorClass = STAMP_COLORS[label] || "text-ink-soft";
  return <span className={`stamp ${colorClass}`}>{label}</span>;
}
