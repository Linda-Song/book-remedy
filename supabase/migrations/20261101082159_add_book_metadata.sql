-- Book metadata used for filtering, ranking and display
alter table books
  add column maturity text not null default 'adult'
    check (maturity in ('all_ages', 'teen', 'adult')),
  add column ratings_count int not null default 0,
  add column avg_rating real,
  add column blurb text;

-- Request context stored with each prescription
alter table prescriptions
  add column attempt int,
  add column strategy text,
  add column source text check (source in ('ai', 'fallback'));