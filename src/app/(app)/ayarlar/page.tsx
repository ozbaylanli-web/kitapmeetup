import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsForm } from "@/components/profile/SettingsForm";
import { PublisherAccountSection } from "@/components/profile/PublisherAccountSection";
import { InstagramConnectionSection } from "@/components/settings/InstagramConnectionSection";
import { InviteFriendCard } from "@/components/settings/InviteFriendCard";
import { getCurrentUser } from "@/lib/data/auth";
import { signOutAction } from "@/lib/actions/auth";
import { hasSupabaseEnv } from "@/lib/env";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ instagram?: string; message?: string }>;
}) {
  const [currentUser, params] = await Promise.all([getCurrentUser(), searchParams]);
  if (!currentUser) redirect("/giris");

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Hesap" title="Ayarlar" description="Profilini güncelle." />
      <SettingsForm currentUser={currentUser} />

      <PublisherAccountSection currentUser={currentUser} />

      {currentUser.isAdmin && <InstagramConnectionSection statusParam={params.instagram} message={params.message} />}

      <InviteFriendCard username={currentUser.username} />

      {hasSupabaseEnv() && (
        <form action={signOutAction} className="mt-4">
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--danger)]"
          >
            <LogOut size={14} /> Çıkış yap
          </button>
        </form>
      )}
    </div>
  );
}
