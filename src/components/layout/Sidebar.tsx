import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import type { AuthorSummary } from "@/lib/types";
import type { NotificationItem } from "@/lib/data/notifications";
import { hasSupabaseEnv } from "@/lib/env";
import { signOutAction } from "@/lib/actions/auth";
import { getDailyDiscovery } from "@/lib/data/discovery";

export async function Sidebar({
  currentUser,
  hasUnreadMessages = false,
  notifications = [],
}: {
  currentUser: AuthorSummary | null;
  hasUnreadMessages?: boolean;
  notifications?: NotificationItem[];
}) {
  const discovery = await getDailyDiscovery();
  const DiscoveryIcon = discovery.icon;

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-[var(--line)] bg-[var(--paper-elevated)] px-4 py-6 lg:flex">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            {currentUser && <NotificationBell items={notifications} />}
          </div>
        </div>
        <NavLinks hasUnreadMessages={hasUnreadMessages} />

        <Link
          href={discovery.href}
          className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] px-3 py-2.5 text-xs font-semibold text-[var(--orange-700)]"
        >
          <DiscoveryIcon size={14} />
          {discovery.cta}
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {currentUser ? (
          <>
            <Link
              href={`/profil/${currentUser.username}`}
              className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-[var(--paper-sunken)]"
            >
              <Avatar name={currentUser.fullName} color={currentUser.avatarColor} url={currentUser.avatarUrl} size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--ink)]">{currentUser.fullName}</p>
                <p className="truncate text-xs text-[var(--ink-muted)]">@{currentUser.username}</p>
              </div>
            </Link>
            <div className="flex items-center gap-1 px-1">
              <Link
                href="/ayarlar"
                className="flex flex-1 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--ink-muted)] hover:bg-[var(--paper-sunken)] hover:text-[var(--ink)]"
              >
                <Settings size={14} /> Ayarlar
              </Link>
              {hasSupabaseEnv() && (
                <form action={signOutAction} className="flex-1">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--ink-muted)] hover:bg-[var(--paper-sunken)] hover:text-[var(--ink)]"
                  >
                    <LogOut size={14} /> Çıkış
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/giris"
            className="rounded-xl bg-[var(--orange-500)] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-[var(--orange-600)]"
          >
            Giriş yap
          </Link>
        )}
      </div>
    </aside>
  );
}
