import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--orange-600)]">{eyebrow}</p>
        )}
        <h1 className="font-serif text-2xl font-semibold text-[var(--ink)] sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-sm text-[var(--ink-muted)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
