"use client";

import { useMemo, useState } from "react";
import { PostCard } from "./PostCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ambientEngine } from "@/lib/audio/ambientEngine";
import { cn } from "@/lib/utils";
import type { FeedItem } from "@/lib/types";

type FilterKey = "all" | "text" | "quote" | "photo" | "question" | "takas" | "blog";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "text", label: "💬 Sohbet" },
  { key: "quote", label: "✒️ Alıntı" },
  { key: "photo", label: "📷 Fotoğraf" },
  { key: "question", label: "❓ Soru" },
  { key: "takas", label: "🔄 Takas" },
  { key: "blog", label: "🖋️ Blog" },
];

function matchesFilter(item: FeedItem, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "blog") return item.kind === "blog";
  if (item.kind !== "post") return false;
  if (filter === "takas") return item.post.type === "takas" || item.post.type === "takas_arama";
  return item.post.type === filter;
}

/** Ana akış listesi — paylaşım türüne göre (Sohbet, Alıntı, Takas, Blog…) istemci tarafında filtrelenebilir. */
export function FeedList({ items, isAdmin = false }: { items: FeedItem[]; isAdmin?: boolean }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const filtered = useMemo(() => items.filter((item) => matchesFilter(item, filter)), [items, filter]);

  return (
    <div>
      <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                if (!active) ambientEngine.playNavTick();
                setFilter(f.key);
              }}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                active ? "bg-[var(--orange-500)] text-white" : "bg-[var(--paper-sunken)] text-[var(--ink-soft)] hover:bg-[var(--line)]"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState emoji="🔍" title="Bu türde paylaşım yok" description="Başka bir filtre dener misin?" />
        ) : (
          filtered.map((item) =>
            item.kind === "post" ? (
              <PostCard key={`post-${item.post.id}`} post={item.post} isAdmin={isAdmin} />
            ) : (
              <BlogCard key={`blog-${item.blogPost.id}`} post={item.blogPost} />
            )
          )
        )}
      </div>
    </div>
  );
}
