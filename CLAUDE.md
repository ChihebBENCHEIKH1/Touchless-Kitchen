# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Touchless Kitchen is a hands-free cooking assistant web app. Users navigate recipe steps using gestures (via webcam) instead of touching their device. The app displays recipe instructions step-by-step with a webcam preview for gesture detection.

## Commands

All commands run from the `frontend/` directory:

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build`
- **Lint:** `pnpm lint`
- **Add shadcn component:** `pnpm dlx shadcn@latest add <component>`

## Architecture

- **Framework:** Next.js 16 (App Router) with React 19, TypeScript, Tailwind CSS v4
- **UI library:** shadcn/ui (new-york style) with Radix primitives, Lucide icons
- **Package manager:** pnpm

### Key Layout

The app is a single-page dashboard (`app/page.tsx` → `RecipeDashboard`):

- **RecipeDashboard** — main orchestrator managing sidebar, current step, and navigation state
- **SavedRecipesSidebar** — collapsible recipe list (responsive: sheet on mobile, fixed on desktop)
- **StepsList** — vertical step navigator shown on md+ screens
- **InstructionCard** — displays current step details, duration, tips, and prev/next navigation
- **WebcamPreview** — camera feed for gesture recognition (top-right corner)
- **GestureHints** — shows available gesture controls to the user

Recipe data is currently hardcoded in `recipe-dashboard.tsx`. No backend or API integration yet.

## Conventions

- Path aliases: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`
- shadcn components live in `components/ui/` — don't manually edit these
- Custom app components live in `components/` (top level)
