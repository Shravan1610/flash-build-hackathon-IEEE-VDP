# UI System

## Standard
- Library: `shadcn/ui`
- Preset: `b5dLKpCS8`

## Rule
Every UI component in this project should be adapted to the `b5dLKpCS8` preset baseline.

That means:
- use the preset-generated component files as the source of truth
- keep semantic color, radius, spacing, and typography tokens aligned with the preset
- compose screens from shadcn primitives instead of recreating equivalent custom components
- update existing components to match the preset if they drift from the initialized baseline

## Initialization command

```bash
npx shadcn@latest init --preset b5dLKpCS8
```

## Scope
This applies to:
- shared UI in `src/components/ui`
- layout building blocks in `src/components/layout`
- feature-facing UI in `src/features/*/components`

## Requested component rule
- Any reusable component you ask for should be added under `src/components/ui`.
- It should be installed or adapted against the `b5dLKpCS8` preset, not against shadcn defaults or another registry baseline.

## Practical guidance
- Use shadcn components first, custom wrappers second, custom primitives last.
- Prefer component variants and composition over one-off styling overrides.
- When the real app scaffold is added, create and commit `components.json` immediately so the preset choice is explicit in version control.
