-- Marks whether the mood or genre was chosen by the AI (not by the reader)
alter table public.prescriptions
  add column if not exists mood_by_ai boolean not null default false,
  add column if not exists genre_by_ai boolean not null default false;
