import Link from "next/link";
import { Sparkles, MessageCircle } from "lucide-react";
import { getTodaysPromptDetail } from "@/lib/data/dailyPrompt";

export async function TodaysQuestion() {
  const prompt = await getTodaysPromptDetail();

  return (
    <Link
      href="/gunun-sorusu"
      className="sunset-gradient mb-4 flex items-start gap-3 rounded-2xl p-4 text-white shadow-sm transition-transform hover:-translate-y-0.5 sm:p-5"
    >
      <Sparkles className="mt-0.5 shrink-0" size={20} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Günün Sorusu</p>
        <p className="mt-1 font-serif text-lg leading-snug sm:text-xl">{prompt.question}</p>
        <p className="mt-2 flex items-center gap-1 text-xs text-white/80">
          <MessageCircle size={12} /> Cevapları gör, sen de cevap yaz
        </p>
      </div>
    </Link>
  );
}
