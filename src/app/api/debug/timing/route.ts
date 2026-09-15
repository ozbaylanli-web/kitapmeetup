import { NextResponse } from "next/server";
import { getDefaultResultOrder } from "node:dns";
import https from "node:https";
import { createClient } from "@/lib/supabase/server";

const SUPA_HOST = "yyasamqdineujcafwctc.supabase.co";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function rawHttpsGet(path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const req = https.get(
      {
        host: SUPA_HOST,
        path,
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
        timeout: 15000,
      },
      (res) => {
        res.on("data", () => {});
        res.on("end", () => resolve(Date.now() - t0));
      }
    );
    req.on("error", (e) => reject(e));
    req.on("timeout", () => reject(new Error("raw https timeout")));
  });
}

function scanForBadChars(s: string) {
  const bad: { index: number; code: number; char: string }[] = [];
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    // JWT/base64url gecerli karakterler disinda ne varsa raporla.
    if (!/[A-Za-z0-9_.\-]/.test(s[i])) {
      bad.push({ index: i, code, char: s[i] });
    }
  }
  return bad;
}

export async function GET() {
  const marks: Record<string, number | string> = {};
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const diag = {
    runtime: process.env.NEXT_RUNTIME,
    dnsOrder: getDefaultResultOrder(),
    nodeVersion: process.version,
    keyLength: rawKey.length,
    keyBadChars: scanForBadChars(rawKey),
    keyStart: rawKey.slice(0, 12),
    keyEnd: rawKey.slice(-12),
    urlValue: rawUrl,
  };

  // 1) Node'un cekirdek https modulu ile dogrudan - fetch/undici'yi tamamen atlatir.
  try {
    marks.rawHttps = await rawHttpsGet("/rest/v1/clubs?select=id");
  } catch (e) {
    marks.rawHttps = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // 2) Global fetch(), acik cache: no-store ile - Next.js'in fetch yamasini devre disi birakir.
  const tf1 = Date.now();
  try {
    await fetch(`https://${SUPA_HOST}/rest/v1/clubs?select=id`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      cache: "no-store",
    });
    marks.fetchNoStore = Date.now() - tf1;
  } catch (e) {
    marks.fetchNoStore = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // 3) supabase-js istemcisi uzerinden (uygulamanin gercekte kullandigi yol).
  const t0 = Date.now();
  const supabase = await createClient();
  marks.createClient = Date.now() - t0;

  if (supabase) {
    const t1 = Date.now();
    await supabase.from("clubs").select("*");
    marks.clubsQuery = Date.now() - t1;
  }

  return NextResponse.json({ marks, diag });
}
