import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, Sparkles, Trash2, Edit2, Search, Calendar, Heart, X } from 'lucide-react';
import { JournalEntry, Memory } from '../types';
import { dataService } from '../services/dataService';
import { useCouple } from '../context/CoupleContext';
import { MediaUploader } from '../components/MediaUploader';

export const Journal: React.FC = () => {
  const { settings } = useCouple();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('love');
  const [author, setAuthor] = useState(settings.partner1_name);
  const [photoUrl, setPhotoUrl] = useState('');
  const [memoryId, setMemoryId] = useState('');

  const loadData = async () => {
    const [fetchedEntries, fetchedMemories] = await Promise.all([
      dataService.getJournalEntries(),
      dataService.getMemories()
    ]);
    setEntries(fetchedEntries);
    setMemories(fetchedMemories);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingEntry(null);
    setTitle('');
    setContent('');
    setMood('love');
    setAuthor(settings.partner1_name);
    setPhotoUrl('');
    setMemoryId('');
    setIsModalOpen(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setAuthor(entry.author || settings.partner1_name);
    setPhotoUrl(entry.photo_url || '');
    setMemoryId(entry.memory_id || '');
    setIsModalOpen(true);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    if (editingEntry) {
      await dataService.updateJournalEntry({
        ...editingEntry,
        title,
        content,
        mood,
        author,
        photo_url: photoUrl || undefined,
        memory_id: memoryId || undefined
      });
    } else {
      await dataService.addJournalEntry({
        title,
        content,
        mood,
        author,
        photo_url: photoUrl || undefined,
        memory_id: memoryId || undefined
      });
    }

    setIsModalOpen(false);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await dataService.deleteJournalEntry(id);
    await loadData();
  };

  const moodBadges = {
    joy: { label: '😊 Pure Joy', bg: 'bg-amber-100 text-amber-800' },
    love: { label: '🥰 So in Love', bg: 'bg-rose-100 text-rose-800' },
    cozy: { label: '☕ Cozy Day', bg: 'bg-pink-100 text-pink-800' },
    missing: { label: '🥺 Missing You', bg: 'bg-purple-100 text-purple-800' },
    adventure: { label: '✈️ Adventure Time', bg: 'bg-sky-100 text-sky-800' },
    grateful: { label: '🙏 Truly Grateful', bg: 'bg-emerald-100 text-emerald-800' }
  };

  const filteredEntries = entries.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Shared Couple Diary</span>
          </div>
          <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-slate-800">
            Daily Journal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Writing down our everyday thoughts, mood reflections, and small wins.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-200 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search journal entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-rose-200 bg-white/80 focus:border-rose-400 text-xs outline-none shadow-xs"
        />
      </div>

      {/* Entries List */}
      <div className="space-y-6">
        <AnimatePresence>
          {filteredEntries.map((entry) => {
            const moodInfo = moodBadges[entry.mood || 'love'];
            const linkedMemory = memories.find((m) => m.id === entry.memory_id);

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-rose-200/80 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${moodInfo.bg}`}>
                      {moodInfo.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 flex items-center space-x-1">
                      <Heart className="w-3 h-3 text-rose-500 fill-current" />
                      <span>Written by {entry.author || 'Couple'}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                    </span>
                    <button
                      onClick={() => openEditModal(entry)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Edit Entry"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-xl text-slate-800">{entry.title}</h3>
                
                {linkedMemory && (
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-pink-50 text-pink-700 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Memory Link: {linkedMemory.title} ({linkedMemory.date})</span>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {entry.content}
                </p>

                {entry.photo_url && (
                  <div className="rounded-2xl overflow-hidden max-h-96 bg-slate-100 border border-rose-100/80 shadow-xs">
                    <img
                      src={entry.photo_url}
                      alt={entry.title}
                      className="w-full h-full object-cover rounded-2xl hover:scale-[1.01] transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredEntries.length === 0 && (
          <div className="text-center py-16 glass-card rounded-3xl p-8 border border-rose-100 max-w-xl mx-auto">
            <Sparkles className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h4 className="font-serif font-bold text-lg text-slate-800">Belum ada catatan jurnal</h4>
            <p className="text-xs text-slate-500 mt-1">Mulai tulis momen dan perasaan harianmu bersama!</p>
          </div>
        )}
      </div>

      {/* New / Edit Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-20 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-rose-200 flex flex-col max-h-[90vh] my-auto overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-800 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-rose-500" />
                <span>{editingEntry ? 'Edit Catatan Jurnal' : 'Tulis Catatan Jurnal'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="flex flex-col overflow-hidden flex-1">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Jurnal</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sore Hujan & Pancakes Matcha"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Penulis</label>
                    <select
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none bg-white"
                    >
                      <option value={settings.partner1_name}>{settings.partner1_name}</option>
                      <option value={settings.partner2_name}>{settings.partner2_name}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mood Hari Ini</label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none bg-white"
                    >
                      <option value="joy">😊 Pure Joy</option>
                      <option value="love">🥰 So in Love</option>
                      <option value="cozy">☕ Cozy Day</option>
                      <option value="missing">🥺 Missing You</option>
                      <option value="adventure">✈️ Adventure Time</option>
                      <option value="grateful">🙏 Truly Grateful</option>
                    </select>
                  </div>
                </div>

                {memories.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hubungkan Kenangan (Opsional)</label>
                    <select
                      value={memoryId}
                      onChange={(e) => setMemoryId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none bg-white"
                    >
                      <option value="">Tidak ada (Jurnal Umum)</option>
                      {memories.map((m) => (
                        <option key={m.id} value={m.id}>
                          ✨ {m.title} ({m.date})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cerita & Refleksi</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tuliskan momen atau perasaanmu hari ini..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                <MediaUploader
                  bucket="photos"
                  label="Foto Jurnal (Opsional)"
                  accept="image/*"
                  value={photoUrl}
                  onChange={setPhotoUrl}
                />
              </div>

              <div className="p-4 sm:p-5 border-t border-rose-100 flex items-center justify-end space-x-3 shrink-0 bg-white/95 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!title || !content}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 hover:scale-105 transition-all"
                >
                  {editingEntry ? 'Perbarui Jurnal' : 'Simpan Jurnal'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
