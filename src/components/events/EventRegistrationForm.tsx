"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { completeEventRegistrationAction } from "@/lib/actions/registrations";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import type { RegistrationField } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]";

/** Bir etkinliğin organizatörünün tanımladığı özel kayıt sorularını yanıtlama formu — "Gidiyorum" derken açılır. */
export function EventRegistrationForm({
  eventId,
  fields,
  initialAnswers,
  onDone,
}: {
  eventId: string;
  fields: RegistrationField[];
  initialAnswers: Record<string, string>;
  onDone: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(initialAnswers);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setValue(fieldId: string, value: string) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function submit() {
    const missing = fields.find((f) => f.required && !(values[f.id] ?? "").trim());
    if (missing) {
      setError(`"${missing.label}" alanı zorunlu.`);
      return;
    }
    setError(null);
    setDemo(false);

    const formData = new FormData();
    formData.set("eventId", eventId);
    formData.set("answers", JSON.stringify(fields.map((f) => ({ fieldId: f.id, value: values[f.id] ?? "" }))));

    startTransition(async () => {
      const result = await completeEventRegistrationAction({ ok: true }, formData);
      if (result.ok) onDone();
      else if (result.demo) setDemo(true);
      else if (result.error) setError(result.error);
    });
  }

  return (
    <div className="mt-2 space-y-3 rounded-xl border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] p-3.5">
      <p className="text-xs font-semibold text-[var(--orange-700)]">Kaydını tamamlamak için birkaç soru:</p>
      {fields.map((f) => (
        <div key={f.id}>
          <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">
            {f.label} {f.required && <span className="text-[var(--danger)]">*</span>}
          </label>
          {f.fieldType === "textarea" ? (
            <textarea rows={2} value={values[f.id] ?? ""} onChange={(e) => setValue(f.id, e.target.value)} className={`${inputClass} resize-none`} />
          ) : f.fieldType === "select" ? (
            <select value={values[f.id] ?? ""} onChange={(e) => setValue(f.id, e.target.value)} className={inputClass}>
              <option value="">Seç…</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : f.fieldType === "checkbox" ? (
            <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
              <input
                type="checkbox"
                checked={values[f.id] === "true"}
                onChange={(e) => setValue(f.id, e.target.checked ? "true" : "false")}
                className="h-4 w-4 accent-[var(--orange-500)]"
              />
              Evet
            </label>
          ) : (
            <input value={values[f.id] ?? ""} onChange={(e) => setValue(f.id, e.target.value)} className={inputClass} />
          )}
        </div>
      ))}

      <div className="flex items-center justify-between">
        <div className="text-xs">
          {demo && <DemoNote />}
          {error && <span className="text-[var(--danger)]">{error}</span>}
        </div>
        <Button type="button" size="sm" disabled={pending} onClick={submit}>
          <Send size={13} /> {pending ? "Kaydediliyor…" : "Kaydını tamamla"}
        </Button>
      </div>
    </div>
  );
}
