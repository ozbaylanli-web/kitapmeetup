import { Avatar } from "@/components/ui/Avatar";
import type { AuthorSummary } from "@/lib/types";
import { firstName } from "@/lib/utils";

export function EventGoingNudge({ attendees }: { attendees: AuthorSummary[] }) {
  if (attendees.length === 0) return null;

  const names = attendees.slice(0, 2).map((a) => firstName(a.fullName));
  const namesText = names.length === 2 ? names.join(" ve ") : names[0];
  const extra = attendees.length - names.length;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] px-3.5 py-3 text-sm text-[var(--orange-800)]">
      <div className="flex -space-x-2">
        {attendees.slice(0, 3).map((a) => (
          <Avatar key={a.id} name={a.fullName} color={a.avatarColor} url={a.avatarUrl} size={28} className="ring-2 ring-[var(--orange-50)]" />
        ))}
      </div>
      <p className="leading-snug">
        <strong className="font-semibold">
          {namesText}
          {extra > 0 ? ` +${extra} kişi` : ""}
        </strong>{" "}
        aynı kitapları okuduğun okurlardan — bu etkinliğe gidiyorlar. Sen de gelsene? 👋
      </p>
    </div>
  );
}
