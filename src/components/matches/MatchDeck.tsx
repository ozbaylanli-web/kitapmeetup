"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown, MessageCircle, Sparkles, CalendarDays, RotateCcw } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { buttonVariants } from "@/components/ui/Button";
import { ambientEngine } from "@/lib/audio/ambientEngine";
import { describeMatch, firstName } from "@/lib/utils";
import type { BookMatch } from "@/lib/types";

function reasonCount(m: BookMatch): number {
  return m.sharedBooks.length + m.sharedGenres.length + m.sharedClubs.length + m.sharedEvents.length;
}

/** Link/butona giden dokunuşun kartın sürükleme/aç-kapa jestini tetiklemesini engeller. */
function stopBubble(e: SyntheticEvent) {
  e.stopPropagation();
}

function SwipeableCard({
  match,
  expanded,
  onToggle,
  onSwipe,
}: {
  match: BookMatch;
  expanded: boolean;
  onToggle: () => void;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 0, 240], [-12, 0, 12]);
  const dragOpacity = useTransform(x, [-240, -80, 0, 80, 240], [0, 1, 1, 1, 0]);

  function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const goLeft = info.offset.x < -110 || info.velocity.x < -700;
    const goRight = info.offset.x > 110 || info.velocity.x > 700;
    if (goLeft || goRight) {
      ambientEngine.playSwipe();
      animate(x, goLeft ? -520 : 520, { duration: 0.22, ease: "easeIn", onComplete: () => onSwipe(goLeft ? "left" : "right") });
    } else {
      animate(x, 0, { type: "spring", stiffness: 420, damping: 32 });
    }
  }

  const count = reasonCount(match);
  const hasExtras = match.sharedGenres.length > 0 || match.sharedClubs.length > 0 || match.sharedEvents.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      <motion.div
        drag="x"
        dragElastic={1}
        onDragEnd={handleDragEnd}
        onTap={onToggle}
        style={{ x, rotate, opacity: dragOpacity }}
        whileTap={{ scale: 0.99 }}
        className="paper-card cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
      >
        <div className="flex flex-col items-center gap-2 px-5 pb-4 pt-7 text-center">
          <Avatar name={match.user.fullName} color={match.user.avatarColor} url={match.user.avatarUrl} size={88} />
          <p className="mt-1 font-serif text-xl font-semibold text-[var(--ink)]">{match.user.fullName}</p>
          <p className="text-xs text-[var(--ink-muted)]">
            @{match.user.username}
            {match.user.city ? ` · ${match.user.city}` : ""}
          </p>
          <span className="gold-pill mt-1">
            <Sparkles size={12} /> {count} ortak nokta
          </span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }} className="mt-1 text-[var(--ink-muted)]">
            <ChevronDown size={18} />
          </motion.span>
        </div>

        <div className="grid transition-[grid-template-rows] duration-500 ease-in-out" style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}>
          <div className="overflow-hidden">
            <div className="space-y-3 border-t border-[var(--line)] px-5 pb-5 pt-4">
              {match.sharedBooks.length > 0 && (
                <div className="space-y-1.5">
                  {match.sharedBooks.map((sb) => (
                    <div key={sb.book.id} className="flex items-center gap-2 rounded-lg bg-[var(--paper-sunken)] px-2.5 py-1.5">
                      <span className="h-7 w-1.5 shrink-0 rounded-sm" style={{ backgroundColor: sb.book.spineColor }} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-[var(--ink)]">{sb.book.title}</p>
                        <p className="text-[11px] text-[var(--ink-muted)]">{describeMatch(sb.myStatus, sb.theirStatus)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasExtras && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {match.sharedGenres.map((g) => (
                    <span
                      key={g}
                      className="rounded-xl bg-[var(--paper-sunken)] px-2.5 py-2 text-center text-[11px] font-medium leading-tight text-[var(--ink-soft)]"
                    >
                      📖 {g}
                    </span>
                  ))}
                  {match.sharedClubs.map((c) => (
                    <Link
                      key={c.id}
                      href={`/kulupler/${c.slug}`}
                      onPointerDown={stopBubble}
                      className="rounded-xl bg-[var(--paper-sunken)] px-2.5 py-2 text-center text-[11px] font-medium leading-tight text-[var(--ink-soft)] hover:bg-[var(--line)]"
                    >
                      {c.icon} {c.name}
                    </Link>
                  ))}
                  {match.sharedEvents.map((e) => (
                    <Link
                      key={e.slug}
                      href={`/etkinlikler/${e.slug}`}
                      onPointerDown={stopBubble}
                      className="rounded-xl bg-[var(--paper-sunken)] px-2.5 py-2 text-center text-[11px] font-medium leading-tight text-[var(--ink-soft)] hover:bg-[var(--line)]"
                    >
                      📅 {e.title}
                    </Link>
                  ))}
                </div>
              )}

              {match.upcomingEventTogether && (
                <div className="flex items-start gap-1.5 rounded-lg border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] px-2.5 py-2 text-[11px] font-medium leading-snug text-[var(--orange-700)]">
                  <CalendarDays size={13} className="mt-0.5 shrink-0" />
                  <span>
                    {firstName(match.user.fullName)}, &ldquo;{match.upcomingEventTogether.title}&rdquo; etkinliğine gidiyor — sen de gel!
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Link href={`/profil/${match.user.username}`} onPointerDown={stopBubble} className={buttonVariants("outline", "sm", "flex-1")}>
                  Profiline bak
                </Link>
                <Link href={`/mesajlar/${match.user.username}`} onPointerDown={stopBubble} className={buttonVariants("secondary", "sm", "flex-1")}>
                  <MessageCircle size={13} /> Mesaj
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Tinder'a benzeyen ama daha iyisi: kaydırarak (ya da ok tuşlarıyla)
 * gezinilen bir eşleşme destesi. Karta dokununca "kart gibi açılıp"
 * ortak noktaları (kitap, tür, kulüp, etkinlik) 2-3'lü bir gride döker.
 * Açılış/kapanış ve kaydırma anlarında kısa, üretimsel ses efektleri çalar.
 */
export function MatchDeck({ matches }: { matches: BookMatch[] }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  if (matches.length === 0) return null;
  const current = matches[index];

  function toggle() {
    if (expanded) ambientEngine.playCardClose();
    else ambientEngine.playCardOpen();
    setExpanded((e) => !e);
  }

  function goTo(newIndex: number) {
    setExpanded(false);
    setIndex(Math.max(0, Math.min(matches.length, newIndex)));
  }

  function handleSwipe(dir: "left" | "right") {
    // sola kaydır → sonraki, sağa kaydır → önceki (sayfa çevirme hissi)
    goTo(dir === "left" ? index + 1 : index - 1);
  }

  if (!current) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 p-8 text-center">
        <p className="text-3xl">🎉</p>
        <p className="text-sm font-semibold text-[var(--ink)]">Hepsini gördün!</p>
        <p className="text-xs text-[var(--ink-muted)]">{matches.length} eşleşmenin tamamına göz attın.</p>
        <button type="button" onClick={() => goTo(0)} className={buttonVariants("outline", "sm")}>
          <RotateCcw size={13} /> Baştan başla
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mx-auto max-w-sm">
        {matches[index + 1] && <div aria-hidden className="paper-card absolute inset-x-3 top-3 -z-10 h-56 scale-[0.96] opacity-60" />}
        <SwipeableCard key={current.user.id} match={current} expanded={expanded} onToggle={toggle} onSwipe={handleSwipe} />
      </div>

      <div className="mx-auto mt-4 flex max-w-sm items-center justify-between">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className={buttonVariants("ghost", "sm", "disabled:pointer-events-none disabled:opacity-30")}
        >
          <ChevronLeft size={16} /> Önceki
        </button>
        <span className="text-xs font-medium text-[var(--ink-muted)]">
          {index + 1} / {matches.length}
        </span>
        <button type="button" onClick={() => goTo(index + 1)} className={buttonVariants("ghost", "sm")}>
          Sonraki <ChevronRight size={16} />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-[var(--ink-muted)]">Kartı sürükleyerek de gezinebilirsin.</p>
    </div>
  );
}
