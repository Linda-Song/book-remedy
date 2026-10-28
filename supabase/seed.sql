-- ================================
-- books
-- ================================
insert into books (isbn13, title, author, publisher, cover_color, genres, about, published_year, pages, language) values
('9780000000001', 'The Midnight Library', 'Matt Haig', 'Canongate', '#16332E', ARRAY['Fiction'],
  'Nora Seed finds herself in a library between life and death, where every book is a different version of her life. She gets to try them one by one and see what she really wants.',
  2020, 304, 'English'),

('9780000000002', 'Salt & Marigold', 'Priya Nair', 'Harrow House', '#8FCBB8', ARRAY['Fiction'],
  'Two sisters reopen their late grandmother''s spice shop in a rainy coastal town and slowly rediscover each other, one recipe at a time.',
  2021, 288, 'English'),

('9780000000003', 'The Lantern Keeper', 'Ines Calder', 'Driftwood Press', '#F6E39A', ARRAY['Fantasy'],
  'A young lighthouse keeper discovers her lantern can open doors to other worlds, and must choose which one to call home.',
  2019, 336, 'English'),

('9780000000004', 'A Year of Small Mercies', 'Tomas Reed', 'Willow & Finch', '#F2B0A4', ARRAY['Memoir'],
  'A gentle memoir following one ordinary year, where the author learns to notice the small kindnesses that carried him through.',
  2018, 256, 'English'),

('9780000000005', 'The Quiet Orchard', 'Elena Marsh', 'Canongate', '#C3E978', ARRAY['Fiction'],
  'A clumsy city girl inherits a failing orchard and a town full of opinionated neighbors who won''t leave her alone.',
  2022, 312, 'English'),

('9780000000006', 'Every Window Lit', 'Owen Hart', 'Harrow House', '#16332E', ARRAY['Fiction'],
  'A quiet novel following one night in an apartment building, moving window to window through the lives of strangers.',
  2020, 224, 'English'),

('9780000000007', 'The Course of Tides', 'Marisol Vega', 'Driftwood Press', '#8FB1DE', ARRAY['Fiction'],
  'A marine biologist returns to her hometown after a long absence and must confront the family she left behind.',
  2021, 298, 'English'),

('9780000000008', 'Small Hours', 'Daniel Foss', 'Willow & Finch', '#F6D56B', ARRAY['Fiction', 'Memoir'],
  'A collection of linked stories about people awake at 3am — insomniacs, night-shift workers, new parents — and what connects them.',
  2023, 240, 'English'),

('9780000000009', 'The Mapmaker''s Daughter', 'Celia Wren', 'Canongate', '#F2B0A4', ARRAY['Fantasy'],
  'In a world where maps can change the land they describe, a young cartographer must redraw her kingdom before it disappears.',
  2022, 352, 'English'),

('9780000000010', 'Everything We Didn''t Say', 'Priya Nair', 'Harrow House', '#8FCBB8', ARRAY['Fiction', 'Romance'],
  'Two former best friends reunite at a wedding and spend one long night finally saying what they never could.',
  2020, 276, 'English');

-- ================================
-- book_moods
-- ================================
insert into book_moods (isbn13, mood_key, score) values
-- The Midnight Library
('9780000000001', 'comfort', 0.9),
('9780000000001', 'think', 0.8),

-- Salt & Marigold
('9780000000002', 'calm', 0.9),
('9780000000002', 'comfort', 0.6),

-- The Lantern Keeper
('9780000000003', 'excited', 0.9),
('9780000000003', 'thrill', 0.7),

-- A Year of Small Mercies
('9780000000004', 'comfort', 0.95),
('9780000000004', 'think', 0.6),

-- The Quiet Orchard
('9780000000005', 'laugh', 0.9),
('9780000000005', 'comfort', 0.5),

-- Every Window Lit
('9780000000006', 'think', 0.9),
('9780000000006', 'calm', 0.5),

-- The Course of Tides
('9780000000007', 'think', 0.8),
('9780000000007', 'comfort', 0.7),

-- Small Hours
('9780000000008', 'think', 0.7),
('9780000000008', 'calm', 0.6),

-- The Mapmaker's Daughter
('9780000000009', 'excited', 0.8),
('9780000000009', 'thrill', 0.6),

-- Everything We Didn't Say
('9780000000010', 'comfort', 0.8),
('9780000000010', 'romance', 0.9);