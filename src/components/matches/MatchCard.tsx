import Link from "next/link";
import { MessageCircle, CalendarDays } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { buttonVariants } from "@/components/ui/Button";
import type { BookMatch } from "@/lib/types";
import { describeMatch, firstName } from "@/lib/utils";

export function MatchCard({ match }: { match: BookMatch }) {
  const extra = match.sharedBooks.length - 3;

  return (
    <div className="paper-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Link href={`/profil/${match.user.username}`} className="shrink-0">
          <Avatar name={match.user.fullName} color={match.user.avatarColor} url={match.user.avatarUrl} size={48} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/profil/${match.user.username}`} className="font-semibold text-[var(--ink)] hover:underline">
            {match.user.fullName}
          </Link>
          <p className="text-xs text-[var(--ink-muted)]">
            @{match.user.username}
            {match.user.city ? ` · ${match.user.city}` : ""}
          </p>

          <div className="mt-2.5 space-y-1.5">
            {match.sharedBooks.slice(0, 3).map((sb) => (
              <div key={sb.book.id} className="flex items-center gap-2 rounded-lg bg-[var(--paper-sunken)] px-2.5 py-1.5">
                <span className="h-7 w-1.5 shrink-0 rounded-sm" style={{ backgroundColor: sb.book.spineColor }} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[var(--ink)]">{sb.book.title}</p>
                  <p className="text-[11px] text-[var(--ink-muted)]">{describeMatch(sb.myStatus, sb.theirStatus)}</p>
                </div>
              </div>
            ))}
            {extra > 0 && <p className="pl-1 text-[11px] text-[var(--ink-muted)]">+{extra} ortak kitap daha</p>}
          </div>

          {(match.sharedGenres.length > 0 || match.sharedClubs.length > 0 || match.sharedEvents.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {match.sharedGenres.map((g) => (
                <span key={g} className="tag-pill bg-[var(--paper-sunken)] text-[var(--ink-soft)]">
                  📖 {g}
                </span>
              ))}
              {match.sharedClubs.map((c) => (
                <Link key={c.id} href={`/kulupler/${c.slug}`} className="tag-pill bg-[var(--paper-sunken)] text-[var(--ink-soft)] hover:bg-[var(--line)]">
                  {c.icon} {c.name}
                </Link>
              ))}
              {match.sharedEvents.map((e) => (
                <Link key={e.slug} href={`/etkinlikler/${e.slug}`} className="tag-pill bg-[var(--paper-sunken)] text-[var(--ink-soft)] hover:bg-[var(--line)]">
                  📅 {e.title}
                </Link>
              ))}
            </div>
          )}

          {match.upcomingEventTogether && (
            <Link
              href={`/etkinlikler/${match.upcomingEventTogether.slug}`}
              className="mt-2.5 flex items-start gap-1.5 rounded-lg border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] px-2.5 py-2 text-[11px] font-medium leading-snug text-[var(--orange-700)]"
            >
              <CalendarDays size={13} className="mt-0.5 shrink-0" />
              <span>
                {firstName(match.user.fullName)}, &ldquo;{match.upcomingEventTogether.title}&rdquo; etkinliğine gidiyor — sen de gel!
              </span>
            </Link>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/profil/${match.user.username}`} className={buttonVariants("outline", "sm")}>
              Profiline bak
            </Link>
            <Link href={`/mesajlar/${match.user.username}`} className={buttonVariants("secondary", "sm")}>
              <MessageCircle size={13} /> Mesaj gönder
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
