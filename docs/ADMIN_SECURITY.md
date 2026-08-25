# Trussline administration security

## Current access model

The private Trussline control room supports two deliberate sign-in choices:

- A deployment-managed administrator password held only in encrypted project settings.
- A username convenience path on a personal browser that has previously completed a successful password sign-in.

No password, authentication token, or service credential belongs in source
control, browser storage, or chat. The trusted-device marker is HttpOnly and
signed server-side; page JavaScript cannot read or forge it. A future member
invitation may retain the recipient's verified email only as private,
service-only operational data in Supabase; it is never public,
browser-readable, or used as a credential.

## Protections in this release

- HTTP-only, secure administrator session cookie with `SameSite=Strict` and an eight-hour maximum lifetime.
- An HttpOnly, server-signed trusted-device marker with `SameSite=Strict` and a 30-day maximum lifetime. It is issued only after a successful password sign-in and is bound to the current owner handle.
- Timing-safe password comparison, generic sign-in failures, password-length limits, and same-origin checks on every administrative mutation.
- Private-area security headers, `no-store` responses, and short-burst throttles for password and username sign-in attempts.
- Keyboard-accessible show/hide password control, Caps Lock feedback that appears only when the browser reports it is on, password-manager-compatible fields, and mobile-safe layouts.

The in-process throttle is an additional safeguard, not a substitute for a durable project-level rate limit or WAF when access is broadened beyond one administrator.

## Required private configuration

Configure these values only in the project’s encrypted environment settings:

1. `TRUSSLINE_ADMIN_PASSWORD` — a unique administrator passphrase.
2. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — project connection values used by the administrative workspace. A legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` remains supported when needed.

## Password rotation

1. Generate or choose a unique password of at least 14 characters and save it in an approved password manager.
2. Replace `TRUSSLINE_ADMIN_PASSWORD` in encrypted project settings.
3. Publish the updated production build.
4. Sign in with the replacement password. Existing sessions become invalid because their signatures are tied to the previous password.

## Named administration foundation

The workspace now has a separate `admin_members` model, with owner,
administrator, editor, analyst, and viewer roles; active/inactive/suspended
states; private avatar storage; invitations; page revisions; design references;
recommendations; and an audit trail. It is intentionally not based on the
learner-facing `profiles.role` field.

`LazimaIwork.AI` is the bootstrap owner handle. On a browser that previously
completed password sign-in, entering the handle can issue a fresh session
without asking for the password again. On a new browser or device, the same
handle cannot create a session: the password must be used once to establish a
private trusted-device marker. A future passkey rollout can replace this
bootstrap method with named-member authentication.

The legacy shared password session remains a narrow bootstrap fallback until
the verified named-owner rollout is complete. It must not be repurposed as a
multi-user login system.

## Future hardening

Before broadening administration beyond the bootstrap owner, require every
workspace route to use a named Supabase Auth session and immutable
server-checked membership on every request; retire shared-password fallback;
add durable distributed rate limiting and TOTP/passkey MFA for privileged
actions; and revoke active sessions immediately on deactivation. User-editable
profile fields must never grant administration access.

## Verification checklist

- An unauthenticated request cannot load or update the control room.
- A cross-site request cannot create or clear an administrator session.
- Failed password and username entries are throttled without confirming whether an account is valid.
- The username convenience endpoint requires both the exact owner handle and a valid private trusted-device marker.
- The portrait, username/password controls, footer, and focus states remain usable at 320px width.
