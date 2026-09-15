import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/env";
import { completeInstagramOAuth } from "@/lib/instagram/oauth";

/** Meta'nın OAuth ekranından geri döndüğü adres — token değişimini tamamlar ve bağlantıyı kaydeder. */
export async function GET(req: NextRequest) {
  const siteUrl = getSiteUrl();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = req.cookies.get("ig_oauth_state")?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${siteUrl}/ayarlar?instagram=error`);
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(`${siteUrl}/ayarlar?instagram=error`);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${siteUrl}/giris`);

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.redirect(`${siteUrl}/ayarlar?instagram=forbidden`);

  const redirectUri = `${siteUrl}/api/instagram/callback`;
  const result = await completeInstagramOAuth(code, redirectUri);
  if (!result.ok) {
    return NextResponse.redirect(`${siteUrl}/ayarlar?instagram=error&message=${encodeURIComponent(result.error)}`);
  }

  // Tek satır kuralı: yeni bağlantı, öncekinin (varsa) yerini alır.
  await supabase.from("instagram_connections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: insertError } = await supabase.from("instagram_connections").insert({
    ig_user_id: result.connection.igUserId,
    ig_username: result.connection.igUsername,
    page_id: result.connection.pageId,
    access_token: result.connection.accessToken,
    token_expires_at: result.connection.expiresInSeconds
      ? new Date(Date.now() + result.connection.expiresInSeconds * 1000).toISOString()
      : null,
    connected_by: user.id,
  });
  if (insertError) {
    return NextResponse.redirect(`${siteUrl}/ayarlar?instagram=error&message=${encodeURIComponent(insertError.message)}`);
  }

  const response = NextResponse.redirect(`${siteUrl}/ayarlar?instagram=connected`);
  response.cookies.delete("ig_oauth_state");
  return response;
}
