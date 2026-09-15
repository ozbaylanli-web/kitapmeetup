export function DemoNote({ text = "Demo modu — Supabase bağlanınca aktif olur" }: { text?: string }) {
  return <span className="text-xs font-medium text-[var(--orange-600)]">{text}</span>;
}
