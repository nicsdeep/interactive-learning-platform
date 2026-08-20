# Product Charter — Interactive Learning Platform

## Non-negotiable vision

Build a curriculum-intelligent, AI-powered interactive learning platform. It must not become a digital textbook, a basic e-learning site, or a generic student chatbot.

The core loop is:

**Curriculum → Learning objective → Interactive experience → Learner behaviour → Assessment → Mastery → AI feedback → Personalized next step**

## Architecture promise

One shared learning engine supports independent curriculum layers:

- **Kenya CBE/CBC** — the first deeply implemented curriculum.
- **USA** — a standards-based framework, with Common Core, NGSS, and state standards accommodated as separate layers.
- **England** — England National Curriculum, distinct from Scotland, Wales, and Northern Ireland.

The system models curriculum frameworks and versions, levels/grades, subjects, strands/sub-strands, learning outcomes, competencies, skills, learning experiences, assessments, evidence, misconceptions, mastery, and recommendations. Curriculum context changes localized experiences, not the learning engine's core contract.

## Product standards

- Teach through Learn, Play, Explore, Solve, Explain, Practice, Master, Challenge, and Create—not read/watch/quiz alone.
- The AI companion is grounded in the learner's current curriculum, outcome, skill evidence, and mastery; it is not a free-floating chatbot.
- Mastery reflects meaningful evidence, including explanations, practice, application, and assessment.
- Learners in the same grade can have different next steps.
- Kenya experiences use authentic local context. USA and England experiences will have their own contextualization.
- The experience must be polished, responsive, accessible, and suitable for an international product.

## Delivery guardrails

1. Make all database changes migration-first and commit them with the application change.
2. Apply least-privilege RLS before enabling real learner data.
3. Verify desktop and mobile layouts before each production deployment.
4. Commit and push cohesive, tested milestones to `main`; Vercel then deploys them automatically.
5. Preserve this charter as the decision reference for future work. A request that conflicts with it requires an explicit product decision, not a silent simplification.

## MVP definition

The first usable release proves one end-to-end Kenya CBE learning loop: learner context, curriculum-aligned outcome, an interactive learning experience, captured evidence, mastery update, grounded companion feedback, and a personalized next activity. It also includes a credible learner dashboard and secure foundations for later parent, teacher, and school views.
