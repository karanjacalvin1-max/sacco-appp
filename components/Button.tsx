import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-forest text-paper hover:bg-forest-dark disabled:bg-ink-soft/40",
  secondary:
    "bg-transparent text-forest border border-forest hover:bg-forest-light disabled:opacity-50",
  danger: "bg-rust text-paper hover:bg-rust/90 disabled:bg-ink-soft/40",
  ghost: "bg-transparent text-ink-soft hover:text-ink hover:bg-forest-light",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
