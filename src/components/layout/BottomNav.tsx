import { NavLinks } from "./NavLinks";

export function BottomNav({ hasUnreadMessages = false }: { hasUnreadMessages?: boolean }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--paper-elevated)]/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <NavLinks orientation="horizontal" hasUnreadMessages={hasUnreadMessages} />
    </div>
  );
}
