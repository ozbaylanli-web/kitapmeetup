import Link from "next/link";
import { Logo } from "./Logo";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import type { AuthorSummary } from "@/lib/types";
import type { NotificationItem } from "@/lib/data/notifications";

export function Topbar({ currentUser, notifications = [] }: { currentUser: AuthorSummary | null; notifications?: NotificationItem[] }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper-elevated)]/95 px-4 py-3 backdrop-blur lg:hidden">
      <Logo />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        {currentUser ? (
          <>
            <NotificationBell items={notifications} />
            <Link href={`/profil/${currentUser.username}`}>
              <Avatar name={currentUser.fullName} color={currentUser.avatarColor} url={currentUser.avatarUrl} size={32} />
            </Link>
          </>
        ) : (
          <Link href="/giris" className="text-sm font-semibold text-[var(--orange-600)]">
            Giriş yap
          </Link>
        )}
      </div>
    </header>
  );
}
