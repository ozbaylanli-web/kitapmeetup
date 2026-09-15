import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * WhatsApp/Instagram/Twitter'da link paylaşıldığında görünen önizleme kartı.
 * Uygulamanın kendi görsel kimliğiyle (gün batımı turuncusu + kağıt kremi)
 * anlık üretilir — ayrı bir tasarım dosyasına gerek yok, marka değişirse
 * tek yerden güncellenir.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 96px",
          background: "linear-gradient(135deg, #fbf3e6 0%, #f3e8d6 60%, #ffe4cc 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -140,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(240,97,31,0.35), rgba(240,97,31,0))",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(160deg, #fea363 0%, #f0611f 45%, #ab3812 100%)",
              color: "white",
              fontSize: 42,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
            }}
          >
            K
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#201811", fontFamily: "Georgia, serif" }}>
            Kitapmeetup
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 56,
            lineHeight: 1.15,
            fontWeight: 700,
            color: "#201811",
            fontFamily: "Georgia, serif",
            maxWidth: 880,
          }}
        >
          Kitap sohbetlerini yeniden buluşturuyoruz.
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 26, color: "#4a3d31", maxWidth: 780 }}>
          Kulüpler · Etkinlikler · Akademi · &quot;Ne okuyorum&quot; akışı
        </div>
      </div>
    ),
    { ...size }
  );
}
