-- Trussline administration workspace foundation.
--
-- This is intentionally separate from the learner-facing `profiles` table.
-- A curriculum role is not an administrative privilege. Named administrative
-- members, page editing, design references, and recommendations live here so
-- they can be authorised and audited independently of learner data.

create extension if not exists citext;

create table if not exists public.admin_members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  username citext not null unique,
  email citext unique,
  display_name text not null,
  avatar_path text,
  avatar_alt text,
  role text not null default 'viewer'
    check (role in ('owner', 'administrator', 'editor', 'analyst', 'viewer')),
  status text not null default 'invited'
    check (status in ('invited', 'active', 'inactive', 'suspended')),
  is_bootstrap_owner boolean not null default false,
  last_signed_in_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (char_length(trim(username::text)) between 3 and 64),
  check (char_length(trim(display_name)) between 1 and 120)
);

create unique index if not exists admin_members_single_bootstrap_owner_idx
  on public.admin_members (is_bootstrap_owner)
  where is_bootstrap_owner;

create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.admin_members(id) on delete cascade,
  recipient_email citext not null,
  requested_role text not null
    check (requested_role in ('administrator', 'editor', 'analyst', 'viewer')),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null default timezone('utc', now()) + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  navigation_label text,
  summary text,
  meta_title text,
  meta_description text,
  status text not null default 'draft'
    check (status in ('draft', 'in_review', 'published', 'archived')),
  current_published_revision_id uuid,
  created_by uuid references public.admin_members(id) on delete set null,
  updated_by uuid references public.admin_members(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (slug = '/' or slug ~ '^/[a-z0-9][a-z0-9/_-]*$'),
  check (char_length(trim(title)) between 1 and 160)
);

create table if not exists public.site_page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_pages(id) on delete cascade,
  revision_number integer not null check (revision_number > 0),
  status text not null default 'draft'
    check (status in ('draft', 'in_review', 'published', 'archived')),
  change_summary text,
  created_by uuid references public.admin_members(id) on delete set null,
  published_by uuid references public.admin_members(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (page_id, revision_number)
);

alter table public.site_pages
  drop constraint if exists site_pages_current_published_revision_id_fkey;
alter table public.site_pages
  add constraint site_pages_current_published_revision_id_fkey
  foreign key (current_published_revision_id)
  references public.site_page_revisions(id)
  on delete set null;

create table if not exists public.site_page_sections (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.site_page_revisions(id) on delete cascade,
  section_type text not null
    check (section_type in (
      'hero', 'proof_strip', 'region_selector', 'feature_list', 'editorial_panel',
      'media_story', 'quote', 'stat_grid', 'faq', 'cta', 'footer'
    )),
  section_key text not null,
  position integer not null default 0 check (position >= 0),
  enabled boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (revision_id, section_key),
  unique (revision_id, position),
  check (jsonb_typeof(content) = 'object'),
  check (jsonb_typeof(settings) = 'object')
);

