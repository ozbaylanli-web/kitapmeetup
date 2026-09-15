"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ListChecks } from "lucide-react";
import { saveRegistrationFieldsAction } from "@/lib/actions/registrations";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import type { RegistrationField, RegistrationFieldType } from "@/lib/types";

interface DraftField {
  label: string;
  fieldType: RegistrationFieldType;
  options: string;
  required: boolean;
}

const TYPE_OPTIONS: { value: RegistrationFieldType; label: string }[] = [
  { value: "text", label: "Kısa metin" },
  { value: "textarea", label: "Uzun metin" },
  { value: "select", label: "Seçenekli" },
  { value: "checkbox", label: "Onay kutusu" },
];

function toDraft(fields: RegistrationField[]): DraftField[] {
  return fields.map((f) => ({ label: f.label, fieldType: f.fieldType, options: f.options.join(", "), required: f.required }));
}

/** Etkinlik organizatörünün "Gidiyorum" diyenlere sorulacak soruları tanımladığı inline form. */
export function RegistrationFieldsEditor({ eventId, initialFields }: { eventId: string; initialFields: RegistrationField[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<DraftField[]>(() => toDraft(initialFields));
  const [demo, setDemo] = useState(false);
  const [pending, startTransition] = useTransition();

  function updateDraft(i: number, patch: Partial<DraftField>) {
    setDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  function addField() {
    setDrafts((prev) => [...prev, { label: "", fieldType: "text", options: "", required: false }]);
  }

  function removeField(i: number) {
    setDrafts((prev) => prev.filter((_, idx) => idx !== i));
  }

  function save() {
    setDemo(false);
    const formData = new FormData();
    formData.set("eventId", eventId);
    formData.set(
      "fields",
      JSON.stringify(
        drafts
          .filter((d) => d.label.trim())
          .map((d) => ({
            label: d.label.trim(),
            fieldType: d.fieldType,
            options: d.options.split(",").map((o) => o.trim()).filter(Boolean),
            required: d.required,
          }))
      )
    );
    startTransition(async () => {
      const result = await saveRegistrationFieldsAction({ ok: true }, formData);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else if (result.demo) setDemo(true);
    });
  }

  if (!open) {
    return (
      <div className="paper-card p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
          <ListChecks size={15} /> Kayıt Formu
        </h3>
        {initialFields.length === 0 ? (
          <p className="mb-2 text-xs text-[var(--ink-muted)]">Henüz özel bir soru yok — &ldquo;Gidiyorum&rdquo; diyen herkes direkt kayıt olur.</p>
        ) : (
          <ul className="mb-2 space-y-1 text-xs text-[var(--ink-muted)]">
            {initialFields.map((f) => (
              <li key={f.id}>• {f.label}</li>
            ))}
          </ul>
        )}
        <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold text-[var(--orange-600)] hover:underline">
          {initialFields.length === 0 ? "Kayıt sorusu ekle" : "Düzenle"}
        </button>
      </div>
    );
  }

  return (
    <div className="paper-card space-y-3 p-4">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
        <ListChecks size={15} /> Kayıt Formu
      </h3>
      <p className="text-xs text-[var(--ink-muted)]">&ldquo;Gidiyorum&rdquo; diyen katılımcılara sorulacak sorular. Boş bırakırsan form gösterilmez.</p>

      {drafts.map((d, i) => (
        <div key={i} className="space-y-1.5 rounded-xl border border-[var(--line)] p-2.5">
          <div className="flex items-center gap-1.5">
            <input
              value={d.label}
              onChange={(e) => updateDraft(i, { label: e.target.value })}
              placeholder="ör. Diyetin var mı?"
              className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--orange-400)]"
            />
            <button type="button" onClick={() => removeField(i)} className="shrink-0 rounded-lg p-1.5 text-[var(--danger)] hover:bg-[var(--danger)]/10">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <select
              value={d.fieldType}
              onChange={(e) => updateDraft(i, { fieldType: e.target.value as RegistrationFieldType })}
              className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2 py-1 text-xs outline-none"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-xs text-[var(--ink-muted)]">
              <input type="checkbox" checked={d.required} onChange={(e) => updateDraft(i, { required: e.target.checked })} className="h-3.5 w-3.5 accent-[var(--orange-500)]" />
              Zorunlu
            </label>
          </div>
          {d.fieldType === "select" && (
            <input
              value={d.options}
              onChange={(e) => updateDraft(i, { options: e.target.value })}
              placeholder="Seçenekler (virgülle ayır): Vejetaryen, Vegan, Fark etmez"
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--orange-400)]"
            />
          )}
        </div>
      ))}

      <button type="button" onClick={addField} className="flex items-center gap-1 text-xs font-semibold text-[var(--orange-600)] hover:underline">
        <Plus size={12} /> Soru ekle
      </button>

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs">{demo && <DemoNote />}</div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Vazgeç
          </Button>
          <Button type="button" size="sm" disabled={pending} onClick={save}>
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </div>
      </div>
    </div>
  );
}
