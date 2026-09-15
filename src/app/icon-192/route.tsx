import { ImageResponse } from "next/og";

/** Android "ana ekrana ekle" ikonu (192×192) — manifest.ts içinde kullanılır. */
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
          fontSize: 104,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
        }}
      >
        K
      </div>
    ),
    { width: 192, height: 192 }
  );
}
