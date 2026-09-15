import type { ReactNode } from "react";

export function EmptyState({
  emoji = "📭",
  title,
  description,
  action,
}: {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="paper-card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="text-4xl">{emoji}</span>
      <h3 className="font-serif text-lg font-semibold text-[var(--ink)]">{title}</h3>
      {description && <p className="max-w-sm text-sm text-[var(--ink-muted)]">{description}</p>}
      {action}
    </div>
  );
}
