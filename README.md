# Touchless Kitchen

A hands-free cooking assistant that lets users navigate recipe steps entirely through webcam gestures, keeping their hands free while cooking.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui (new-york style), Framer Motion
- MediaPipe `@mediapipe/tasks-vision` — `GestureRecognizer` model
- Prisma ORM (SQLite in dev, Postgres in prod via `DATABASE_URL`)
- pnpm

## Getting Started

All commands run from `frontend/`:

```bash
pnpm dev       # development server
pnpm build     # production build
pnpm lint      # ESLint
```

## Architecture

### Gesture Detection Pipeline

The entire gesture layer lives in `hooks/use-gesture-control.ts`. On mount it:

1. Dynamically imports `@mediapipe/tasks-vision` and initializes a `FilesetResolver` pointing to the CDN-hosted WASM bundle.
2. Creates a `GestureRecognizer` with GPU delegate and `runningMode: "VIDEO"`.
3. Acquires a webcam stream (`getUserMedia`) and binds it to a hidden `<video>` element via a forwarded ref.
4. Runs a `setTimeout`-based detection loop at ~20 fps (50 ms interval). The next tick is only scheduled after the current frame completes, preventing main-thread backlog.

The hook exposes three gesture events (`swipe-left`, `swipe-right`, `thumbs-up-hold`) and a `status` value (`idle | loading | ready | error`).

**Swipe detection** uses a 3-frame smoothed velocity window over the index finger tip (landmark 8). When the average per-frame delta exceeds a velocity threshold, the gesture fires and the buffer clears. The video element is CSS-mirrored (`scale-x-[-1]`), so delta is computed as `prev - current` to keep positive = visual right.

**Thumbs-up** uses the model's built-in `Thumb_Up` classifier (confidence > 0.6). It must be held for 2 seconds continuously before firing, preventing accidental triggers.

**Auto-recovery**: consecutive inference errors (5+) or a 4-second heartbeat timeout trigger `reinitDetector()`, which recreates the `GestureRecognizer` from the cached WASM instance without re-downloading assets. A `reiniting` guard prevents concurrent reinit calls.

### Component Hierarchy

```
app/page.tsx
  RecipeDashboard          — state: currentStep, direction, sidebar, heart burst
    SavedRecipesSidebar    — recipe list; sheet on mobile, fixed panel on desktop
    WebcamPreview          — <video> with forwarded ref; centered in header
    GestureHints           — static legend of available gestures
    StepsList              — vertical step index (md+ only)
    InstructionCard        — step content with Framer Motion slide animation
    HeartBurst             — fixed overlay triggered by thumbs-up save
```

### Data Flow

Gestures fire `onGesture` callbacks in `RecipeDashboard.handleGesture`:
- `swipe-right` / `swipe-left` advance or retreat `currentStep` and set `direction` for the slide animation.
- `thumbs-up-hold` triggers the `HeartBurst` animation and calls the `saveRecipe` Server Action to persist the recipe to the database.

Recipe data is currently hardcoded in `recipe-dashboard.tsx`. The database layer (`prisma/schema.prisma`) has a `SavedRecipe` model ready for real recipe persistence.

### Database

Prisma schema at `frontend/prisma/schema.prisma`. Run migrations with:

```bash
pnpm dlx prisma migrate dev
pnpm dlx prisma studio
```
