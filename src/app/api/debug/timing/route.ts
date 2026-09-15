import { NextResponse } from "next/server";
import { getDefaultResultOrder } from "node:dns";
import https from "node:https";
import { createClient } from "@/lib/supabase/server";

const SUPA_HOST = "yyasamqdineujcafwctc.supabase.co";

// Anahtar icermeyen, salt baglanti suresini olcen ham istek - Vercel'in
// gizli-deger redaksiyonundan tamamen bagimsiz (hicbir secret string kullanmiyor).
function rawHttpsGet(host: string, path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const req = https.get({ host, path, timeout: 15000 }, (res) => {
      res.on("data", () => {});
      res.on("end", () => resolve(Date.now() - t0));
    });
    req.on("error", (e) => reject(e));
    req.on("timeout", () => reject(new Error("raw https timeout")));
  });
}

export async function GET() {
  const marks: Record<string, number | string> = {};
  const diag = {
    runtime: process.env.NEXT_RUNTIME,
    dnsOrder: getDefaultResultOrder(),
    nodeVersion: process.version,
  };

  // 1) Supabase'le tamamen ilgisiz, rastgele bir dis host - genel disa cikis
  //    (egress) yavas mi, yoksa sadece Supabase'e mi ozgu, onu ayirt eder.
  try {
    marks.rawHttpsExample = await rawHttpsGet("example.com", "/");
  } catch (e) {
    marks.rawHttpsExample = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // 2) Supabase host'una ham https ile (anahtarsiz - 401 doner ama sadece
  //    baglanti+yanit suresini olcuyoruz).
  try {
    marks.rawHttpsSupabase = await rawHttpsGet(SUPA_HOST, "/rest/v1/clubs?select=id");
  } catch (e) {
    marks.rawHttpsSupabase = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // 3) Ayni sey global fetch() ile (Node https modulunu degil, undici'yi kullanir).
  const tf1 = Date.now();
  try {
    await fetch(`https://${SUPA_HOST}/rest/v1/clubs?select=id`, { cache: "no-store" });
    marks.fetchSupabaseNoKey = Date.now() - tf1;
  } catch (e) {
    marks.fetchSupabaseNoKey = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // 4) supabase-js istemcisi uzerinden (uygulamanin gercekte kullandigi yol).
  const t0 = Date.now();
  const supabase = await createClient();
  marks.createClient = Date.now() - t0;

  let queryResult: unknown = null;
  if (supabase) {
    const t1 = Date.now();
    const { data, error, status, statusText } = await supabase.from("clubs").select("*");
    marks.clubsQuery = Date.now() - t1;
    queryResult = { data, error, status, statusText };
  }

  return NextResponse.json({ marks, diag, queryResult });
}
