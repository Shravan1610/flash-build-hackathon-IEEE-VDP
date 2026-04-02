# Feature Module Conventions

This codebase uses a feature-first structure.

## Rule
If code only serves one business capability, keep it inside that feature folder instead of pushing it into shared directories too early.

## Feature layout
Each feature can use:
- `components/` for feature-specific UI
- `lib/` for helpers, formatters, and client-side logic
- `server/` for data fetching, server actions, and orchestration
- `types/` for feature-local contracts

## Current features
- `auth` for admin authentication and authorization
- `poster-ingestion` for upload, OCR trigger, and extraction workflow
- `event-review` for admin review and publication flow
- `event-catalog` for public event listing
- `event-detail` for event page rendering
- `search-filter` for keyword, category, and date-based filtering

## Shared code
Only move code into `src/components` or `src/lib` when it is reused by multiple features or is genuinely infrastructural.
