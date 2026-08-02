import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  Heart,
  Image,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { MediaUploader } from '../components/MediaUploader';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useCouple();
  const [formState, setFormState] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold mb-2">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Universe Settings</span>
        </div>
        <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-slate-800">
          Settings & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize couple names, relationship dates, background photo, and title settings.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="glass-card p-6 sm:p-8 rounded-3xl border border-rose-200/80 shadow-md space-y-6">
        
        <h3 className="font-serif font-bold text-xl text-slate-800 border-b border-rose-100 pb-3 flex items-center space-x-2">
          <Heart className="w-5 h-5 text-rose-500" />
          <span>Couple Identity & Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Partner 1 Name</label>
            <input
              type="text"
              required
              value={formState.partner1_name}
              onChange={(e) => setFormState({ ...formState, partner1_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Partner 2 Name</label>
            <input
              type="text"
              required
              value={formState.partner2_name}
              onChange={(e) => setFormState({ ...formState, partner2_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none"
            />
          </div>
        </div>

        {/* Avatars & Card Background Cover Photo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Partner 1 Avatar</label>
            <MediaUploader
              bucket="photos"
              label="Upload Partner 1 Avatar"
              accept="image/*"
              onUploadSuccess={(url) => setFormState({ ...formState, partner1_avatar: url })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Partner 2 Avatar</label>
            <MediaUploader
              bucket="photos"
              label="Upload Partner 2 Avatar"
              accept="image/*"
              onUploadSuccess={(url) => setFormState({ ...formState, partner2_avatar: url })}
            />
          </div>
        </div>

        {/* Polaroid Showcase Background / Cover Photo CRUD */}
        <div className="space-y-3 pt-4 border-t border-rose-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Image className="w-4 h-4 text-rose-500" />
              <span>Foto Background / Sampul Belakang Card Polaroid</span>
            </label>
            {formState.cover_photo && (
              <button
                type="button"
                onClick={() => setFormState({ ...formState, cover_photo: '' })}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline transition-colors"
              >
                Hapus Foto Background
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Foto ini akan ditampilkan sebagai latar belakang/background di dalam card polaroid di halaman utama (Landing).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div className="sm:col-span-2 space-y-3">
              <MediaUploader
                bucket="photos"
                label="Unggah Foto Background Belakang"
                accept="image/*"
                onUploadSuccess={(url) => setFormState({ ...formState, cover_photo: url })}
              />
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Atau Masukkan URL Gambar:</span>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formState.cover_photo || ''}
                  onChange={(e) => setFormState({ ...formState, cover_photo: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-rose-200 text-xs outline-none bg-white"
                />
              </div>
            </div>

            {/* Preview Box */}
            <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Preview Background</span>
              {formState.cover_photo ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-sm border border-rose-200 group">
                  <img
                    src={formState.cover_photo}
                    alt="Background Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, cover_photo: '' })}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-rose-700"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 rounded-xl border-2 border-dashed border-rose-200 flex flex-col items-center justify-center text-rose-300 p-2">
                  <Image className="w-8 h-8 mb-1" />
                  <span className="text-[10px] text-slate-400">Belum ada foto background</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Relationship Date & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship Start Date</label>
            <input
              type="date"
              required
              value={formState.relationship_start_date}
              onChange={(e) => setFormState({ ...formState, relationship_start_date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Animated Floating Particles</label>
            <select
              value={formState.particle_type}
              onChange={(e) => setFormState({ ...formState, particle_type: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none bg-white"
            >
              <option value="hearts">💖 Floating Hearts</option>
              <option value="sakura">🌸 Sakura Petals</option>
              <option value="stars">✨ Glowing Stars</option>
              <option value="sparkles">💫 Sparkles</option>
              <option value="bubbles">🫧 Romantic Bubbles</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Title</label>
          <input
            type="text"
            value={formState.hero_title}
            onChange={(e) => setFormState({ ...formState, hero_title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Hero Subtitle</label>
          <textarea
            rows={2}
            value={formState.hero_subtitle}
            onChange={(e) => setFormState({ ...formState, hero_subtitle: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-rose-100">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Settings updated successfully!</span>
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-200 hover:scale-105 transition-all flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

    </div>
  );
};
