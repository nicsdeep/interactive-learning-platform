-- Preserve the administrator's own research brief and the selection context
-- for a linked design reference. Third-party source content remains link-only:
-- no scraping, copied artwork, or provider-derived metadata is stored here.

alter table public.design_references
  add column if not exists search_query text,
  add column if not exists design_brief text,
  add column if not exists target_surface text,
  add column if not exists selection_method text not null default 'manual_link',
  add column if not exists assistant_metadata jsonb not null default '{}'::jsonb;

alter table public.design_references
  drop constraint if exists design_references_target_surface_check,
  add constraint design_references_target_surface_check
    check (target_surface is null or target_surface in ('home', 'dashboard', 'mobile', 'admin', 'component', 'other')),
  drop constraint if exists design_references_selection_method_check,
  add constraint design_references_selection_method_check
    check (selection_method in ('manual_link', 'provider_oauth', 'owned_upload')),
  drop constraint if exists design_references_assistant_metadata_check,
  add constraint design_references_assistant_metadata_check
    check (jsonb_typeof(assistant_metadata) = 'object'),
  drop constraint if exists design_references_search_query_length_check,
  add constraint design_references_search_query_length_check
    check (search_query is null or char_length(search_query) <= 240),
  drop constraint if exists design_references_design_brief_length_check,
  add constraint design_references_design_brief_length_check
    check (design_brief is null or char_length(design_brief) <= 1200);

create index if not exists design_references_target_surface_idx
  on public.design_references (target_surface, updated_at desc);
