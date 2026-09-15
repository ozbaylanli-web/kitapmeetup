/**
 * Elle yazılmış Supabase veritabanı tipleri (supabase/migrations/0001_init.sql
 * ile senkron tutulur). Gerçek bir Supabase projeniz olduğunda, bu dosyayı
 * `npx supabase gen types typescript --linked > src/lib/supabase/types.ts`
 * ile otomatik üretilenle değiştirebilirsiniz.
 *
 * Not: `Relationships: []` ve şema seviyesindeki `Views`/`Functions`/`Enums`/
 * `CompositeTypes` alanları, @supabase/postgrest-js'in `GenericSchema` tipini
 * sağlamak için gerekli — Supabase CLI'ın ürettiği dosyalarla aynı desen.
 */

export type ClubRole = "member" | "moderator" | "owner";
export type ShelfStatus = "reading" | "read" | "want";
export type PostType = "text" | "quote" | "photo" | "question" | "takas" | "takas_arama" | "etkinlik" | "kulup";
export type SwapOfferStatus = "pending" | "accepted" | "declined";
export type CommentTarget = "post" | "blog_post" | "lesson" | "read_thread";
export type RsvpStatus = "going" | "interested" | "not_going";
export type AcademyLevel = "giriş" | "orta" | "ileri";
export type AcademyCadence = "haftalık" | "aylık" | "kendi hızında";
export type VenueKind = "kitapci" | "kitap_kafe" | "okuma_dostu_kafe";
export type RegistrationFieldType = "text" | "textarea" | "select" | "checkbox";

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          avatar_color: string;
          bio: string;
          city: string | null;
          birth_date: string | null;
          gender: string | null;
          is_admin: boolean;
          referred_by: string | null;
          account_kind: "reader" | "publisher";
          publisher_website: string | null;
          created_at: string;
        },
        {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          avatar_color?: string;
          bio?: string;
          city?: string | null;
          birth_date?: string | null;
          gender?: string | null;
          is_admin?: boolean;
          referred_by?: string | null;
          account_kind?: "reader" | "publisher";
          publisher_website?: string | null;
          created_at?: string;
        }
      >;
      clubs: Table<
        {
          id: string;
          slug: string;
          name: string;
          description: string;
          color: string;
          icon: string;
          created_by: string | null;
          current_book_id: string | null;
          current_book_note: string | null;
          current_book_set_at: string | null;
          home_venue_id: string | null;
          created_at: string;
        },
        {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          color?: string;
          icon?: string;
          created_by?: string | null;
          current_book_id?: string | null;
          current_book_note?: string | null;
          current_book_set_at?: string | null;
          home_venue_id?: string | null;
          created_at?: string;
        }
      >;
      club_members: Table<
        { club_id: string; user_id: string; role: ClubRole; joined_at: string },
        { club_id: string; user_id: string; role?: ClubRole; joined_at?: string }
      >;
      books: Table<
        {
          id: string;
          title: string;
          author: string;
          spine_color: string;
          genre: string | null;
          added_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          title: string;
          author: string;
          spine_color?: string;
          genre?: string | null;
          added_by?: string | null;
          created_at?: string;
        }
      >;
      shelf_entries: Table<
        {
          id: string;
          user_id: string;
          book_id: string;
          status: ShelfStatus;
          rating: number | null;
          note: string | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          book_id: string;
          status?: ShelfStatus;
          rating?: number | null;
          note?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        }
      >;
      posts: Table<
        {
          id: string;
          author_id: string;
          club_id: string | null;
          event_id: string | null;
          type: PostType;
          body: string | null;
          book_id: string | null;
          counter_book_id: string | null;
          image_url: string | null;
          created_at: string;
        },
        {
          id?: string;
          author_id: string;
          club_id?: string | null;
          event_id?: string | null;
          type?: PostType;
          body?: string | null;
          book_id?: string | null;
          counter_book_id?: string | null;
          image_url?: string | null;
          created_at?: string;
        }
      >;
      post_likes: Table<
        { post_id: string; user_id: string; created_at: string },
        { post_id: string; user_id: string; created_at?: string }
      >;
      comments: Table<
        {
          id: string;
          author_id: string;
          target_type: CommentTarget;
          target_id: string;
          body: string;
          created_at: string;
        },
        {
          id?: string;
          author_id: string;
          target_type: CommentTarget;
          target_id: string;
          body: string;
          created_at?: string;
        }
      >;
      follows: Table<
        { follower_id: string; following_id: string; created_at: string },
        { follower_id: string; following_id: string; created_at?: string }
      >;
      events: Table<
        {
          id: string;
          slug: string;
          club_id: string | null;
          title: string;
          description: string;
          location_name: string | null;
          location_url: string | null;
          is_online: boolean;
          venue_id: string | null;
          starts_at: string;
          ends_at: string | null;
          capacity: number | null;
          created_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          slug: string;
          club_id?: string | null;
          title: string;
          description?: string;
          location_name?: string | null;
          location_url?: string | null;
          is_online?: boolean;
          venue_id?: string | null;
          starts_at: string;
          ends_at?: string | null;
          capacity?: number | null;
          created_by?: string | null;
          created_at?: string;
        }
      >;
      event_rsvps: Table<
        { event_id: string; user_id: string; status: RsvpStatus; created_at: string },
        { event_id: string; user_id: string; status?: RsvpStatus; created_at?: string }
      >;
      event_registration_fields: Table<
        {
          id: string;
          event_id: string;
          label: string;
          field_type: RegistrationFieldType;
          options: string[] | null;
          is_required: boolean;
          order_index: number;
          created_at: string;
        },
        {
          id?: string;
          event_id: string;
          label: string;
          field_type?: RegistrationFieldType;
          options?: string[] | null;
          is_required?: boolean;
          order_index?: number;
          created_at?: string;
        }
      >;
      event_registration_answers: Table<
        { id: string; field_id: string; event_id: string; user_id: string; value: string; created_at: string },
        { id?: string; field_id: string; event_id: string; user_id: string; value?: string; created_at?: string }
      >;
      academy_courses: Table<
        {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          description: string;
          level: AcademyLevel;
          cadence: AcademyCadence;
          color: string;
          is_published: boolean;
          created_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          slug: string;
          title: string;
          subtitle?: string | null;
          description?: string;
          level?: AcademyLevel;
          cadence?: AcademyCadence;
          color?: string;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
        }
      >;
      academy_lessons: Table<
        {
          id: string;
          course_id: string;
          slug: string;
          title: string;
          order_index: number;
          content: string;
          duration_minutes: number;
          starts_at: string | null;
          ends_at: string | null;
          is_online: boolean;
          location_name: string | null;
          location_url: string | null;
          capacity: number | null;
          created_at: string;
        },
        {
          id?: string;
          course_id: string;
          slug: string;
          title: string;
          order_index?: number;
          content?: string;
          duration_minutes?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          is_online?: boolean;
          location_name?: string | null;
          location_url?: string | null;
          capacity?: number | null;
          created_at?: string;
        }
      >;
      academy_enrollments: Table<
        { course_id: string; user_id: string; enrolled_at: string },
        { course_id: string; user_id: string; enrolled_at?: string }
      >;
      academy_lesson_progress: Table<
        { lesson_id: string; user_id: string; completed_at: string },
        { lesson_id: string; user_id: string; completed_at?: string }
      >;
      academy_lesson_rsvps: Table<
        { lesson_id: string; user_id: string; status: RsvpStatus; created_at: string },
        { lesson_id: string; user_id: string; status?: RsvpStatus; created_at?: string }
      >;
      blog_posts: Table<
        {
          id: string;
          author_id: string;
          slug: string;
          title: string;
          summary: string | null;
          color: string;
          body: string;
          tags: string[];
          is_published: boolean;
          published_at: string;
          created_at: string;
        },
        {
          id?: string;
          author_id: string;
          slug: string;
          title: string;
          summary?: string | null;
          color?: string;
          body?: string;
          tags?: string[];
          is_published?: boolean;
          published_at?: string;
          created_at?: string;
        }
      >;
      daily_prompts: Table<{ id: number; question: string }, { id?: number; question: string }>;
      daily_prompt_answers: Table<
        { id: string; prompt_id: number; author_id: string; body: string; image_url: string | null; created_at: string },
        { id?: string; prompt_id: number; author_id: string; body?: string; image_url?: string | null; created_at?: string }
      >;
      instagram_connections: Table<
        {
          id: string;
          ig_user_id: string;
          ig_username: string | null;
          page_id: string;
          access_token: string;
          token_expires_at: string | null;
          connected_by: string | null;
          connected_at: string;
        },
        {
          id?: string;
          ig_user_id: string;
          ig_username?: string | null;
          page_id: string;
          access_token: string;
          token_expires_at?: string | null;
          connected_by?: string | null;
          connected_at?: string;
        }
      >;
      instagram_posts: Table<
        {
          id: string;
          source_type: "event" | "post";
          source_id: string;
          ig_media_id: string | null;
          ig_permalink: string | null;
          status: "pending" | "published" | "failed";
          error: string | null;
          posted_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          source_type: "event" | "post";
          source_id: string;
          ig_media_id?: string | null;
          ig_permalink?: string | null;
          status?: "pending" | "published" | "failed";
          error?: string | null;
          posted_by?: string | null;
          created_at?: string;
        }
      >;
      venues: Table<
        {
          id: string;
          slug: string;
          name: string;
          district: string;
          kind: VenueKind;
          description: string;
          maps_url: string | null;
          added_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          slug: string;
          name: string;
          district: string;
          kind?: VenueKind;
          description?: string;
          maps_url?: string | null;
          added_by?: string | null;
          created_at?: string;
        }
      >;
      venue_notes: Table<
        { id: string; venue_id: string; author_id: string; rating: number | null; body: string; created_at: string },
        { id?: string; venue_id: string; author_id: string; rating?: number | null; body?: string; created_at?: string }
      >;
      venue_checkins: Table<
        { id: string; venue_id: string; user_id: string; note: string | null; created_at: string },
        { id?: string; venue_id: string; user_id: string; note?: string | null; created_at?: string }
      >;
      swap_offers: Table<
        {
          id: string;
          post_id: string;
          offerer_id: string;
          book_id: string;
          message: string;
          status: SwapOfferStatus;
          created_at: string;
        },
        {
          id?: string;
          post_id: string;
          offerer_id: string;
          book_id: string;
          message?: string;
          status?: SwapOfferStatus;
          created_at?: string;
        }
      >;
      reading_goals: Table<
        { user_id: string; year: number; target: number; created_at: string; updated_at: string },
        { user_id: string; year: number; target: number; created_at?: string; updated_at?: string }
      >;
      club_read_threads: Table<
        { id: string; club_id: string; title: string; created_by: string | null; created_at: string },
        { id?: string; club_id: string; title: string; created_by?: string | null; created_at?: string }
      >;
      direct_messages: Table<
        {
          id: string;
          sender_id: string;
          recipient_id: string;
          body: string;
          created_at: string;
          read_at: string | null;
        },
        {
          id?: string;
          sender_id: string;
          recipient_id: string;
          body: string;
          created_at?: string;
          read_at?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
