export async function register() {
  // Vercel'in Node.js calisma ortaminda IPv6 baglantilari Supabase'e
  // ulasamiyor (paketler cevapsiz kaliyor) ve her istek ~7sn'lik bir
  // baglanti zaman asimindan sonra IPv4'e duserek tamamlaniyordu - bu da
  // her Supabase sorgusunu sabit ~7sn geciktiriyordu. IPv4'u once deneyerek
  // bu zaman asimini tamamen atlatiyoruz.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setDefaultResultOrder } = await import("node:dns");
    setDefaultResultOrder("ipv4first");
  }
}
