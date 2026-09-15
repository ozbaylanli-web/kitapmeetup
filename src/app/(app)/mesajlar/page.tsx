import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { getConversations } from "@/lib/data/messages";
import { timeAgo } from "@/lib/utils";

export default async function MessagesInboxPage() {
  const conversations = await getConversations();

  return (
    <div>
      <PageHeader eyebrow="Sohbetler" title="Mesajlar" description="Kitap eşleşmelerinle başlattığın sohbetler burada." />
      {conversations.length === 0 ? (
        <EmptyState
          emoji="✉️"
          title="Henüz mesajın yok"
          description="Bir kitap eşleşmenin profiline gidip “Mesaj gönder”e basarak başlayabilirsin."
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.otherUser.id}
              href={`/mesajlar/${c.otherUser.username}`}
              className="paper-card flex items-center gap-3 p-3.5 transition-transform hover:-translate-y-0.5"
            >
              <Avatar name={c.otherUser.fullName} color={c.otherUser.avatarColor} url={c.otherUser.avatarUrl} size={42} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-[var(--ink)]">{c.otherUser.fullName}</p>
                  <span className="shrink-0 text-[11px] text-[var(--ink-muted)]">{timeAgo(c.lastMessageAt)}</span>
                </div>
                <p className={c.unread ? "truncate text-sm font-semibold text-[var(--ink)]" : "truncate text-sm text-[var(--ink-muted)]"}>
                  {c.fromMe && <span className="text-[var(--ink-muted)]">Sen: </span>}
                  {c.lastMessage}
                </p>
              </div>
              {c.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--orange-500)]" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
