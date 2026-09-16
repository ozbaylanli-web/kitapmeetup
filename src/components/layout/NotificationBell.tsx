"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Bell, UserPlus, CalendarDays, Users2, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { timeAgo, cn } from "@/lib/utils";
import type { NotificationItem, NotificationKind } from "@/lib/data/notifications";

const STORAGE_KEY = "kitapmeetup:notifications:lastSeen";
const noopSubscribe = () => () => {};

function readLastSeen(): number {
  try {
    return Number(localStorage.getItem(STORAGE_KEY) ?? 0);
  } catch {
    return 0;
  }
}

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  follow: UserPlus,
  club_event: CalendarDays,
  match: Users2,
  followed_post: MessageCircle,
};

export function NotificationBell({ items, className }: { items: NotificationItem[]; className?: string }) {
  const [open, setOpen] = useState(false);
  // Sunucuda localStorage yok - useSyncExternalStore, sunucu/istemci anlık
  // görüntülerini ayırarak hydration uyuşmazlığı yaşamadan gerçek değeri verir.
  const lastSeen = useSyncExternalStore(noopSubscribe, readLastSeen, () => 0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const unreadCount = items.filter((i) => new Date(i.createdAt).getTime() > lastSeen).length;

  function toggleOpen() {
    if (!open) {
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        // panoya/depoya erişim yoksa sessizce geç
      }
    }
    setOpen((v) => !v);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={toggleOpen}
        title="Bildirimler"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--paper-sunken)]"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-2 w-2 items-center justify-center rounded-full bg-[var(--orange-500)] ring-2 ring-[var(--paper-elevated)]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper-elevated)] shadow-lg">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--ink)]">Bildirimler</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-[var(--ink-muted)]">Henüz bildirim yok.</p>
            ) : (
              items.map((item) => {
                const Icon = KIND_ICON[item.kind];
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-[var(--paper-sunken)]"
                  >
                    {item.avatarName ? (
                      <Avatar name={item.avatarName} color={item.avatarColor ?? "#F0611F"} url={item.avatarUrl} size={30} />
                    ) : (
                      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[var(--orange-100)] text-[var(--orange-600)]">
                        <Icon size={14} />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-snug text-[var(--ink)]">{item.text}</p>
                      <p className="mt-0.5 text-[10px] text-[var(--ink-muted)]">{timeAgo(item.createdAt)}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
