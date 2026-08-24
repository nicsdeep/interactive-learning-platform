# Trussline administration security

## Current access model

The private Trussline control room supports two deliberate ways to sign in:

- A deployment-managed administrator password held only in encrypted project settings.
- A one-time email link sent only to the single verified administrator email held in encrypted project settings.

No password, email address, authentication token, or service credential belongs in source control, Supabase data, browser storage, or chat.

## Protections in this release

- HTTP-only, secure administrator session cookie with `SameSite=Strict` and an eight-hour maximum lifetime.
- Timing-safe password comparison, generic sign-in failures, password-length limits, and same-origin checks on every administrative mutation.
- Private-area security headers, `no-store` responses, and short-burst throttles for password, email-link, and verification-code attempts.
- An encrypted, callback-only, 15-minute PKCE verifier cookie for email sign-in. The verifier is never readable by page JavaScript.
- Server-side allowlisting: the email-link endpoint never accepts an email address from the browser, and the callback issues an administrator session only after the returned authenticated email exactly matches the protected configured address.
- Single-use email links, a graceful expired-link message, and an optional code entry path when the mail template includes a code.
- Keyboard-accessible show/hide password control, Caps Lock feedback that appears only when the browser reports it is on, password-manager-compatible fields, and mobile-safe layouts.

The in-process throttle is an additional safeguard, not a substitute for a durable project-level rate limit or WAF when access is broadened beyond one administrator.

## Required private configuration

Configure these values only in the project’s encrypted environment settings:

1. `TRUSSLINE_ADMIN_PASSWORD` — a unique administrator passphrase.
2. `TRUSSLINE_ADMIN_OTP_EMAIL` — the single verified inbox permitted to receive email sign-in links.
3. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — the project’s public Supabase connection values. A legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` remains supported when needed.

In Supabase Authentication, set the live site URL and allowlist the exact production callback:

`https://nick-interactive-learning.vercel.app/admin/kinyae/auth/callback`

Keep email confirmation enabled. The verified administrator account is created only when that inbox itself requests and confirms its first secure link; no test email should be sent merely to configure this feature.

## Password rotation

1. Generate or choose a unique password of at least 14 characters and save it in an approved password manager.
2. Replace `TRUSSLINE_ADMIN_PASSWORD` in encrypted project settings.
3. Publish the updated production build.
4. Sign in with the replacement password. Existing sessions become invalid because their signatures are tied to the previous password.

## Future hardening

Before adding more administrators, move authorisation to named Supabase Auth users with immutable server-checked role claims, audit actor IDs and authentication methods, apply a durable distributed rate limiter, and require TOTP MFA for privileged actions. User-editable profile fields must never grant administration access.

## Verification checklist

- An unauthenticated request cannot load or update the control room.
- A cross-site request cannot create or clear an administrator session.
- Failed password and code entries are throttled without confirming whether an account is valid.
- The email-link endpoint has no browser-controlled recipient field.
- An expired or used email link returns the user to a clear recovery message.
- The portrait, password controls, footer, focus states, and recovery paths remain usable at 320px width.
