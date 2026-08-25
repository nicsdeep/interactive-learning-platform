# Trussline administration workspace

The administration workspace is a protected operating layer for Trussline Interactive Learning. It is deliberately separate from the learner profile and curriculum models.

## What it manages

- An owner profile, including a private avatar upload.
- Named administrative members with clear roles and activation states.
- Draft pages, revisions, and typed responsive sections.
- Curated design references with provenance links to Pinterest, Behance, Dribbble, Awwwards, and other approved sources.
- Rule-based studio guidance for responsive layout, content quality, accessibility, design consistency, and publishing readiness.
- A private audit record for user, content, design, and identity actions.

## Access doctrine

`LazimaIwork.AI` is the initial visible owner handle. It identifies the account before a verified sign-in flow; it is never a credential.

```text
Username / handle selected
→ verified passwordless email link, OTP, passkey, or approved password method
→ authenticated Supabase user
→ active named member + role check on the server
→ authorised workspace action
```

The current protected password/email setup remains a temporary bootstrap route until the named owner has completed verified Supabase enrolment. It must not be widened into a shared multi-user access method.

## Roles

- `owner` — manages all administration, including people and publishing.
- `administrator` — manages people, content, design, and publishing.
- `editor` — manages draft content and design references; cannot publish or manage people.
- `analyst` — reviews guidance and activity without editing content.
- `viewer` — view-only role for future named access.

The founding owner cannot be deactivated or demoted through ordinary people-management controls. There must always be an active owner before any handover process is added.

## CMS doctrine

Pages use revisions and a limited set of typed section blocks: hero, proof strip, region selector, feature list, editorial panel, media story, quote, stat grid, FAQ, CTA, and footer. Arbitrary HTML, scripts, and copied third-party markup are intentionally excluded. This protects responsive rendering, accessibility, and the public site.

Only published pages, revisions, and sections can be exposed to the public renderer. Drafts, activity records, people, recommendations, private media, invitations, and source notes remain server-only.

## Design references

The first release is a curated design library, not a scraper. A reference stores its original HTTPS URL, provider, purpose, tags, notes, review state, and (where appropriate) a user-owned or licensed upload. It never imports third-party account credentials, cookies, page markup, or artwork by default.

Any future Pinterest connection must use the provider's approved OAuth flow, minimal read-only scopes, encrypted server-side tokens, consent, revocation, and audit logging. Behance and similar services start with canonical links unless an official supported API integration is approved.

## AI doctrine

The initial studio guidance is deterministic and honest: it identifies missing page structure, draft-review needs, design-reference gaps, and mobile-first publishing checks. An AI provider may later add schema-validated proposals, but must:

- receive only the minimum approved content metadata, never learner data by default;
- return a structured suggestion with a rationale;
- require a human to accept, edit, or dismiss it;
- never publish, overwrite, or change permissions on its own;
- record provider/model/version metadata and the accepted decision in the audit log.

## Responsive rule

The control room is itself mobile-first. Desktop uses a calm left navigation rail; phones use a narrow left drawer with icon-and-label rows. Content becomes stacked editable cards, never clipped tables or horizontal dashboards.
