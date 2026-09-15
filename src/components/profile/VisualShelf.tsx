"use client";

import { useState } from "react";
import Link from "next/link";
import { BookMarked, StickyNote } from "lucide-react";
import { ShelfEntryEditor } from "@/components/profile/ShelfEntryEditor";
import type { ShelfItem, ShelfStatus } from "@/lib/types";

const GROUPS: { status: ShelfStatus; label: string }[] = [
  { status: "reading", label: "Şu an okuyor" },
  { status: "read", label: "Okudu" },
  { status: "want", label: "Okumak istiyor" },
];

export function VisualShelf({ shelf, editable = false }: { shelf: ShelfItem[]; editable?: boolean }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (shelf.length === 0) {
    return (
      <div className="paper-card flex flex-col items-center gap-2 p-8 text-center">
        <BookMarked className="text-[var(--ink-muted)]" size={24} />
        <p className="text-sm text-[var(--ink-muted)]">Raf henüz boş.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {GROUPS.map(({ status, label }) => {
        const items = shelf.filter((s) => s.status === status);
        if (items.length === 0) return null;
        const editingItem = items.find((i) => i.id === editingId);
        return (
          <div key={status}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              {label} <span className="font-normal">({items.length})</span>
            </p>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--paper-elevated)] p-3">
              <div className="flex flex-wrap items-end gap-1.5 border-b-4 border-[var(--paper-sunken)] pb-0">
                {items.map((item) => {
                  const titleAttr = [
                    `${item.book.title} — ${item.book.author}`,
                    item.rating ? `${"★".repeat(item.rating)} (${item.rating}/5)` : null,
                    item.note,
                  ]
                    .filter(Boolean)
                    .join("\n");
                  const spineClass =
                    "group relative flex h-24 w-7 shrink-0 items-end justify-center rounded-t-sm pb-1.5 text-center shadow-sm transition-transform hover:-translate-y-1 sm:h-28 sm:w-8";
                  const spineContent = (
                    <>
                      <span className="line-clamp-3 px-0.5 text-[9px] font-semibold leading-tight text-white/90 [writing-mode:vertical-rl]">
                        {item.book.title}
                      </span>
                      {item.rating ? (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--gold-500)] px-0.5 text-[8px] font-bold text-white shadow">
                          {item.rating}★
                        </span>
                      ) : null}
                      {item.note ? (
                        <span className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--paper-elevated)] text-[var(--orange-600)] shadow">
                          <StickyNote size={9} />
                        </span>
                      ) : null}
                    </>
                  );
                  return editable ? (
                    <button
                      key={item.id}
                      type="button"
                      title={titleAttr}
                      onClick={() => setEditingId((cur) => (cur === item.id ? null : item.id))}
                      className={spineClass}
                      style={{ backgroundColor: item.book.spineColor }}
                    >
                      {spineContent}
                    </button>
                  ) : (
                    <Link key={item.id} href={`/kitaplar/${item.book.id}`} title={titleAttr} className={spineClass} style={{ backgroundColor: item.book.spineColor }}>
                      {spineContent}
                    </Link>
                  );
                })}
              </div>
            </div>
            {editable && editingItem && <ShelfEntryEditor item={editingItem} onClose={() => setEditingId(null)} />}
          </div>
        );
      })}
    </div>
  );
}
