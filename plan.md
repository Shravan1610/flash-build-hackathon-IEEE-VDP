# IEEE CS Event Poster Extraction Platform

## Overview
This project is a web-based event information system for the IEEE Computer Society Student Chapter at SRM IST Vadapalani. The platform accepts unstructured visual event posters and converts them into structured, searchable event records.

The MVP is designed for a hackathon build and prioritizes:
- fast poster ingestion
- high-confidence metadata extraction
- admin review before publication
- clean public discovery for students and faculty

## Problem
IEEE chapter event information is currently distributed through posters, PDFs, and image files. That forces manual tracking of event names, dates, venues, and categories. Manual entry is slow, inconsistent, and prone to mistakes.

The system should automate extraction and make the data searchable in a centralized web portal.

## MVP Goals
- Upload posters in `.jpeg`, `.png`, and `.pdf`
- Extract `event name`, `date`, `time`, and `venue`
- Classify events into:
  - Membership Drive
  - Seminar
  - Workshop
  - Hackathon
  - Coding Challenge
- Store structured event data with the original poster
- Let admins review extracted results before publishing
- Provide a public event portal with search and filters

## Selected MVP Decisions
- Stack: `Next.js + Supabase`
- Auth model: `admin-only uploads`
- Visibility: `public event portal`
- Publish flow: `admin review first`
- Extraction approach: `hybrid OCR + LLM`
- OCR model: `gemini-3.1-flash-lite-preview` via the Gemini multimodal API
- UI component system: `shadcn/ui`
- shadcn preset: `b5dLKpCS8`

## Core User Flows
### 1. Admin poster ingestion
1. Admin uploads a poster file.
2. The system stores the original file in Supabase Storage.
3. OCR extracts raw text from the file.
4. An LLM parses the OCR output into normalized metadata.
5. The system classifies the event category.
6. The extracted event is saved as `review_required` or `draft`.
7. Admin reviews, edits if needed, and publishes the event.

### 2. Public event discovery
1. A visitor opens the public portal.
2. The system lists published events.
3. The visitor filters by date range, category, or keyword.
4. The visitor opens an event detail page to view the poster and metadata.

## Functional Scope
### Data ingestion and extraction
- Support uploads for `.jpeg`, `.png`, `.pdf`
- Convert posters into machine-readable text using OCR
- Extract:
  - title
  - date
  - time
  - venue
- Preserve the original poster file and its storage reference

### Classification and storage
- Classify each event into one of the supported categories
- Store extracted text, normalized fields, poster link, and status in a relational database
- Keep failed or low-confidence extractions in review state instead of auto-publishing

### Public presentation
- Event listing page for published events
- Event detail page with poster and structured metadata
- Search and filter by:
  - date or date range
  - category
  - event name keyword

## Non-Functional Goals
- Extraction precision should be high enough to avoid schedule conflicts
- Responsive UI for desktop and mobile
- Graceful handling for blurry or low-quality posters
- Scalable storage and database design for growing event volume

## Feature-Based Codebase Structure
The project should follow a feature-first architecture. Business logic stays inside feature modules, while cross-cutting utilities live in shared locations.

```text
.
├── plan.md
├── public/
│   └── posters/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── events/
│   │   │   │   └── [slug]/
│   │   │   └── search/
│   │   └── admin/
│   │       ├── events/
│   │       └── uploads/
│   ├── components/
│   │   ├── layout/
│   │   ├── shared/
│   │   └── ui/
│   ├── config/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   ├── server/
│   │   │   └── types/
│   │   ├── event-catalog/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   ├── server/
│   │   │   └── types/
│   │   ├── event-detail/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   ├── server/
│   │   │   └── types/
│   │   ├── event-review/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   ├── server/
│   │   │   └── types/
│   │   ├── poster-ingestion/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   ├── server/
│   │   │   └── types/
│   │   └── search-filter/
│   │       ├── components/
│   │       ├── lib/
│   │       ├── server/
│   │       └── types/
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   ├── supabase/
│   │   ├── utils/
│   │   └── validations/
│   ├── styles/
│   └── types/
├── supabase/
│   ├── migrations/
│   └── seed/
└── tests/
    ├── e2e/
    ├── integration/
    └── unit/
```

## Folder Responsibilities
### `src/app`
Owns route definitions, layouts, and page-level composition for the Next.js App Router.

### `src/features`
Owns feature-specific business logic and UI. Each feature should keep:
- `components` for feature UI
- `lib` for feature helpers and client-side logic
- `server` for server actions, queries, and data orchestration
- `types` for feature-local types and contracts

### `src/components`
Owns reusable UI that is not tied to a single feature.

### `src/lib`
Owns shared infrastructure such as Supabase clients, validators, shared helpers, and common API wrappers.

### `supabase`
Owns schema migrations, seeds, and database setup assets.

### `tests`
Owns unit, integration, and end-to-end coverage.

## Initial Database Model
### `events`
- `id`
- `title`
- `description_raw_text`
- `event_date`
- `start_time`
- `end_time` nullable
- `venue`
- `category`
- `status`
- `poster_storage_path`
- `poster_public_url`
- `source_file_type`
- `ocr_text`
- `extraction_confidence`
- `created_at`
- `updated_at`
- `published_at`

## Event Status Lifecycle
- `draft`
- `review_required`
- `published`
- `rejected`

## Extraction Pipeline
1. Receive upload
2. Store original file
3. Convert PDF to processable image pages if needed
4. Run OCR
5. Run LLM-based metadata parsing and classification
6. Validate and normalize extracted fields
7. Save event for admin review
8. Publish after approval

## Validation Rules For MVP
- `title`, `event_date`, `venue`, and `category` should be required before publication
- unclear extraction should remain in review state
- duplicate warnings should be raised when title, date, and venue strongly overlap

## Suggested Build Order
1. Set up Next.js app and Supabase project connection
2. Create database schema and storage buckets
3. Build poster upload and extraction workflow
4. Build admin review dashboard
5. Build public event list and event detail pages
6. Add search and filter support
7. Add test coverage for ingestion, review, and discovery

## Notes
- `Membership Drive` refers to student chapter membership or recruitment campaigns.
- The MVP is intentionally review-first to preserve data quality.
- If extraction latency becomes an issue, background jobs can be introduced later.
- Keep the Gemini OCR model ID environment-driven so the team can move between preview and stable releases without touching feature code.
- Initialize shadcn with `--preset b5dLKpCS8` and keep all generated or custom UI aligned to that preset's tokens, primitives, and component composition.
