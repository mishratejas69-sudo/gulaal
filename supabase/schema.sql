create extension if not exists pgcrypto;
create table poems(id uuid primary key default gen_random_uuid(),title text not null,content text not null,author text default 'Gulaal 🥀',date date default current_date,cover_image text,tags text[] default '{}',created_at timestamptz default now());
create table stories(id uuid primary key default gen_random_uuid(),title text not null,content text not null,description text,cover_image text,date date default current_date,created_at timestamptz default now());
create table playlists(id uuid primary key default gen_random_uuid(),title text not null,description text,spotify_url text not null,cover_image text,created_at timestamptz default now());
create table about(id uuid primary key default gen_random_uuid(),content text,social_links jsonb default '{}',updated_at timestamptz default now());
create table comments(id uuid primary key default gen_random_uuid(),content_id uuid not null,content_type text not null check(content_type in('poem','story')),username text not null check(char_length(username) between 1 and 40),comment text not null check(char_length(comment) between 1 and 500),created_at timestamptz default now());
create table reactions(id uuid primary key default gen_random_uuid(),content_id uuid not null,content_type text not null check(content_type in('poem','story')),reaction_type text not null check(reaction_type in('heart','laugh','cry','like','wow')),created_at timestamptz default now());
-- admin = the one auth user whose email you set here:
create or replace function is_admin() returns boolean language sql stable as $$ select coalesce(auth.jwt()->>'email','')='CHANGE_ME@example.com' $$;
do $$ declare t text; begin foreach t in array array['poems','stories','playlists','about','comments','reactions'] loop
 execute format('alter table %I enable row level security',t);
 execute format('create policy "read" on %I for select using(true)',t);
 execute format('create policy "admin_delete" on %I for delete using(is_admin())',t);
 if t in('comments','reactions') then execute format('create policy "public_add" on %I for insert with check(true)',t);
 else execute format('create policy "admin_write" on %I for insert with check(is_admin())',t);
      execute format('create policy "admin_update" on %I for update using(is_admin())',t); end if;
end loop; end $$;
create or replace view reaction_counts as select content_id,reaction_type,count(*)::int n from reactions group by 1,2;
grant select on reaction_counts to anon,authenticated;
