import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Plus, Sparkles, Trash2, Edit2, Heart, Film, Utensils, MapPin, Compass, Target, Music, X } from 'lucide-react';
import { FavoriteItem, Memory } from '../types';
import { dataService } from '../services/dataService';
import { MediaUploader } from '../components/MediaUploader';

export const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FavoriteItem | null>(null);

  // Form state
  const [category, setCategory] = useState<FavoriteItem['category']>('movies');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState('');
  const [memoryId, setMemoryId] = useState('');

  const loadData = async () => {
    const [fetchedFavorites, fetchedMemories] = await Promise.all([
      dataService.getFavorites(),
      dataService.getMemories()
    ]);
    setFavorites(fetchedFavorites);
    setMemories(fetchedMemories);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setCategory('movies');
    setTitle('');
    setDescription('');
    setRating(5);
    setImageUrl('');
    setMemoryId('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: FavoriteItem) => {
    setEditingItem(item);
    setCategory(item.category);
    setTitle(item.title);
    setDescription(item.description);
    setRating(item.rating || 5);
    setImageUrl(item.image_url || '');
    setMemoryId(item.memory_id || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (editingItem) {
      await dataService.updateFavorite({
        ...editingItem,
        category,
        title,
        description,
        rating,
        image_url: imageUrl || undefined,
        memory_id: memoryId || undefined
      });
    } else {
      await dataService.addFavorite({
        category,
        title,
        description,
        rating,
        image_url: imageUrl || undefined,
        memory_id: memoryId || undefined
      });
    }

    setIsModalOpen(false);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await dataService.deleteFavorite(id);
    await loadData();
  };

  const categories = [
    { id: 'all', label: 'All Favorites', icon: Star },
    { id: 'movies', label: 'Movies & Shows', icon: Film },
    { id: 'songs', label: 'Songs', icon: Music },
    { id: 'foods', label: 'Foods & Dishes', icon: Utensils },
    { id: 'places', label: 'Places & Spot', icon: MapPin },
    { id: 'dreams', label: 'Dreams & Bucketlist', icon: Compass },
    { id: 'goals', label: 'Future Goals', icon: Target }
  ];

  const filtered = favorites.filter((f) => {
    if (activeCategory === 'all') return true;
    return f.category === activeCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold mb-2">
            <Star className="w-3.5 h-3.5" />
            <span>Shared Favorites</span>
          </div>
          <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-slate-800">
            Favorites Collection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Our favorite movies, comfort foods, dream vacations, and shared goals.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-200 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Favorite Item</span>
        </button>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                  : 'bg-white/80 text-slate-600 border border-rose-100 hover:bg-rose-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((item) => {
            const linkedMemory = memories.find((m) => m.id === item.memory_id);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-3xl p-5 border border-rose-100/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {item.image_url && (
                  <div className="rounded-2xl overflow-hidden h-44 bg-slate-100">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-100 text-pink-600 text-[10px] font-bold uppercase">
                      {item.category}
                    </span>

                    <div className="flex items-center space-x-1 text-amber-400">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-slate-800">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                  {linkedMemory && (
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 text-[11px] font-semibold mt-2">
                      <Sparkles className="w-3 h-3 text-rose-500" />
                      <span>Linked Memory: {linkedMemory.title}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center space-x-1 text-rose-500">
                    <Heart className="w-3 h-3 fill-current" />
                    <span>Loved by Both</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 glass-card rounded-3xl p-8 border border-rose-100 max-w-xl mx-auto">
          <Sparkles className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h4 className="font-serif font-bold text-lg text-slate-800">No favorites in this category</h4>
          <p className="text-xs text-slate-500 mt-1">Add your favorite movies, foods, and goals together!</p>
        </div>
      )}

      {/* Add / Edit Favorite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-20 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-rose-200 flex flex-col max-h-[90vh] my-auto overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-800 flex items-center space-x-2">
                <Star className="w-5 h-5 text-rose-500" />
                <span>{editingItem ? 'Edit Favorite Item' : 'Add Favorite Item'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col overflow-hidden flex-1">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none bg-white"
                    >
                      <option value="movies">Movies & Shows</option>
                      <option value="songs">Songs</option>
                      <option value="foods">Foods & Dishes</option>
                      <option value="places">Places & Spots</option>
                      <option value="dreams">Dreams & Bucketlist</option>
                      <option value="goals">Future Goals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rating (Stars)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none bg-white"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. About Time (Movie)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Why We Love It</label>
                  <textarea
                    rows={3}
                    placeholder="Tell why this holds a special place in our hearts..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                {memories.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Link to Memory (Optional)</label>
                    <select
                      value={memoryId}
                      onChange={(e) => setMemoryId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none bg-white"
                    >
                      <option value="">None (General Favorite)</option>
                      {memories.map((m) => (
                        <option key={m.id} value={m.id}>
                          ✨ {m.title} ({m.date})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <MediaUploader
                  bucket="photos"
                  label="Optional Cover Photo (Photos Bucket)"
                  accept="image/*"
                  onUploadSuccess={(url) => setImageUrl(url)}
                />

                {imageUrl && (
                  <div className="rounded-xl overflow-hidden h-32 border border-rose-100">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 border-t border-rose-100 flex items-center justify-end space-x-3 shrink-0 bg-white/95 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 hover:scale-105 transition-all"
                >
                  {editingItem ? 'Update Favorite' : 'Save Favorite'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