create table if not exists public.admin_media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null default 'trussline-admin-assets',
  storage_path text not null unique,
  mime_type text not null,
  byte_size integer not null check (byte_size > 0 and byte_size <= 5242880),
  alt_text text,
  created_by uuid references public.admin_members(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.design_collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active'
    check (status in ('active', 'archived')),
  created_by uuid references public.admin_members(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (char_length(trim(name)) between 1 and 120)
);

create table if not exists public.design_references (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.design_collections(id) on delete set null,
  provider text not null
    check (provider in ('pinterest', 'behance', 'dribbble', 'awwwards', 'manual', 'other')),
  source_url text not null,
  title text not null,
  purpose text,
  tags text[] not null default '{}',
  notes text,
  cover_asset_id uuid references public.admin_media_assets(id) on delete set null,
  rights_status text not null default 'link_only'
    check (rights_status in ('link_only', 'owned_upload', 'licensed_upload')),
  status text not null default 'saved'
    check (status in ('saved', 'reviewing', 'approved', 'archived')),
  created_by uuid references public.admin_members(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (source_url ~ '^https://')
);

create table if not exists public.admin_recommendations (
  id uuid primary key default gen_random_uuid(),
  scope text not null
    check (scope in ('responsive', 'accessibility', 'content', 'design', 'performance', 'security')),
  priority text not null default 'normal'
    check (priority in ('critical', 'high', 'normal', 'low')),
  title text not null,
  rationale text not null,
  suggested_action text,
  target_type text,
  target_id uuid,
  source text not null default 'rules'
    check (source in ('rules', 'ai')),
  provider_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'open'
    check (status in ('open', 'accepted', 'dismissed', 'completed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (jsonb_typeof(provider_metadata) = 'object')
);

create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_member_id uuid references public.admin_members(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  check (jsonb_typeof(metadata) = 'object')
);

create index if not exists admin_members_status_idx on public.admin_members (status, role);
create index if not exists site_pages_status_idx on public.site_pages (status, updated_at desc);
create index if not exists site_page_revisions_page_idx on public.site_page_revisions (page_id, revision_number desc);
create index if not exists site_page_sections_revision_idx on public.site_page_sections (revision_id, position);
create index if not exists design_references_status_idx on public.design_references (status, updated_at desc);
create index if not exists admin_recommendations_status_idx on public.admin_recommendations (status, priority, created_at desc);
create index if not exists admin_audit_events_actor_idx on public.admin_audit_events (actor_member_id, occurred_at desc);

drop trigger if exists admin_members_updated_at on public.admin_members;
create trigger admin_members_updated_at before update on public.admin_members
  for each row execute function public.set_updated_at();
drop trigger if exists admin_invitations_updated_at on public.admin_invitations;
create trigger admin_invitations_updated_at before update on public.admin_invitations
  for each row execute function public.set_updated_at();
drop trigger if exists site_pages_updated_at on public.site_pages;
create trigger site_pages_updated_at before update on public.site_pages
  for each row execute function public.set_updated_at();
drop trigger if exists site_page_revisions_updated_at on public.site_page_revisions;
create trigger site_page_revisions_updated_at before update on public.site_page_revisions
  for each row execute function public.set_updated_at();
drop trigger if exists site_page_sections_updated_at on public.site_page_sections;
create trigger site_page_sections_updated_at before update on public.site_page_sections
  for each row execute function public.set_updated_at();
drop trigger if exists design_collections_updated_at on public.design_collections;
create trigger design_collections_updated_at before update on public.design_collections
  for each row execute function public.set_updated_at();
drop trigger if exists design_references_updated_at on public.design_references;
create trigger design_references_updated_at before update on public.design_references
  for each row execute function public.set_updated_at();
drop trigger if exists admin_recommendations_updated_at on public.admin_recommendations;
create trigger admin_recommendations_updated_at before update on public.admin_recommendations
  for each row execute function public.set_updated_at();

-- Server routes use the service key, while this function prepares a precise
-- Supabase Auth identity check for the named-admin sign-in rollout.
create or replace function public.current_admin_member_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.admin_members
  where auth_user_id = auth.uid()
    and status = 'active'
  limit 1;
$$;

create or replace function public.is_active_admin_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_admin_member_role() is not null;
$$;

revoke all on function public.current_admin_member_role() from public;
revoke all on function public.is_active_admin_member() from public;
grant execute on function public.current_admin_member_role() to authenticated;
grant execute on function public.is_active_admin_member() to authenticated;

alter table public.admin_members enable row level security;
alter table public.admin_invitations enable row level security;
alter table public.site_pages enable row level security;
alter table public.site_page_revisions enable row level security;
alter table public.site_page_sections enable row level security;
alter table public.admin_media_assets enable row level security;
alter table public.design_collections enable row level security;
alter table public.design_references enable row level security;
alter table public.admin_recommendations enable row level security;
alter table public.admin_audit_events enable row level security;

revoke all on table public.admin_members from anon, authenticated, public;
revoke all on table public.admin_invitations from anon, authenticated, public;
revoke all on table public.site_pages from anon, authenticated, public;
revoke all on table public.site_page_revisions from anon, authenticated, public;
revoke all on table public.site_page_sections from anon, authenticated, public;
revoke all on table public.admin_media_assets from anon, authenticated, public;
revoke all on table public.design_collections from anon, authenticated, public;
revoke all on table public.design_references from anon, authenticated, public;
revoke all on table public.admin_recommendations from anon, authenticated, public;
revoke all on table public.admin_audit_events from anon, authenticated, public;

grant all on table public.admin_members, public.admin_invitations,
  public.site_pages, public.site_page_revisions, public.site_page_sections,
  public.admin_media_assets, public.design_collections, public.design_references,
  public.admin_recommendations, public.admin_audit_events to service_role;

-- Only published content is visible to the public site. Drafts, private
-- design references, people, audits, and recommendations never leave the
-- protected server routes.
drop policy if exists "public reads published pages" on public.site_pages;
create policy "public reads published pages" on public.site_pages
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "public reads published revisions" on public.site_page_revisions;
create policy "public reads published revisions" on public.site_page_revisions
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "public reads published page sections" on public.site_page_sections;
create policy "public reads published page sections" on public.site_page_sections
  for select to anon, authenticated
  using (exists (
    select 1 from public.site_page_revisions r
    where r.id = revision_id and r.status = 'published'
  ));

-- Private admin assets are uploaded and signed only by protected server routes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trussline-admin-assets',
  'trussline-admin-assets',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into public.admin_members (
  username,
  display_name,
  role,
  status,
  is_bootstrap_owner
)
values (
  'LazimaIwork.AI',
  'LazimaIwork',
  'owner',
  'active',
  true
)
on conflict (username) do nothing;

insert into public.site_pages (slug, title, navigation_label, summary, status)
values (
  '/',
  'Trussline home',
  'Home',
  'International interactive learning launch page.',
  'draft'
)
on conflict (slug) do nothing;

-- Give the initial Home record a real editable draft rather than a decorative
-- row. Subsequent pages are created through the protected CMS route using the
-- same page → revision → typed-section relationship.
do $$
declare
  home_page_id uuid;
  home_revision_id uuid;
  owner_id uuid;
begin
  select id into home_page_id from public.site_pages where slug = '/';
  select id into owner_id from public.admin_members where is_bootstrap_owner;
  select id into home_revision_id
  from public.site_page_revisions
  where page_id = home_page_id
  order by revision_number desc
  limit 1;

  if home_page_id is not null and home_revision_id is null then
    insert into public.site_page_revisions (
      page_id, revision_number, status, change_summary, created_by
    ) values (
      home_page_id, 1, 'draft', 'Initial editable Trussline home draft', owner_id
    ) returning id into home_revision_id;
  end if;

  if home_revision_id is not null then
    insert into public.site_page_sections (
      revision_id, section_type, section_key, position, content, settings
    ) values (
      home_revision_id,
      'hero',
      'hero',
      0,
      jsonb_build_object(
        'heading', 'Learning that meets the world where it is.',
        'body', 'Trussline Interactive Learning turns curriculum into active, adaptive learning for every region.'
      ),
      jsonb_build_object('tone', 'light', 'alignment', 'left')
    ) on conflict (revision_id, section_key) do nothing;
  end if;
end;
$$;
