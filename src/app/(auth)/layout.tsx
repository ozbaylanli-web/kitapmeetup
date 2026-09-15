import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";

export default function AuthRouteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--paper)] px-4 py-10">
      <div className="mb-6">
        <Logo />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
