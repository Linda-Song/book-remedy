-- 1. books --
create table books (
  isbn13 text primary key,
  title text not null,
  author text not null, 
  publisher text,
  cover_color text,
  cover_url text,
  genres text[] not null default '{}',
  about text,
  published_year int,
  pages int,
  language text default 'English',
  active boolean default true,
  created_at timestamptz default now()
);

-- 2. book_moods --
create table book_moods (
  isbn13 text references books(isbn13) on delete cascade,
  mood_key text not null,
  score real check (score >= 0 and score <= 1),
  primary key (isbn13, mood_key)
);

-- 3. prescriptions --
create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  guest_id uuid,
  mood_key text not null,
  genre_key text,
  free_text text,
  isbn13 text references books(isbn13), 
  reason text,
  dosage text,
  feedback text check (feedback in ('yes', 'no')),
  status text default 'To read' check (status in ('To read', 'Reading', 'Finished', 'Not for me')),
  started_date date,
  finished_date date,
  created_at timestamptz default now()
);

-- 4. reviews --
create table reviews (
  prescription_id uuid primary key references prescriptions(id) on delete cascade,
  rating smallint check (rating between 1 and 5),
  share_line text check (char_length(share_line) <= 80),
  quote_page int,
  quote_text text,
  body text check (char_length(body) <= 500),
  is_public boolean default false,
  updated_at timestamptz default now()
);

-- 5. daily_usage --
create table daily_usage (
  owner_key text not null,
  day date not null default current_date,
  used int not null default 0,
  primary key (owner_key, day)
);