import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Test için kullandığımız Cloudflare quick tunnel her seferinde yeni,
  // rastgele bir *.trycloudflare.com alt alan adı veriyor. Next.js'in
  // geliştirme sunucusu, güvenlik için varsayılan olarak localhost dışındaki
  // kaynaklardan gelen istekleri engelliyor (bkz. allowedDevOrigins) — bu da
  // tünel üzerinden açılan sayfalarda React'in hiç etkileşimli hale
  // gelmemesine (tıklamaların çalışmamasına) yol açıyordu. Joker karakterli
  // bir kural ekleyerek hangi tünel adresi olursa olsun kapsıyoruz.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
