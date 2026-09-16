import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getDailyDiscovery } from "@/lib/data/discovery";

export async function TodaysQuestion() {
  const discovery = await getDailyDiscovery();
  const Icon = discovery.icon;

  return (
    <Link
      href={discovery.href}
      className="sunset-gradient mb-4 flex items-start gap-3 rounded-2xl p-4 text-white shadow-sm transition-transform hover:-translate-y-0.5 sm:p-5"
    >
      <Icon className="mt-0.5 shrink-0" size={20} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{discovery.eyebrow}</p>
        <p className="mt-1 font-serif text-lg leading-snug sm:text-xl">{discovery.title}</p>
        {discovery.subtitle && <p className="mt-0.5 text-sm text-white/85">{discovery.subtitle}</p>}
        <p className="mt-2 flex items-center gap-1 text-xs text-white/80">
          <ChevronRight size={12} /> {discovery.cta}
        </p>
      </div>
    </Link>
  );
}
