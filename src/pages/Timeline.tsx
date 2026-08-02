import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar, MapPin, Trash2, Pencil, Sparkles, Filter, X, Music, Heart, MessageCircle, Camera, Globe, Star } from 'lucide-react';
import { Memory, Song } from '../types';
import { dataService } from '../services/dataService';
import { MediaUploader } from '../components/MediaUploader';

export const Timeline: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<'first_date' | 'travel' | 'anniversary' | 'celebration' | 'daily'>('travel');
  const [photoUrl, setPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [songId, setSongId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedMemories, fetchedSongs] = await Promise.all([
        dataService.getMemories(),
        dataService.getSongs()
      ]);
      setMemories(fetchedMemories);
      setSongs(fetchedSongs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingMemory(null);
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setCategory('travel');
    setPhotoUrl('');
    setVideoUrl('');
    setSongId('');
    setIsModalOpen(true);
  };

  const openEditModal = (memory: Memory) => {
    setEditingMemory(memory);
    setTitle(memory.title);
    setDescription(memory.description || '');
    setDate(memory.date || new Date().toISOString().split('T')[0]);
    setLocation(memory.location || '');
    setCategory(memory.category || 'travel');
    setPhotoUrl(memory.photo_url || '');
    setVideoUrl(memory.video_url || '');
    setSongId(memory.song_id || '');
    setIsModalOpen(true);
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    if (editingMemory) {
      await dataService.updateMemory({
        ...editingMemory,
        title,
        description,
        date,
        location,
        category,
        photo_url: photoUrl || undefined,
        video_url: videoUrl || undefined,
        song_id: songId || undefined
      });
    } else {
      await dataService.addMemory({
        title,
        description,
        date,
        location,
        category,
        photo_url: photoUrl || undefined,
        video_url: videoUrl || undefined,
        song_id: songId || undefined
      });
    }

    setIsModalOpen(false);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await dataService.deleteMemory(id);
    await loadData();
  };

  const filteredMemories = memories.filter((m) => {
    if (filterCategory === 'all') return true;
    return m.category === filterCategory;
  });

  const categories = [
    { id: 'all', label: 'All Memories' },
    { id: 'first_date', label: 'First Dates' },
    { id: 'travel', label: 'Trips & Travel' },
    { id: 'anniversary', label: 'Anniversaries' },
    { id: 'celebration', label: 'Celebrations' },
    { id: 'daily', label: 'Daily Life' }
  ];

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'first_date':
        return <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />;
      case 'travel':
        return <Camera className="w-4 h-4 text-pink-500" />;
      case 'anniversary':
        return <Sparkles className="w-4 h-4 text-pink-500" />;
      case 'celebration':
        return <Star className="w-4 h-4 text-pink-500 fill-pink-500" />;
      case 'daily':
        return <MessageCircle className="w-4 h-4 text-pink-500" />;
      default:
        return <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#FFE4E9] text-[#DB2777] text-xs font-sans font-bold mb-2 border border-[#FDE2E8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Couple Journal</span>
          </div>
          <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#4A3B3E]">
            Our Love Timeline
          </h1>
          <p className="text-xs sm:text-sm text-[#8C7A7D] mt-1 font-sans">
            Every step, smile, and sunset we have shared along the way.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#DB2777] text-white font-sans font-bold text-xs uppercase tracking-widest shadow-lg shadow-pink-200 hover:scale-105 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Memory</span>
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-[#DB2777] shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-sans font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterCategory === cat.id
                ? 'bg-[#DB2777] text-white shadow-md shadow-pink-200/50'
                : 'bg-white text-[#4A3B3E] border border-[#FDE2E8] hover:bg-[#FFE4E9]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Alternating Zig-Zag Timeline */}
      <div className="relative my-10">
        
        {/* Center Pink Line (Desktop) / Left Pink Line (Mobile) */}
        <div className="absolute top-0 bottom-0 left-6 md:left-1/2 -translate-x-1/2 w-0.5 bg-linear-to-b from-pink-300 via-rose-400 to-pink-300 shadow-xs" />

        <div className="space-y-12">
          <AnimatePresence>
            {filteredMemories.map((m, index) => {
              const linkedSong = songs.find((s) => s.id === m.song_id);
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="relative flex flex-col md:flex-row items-center"
                >
                  {/* Center Node Icon */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-6 z-10 w-9 h-9 rounded-full bg-white border-2 border-pink-500 shadow-md flex items-center justify-center ring-4 ring-pink-100">
                    {getCategoryIcon(m.category)}
                  </div>

                  {/* Card Container with Alternating Sides */}
                  <div
                    className={`w-full md:w-1/2 pl-16 md:pl-0 ${
                      isEven
                        ? 'md:pr-12 md:mr-auto text-left'
                        : 'md:pl-12 md:ml-auto text-left'
                    }`}
                  >
                    <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-pink-100 hover:border-pink-300 shadow-lg shadow-pink-100/40 transition-all duration-300 space-y-4 group">
                      
                      {/* Top Header: Tag + Date */}
                      <div className="flex items-center justify-between border-b border-pink-50 pb-3">
                        <span className="px-3 py-1 rounded-full bg-pink-100/80 text-pink-600 text-[11px] font-sans font-bold uppercase tracking-wider">
                          {m.category ? m.category.replace('_', ' ') : 'MEMORY'}
                        </span>
                        
                        <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-sans font-medium">
                          <Calendar className="w-3.5 h-3.5 text-pink-400" />
                          <span>{m.date}</span>
                        </div>
                      </div>

                      {/* Photo / Video Preview */}
                      {m.photo_url && (
                        <div className="rounded-2xl overflow-hidden max-h-72 bg-pink-50 border border-pink-100/60 shadow-xs">
                          <img
                            src={m.photo_url}
                            alt={m.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                        </div>
                      )}

                      {m.video_url && (
                        <div className="rounded-2xl overflow-hidden max-h-72 bg-black border border-pink-100 shadow-xs">
                          <video src={m.video_url} controls className="w-full max-h-72" />
                        </div>
                      )}

                      {/* Title & Location */}
                      <div>
                        <h3 className="font-serif font-bold text-xl text-[#4A3B3E] group-hover:text-pink-600 transition-colors">
                          {m.title}
                        </h3>
                        {m.location && (
                          <div className="flex items-center space-x-1.5 text-xs text-pink-500 mt-1 font-sans font-semibold">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{m.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {m.description && (
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                          {m.description}
                        </p>
                      )}

                      {/* Linked Song Badge */}
                      {linkedSong && (
                        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-pink-50/80 border border-pink-200 text-pink-700 text-xs font-semibold">
                          <Music className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                          <span>Theme: {linkedSong.title} — {linkedSong.artist}</span>
                        </div>
                      )}

                      {/* Card Footer: Decorative Quote + Actions */}
                      <div className="pt-3 border-t border-pink-100 flex items-center justify-between text-xs">
                        <span className="font-serif italic text-pink-400 text-xs sm:text-sm">
                          Forever & Always
                        </span>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openEditModal(m)}
                            className="flex items-center space-x-1 text-pink-500 hover:text-pink-700 font-sans font-bold transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="flex items-center space-x-1 text-rose-400 hover:text-rose-600 font-sans font-bold transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredMemories.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-3xl p-8 border border-pink-100 max-w-md mx-auto shadow-xs">
              <Sparkles className="w-10 h-10 text-pink-400 mx-auto mb-3" />
              <h4 className="font-serif font-bold text-lg text-slate-800">No Memories in this category yet</h4>
              <p className="text-xs text-slate-500 mt-1">Click "Add New Memory" above to write our story!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Memory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-20 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-white max-w-xl w-full rounded-3xl shadow-2xl border border-pink-200 flex flex-col max-h-[90vh] my-auto overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-pink-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-800 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <span>{editingMemory ? 'Edit Memory' : 'Add New Memory'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-pink-50 text-slate-400 hover:text-pink-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="flex flex-col overflow-hidden flex-1">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Memory Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stargazing at Whispering Cliffs"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-400 text-xs sm:text-sm outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-400 text-xs sm:text-sm outline-none bg-white"
                    >
                      <option value="first_date">First Date</option>
                      <option value="travel">Travel & Trip</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="celebration">Celebration</option>
                      <option value="daily">Daily Life</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Rosewood Botanical Garden"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                {songs.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Link Special Song</label>
                    <select
                      value={songId}
                      onChange={(e) => setSongId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-400 text-xs sm:text-sm outline-none bg-white"
                    >
                      <option value="">None (No song linked)</option>
                      {songs.map((s) => (
                        <option key={s.id} value={s.id}>
                          🎵 {s.title} — {s.artist}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Memory Story</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how magical this moment was..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                {/* Photo Upload */}
                <MediaUploader
                  bucket="photos"
                  label="Attach Memory Photo (Photos Bucket)"
                  accept="image/*"
                  onUploadSuccess={(url) => setPhotoUrl(url)}
                />

                {photoUrl && (
                  <div className="rounded-xl overflow-hidden h-32 border border-pink-100">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 border-t border-pink-100 flex items-center justify-end space-x-3 shrink-0 bg-white/95 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  {editingMemory ? 'Update Memory' : 'Save Memory'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

