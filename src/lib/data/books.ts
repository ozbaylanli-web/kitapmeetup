import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { AUTHORS, BOOKS, CLUBS, EVENTS, SHELVES } from "@/lib/fixtures";
import { BOOK_CATALOG } from "@/lib/fixtures/catalog";
import { colorForText, slugify } from "@/lib/utils";
import { fetchAuthorsByIds, mapBook } from "./mappers";
import { getFeedPosts } from "./feed";
import { getEvents } from "./events";
import type { AuthorDetail, BookDetail, BookReader, BookSummary } from "@/lib/types";

/**
 * Kitap ve yazar sayfaları hiçbir yeni tablo/kolon gerektirmedi — mevcut
 * `books`, `posts`, `shelf_entries` ve `clubs.current_book_id` üzerine kurulu.
 * Yazarın kendine ait bir tablosu yok: "yazar" kimliği, `books.author`
 * serbest metin alanından (slugify edilerek) türetiliyor.
 */

function catalogBookId(title: string): string {
  return `cat_${slugify(title)}`;
}

function fixtureBookUniverse(): BookSummary[] {
  // Küratörlü BOOKS (paylaşım/raf/kulüp fixture'larında kullanılan ~12 kitap) ile
  // BOOK_CATALOG (700+) arasında başlık çakışması olabilir — scripts/seed.ts gerçek
  // backend'de bunu zaten dışlıyor (bkz. "Kitap kataloğu" adımı); burada da aynı
  // mantıkla, küratörlü olan kazanır.
  const curated = Object.values(BOOKS);
  const curatedTitles = new Set(curated.map((b) => b.title.trim().toLowerCase()));
  const catalog = BOOK_CATALOG.filter((b) => !curatedTitles.has(b.title.trim().toLowerCase())).map((b) => ({
    id: catalogBookId(b.title),
    title: b.title,
    author: b.author,
    spineColor: colorForText(b.title),
    genre: b.genre,
  }));
  return [...curated, ...catalog];
}

export async function getBookById(id: string): Promise<BookDetail | null> {
  if (!hasSupabaseEnv()) {
    const book = fixtureBookUniverse().find((b) => b.id === id);
    if (!book) return null;

    const posts = (await getFeedPosts()).filter((p) => p.book?.id === id || p.counterBook?.id === id);

    const readers: BookReader[] = [];
    Object.entries(SHELVES).forEach(([username, items]) => {
      const entry = items.find((i) => i.book.id === id);
      const author = AUTHORS[username];
      if (entry && author) readers.push({ status: entry.status, author });
    });

    const clubIds = new Set(CLUBS.filter((c) => c.pinnedBook?.id === id).map((c) => c.id));
    const events = EVENTS.filter((e) => e.club && clubIds.has(e.club.id));

    return { ...book, posts, readers, events };
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: row } = await supabase.from("books").select("*").eq("id", id).maybeSingle();
  if (!row) return null;
  const book = mapBook(row);

  const [posts, { data: shelfRows }, { data: clubRows }] = await Promise.all([
    getFeedPosts({ bookIds: [id] }),
    supabase.from("shelf_entries").select("user_id, status").eq("book_id", id).limit(60),
    supabase.from("clubs").select("id").eq("current_book_id", id),
  ]);

  const authorMap = await fetchAuthorsByIds(supabase, (shelfRows ?? []).map((r) => r.user_id));
  const readers: BookReader[] = (shelfRows ?? [])
    .map((r) => {
      const author = authorMap.get(r.user_id);
      return author ? { status: r.status, author } : null;
    })
    .filter((r): r is BookReader => Boolean(r));

  const clubIds = new Set((clubRows ?? []).map((c) => c.id));
  const events = clubIds.size ? (await getEvents()).filter((e) => e.club && clubIds.has(e.club.id)) : [];

  return { ...book, posts, readers, events };
}

export async function getAuthorPage(slug: string): Promise<AuthorDetail | null> {
  if (!hasSupabaseEnv()) {
    const universe = fixtureBookUniverse();
    const matches = universe.filter((b) => slugify(b.author) === slug);
    if (matches.length === 0) return null;

    const name = matches[0].author;
    const bookIds = new Set<string>();
    const books: BookSummary[] = [];
    matches.forEach((b) => {
      if (!bookIds.has(b.id)) {
        bookIds.add(b.id);
        books.push(b);
      }
    });

    const posts = (await getFeedPosts()).filter((p) => (p.book && bookIds.has(p.book.id)) || (p.counterBook && bookIds.has(p.counterBook.id)));
    const clubIds = new Set(CLUBS.filter((c) => c.pinnedBook && bookIds.has(c.pinnedBook.id)).map((c) => c.id));
    const events = EVENTS.filter((e) => e.club && clubIds.has(e.club.id));

    return { name, slug, books, posts, events };
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: authorRows } = await supabase.from("books").select("author");
  const distinctNames = Array.from(new Set((authorRows ?? []).map((r) => r.author).filter(Boolean)));
  const name = distinctNames.find((n) => slugify(n) === slug);
  if (!name) return null;

  const { data: bookRows } = await supabase.from("books").select("*").eq("author", name).limit(60);
  const books = (bookRows ?? []).map(mapBook);
  const bookIds = books.map((b) => b.id);
  if (bookIds.length === 0) return { name, slug, books: [], posts: [], events: [] };

  const [posts, { data: clubRows }] = await Promise.all([
    getFeedPosts({ bookIds }),
    supabase.from("clubs").select("id").in("current_book_id", bookIds),
  ]);
  const clubIds = new Set((clubRows ?? []).map((c) => c.id));
  const events = clubIds.size ? (await getEvents()).filter((e) => e.club && clubIds.has(e.club.id)) : [];

  return { name, slug, books, posts, events };
}
