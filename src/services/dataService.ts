import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  Memory,
  Note,
  JournalEntry,
  Song,
  FavoriteItem,
  Milestone,
  CoupleSettings,
  LoveLetter,
} from "../types";

// Default initial settings fallback
const DEFAULT_SETTINGS: CoupleSettings = {
  partner1_name: "Alex",
  partner2_name: "Emma",
  partner1_avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  partner2_avatar:
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
  cover_photo:
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200",
  relationship_start_date: "2023-05-20",
  hero_title: "sabrianisa",
  hero_subtitle:
    "A sweet corner of the cosmos made entirely of our love, quiet laughs, and endless memories.",
  bg_music_url:
    "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
  particle_type: "hearts",
};

// Helper for generating UUIDs compatible with PostgreSQL UUID columns
const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const isValidUUID = (id?: string): boolean => {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
};

const ensureUUID = (id?: string): string => {
  if (id && isValidUUID(id)) return id;
  return generateUUID();
};

const cleanPayload = (obj: Record<string, any>): Record<string, any> => {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  if (clean.id) {
    clean.id = ensureUUID(clean.id);
  }
  return clean;
};

// Pure Supabase Data Service - No Local Cache / No Auto-Insert on Read
export const dataService = {
  // SETTINGS
  async getSettings(): Promise<CoupleSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .limit(1);
        if (error) {
          console.error(
            '[Supabase Error] Gagal membaca tabel "settings":',
            error,
          );
        } else if (data && data.length > 0) {
          const raw = data[0];
          let cover_photo = raw.cover_photo;

          // Extract cover_photo embedded in hero_subtitle if cover_photo column was missing in DB
          let hero_subtitle = raw.hero_subtitle || "";
          if (hero_subtitle.includes("___COVER___:")) {
            const parts = hero_subtitle.split("___COVER___:");
            hero_subtitle = parts[0].trim();
            if (!cover_photo && parts[1]) {
              cover_photo = parts[1].trim();
            }
          }

          // Fallback to localStorage if cover_photo is missing or standard default
          if (!cover_photo && typeof window !== "undefined") {
            const localCover = localStorage.getItem("app_cover_photo");
            if (localCover) {
              cover_photo = localCover;
            }
          }

          const res: CoupleSettings = {
            ...DEFAULT_SETTINGS,
            ...raw,
            hero_subtitle: hero_subtitle || DEFAULT_SETTINGS.hero_subtitle,
            cover_photo: cover_photo || DEFAULT_SETTINGS.cover_photo,
          };

          if (
            !res.hero_title ||
            res.hero_title === "Our Little Universe" ||
            res.hero_title === "Our Universe"
          ) {
            res.hero_title = "sabrianisa";
          }
          return res;
        }
      } catch (err) {
        console.warn("Supabase getSettings error:", err);
      }
    }
    const localCover =
      typeof window !== "undefined"
        ? localStorage.getItem("app_cover_photo")
        : null;
    return localCover
      ? { ...DEFAULT_SETTINGS, cover_photo: localCover }
      : DEFAULT_SETTINGS;
  },

  async updateSettings(settings: CoupleSettings): Promise<CoupleSettings> {
    const payload = { id: "default", ...settings };

    // Always persist cover_photo to localStorage immediately as client backup
    if (settings.cover_photo && typeof window !== "undefined") {
      try {
        localStorage.setItem("app_cover_photo", settings.cover_photo);
      } catch (e) {
        console.warn("Failed to save cover_photo to localStorage:", e);
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Prepare embedded hero_subtitle fallback in case cover_photo column is missing in DB
        const cleanSubtitle = (payload.hero_subtitle || "")
          .split("___COVER___:")[0]
          .trim();
        const subtitleWithCover = payload.cover_photo
          ? `${cleanSubtitle} ___COVER___:${payload.cover_photo}`
          : cleanSubtitle;

        // Try primary upsert with full payload
        const primaryPayload = {
          ...payload,
          hero_subtitle: subtitleWithCover,
        };

        const { error } = await supabase
          .from("settings")
          .upsert([primaryPayload]);
        if (error) {
          console.warn(
            '[Supabase Warn] Primary updateSettings failed, column "cover_photo" might not exist. Retrying fallback:',
            error,
          );

          // Omit cover_photo key so Supabase upsert succeeds on tables without cover_photo column
          const { cover_photo, ...fallbackPayload } = primaryPayload;
          const { error: fallbackError } = await supabase
            .from("settings")
            .upsert([fallbackPayload]);

          if (fallbackError) {
            console.error(
              "[Supabase Error] updateSettings fallback failed:",
              fallbackError,
            );
          } else {
            console.log(
              "[Supabase Success] Settings saved with embedded cover_photo in hero_subtitle!",
            );
          }
        }
      } catch (err) {
        console.warn("Supabase updateSettings failed:", err);
      }
    }
    return payload;
  },

  // MEMORIES
  async getMemories(): Promise<Memory[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("memories")
          .select("*")
          .order("date", { ascending: false });
        if (error) {
          console.error(
            '[Supabase Error] Gagal membaca tabel "memories":',
            error,
          );
          return [];
        } else if (data) {
          return data.map((m) => ({ ...m, id: m.id }));
        }
      } catch (err) {
        console.warn("Supabase getMemories error:", err);
        return [];
      }
    }
    return [];
  },

  async addMemory(memory: Omit<Memory, "id">): Promise<Memory> {
    const newMemory: Memory = { ...memory, id: generateUUID() };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(newMemory);
        const { data, error } = await supabase
          .from("memories")
          .insert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] addMemory failed:", error);
        } else if (data) {
          return data as Memory;
        }
      } catch (err) {
        console.warn("Supabase addMemory failed:", err);
      }
    }
    return newMemory;
  },

  async updateMemory(memory: Memory): Promise<Memory> {
    const cleanMem = { ...memory, id: ensureUUID(memory.id) };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(cleanMem);
        const { data, error } = await supabase
          .from("memories")
          .upsert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] updateMemory failed:", error);
        } else if (data) {
          return data as Memory;
        }
      } catch (err) {
        console.warn("Supabase updateMemory failed:", err);
      }
    }
    return cleanMem;
  },

  async deleteMemory(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("memories").delete().eq("id", id);
        if (error) {
          console.error("[Supabase Error] deleteMemory failed:", error);
        }
      } catch (err) {
        console.warn("Supabase deleteMemory failed:", err);
      }
    }
  },

  // LOVE NOTES
  async getNotes(): Promise<Note[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) {
          console.error('[Supabase Error] Gagal membaca tabel "notes":', error);
          return [];
        } else if (data) {
          return data.map((n) => ({ ...n, id: n.id }));
        }
      } catch (err) {
        console.warn("Supabase getNotes error:", err);
        return [];
      }
    }
    return [];
  },

  async addNote(note: Omit<Note, "id" | "created_at">): Promise<Note> {
    const newNote: Note = {
      ...note,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(newNote);
        const { data, error } = await supabase
          .from("notes")
          .insert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] addNote failed:", error);
        } else if (data) {
          return data as Note;
        }
      } catch (err) {
        console.warn("Supabase addNote failed:", err);
      }
    }
    return newNote;
  },

  async updateNote(note: Note): Promise<Note> {
    const cleanNote = { ...note, id: ensureUUID(note.id) };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(cleanNote);
        const { data, error } = await supabase
          .from("notes")
          .upsert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] updateNote failed:", error);
        } else if (data) {
          return data as Note;
        }
      } catch (err) {
        console.warn("Supabase updateNote failed:", err);
      }
    }
    return cleanNote;
  },

  async togglePinNote(id: string, is_pinned: boolean): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("notes")
          .update({ is_pinned })
          .eq("id", id);
        if (error)
          console.error("[Supabase Error] togglePinNote failed:", error);
      } catch (err) {
        console.warn("Supabase togglePinNote failed:", err);
      }
    }
  },

  async deleteNote(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("notes").delete().eq("id", id);
        if (error) console.error("[Supabase Error] deleteNote failed:", error);
      } catch (err) {
        console.warn("Supabase deleteNote failed:", err);
      }
    }
  },

  // JOURNAL
  async getJournalEntries(): Promise<JournalEntry[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) {
          console.error(
            '[Supabase Error] Gagal membaca tabel "journal_entries":',
            error,
          );
          return [];
        } else if (data) {
          return data.map((j) => ({ ...j, id: j.id }));
        }
      } catch (err) {
        console.warn("Supabase getJournalEntries error:", err);
        return [];
      }
    }
    return [];
  },

  async addJournalEntry(
    entry: Omit<JournalEntry, "id" | "created_at">,
  ): Promise<JournalEntry> {
    const newEntry: JournalEntry = {
      ...entry,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(newEntry);
        const { data, error } = await supabase
          .from("journal_entries")
          .insert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] addJournalEntry failed:", error);
        } else if (data) {
          return data as JournalEntry;
        }
      } catch (err) {
        console.warn("Supabase addJournalEntry failed:", err);
      }
    }
    return newEntry;
  },

  async updateJournalEntry(entry: JournalEntry): Promise<JournalEntry> {
    const cleanEntry = { ...entry, id: ensureUUID(entry.id) };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(cleanEntry);
        const { data, error } = await supabase
          .from("journal_entries")
          .upsert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] updateJournalEntry failed:", error);
        } else if (data) {
          return data as JournalEntry;
        }
      } catch (err) {
        console.warn("Supabase updateJournalEntry failed:", err);
      }
    }
    return cleanEntry;
  },

  async deleteJournalEntry(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("journal_entries")
          .delete()
          .eq("id", id);
        if (error)
          console.error("[Supabase Error] deleteJournalEntry failed:", error);
      } catch (err) {
        console.warn("Supabase deleteJournalEntry failed:", err);
      }
    }
  },

  // MUSIC / SONGS
  async getSongs(): Promise<Song[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("songs")
          .select("*")
          .order("created_at", { ascending: true });
        if (error) {
          console.error('[Supabase Error] Gagal membaca tabel "songs":', error);
          return [];
        } else if (data) {
          return data.map((s) => ({ ...s, id: s.id }));
        }
      } catch (err) {
        console.warn("Supabase getSongs error:", err);
        return [];
      }
    }
    return [];
  },

  async addSong(song: Omit<Song, "id">): Promise<Song> {
    const newSong: Song = {
      ...song,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(newSong);
        const { data, error } = await supabase
          .from("songs")
          .insert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] addSong failed:", error);
        } else if (data) {
          return data as Song;
        }
      } catch (err) {
        console.warn("Supabase addSong failed:", err);
      }
    }
    return newSong;
  },

  async updateSong(song: Song): Promise<Song> {
    const cleanSong = { ...song, id: ensureUUID(song.id) };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(cleanSong);
        const { data, error } = await supabase
          .from("songs")
          .upsert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] updateSong failed:", error);
        } else if (data) {
          return data as Song;
        }
      } catch (err) {
        console.warn("Supabase updateSong failed:", err);
      }
    }
    return cleanSong;
  },

  async deleteSong(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("songs").delete().eq("id", id);
        if (error) console.error("[Supabase Error] deleteSong failed:", error);
      } catch (err) {
        console.warn("Supabase deleteSong failed:", err);
      }
    }
  },

  // FAVORITES
  async getFavorites(): Promise<FavoriteItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("favorites").select("*");
        if (error) {
          console.error(
            '[Supabase Error] Gagal membaca tabel "favorites":',
            error,
          );
          return [];
        } else if (data) {
          return data.map((f) => ({ ...f, id: f.id }));
        }
      } catch (err) {
        console.warn("Supabase getFavorites error:", err);
        return [];
      }
    }
    return [];
  },

  async addFavorite(item: Omit<FavoriteItem, "id">): Promise<FavoriteItem> {
    const newItem: FavoriteItem = {
      ...item,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(newItem);
        const { data, error } = await supabase
          .from("favorites")
          .insert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] addFavorite failed:", error);
        } else if (data) {
          return data as FavoriteItem;
        }
      } catch (err) {
        console.warn("Supabase addFavorite failed:", err);
      }
    }
    return newItem;
  },

  async updateFavorite(item: FavoriteItem): Promise<FavoriteItem> {
    const cleanItem = { ...item, id: ensureUUID(item.id) };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(cleanItem);
        const { data, error } = await supabase
          .from("favorites")
          .upsert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] updateFavorite failed:", error);
        } else if (data) {
          return data as FavoriteItem;
        }
      } catch (err) {
        console.warn("Supabase updateFavorite failed:", err);
      }
    }
    return cleanItem;
  },

  async deleteFavorite(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("id", id);
        if (error)
          console.error("[Supabase Error] deleteFavorite failed:", error);
      } catch (err) {
        console.warn("Supabase deleteFavorite failed:", err);
      }
    }
  },

  // MILESTONES
  async getMilestones(): Promise<Milestone[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("milestones").select("*");
        if (error) {
          console.error(
            '[Supabase Error] Gagal membaca tabel "milestones":',
            error,
          );
          return [];
        } else if (data) {
          return data.map((m) => ({
            id: m.id,
            label: m.label,
            description: m.description,
            targetDays: m.target_days ?? m.targetDays ?? 100,
          }));
        }
      } catch (err) {
        console.warn("Supabase getMilestones error:", err);
        return [];
      }
    }
    return [];
  },

  async addMilestone(ms: Omit<Milestone, "id">): Promise<Milestone> {
    const newMs: Milestone = {
      ...ms,
      id: generateUUID(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(newMs);
        payload.target_days = newMs.targetDays;
        delete payload.targetDays;
        const { data, error } = await supabase
          .from("milestones")
          .insert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] addMilestone failed:", error);
        } else if (data) {
          return {
            id: data.id,
            label: data.label,
            description: data.description,
            targetDays: data.target_days ?? data.targetDays ?? newMs.targetDays,
          };
        }
      } catch (err) {
        console.warn("Supabase addMilestone failed:", err);
      }
    }
    return newMs;
  },

  async updateMilestone(ms: Milestone): Promise<Milestone> {
    const cleanMs = { ...ms, id: ensureUUID(ms.id) };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(cleanMs);
        payload.target_days = cleanMs.targetDays;
        delete payload.targetDays;
        const { data, error } = await supabase
          .from("milestones")
          .upsert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] updateMilestone failed:", error);
        } else if (data) {
          return {
            id: data.id,
            label: data.label,
            description: data.description,
            targetDays:
              data.target_days ?? data.targetDays ?? cleanMs.targetDays,
          };
        }
      } catch (err) {
        console.warn("Supabase updateMilestone failed:", err);
      }
    }
    return cleanMs;
  },

  async deleteMilestone(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("milestones")
          .delete()
          .eq("id", id);
        if (error)
          console.error("[Supabase Error] deleteMilestone failed:", error);
      } catch (err) {
        console.warn("Supabase deleteMilestone failed:", err);
      }
    }
  },

  // LOVE LETTERS CRUD
  async getLetters(): Promise<LoveLetter[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("letters")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) {
          console.error(
            '[Supabase Error] Gagal membaca tabel "letters":',
            error,
          );
          return [];
        } else if (data) {
          return data.map((l) => ({ ...l, id: l.id }));
        }
      } catch (err) {
        console.warn("Supabase getLetters error:", err);
        return [];
      }
    }
    return [];
  },

  async addLetter(
    letter: Omit<LoveLetter, "id" | "created_at">,
  ): Promise<LoveLetter> {
    const newLetter: LoveLetter = {
      ...letter,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(newLetter);
        const { data, error } = await supabase
          .from("letters")
          .insert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] addLetter failed:", error);
        } else if (data) {
          return data as LoveLetter;
        }
      } catch (err) {
        console.warn("Supabase addLetter failed:", err);
      }
    }
    return newLetter;
  },

  async updateLetter(letter: LoveLetter): Promise<LoveLetter> {
    const cleanLetter = { ...letter, id: ensureUUID(letter.id) };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = cleanPayload(cleanLetter);
        const { data, error } = await supabase
          .from("letters")
          .upsert([payload])
          .select()
          .single();
        if (error) {
          console.error("[Supabase Error] updateLetter failed:", error);
        } else if (data) {
          return data as LoveLetter;
        }
      } catch (err) {
        console.warn("Supabase updateLetter failed:", err);
      }
    }
    return cleanLetter;
  },

  async deleteLetter(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("letters").delete().eq("id", id);
        if (error)
          console.error("[Supabase Error] deleteLetter failed:", error);
      } catch (err) {
        console.warn("Supabase deleteLetter failed:", err);
      }
    }
  },

  // FILE UPLOADER (SUPABASE STORAGE DIRECTLY WITH BASE64 FALLBACK)
  async uploadFile(
    file: File,
    bucket: "photos" | "videos" | "music" | "notes-attachments" = "photos",
    onProgress?: (pct: number) => void,
  ): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      if (onProgress) onProgress(20);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      try {
        if (onProgress) onProgress(40);
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) {
          console.warn(
            `Supabase Storage upload warning for bucket ${bucket}:`,
            error.message,
          );
          throw error;
        }

        if (onProgress) onProgress(90);
        const { data: publicData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);
        if (onProgress) onProgress(100);
        return publicData.publicUrl;
      } catch (uploadErr) {
        console.warn("Falling back to Data URL encoding for file upload...");
      }
    }

    // Fallback: Convert file to Base64 Data URL if Supabase Storage is not ready or bucket fails
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },
};
