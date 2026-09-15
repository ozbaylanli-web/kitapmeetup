import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { timeAgo } from "@/lib/utils";
import type { EventRegistrant } from "@/lib/types";

/** Etkinlik yöneticisi için: kaç kişi kayıt oldu ve kayıt formuna ne yanıt verdiler. */
export function RegistrantsDashboard({ registrants }: { registrants: EventRegistrant[] }) {
  return (
    <div className="paper-card p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
        <Users size={15} /> Kayıtlar <span className="font-normal text-[var(--ink-muted)]">({registrants.length})</span>
      </h3>

      {registrants.length === 0 ? (
        <p className="text-xs text-[var(--ink-muted)]">Henüz &ldquo;Gidiyorum&rdquo; diyen olmadı.</p>
      ) : (
        <div className="space-y-3">
          {registrants.map((r) => (
            <div key={r.user.id} className="rounded-xl bg-[var(--paper-sunken)] p-2.5">
              <div className="flex items-center justify-between gap-2">
                <Link href={`/profil/${r.user.username}`} className="flex min-w-0 items-center gap-2">
                  <Avatar name={r.user.fullName} color={r.user.avatarColor} url={r.user.avatarUrl} size={26} />
                  <span className="truncate text-xs font-semibold text-[var(--ink)]">{r.user.fullName}</span>
                </Link>
                <span className="shrink-0 text-[10px] text-[var(--ink-muted)]">{timeAgo(r.registeredAt)}</span>
              </div>
              {r.answers.length > 0 && (
                <dl className="mt-2 space-y-1 border-t border-[var(--line)] pt-2">
                  {r.answers.map((a) => (
                    <div key={a.fieldId} className="text-xs">
                      <dt className="inline font-medium text-[var(--ink-soft)]">{a.label}: </dt>
                      <dd className="inline text-[var(--ink-muted)]">{a.value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
