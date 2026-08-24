# Trussline administration security

## Current release

The first private control room uses a deployment-managed administrator password. The password is held only in Vercel's encrypted environment settings under `TRUSSLINE_ADMIN_PASSWORD`; it must never be committed, placed in Supabase data, or sent through chat.

This release provides:

- An HTTP-only, secure, `SameSite=Strict` administrator session cookie with an eight-hour maximum lifetime.
- Timing-safe password comparison and same-origin checks for every administrative mutation.
- Generic sign-in errors, password length limits, `no-store` responses, private-area security headers, and a short-burst sign-in throttle.
- Keyboard-accessible show/hide password control, Caps Lock feedback, password-manager-compatible fields, and mobile-safe layout.
- A reset guide that generates a strong password locally in the browser and explains the owner-controlled Vercel reset and redeploy process.
- A separate, responsive administration footer rather than the public marketing footer.

The in-process throttle is an additional safeguard, not a substitute for Vercel WAF or a durable rate-limit service. Enable a project-level rate rule before broadening administrator access.

## Password reset today

1. Generate or choose a unique password of at least 14 characters and save it in an approved password manager.
2. Update `TRUSSLINE_ADMIN_PASSWORD` in Vercel Project Settings → Environment Variables.
3. Redeploy production.
4. Sign in with the new password. The new deployment invalidates sessions signed with the previous password.

## Required path for passwordless access, reset email, and MFA

One-time codes, magic links, self-service password reset, and MFA must use a named Supabase Auth administrator—not the shared deployment password. Do not enable a cosmetic OTP button before the following are complete:

1. Create a verified Supabase Auth administrator and mark it with immutable `app_metadata.trussline_role = "admin"`.
2. Use Supabase Auth email/password or passwordless email with `shouldCreateUser: false`; configure only exact production callback URLs and custom SMTP.
3. Require TOTP MFA and AAL2 before reading or updating the control room.
4. Change `site_brand_settings` updates to run under that verified user session. Record actor ID, authentication method, and AAL in the audit table.
5. Remove the service-role update path from ordinary administrator requests and retire the shared deployment password after cutover.

`profiles.role` and `user_metadata` must never grant administrative access. Authorization must rely on validated Supabase Auth claims stored in `app_metadata` and checked server-side.

## Verification checklist

- A non-authenticated request cannot load or update the control room.
- A cross-site request cannot create or clear an administrator session.
- Failed sign-ins are throttled without revealing whether a password is valid.
- Password reset instructions never reveal a current secret.
- Footer, password visibility, Caps Lock feedback, reset guidance, error states, and keyboard focus all work at 320px width.
