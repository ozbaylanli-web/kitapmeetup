"use client";

import { useState, useTransition, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { createCommentAction } from "@/lib/actions/posts";
import { Avatar } from "@/components/ui/Avatar";
import { DemoNote } from "@/components/ui/DemoNote";
import { buttonVariants } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";
import type { CommentItem } from "@/lib/types";

export function CommentsSection({ postId, initialCount }: { postId: string; initialCount: number }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function loadComments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      setComments(data.comments ?? []);
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && comments === null) void loadComments();
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    setDemo(false);

    const formData = new FormData();
    formData.set("targetType", "post");
    formData.set("targetId", postId);
    formData.set("body", text.trim());

    startTransition(async () => {
      const result = await createCommentAction({ ok: true }, formData);
      if (result.ok) {
        setText("");
        void loadComments();
      } else if (result.demo) {
        setDemo(true);
      } else if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-[var(--ink-muted)] hover:bg-[var(--paper-sunken)]"
      >
        <MessageCircle size={17} strokeWidth={2.2} />
        {initialCount > 0 && <span>{initialCount}</span>}
        <span className="hidden sm:inline">yorum</span>
      </button>

      {open && (
        <div className="w-full space-y-3 border-t border-[var(--line)] pt-3">
          {loading && <p className="text-xs text-[var(--ink-muted)]">Yorumlar yükleniyor…</p>}
          {!loading &&
            comments?.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <Avatar name={c.author.fullName} color={c.author.avatarColor} url={c.author.avatarUrl} size={26} />
                <div className="min-w-0 flex-1 rounded-xl bg-[var(--paper-sunken)] px-3 py-2">
                  <p className="text-xs font-semibold text-[var(--ink)]">
                    {c.author.fullName} <span className="ml-1 font-normal text-[var(--ink-muted)]">{timeAgo(c.createdAt)}</span>
                  </p>
                  <p className="text-sm text-[var(--ink-soft)]">{c.body}</p>
                </div>
              </div>
            ))}
          {!loading && comments?.length === 0 && (
            <p className="text-xs text-[var(--ink-muted)]">Henüz yorum yok — ilk yorumu sen yaz.</p>
          )}

          <form onSubmit={submit} className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Bir şeyler yaz…"
              className="flex-1 rounded-full border border-[var(--line-strong)] bg-[var(--paper-elevated)] px-3.5 py-2 text-sm outline-none focus:border-[var(--orange-400)]"
            />
            <button type="submit" disabled={pending} className={buttonVariants("secondary", "sm")}>
              Gönder
            </button>
          </form>
          {demo && <DemoNote />}
          {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        </div>
      )}
    </>
  );
}
