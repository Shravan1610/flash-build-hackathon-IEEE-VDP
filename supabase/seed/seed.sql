delete from public.events
where slug in (
  'ai-bootcamp-2026',
  'chapter-membership-open-house',
  'ieee-code-rush'
);

insert into public.events (
  slug,
  title,
  description_raw_text,
  event_date,
  start_time,
  end_time,
  venue,
  category,
  status,
  poster_storage_path,
  poster_public_url,
  source_file_type,
  ocr_text,
  extraction_confidence,
  published_at
)
values
  (
    'ai-bootcamp-2026',
    'AI Bootcamp 2026',
    'An intensive primer on practical AI automation workflows for student builders.',
    '2026-04-14',
    '10:00',
    '13:00',
    'Tech Park Seminar Hall',
    'Workshop',
    'published',
    'seed/ai-bootcamp-2026.jpg',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    'AI Bootcamp 2026 poster transcript',
    0.94,
    timezone('utc', now())
  ),
  (
    'chapter-membership-open-house',
    'Chapter Membership Open House',
    'A recruitment and orientation session for new IEEE CS chapter members.',
    '2026-04-19',
    '14:00',
    '16:30',
    'Innovation Lab',
    'Membership Drive',
    'published',
    'seed/chapter-membership-open-house.jpg',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    'Membership drive poster transcript',
    0.9,
    timezone('utc', now())
  ),
  (
    'ieee-code-rush',
    'IEEE Code Rush',
    'A timed coding challenge with campus-wide participation and judging rounds.',
    '2026-04-28',
    '09:30',
    '17:00',
    'Block C Computing Center',
    'Coding Challenge',
    'review_required',
    'seed/ieee-code-rush.jpg',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
    'image/jpeg',
    'Code Rush poster transcript',
    0.72,
    null
  );
