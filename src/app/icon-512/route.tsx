import { ImageResponse } from "next/og";

/**
 * Android "ana ekrana ekle" ikonu (512×512) — manifest.ts içinde hem normal
 * hem de "maskable" (OS'un kendi şekliyle kırptığı) amaç için kullanılır.
 * Glif, kırpma güvenlik alanına sığacak kadar küçük tutulur.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #fea363 0%, #f0611f 45%, #ab3812 100%)",
          color: "white",
          fontSize: 230,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
        }}
      >
        K
      </div>
    ),
    { width: 512, height: 512 }
  );
}
