import { cx } from "@/lib/cx";

type BadgeTone = "green" | "amber" | "red" | "slate" | "teal";

const toneClasses: Record<BadgeTone, string> = {
  green: "bg-green-50 text-green-700 ring-green-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
};

export function StatusBadge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
