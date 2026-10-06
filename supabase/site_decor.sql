-- Run after schema.sql. Decorative text only; positions/styles live in the frontend.
create table site_decor(
 id uuid primary key default gen_random_uuid(),
 section text not null default 'global' check(section in('poetry','stories','playlists','about','global')),
 element_type text not null check(element_type in('quote','note','caption','stamp','label','annotation')),
 text text not null check(char_length(text) between 1 and 160),
 position_key text,            -- optional slot pin, e.g. 'poetry.caption-0'; leave empty to fill the next free slot
 is_active boolean not null default true,
 created_at timestamptz default now());
alter table site_decor enable row level security;
create policy "decor_read" on site_decor for select using(is_active or is_admin());
create policy "decor_insert" on site_decor for insert with check(is_admin());
create policy "decor_update" on site_decor for update using(is_admin());
create policy "decor_delete" on site_decor for delete using(is_admin());
