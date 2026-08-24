import { DEFAULT_LOGO_SCALE, normalizeLogoScale } from "./brand-logo-scale";

export {
  DEFAULT_LOGO_SCALE,
  MIN_LOGO_SCALE,
  MAX_LOGO_SCALE,
  normalizeLogoScale,
  getBrandLogoCssVariables,
} from "./brand-logo-scale";
export type { BrandLogoCssVariables } from "./brand-logo-scale";

export type SiteBrandSettings = {
  logoScale: number;
  source: "default" | "database";
};

function publicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Supabase now issues publishable keys for browser-facing access. Keep the
  // older anonymous-key name as a compatibility fallback for existing setups.
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return url && anonKey ? { url, anonKey } : undefined;
}

function serviceSupabase() {
  const publicConfig = publicSupabase();
  // The primary name is intentionally explicit. The second name is a
  // server-only Vercel compatibility alias for the existing encrypted
  // project setting, so it is never bundled into the browser or source.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    || process.env.vercel_admin_settings_live?.trim();
  return publicConfig && serviceKey ? { ...publicConfig, serviceKey } : undefined;
}

export function isSiteBrandPersistenceConfigured() {
  return Boolean(serviceSupabase());
}

export async function getSiteBrandSettings(): Promise<SiteBrandSettings> {
  const config = publicSupabase();
  if (!config) return { logoScale: DEFAULT_LOGO_SCALE, source: "default" };

  try {
    const response = await fetch(
      `${config.url}/rest/v1/site_brand_settings?select=logo_scale&id=eq.true&limit=1`,
      {
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
        },
        cache: "no-store",
      },
    );
    if (!response.ok) return { logoScale: DEFAULT_LOGO_SCALE, source: "default" };

    const data = await response.json() as Array<{ logo_scale?: number }>;
    const scale = normalizeLogoScale(data[0]?.logo_scale);
    return scale ? { logoScale: scale, source: "database" } : { logoScale: DEFAULT_LOGO_SCALE, source: "default" };
  } catch {
    return { logoScale: DEFAULT_LOGO_SCALE, source: "default" };
  }
}

export async function updateSiteBrandSettings(logoScale: number) {
  const config = serviceSupabase();
  if (!config) return { ok: false as const, reason: "not_configured" as const };

  const response = await fetch(`${config.url}/rest/v1/site_brand_settings?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ id: true, logo_scale: logoScale }),
    cache: "no-store",
  });

  if (!response.ok) return { ok: false as const, reason: "write_failed" as const };
  const data = await response.json() as Array<{ logo_scale?: number }>;
  const persistedScale = normalizeLogoScale(data[0]?.logo_scale);
  return persistedScale
    ? { ok: true as const, settings: { logoScale: persistedScale, source: "database" as const } }
    : { ok: false as const, reason: "write_failed" as const };
}
