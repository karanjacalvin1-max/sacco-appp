import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-paper-raised border border-line rounded-sm shadow-[0_1px_2px_rgba(26,40,32,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-line">
      <div>
        <h2 className="font-display text-lg text-forest-dark">{title}</h2>
        {subtitle && (
          <p className="text-sm text-ink-soft mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
