"use client";

import { useActionState } from "react";
import { createBlogPostAction } from "@/lib/actions/blog";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";

const COLOR_OPTIONS = ["#F0611F", "#6F5A94", "#146B62", "#C05F82", "#35594D", "#B8791B"];
const initialState = { ok: true as const };

export function BlogEditorForm() {
  const [state, formAction, pending] = useActionState(createBlogPostAction, initialState);

  return (
    <form action={formAction} className="paper-card space-y-4 p-5">
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Başlık</label>
        <input
          name="title"
          required
          placeholder="Yazının başlığı"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Özet (opsiyonel)</label>
        <input
          name="summary"
          placeholder="Kısa bir özet — kart görünümünde bu yazı"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">
          İçerik <span className="font-normal text-[var(--ink-muted)]">(Markdown desteklenir: **kalın**, ## başlık, - liste)</span>
        </label>
        <textarea
          name="body"
          required
          rows={12}
          placeholder={"Yazına başla…\n\n## Bir alt başlık\n\nDüşüncelerini burada paylaş."}
          className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 font-mono text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Etiketler (virgülle ayır)</label>
          <input
            name="tags"
            placeholder="inceleme, felsefe"
            className="w-full min-w-0 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
          />
        </div>
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Vurgu rengi</label>
          <select
            name="color"
            defaultValue={COLOR_OPTIONS[0]}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--orange-400)]"
          >
            {COLOR_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs">
          {state.demo && <DemoNote />}
          {"error" in state && state.error && <span className="text-[var(--danger)]">{state.error}</span>}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Yayınlanıyor…" : "Yayınla"}
        </Button>
      </div>
    </form>
  );
}
