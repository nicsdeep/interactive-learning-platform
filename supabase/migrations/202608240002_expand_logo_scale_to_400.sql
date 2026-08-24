-- Allow the protected brand setting to express a 400% logo presence.
-- The application contains the SVG within fixed header/footer display rails,
-- so this wider range cannot change page geometry.
alter table public.site_brand_settings
  drop constraint if exists site_brand_settings_logo_scale_check;

alter table public.site_brand_settings
  add constraint site_brand_settings_logo_scale_check
  check (logo_scale >= 0.80 and logo_scale <= 4.00);
