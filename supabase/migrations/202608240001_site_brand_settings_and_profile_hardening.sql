-- Global, public-safe brand settings. This is deliberately separate from
-- learner data: anyone may read the harmless logo scale, while only a
-- server-side service role may change it through the protected admin route.

create table if not exists public.site_brand_settings (
  id boolean primary key default true check (id),
  logo_scale numeric(3,2) not null default 1.20 check (logo_scale >= 0.80 and logo_scale <= 1.40),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_brand_settings_audit (
  id uuid primary key default gen_random_uuid(),
  previous_logo_scale numeric(3,2),
  next_logo_scale numeric(3,2) not null,
  changed_at timestamptz not null default timezone('utc', now())
);

alter table public.site_brand_settings enable row level security;
alter table public.site_brand_settings_audit enable row level security;

revoke all on table public.site_brand_settings from anon, authenticated, public;
revoke all on table public.site_brand_settings_audit from anon, authenticated, public;
grant select on table public.site_brand_settings to anon, authenticated;
grant all on table public.site_brand_settings, public.site_brand_settings_audit to service_role;

drop policy if exists "public can read brand settings" on public.site_brand_settings;
create policy "public can read brand settings"
  on public.site_brand_settings
  for select
  to anon, authenticated
  using (id = true);

-- The audit table intentionally has no public policies.
create or replace function public.audit_site_brand_settings_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.site_brand_settings_audit (previous_logo_scale, next_logo_scale)
  values (
    case when tg_op = 'INSERT' then null else old.logo_scale end,
    new.logo_scale
  );
  return new;
end;
$$;

drop trigger if exists site_brand_settings_updated_at on public.site_brand_settings;
create trigger site_brand_settings_updated_at
  before update on public.site_brand_settings
  for each row execute function public.set_updated_at();

drop trigger if exists audit_site_brand_settings on public.site_brand_settings;
create trigger audit_site_brand_settings
  after insert or update on public.site_brand_settings
  for each row execute function public.audit_site_brand_settings_change();

insert into public.site_brand_settings (id, logo_scale)
values (true, 1.20)
on conflict (id) do nothing;

-- Defense in depth for the initial profiles policy. RLS constrains rows, not
-- columns, so an unrestricted UPDATE policy would otherwise let a learner set
-- their own role to admin. Only editable profile fields are now granted.
drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their safe profile fields"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke update on table public.profiles from anon, authenticated, public;
grant update (display_name, avatar_url) on table public.profiles to authenticated;

create or replace function public.prevent_self_profile_role_change()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() = old.id and new.role is distinct from old.role then
    raise exception 'A profile cannot change its own role';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_self_profile_role_change on public.profiles;
create trigger prevent_self_profile_role_change
  before update on public.profiles
  for each row execute function public.prevent_self_profile_role_change();
