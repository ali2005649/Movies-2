-- Run this once in the Supabase Dashboard → SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS.
-- After running, reviews load on MovieDetails without the red toast.

-- ========== FAVORITES ==========
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  movie_id text not null,
  movie_title text,
  movie_poster text,
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);

alter table public.favorites enable row level security;

drop policy if exists "Favorites are viewable by owner" on public.favorites;
create policy "Favorites are viewable by owner"
  on public.favorites for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own favorites" on public.favorites;
create policy "Users can insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ========== REVIEWS ==========
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  movie_id text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  user_email text,
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);

alter table public.reviews enable row level security;

drop policy if exists "Reviews are publicly readable" on public.reviews;
create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

drop policy if exists "Users can insert own reviews" on public.reviews;
create policy "Users can insert own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own reviews" on public.reviews;
create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own reviews" on public.reviews;
create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Grants required for anon/authenticated API access through the Supabase client
grant usage on schema public to anon, authenticated;
grant select on table public.reviews to anon, authenticated;
grant insert, update, delete on table public.reviews to authenticated;
grant select, insert, delete on table public.favorites to authenticated;

create index if not exists reviews_movie_id_idx on public.reviews (movie_id);
create index if not exists favorites_user_id_idx on public.favorites (user_id);

-- Optional: refresh PostgREST schema cache if the table was just created
notify pgrst, 'reload schema';
