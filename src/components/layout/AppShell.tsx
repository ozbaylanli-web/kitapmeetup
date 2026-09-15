import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { DemoBanner } from "./DemoBanner";
import { PageTransition } from "./PageTransition";
import { getCurrentUser } from "@/lib/data/auth";
import { getConversations } from "@/lib/data/messages";
import { hasSupabaseEnv } from "@/lib/env";

export async function AppShell({ children }: { children: ReactNode }) {
  const currentUser = await getCurrentUser();
  const conversations = currentUser ? await getConversations() : [];
  const hasUnreadMessages = conversations.some((c) => c.unread);

  return (
    <div className="flex min-h-screen">
      <Sidebar currentUser={currentUser} hasUnreadMessages={hasUnreadMessages} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar currentUser={currentUser} />
        <main className="mx-auto w-full min-w-0 max-w-3xl flex-1 px-4 pb-24 pt-6 lg:pb-10">
          {!hasSupabaseEnv() && <DemoBanner />}
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <BottomNav hasUnreadMessages={hasUnreadMessages} />
    </div>
  );
}
