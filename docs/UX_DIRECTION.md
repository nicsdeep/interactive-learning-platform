# UX Direction — Trussline International

## Brand mark guardrails

Trussline International's mark communicates learning progress, curriculum structure, and connection across education systems. Use a compact horizontal institution-style lockup, never a generic AI sparkle, graduation cap, or abstract fintech symbol. The required caption is **Interactive Learning**. The palette is deep learning navy, international blue, a restrained coral highlight, and a small green mastery accent. Every mark must remain clear at mobile navigation size and on light backgrounds.

## Standing design references

- Public product name: **Trussline International**. Caption: **Interactive Learning**.

- Primary dashboard reference: [Education Platform Dashboard by Fakher Uddin](https://www.behance.net/gallery/251535713/Education-Platform-Dashboard).
- Public-home visual reference: [Modern EdTech Platform UI/UX Case Study by Ubada Forayaje](https://www.behance.net/gallery/253772869/Modern-EdTech-Platform-UIUX-Case-Study). Use its bright product-blue, dark atmospheric hero, approachable learning-product feel, and responsive composition as inspiration—never copied layouts, text, or media.
- Product-specific direction: **Adaptive Learning Studio** — an activity-first learner space, not a generic course dashboard.

## Visual system

- Deep navy navigation: `#071B45`
- Primary learning blue: `#1763F5`
- Soft blue-gray page surface: `#F5F8FE`
- White content surfaces and rounded cards
- Orange `#FF7817` only for small action/status accents
- Green only for positive evidence states

## Interface rules

- Mobile is a first-class acceptance criterion for every change: no horizontal overflow, cropped content, overlapping controls, or unreadably small brand elements. Verify the 360px viewport before each production push.
- Any visual control must update the relevant on-page preview on every input event, before autosave or a manual save. A percentage readout alone is never sufficient. Preview changes must use the same responsive sizing variables as the live product: the mark may grow, but device width, navigation height, and footer geometry must never grow with it.
- Public headers remain sticky while scrolling. On mobile, navigation opens as a left-aligned panel below the header with clear touch targets.
- Public navigation is a learning guide, not a row of dead labels: each top-level item reveals real, clickable destinations on hover, focus, or keyboard activation. Phone navigation uses compact expandable rows inside the left-side drawer.
- Public-facing copy speaks to learners, families, and educators. Do not expose implementation language such as engines, layers, architecture, deployments, or developer settings in public content.
- Avoid repeating the same call to action. The public navigation uses **Read more**, while a launch-update invitation appears only where it genuinely helps someone decide to stay informed.
- Prefer editorial lines, progressive stories, and purposeful interaction over grids of static marketing cards. Animated counters must describe real product scope or a clearly labelled learning model—not invented traction. Motion always has a reduced-motion alternative.
- A moving learning visual must be labelled truthfully: use a real, captioned video when a video asset exists; otherwise call it an interactive visual or learning demonstration, provide a pause control, and never imply that an animation is live AI.
- Responsive from small phones through desktop; no desktop-only dashboard assumptions.
- Use blue for navigation, progress, and primary action; preserve clear contrast and keyboard focus.
- Learner pages are activity-first: active learning canvas, evidence, companion, and next step.
- Teacher, parent, and school interfaces may use data-dense dashboard patterns later; they must not dictate the learner experience.
- Use deliberate motion (150–250ms with reduced-motion support), real copy, clear metadata, and consistent icon weight.
- Do not use purple/blue gradients, glassmorphism, generic marketing filler, or copied third-party layouts.
- Public Home uses a dark navy atmosphere, bright blue action system, small orange learning-status accents, an animated daily challenge timer, and a region selector. Kenya is the active curriculum; future regions must be presented honestly as availability expands.
- The selected case study's **internal white landing page** (not its dark external portfolio framing) is the current Home reference: a light navigation bar, bold blue/red editorial emphasis, a warm human learning-guide image, direct CTAs, and concise proof metrics. Kora uses an original generated guide asset and original copy.
- The public Home must remain internationally framed: it does not name a country-specific curriculum. All unfinished learner-entry routes show an honest Coming Soon state until the full experience is ready.

## Public launch gate

Until a product area is deliberately opened, `/learn` is the holding destination for unfinished public product routes and CTAs. The public Home (`/`) and About (`/about`) pages are deliberate exceptions; the dedicated **Back to home** link always returns to `/`. Static assets and the location API remain available. This prevents unfinished sections from being presented as ready and gives the product owner one clear place to decide what opens next.

## Administration workspace rule

The control room is a product surface, not a desktop-only internal form. Its
desktop navigation is a quiet left rail; its phone navigation is a left-side
drawer that is no wider than the readable content it reveals. Lists become
editable cards on small screens, not compressed tables. Every content action
must be reviewable, and every responsive preview must show a real change before
the user saves or publishes it.

## Source-of-truth relationship

This file governs visual direction. `PRODUCT_CHARTER.md` governs product architecture and learning philosophy. Both must be checked before new UI work.
