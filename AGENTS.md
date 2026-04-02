# Repository Guidelines

## Agent-Specific Instructions
Follow these three rules for work in this repository:
1. Ask the user questions instead of filling gaps with guesses.
2. Do not assume requirements, tools, or implementation details.
3. Do not start working until the user explicitly asks you to do so.

## Project Structure & Module Organization
This repository is organized around a planned Next.js + Supabase app. The high-level blueprint lives in `plan.md`. Application code belongs under `src/`, using a feature-first structure: `src/features/poster-ingestion`, `src/features/event-review`, `src/features/event-catalog`, and related modules own their own `components`, `lib`, `server`, and `types`. Shared UI belongs in `src/components`, shared infrastructure in `src/lib`, route composition in `src/app`, and database assets in `supabase/migrations` and `supabase/seed`. Tests are grouped by level in `tests/unit`, `tests/integration`, and `tests/e2e`. Static poster assets belong in `public/posters`.

## Build, Test, and Development Commands
Install dependencies with `npm install`.

Use these project commands:

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

Treat `plan.md`, `src/config/ui-system.md`, and feature READMEs as the source of truth when expanding the scaffold.

## Coding Style & Naming Conventions
Use TypeScript for app code and keep modules focused on one business capability. Prefer feature-local code over prematurely shared abstractions. Use 2-space indentation, descriptive camelCase for variables and functions, PascalCase for React components, and kebab-case for file names such as `gemini-ocr.ts`. Shared UI components should be added under `src/components/ui` and aligned with the `shadcn/ui` preset `b5dLKpCS8`.

## Testing Guidelines
Place fast logic tests in `tests/unit`, workflow-level checks in `tests/integration`, and browser flows in `tests/e2e`. Name test files after the target module, for example `poster-ingestion.unit.test.ts`. If you add a testing framework, prefer one command to run the full suite and one command for watch mode.

## Commit & Pull Request Guidelines
No Git history is present in this workspace, so adopt clear, imperative commit messages such as `Add Gemini OCR service scaffold` or `Document shadcn preset rules`. Pull requests should include: a short summary, affected paths, setup or env changes, and screenshots for UI work. Link the relevant issue or task when available.

## Security & Configuration Tips
Never commit secrets. Keep keys such as `GEMINI_API_KEY` in environment files only. Supabase access should be project-scoped, and OCR/model identifiers should remain environment-driven where possible.
