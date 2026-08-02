export interface LoveLetter {
  id: string;
  title: string;
  content: string;
  sender: string;
  receiver: string;
  date?: string;
  seal_color?: 'rose' | 'pink' | 'purple' | 'gold' | 'red';
  created_at?: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  role?: 'partner1' | 'partner2';
  bio?: string;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  photo_url?: string;
  video_url?: string;
  location?: string;
  category?: 'first_date' | 'travel' | 'anniversary' | 'celebration' | 'daily';
  song_id?: string;
  created_at?: string;
}

export interface Note {
  id: string;
  sender: string;
  receiver: string;
  message: string;
  attachment_url?: string;
  is_pinned?: boolean;
  theme?: 'rose' | 'blush' | 'lavender' | 'mint' | 'gold';
  memory_id?: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: 'joy' | 'love' | 'cozy' | 'missing' | 'adventure' | 'grateful';
  created_at: string;
  photo_url?: string;
  video_url?: string;
  author?: string;
  memory_id?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
  music_url: string;
  duration?: string;
  dedication?: string;
  memory_id?: string;
  created_at?: string;
}

export interface FavoriteItem {
  id: string;
  category: 'songs' | 'movies' | 'foods' | 'places' | 'dreams' | 'goals';
  title: string;
  description: string;
  image_url?: string;
  rating?: number;
  memory_id?: string;
  created_at?: string;
}

export interface Milestone {
  id: string;
  targetDays: number;
  label: string;
  description?: string;
  is_custom?: boolean;
}

export interface CoupleSettings {
  id?: string;
  partner1_name: string;
  partner2_name: string;
  partner1_avatar: string;
  partner2_avatar: string;
  cover_photo?: string;
  relationship_start_date: string;
  hero_title: string;
  hero_subtitle: string;
  bg_music_url: string;
  particle_type: 'hearts' | 'sakura' | 'stars' | 'sparkles' | 'bubbles';
}

export type ParticleType = 'hearts' | 'sakura' | 'stars' | 'sparkles' | 'bubbles';
