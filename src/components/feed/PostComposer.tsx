"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { MessageCircle, Quote, ImageIcon, HelpCircle, Repeat, Search } from "lucide-react";
import { createPostAction } from "@/lib/actions/posts";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import type { AuthorSummary, ClubSummary, PostType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPES: { value: PostType; label: string; icon: typeof Quote; placeholder: string }[] = [
  { value: "text", label: "Sohbet", icon: MessageCircle, placeholder: "Aklından ne geçiyor?" },
  { value: "quote", label: "Alıntı", icon: Quote, placeholder: "Hangi satır seni durdurdu?" },
  { value: "photo", label: "Fotoğraf", icon: ImageIcon, placeholder: "Fotoğrafına kısa bir not düş…" },
  { value: "question", label: "Soru", icon: HelpCircle, placeholder: "Topluluğa ne sormak istersin?" },
  { value: "takas", label: "Takas", icon: Repeat, placeholder: "Karşılığında ne arıyorsun? (opsiyonel not)" },
  { value: "takas_arama", label: "Arıyorum", icon: Search, placeholder: "Bu kitabı neden arıyorsun? (opsiyonel not)" },
];
const VISIBLE_TYPES = TYPES.filter((t) => t.value !== "takas_arama");

const initialState = { ok: true as const };

export function PostComposer({ currentUser, clubs }: { currentUser: AuthorSummary; clubs: ClubSummary[] }) {
  const [type, setType] = useState<PostType>("text");
  const [state, formAction, pending] = useActionState(createPostAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);
  const activeType = TYPES.find((t) => t.value === type)!;
  const isSwap = type === "takas" || type === "takas_arama";
  const isSeeking = type === "takas_arama";

  useEffect(() => {
    if (wasPending.current && !pending && state.ok) {
      formRef.current?.reset();
      setType("text");
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="paper-card mb-6 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Avatar name={currentUser.fullName} color={currentUser.avatarColor} url={currentUser.avatarUrl} size={40} />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {VISIBLE_TYPES.map((t) => {
              const active = t.value === "takas" ? isSwap : type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-[var(--orange-400)] bg-[var(--orange-100)] text-[var(--orange-700)]"
                      : "border-[var(--line)] text-[var(--ink-muted)] hover:bg-[var(--paper-sunken)]"
                  )}
                >
                  <t.icon size={13} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {isSwap && (
            <div className="flex gap-1.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setType("takas")}
                className={cn(
                  "rounded-full px-3 py-1 transition-colors",
                  type === "takas" ? "bg-[var(--ink)] text-white" : "bg-[var(--paper-sunken)] text-[var(--ink-muted)]"
                )}
              >
                Elimde var
              </button>
              <button
                type="button"
                onClick={() => setType("takas_arama")}
                className={cn(
                  "rounded-full px-3 py-1 transition-colors",
                  type === "takas_arama" ? "bg-[var(--ink)] text-white" : "bg-[var(--paper-sunken)] text-[var(--ink-muted)]"
                )}
              >
                Arıyorum
              </button>
            </div>
          )}

          <input type="hidden" name="type" value={type} />

          <textarea
            name="body"
            rows={3}
            placeholder={activeType.placeholder}
            className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
          />

          {(type === "quote" || type === "photo" || isSwap) && (
            <div className="grid grid-cols-2 gap-2">
              <input
                name="bookTitle"
                required={isSwap}
                placeholder={type === "takas" ? "Takas edeceğin kitap" : isSeeking ? "Aradığın kitap" : "Kitap adı (opsiyonel)"}
                className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--orange-400)]"
              />
              <input
                name="bookAuthor"
                placeholder="Yazar (opsiyonel)"
                className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--orange-400)]"
              />
            </div>
          )}

          {isSeeking && (
            <div className="grid grid-cols-2 gap-2">
              <input
                name="counterBookTitle"
                placeholder="Karşılığında verebileceğin kitap (opsiyonel)"
                className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--orange-400)]"
              />
              <input
                name="counterBookAuthor"
                placeholder="Yazar (opsiyonel)"
                className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--orange-400)]"
              />
            </div>
          )}

          {isSwap && (
            <p className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
              {isSeeking ? <Search size={12} /> : <Repeat size={12} />}
              {isSeeking
                ? "İlanın Ana Akış’ta görünür, kitap kimde varsa haber verebilir."
                : "İlanın Ana Akış’ta görünür, isteyen kendi kitabıyla teklif yapabilir."}
            </p>
          )}

          {type === "photo" && (
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full rounded-xl border border-dashed border-[var(--line-strong)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink-muted)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--orange-100)] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[var(--orange-700)]"
            />
          )}

          {clubs.length > 0 && (
            <select
              name="clubId"
              defaultValue=""
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--orange-400)]"
            >
              <option value="">Genel akış (kulüpsüz)</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs">
              {state.demo && <DemoNote />}
              {"error" in state && state.error && <span className="text-[var(--danger)]">{state.error}</span>}
            </div>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Paylaşılıyor…" : "Paylaş"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
