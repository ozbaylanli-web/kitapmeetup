import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { getConversationWith } from "@/lib/data/messages";
import { getCurrentUser } from "@/lib/data/auth";
import { cn, timeAgo } from "@/lib/utils";

export default async function ConversationPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [conversation, currentUser] = await Promise.all([getConversationWith(username), getCurrentUser()]);
  if (!conversation || !currentUser) notFound();

  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5">
        <Link href="/mesajlar" className="rounded-full p-1.5 text-[var(--ink-muted)] hover:bg-[var(--paper-sunken)] hover:text-[var(--ink)]">
          <ChevronLeft size={20} />
        </Link>
        <Link href={`/profil/${conversation.otherUser.username}`} className="flex items-center gap-2.5">
          <Avatar name={conversation.otherUser.fullName} color={conversation.otherUser.avatarColor} url={conversation.otherUser.avatarUrl} size={36} />
          <div>
            <p className="font-semibold text-[var(--ink)]">{conversation.otherUser.fullName}</p>
            <p className="text-xs text-[var(--ink-muted)]">@{conversation.otherUser.username}</p>
          </div>
        </Link>
      </div>

      <div className="paper-card mb-4 space-y-2.5 p-4">
        {conversation.messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--ink-muted)]">Henüz mesaj yok — ilk mesajı sen gönder.</p>
        ) : (
          conversation.messages.map((m) => {
            const mine = m.senderId === currentUser.id;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-3.5 py-2 text-sm sm:max-w-[70%]",
                    mine ? "bg-[var(--orange-500)] text-white" : "bg-[var(--paper-sunken)] text-[var(--ink)]"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className={cn("mt-0.5 text-[10px]", mine ? "text-white/70" : "text-[var(--ink-muted)]")}>{timeAgo(m.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MessageComposer recipientUsername={conversation.otherUser.username} />
    </div>
  );
}
