# interactive-learning-platform

Curriculum intelligence, interactive learning, and adaptive mastery—starting with Kenya CBE/CBC, and designed for USA standards and England's National Curriculum as independent curriculum layers on one shared learning engine.

## Foundation

- `app/` — learner experience and application shell
- `lib/domain/` — curriculum and mastery language shared by the product
- `lib/supabase/` — browser client factory
- `supabase/migrations/` — versioned database changes; apply before shipping database-dependent features

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase URL and publishable key.
3. Install dependencies with `pnpm install`.
4. Run `pnpm dev`.
