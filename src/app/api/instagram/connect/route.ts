import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";
import { getInstagramOAuthUrl, isInstagramConfigured } from "@/lib/instagram/oauth";

/**
 * "Instagram'a bağlan" düğmesinin gittiği yer — Meta'nın kendi OAuth
 * ekranına yönlendirir. Sadece yöneticiler başlatabilir (bkz. Ayarlar).
 */
export async function GET() {
  const siteUrl = getSiteUrl();

  if (!isInstagramConfigured()) {
    return NextResponse.redirect(`${siteUrl}/ayarlar?instagram=not_configured`);
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(`${siteUrl}/ayarlar?instagram=error`);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${siteUrl}/giris`);

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.redirect(`${siteUrl}/ayarlar?instagram=forbidden`);

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${siteUrl}/api/instagram/callback`;
  const oauthUrl = getInstagramOAuthUrl(redirectUri, state);

  const response = NextResponse.redirect(oauthUrl);
  response.cookies.set("ig_oauth_state", state, { httpOnly: true, maxAge: 600, path: "/", sameSite: "lax" });
  return response;
}
