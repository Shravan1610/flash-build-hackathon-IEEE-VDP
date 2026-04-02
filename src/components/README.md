# UI Component Conventions

This project uses `shadcn/ui` for shared UI components.

## Required preset
Initialize shadcn with this exact preset:

```bash
npx shadcn@latest init --preset b5dLKpCS8
```

Do not switch presets unless the project explicitly decides to migrate the entire UI system.

## Component policy
- Prefer `shadcn/ui` components before custom markup.
- All new shared UI should be added under `src/components/ui` after the app is scaffolded.
- Feature-specific compositions can live inside `src/features/*/components`, but they should still be built from shadcn primitives and variants.
- Reuse the preset's semantic tokens and variants instead of hand-rolled styling.
- Do not mix multiple visual systems or ad hoc Tailwind patterns on top of shadcn components.
- When the user asks for a component, add it from the `b5dLKpCS8` shadcn preset flow and place the generated shared component source in `src/components/ui`.

## Expected setup order
1. Scaffold the Next.js app.
2. Initialize shadcn with `--preset b5dLKpCS8`.
3. Commit the generated `components.json`, Tailwind/global CSS token setup, and base components.
4. Add only the components actually needed by each feature.

## Implementation notes
- Shared primitives belong in `src/components/ui`.
- Layout wrappers and reusable shells belong in `src/components/layout`.
- Business-specific compositions belong in the relevant feature module.
- When adapting components, preserve shadcn composition patterns instead of flattening everything into custom `div` trees.
- If a requested component is globally reusable, keep it in `src/components/ui` instead of burying it in a feature folder.
