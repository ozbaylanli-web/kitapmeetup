import { initials } from "@/lib/utils";

export function Avatar({
  name,
  color,
  url,
  size = 40,
  className,
}: {
  name: string;
  color: string;
  url?: string | null;
  size?: number;
  className?: string;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- kullanıcı yüklemesi (Supabase Storage), next/image domain izni gerekmesin diye düz img
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-full object-cover ${className ?? ""}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-serif font-semibold text-white ${className ?? ""}`}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
