import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

const SIZE = { width: 1080, height: 1080 };

/**
 * Instagram'a paylaşılacak, marka kimliğine uygun anlık üretilen bir kare
 * kart görseli — bir etkinliğin/gönderinin kendi fotoğrafı yoksa bu
 * kullanılır (bkz. src/lib/actions/instagram.ts). Instagram Content
 * Publishing API'nin `image_url` alanı herkese açık, HTTPS bir adres
 * istediği için bu route kasıtlı olarak kimlik doğrulaması istemez.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eyebrow = (searchParams.get("eyebrow") ?? "Kitapmeetup").slice(0, 40);
  const title = (searchParams.get("title") ?? "Kitapmeetup").slice(0, 140);
  const subtitle = (searchParams.get("subtitle") ?? "").slice(0, 100);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "88px",
          background: "linear-gradient(135deg, #fbf3e6 0%, #f3e8d6 55%, #ffe4cc 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(240,97,31,0.35) 0%, rgba(240,97,31,0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(160deg, #fea363 0%, #f0611f 45%, #ab3812 100%)",
              color: "white",
              fontSize: 38,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
            }}
          >
            K
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#201811", fontFamily: "Georgia, serif" }}>Kitapmeetup</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              color: "#c2410c",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 20,
            }}
          >
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: 66, lineHeight: 1.18, fontWeight: 700, color: "#201811", fontFamily: "Georgia, serif" }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#4a3d31" }}>{subtitle}</div>
          )}
        </div>
      </div>
    ),
    { ...SIZE }
  );
}
