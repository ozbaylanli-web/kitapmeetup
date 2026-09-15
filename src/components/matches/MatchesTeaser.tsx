import Link from "next/link";
import { Users2, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { getBookMatches } from "@/lib/data/matches";

export async function MatchesTeaser() {
  const matches = await getBookMatches();
  if (matches.length === 0) return null;

  return (
    <Link
      href="/eslesmeler"
      className="paper-card mb-4 flex items-center gap-3 p-3.5 transition-transform hover:-translate-y-0.5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--orange-100)] text-[var(--orange-600)]">
        <Users2 size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--ink)]">
          {matches.length} eşleşmen var
        </p>
        <p className="truncate text-xs text-[var(--ink-muted)]">
          {matches
            .slice(0, 3)
            .map((m) => m.user.fullName)
            .join(", ")}{" "}
          — ortak kitap, tür, kulüp ya da etkinlikleriniz var
        </p>
      </div>
      <div className="flex -space-x-2">
        {matches.slice(0, 3).map((m) => (
          <Avatar key={m.user.id} name={m.user.fullName} color={m.user.avatarColor} url={m.user.avatarUrl} size={28} className="ring-2 ring-[var(--paper-elevated)]" />
        ))}
      </div>
      <ChevronRight size={18} className="shrink-0 text-[var(--ink-muted)]" />
    </Link>
  );
}
