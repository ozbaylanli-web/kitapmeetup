import Link from "next/link";
import { Logo } from "./Logo";
import { Avatar } from "@/components/ui/Avatar";
import type { AuthorSummary } from "@/lib/types";

export function Topbar({ currentUser }: { currentUser: AuthorSummary | null }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper-elevated)]/95 px-4 py-3 backdrop-blur lg:hidden">
      <Logo />
      <div className="flex items-center gap-2">
        {currentUser ? (
          <Link href={`/profil/${currentUser.username}`}>
            <Avatar name={currentUser.fullName} color={currentUser.avatarColor} url={currentUser.avatarUrl} size={32} />
          </Link>
        ) : (
          <Link href="/giris" className="text-sm font-semibold text-[var(--orange-600)]">
            Giriş yap
          </Link>
        )}
      </div>
    </header>
  );
}
