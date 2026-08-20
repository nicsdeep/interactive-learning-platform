# Public Home Page Strategy

## Purpose

The public home page is the front door before any learner enters a curriculum portal. It must explain the product in one glance, establish trust with families and schools, and route a learner into the correct curriculum context without pretending that all curriculum layers are equally complete.

## Recommended concept: The Learning Map

**Positioning:** _One learning engine. A path that knows where you are going._

The hero is an interactive learning map, not a generic SaaS hero or a dashboard screenshot. It visually connects a learner, a curriculum layer, a learning objective, an active experience, evidence, mastery, and a next step.

### Hero

- Headline: **Learning that knows where you are going.**
- Supporting copy: curriculum-aware interactive learning that adapts to evidence—not completion.
- Primary CTA: **Start with Kenya CBE**
- Secondary CTA: **See how it works**
- Hero visual: a live “route card” for a Kenya Grade 4 fraction mission, with small connected markers for objective, activity, evidence, and next step.
- The visual should feel like a map or learning route in motion—not a row of marketing cards.

### Curriculum entry strip

Three routes use the shared engine:

1. **Kenya CBE/CBC** — available now; entry to the working learner studio.
2. **USA standards-based learning** — planned standards layer; show the architecture, not a false live portal.
3. **England National Curriculum** — planned curriculum layer; show the architecture, not a false live portal.

### Narrative sections

1. **What changes for a learner** — interactive mission, meaningful evidence, mastered next step.
2. **A curriculum is more than a subject list** — strands, outcomes, competencies, and skills become the map.
3. **One learner, a continuous journey** — future transition and cross-curriculum mapping promise.
4. **For learners, families, and schools** — three concise entry points, not three generic feature grids.
5. **Final Kenya-first call to action.**

## Design language

- Use the blue/navy reference system in `UX_DIRECTION.md`.
- Public home has more breathing room and narrative illustration than the app shell.
- The public home should be visually related to the Studio but must not reuse the portal sidebar.
- It must be responsive and performance-conscious. No auto-playing video, stock classroom collage, or decorative animation without a learning purpose.

## Implementation order

1. Build this public home at `/`.
2. Move the current Adaptive Learning Studio to `/learn`.
3. Route Kenya CTA to `/learn` with Kenya context.
4. Add real portal routing only after authentication and curriculum availability are implemented.
