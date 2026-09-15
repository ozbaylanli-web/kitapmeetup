import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { DailyAnswerForm } from "@/components/feed/DailyAnswerForm";
import { getTodaysPromptDetail, getPromptAnswers } from "@/lib/data/dailyPrompt";
import { getCurrentUser } from "@/lib/data/auth";
import { timeAgo } from "@/lib/utils";

export default async function TodaysQuestionPage() {
  const [prompt, currentUser] = await Promise.all([getTodaysPromptDetail(), getCurrentUser()]);
  const answers = await getPromptAnswers(prompt.id);

  return (
    <div>
      <div className="sunset-gradient mb-6 flex items-start gap-3 rounded-2xl p-4 text-white shadow-sm sm:p-5">
        <Sparkles className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Günün Sorusu</p>
          <p className="mt-1 font-serif text-lg leading-snug sm:text-xl">{prompt.question}</p>
        </div>
      </div>

      {currentUser ? (
        <div className="mb-6">
          <DailyAnswerForm promptId={prompt.id} myAnswer={prompt.myAnswer} />
        </div>
      ) : (
        <p className="mb-6 text-center text-sm text-[var(--ink-muted)]">
          Cevap yazmak için{" "}
          <Link href="/giris" className="font-semibold text-[var(--orange-600)] hover:underline">
            giriş yapmalısın
          </Link>
          .
        </p>
      )}

      <h2 className="mb-3 font-serif text-lg font-semibold text-[var(--ink)]">Cevaplar ({answers.length})</h2>
      {answers.length === 0 ? (
        <EmptyState emoji="💭" title="Henüz cevap yok" description="İlk cevabı sen bırak." />
      ) : (
        <div className="space-y-3">
          {answers.map((a) => (
            <div key={a.id} className="paper-card p-4">
              <div className="flex items-center gap-2.5">
                <Link href={`/profil/${a.author.username}`}>
                  <Avatar name={a.author.fullName} color={a.author.avatarColor} url={a.author.avatarUrl} size={32} />
                </Link>
                <div className="min-w-0">
                  <Link href={`/profil/${a.author.username}`} className="text-sm font-semibold text-[var(--ink)] hover:underline">
                    {a.author.fullName}
                  </Link>
                  <p className="text-[11px] text-[var(--ink-muted)]">{timeAgo(a.createdAt)}</p>
                </div>
              </div>
              {a.body && <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">{a.body}</p>}
              {a.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.imageUrl} alt="Cevap fotoğrafı" className="mt-2.5 max-h-80 w-full rounded-xl object-cover" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
