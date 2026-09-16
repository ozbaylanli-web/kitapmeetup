"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon, MonitorSmartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kitapmeetup:theme";
const THEME_EVENT = "kitapmeetup:theme-change";

type ThemePref = "system" | "light" | "dark";

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

/** data-theme'i ve localStorage'ı günceller, ardından bu sekmedeki tüm ThemeToggle örneklerinin yeniden render olması için özel bir olay yayınlar. */
function applyPref(pref: ThemePref) {
  if (pref === "system") {
    document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // depoya erişim yoksa sessizce geç
    }
  } else {
    document.documentElement.setAttribute("data-theme", pref);
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      // depoya erişim yoksa sessizce geç
    }
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

const NEXT: Record<ThemePref, ThemePref> = { system: "light", light: "dark", dark: "system" };
const META: Record<ThemePref, { icon: typeof Sun; label: string }> = {
  system: { icon: MonitorSmartphone, label: "Tema: Sistemi takip ediyor" },
  light: { icon: Sun, label: "Tema: Açık" },
  dark: { icon: Moon, label: "Tema: Karanlık" },
};

/** Sistem → Açık → Karanlık arasında döngüsel bir tema düğmesi. Tercih localStorage'da tutulur (bkz. layout.tsx'teki FOUC-önleyici script). */
export function ThemeToggle({ className }: { className?: string }) {
  const pref = useSyncExternalStore(subscribe, readPref, () => "system" as ThemePref);
  const { icon: Icon, label } = META[pref];

  return (
    <button
      type="button"
      onClick={() => applyPref(NEXT[pref])}
      title={label}
      aria-label={label}
      className={cn("flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--paper-sunken)]", className)}
    >
      <Icon size={17} />
    </button>
  );
}
