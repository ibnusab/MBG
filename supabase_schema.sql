-- SUPABASE POSTGRESQL DATABASE SCHEMA & MIGRATIONS FOR "OUR LITTLE UNIVERSE"
-- Copy and execute this script inside your Supabase Project -> SQL Editor

-- 1. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  partner1_name TEXT DEFAULT 'Alex',
  partner2_name TEXT DEFAULT 'Emma',
  partner1_avatar TEXT,
  partner2_avatar TEXT,
  relationship_start_date DATE DEFAULT '2023-05-20',
  hero_title TEXT DEFAULT 'Our Little Universe',
  hero_subtitle TEXT,
  bg_music_url TEXT,
  particle_type TEXT DEFAULT 'hearts'
);

-- 2. MEMORIES TABLE
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  photo_url TEXT,
  video_url TEXT,
  location TEXT,
  category TEXT DEFAULT 'travel',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NOTES TABLE
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL,
  receiver TEXT NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'rose',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. JOURNAL ENTRIES TABLE
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT DEFAULT 'love',
  author TEXT,
  photo_url TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SONGS TABLE
CREATE TABLE IF NOT EXISTS songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  cover_url TEXT,
  music_url TEXT NOT NULL,
  duration TEXT,
  dedication TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rating INT DEFAULT 5,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MILESTONES TABLE
CREATE TABLE IF NOT EXISTS milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  target_days INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LETTERS TABLE
CREATE TABLE IF NOT EXISTS letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  sender TEXT NOT NULL,
  receiver TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE,
  seal_color TEXT DEFAULT 'rose',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ENABLE ROW LEVEL SECURITY & OPEN ANONYMOUS ACCESS POLICIES
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert settings" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update settings" ON settings FOR UPDATE USING (true);

CREATE POLICY "Allow public select memories" ON memories FOR SELECT USING (true);
CREATE POLICY "Allow public insert memories" ON memories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update memories" ON memories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete memories" ON memories FOR DELETE USING (true);

CREATE POLICY "Allow public select notes" ON notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert notes" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update notes" ON notes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete notes" ON notes FOR DELETE USING (true);

CREATE POLICY "Allow public select journal_entries" ON journal_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert journal_entries" ON journal_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update journal_entries" ON journal_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete journal_entries" ON journal_entries FOR DELETE USING (true);

CREATE POLICY "Allow public select songs" ON songs FOR SELECT USING (true);
CREATE POLICY "Allow public insert songs" ON songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update songs" ON songs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete songs" ON songs FOR DELETE USING (true);

CREATE POLICY "Allow public select favorites" ON favorites FOR SELECT USING (true);
CREATE POLICY "Allow public insert favorites" ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update favorites" ON favorites FOR UPDATE USING (true);
CREATE POLICY "Allow public delete favorites" ON favorites FOR DELETE USING (true);

CREATE POLICY "Allow public select letters" ON letters FOR SELECT USING (true);
CREATE POLICY "Allow public insert letters" ON letters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update letters" ON letters FOR UPDATE USING (true);
CREATE POLICY "Allow public delete letters" ON letters FOR DELETE USING (true);

-- 10. STORAGE BUCKETS & POLICIES SETUP VIA SQL
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('photos', 'photos', true),
  ('videos', 'videos', true),
  ('music', 'music', true),
  ('notes-attachments', 'notes-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public access for reading, uploading, and deleting files in storage
DROP POLICY IF EXISTS "Public Access photos" ON storage.objects;
CREATE POLICY "Public Access photos" ON storage.objects FOR ALL USING (bucket_id = 'photos') WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "Public Access videos" ON storage.objects;
CREATE POLICY "Public Access videos" ON storage.objects FOR ALL USING (bucket_id = 'videos') WITH CHECK (bucket_id = 'videos');

DROP POLICY IF EXISTS "Public Access music" ON storage.objects;
CREATE POLICY "Public Access music" ON storage.objects FOR ALL USING (bucket_id = 'music') WITH CHECK (bucket_id = 'music');

DROP POLICY IF EXISTS "Public Access notes-attachments" ON storage.objects;
CREATE POLICY "Public Access notes-attachments" ON storage.objects FOR ALL USING (bucket_id = 'notes-attachments') WITH CHECK (bucket_id = 'notes-attachments');
