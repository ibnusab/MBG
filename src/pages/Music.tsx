import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Music as MusicIcon,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Heart,
  X
} from 'lucide-react';
import { Song } from '../types';
import { useMusic } from '../context/MusicContext';
import { MediaUploader } from '../components/MediaUploader';

export const MusicPage: React.FC = () => {
  const {
    songs,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    playSong,
    playNext,
    playPrev,
    setVolume,
    seekTo,
    addSong,
    updateSong,
    deleteSong
  } = useMusic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [dedication, setDedication] = useState('');

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const openCreateModal = () => {
    setEditingSong(null);
    setTitle('');
    setArtist('');
    setCoverUrl('');
    setMusicUrl('');
    setDedication('');
    setIsModalOpen(true);
  };

  const openEditModal = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSong(song);
    setTitle(song.title);
    setArtist(song.artist);
    setCoverUrl(song.cover_url || '');
    setMusicUrl(song.music_url || '');
    setDedication(song.dedication || '');
    setIsModalOpen(true);
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicUrl || !title) return;

    if (editingSong) {
      await updateSong({
        ...editingSong,
        title,
        artist: artist || 'Various Artists',
        cover_url: coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=400',
        music_url: musicUrl,
        dedication
      });
    } else {
      await addSong({
        title,
        artist: artist || 'Various Artists',
        cover_url: coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=400',
        music_url: musicUrl,
        dedication
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteSong = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSong(id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold mb-2">
            <MusicIcon className="w-3.5 h-3.5" />
            <span>Romantic Soundtrack</span>
          </div>
          <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-slate-800">
            Music Corner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Our shared soundtrack, slow dance songs, and sweet lullabies.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-200 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Track (MP3)</span>
        </button>
      </div>

      {/* Main Music Player Card */}
      {currentSong ? (
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-rose-200/80 shadow-xl relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Album Art with Vinyl Spinning Effect */}
            <div className="relative group shrink-0 flex items-center justify-center">
              <div
                className={`w-48 h-48 sm:w-60 sm:h-60 rounded-full overflow-hidden shadow-2xl border-4 border-white/90 relative transition-all duration-500 ${
                  isPlaying ? 'animate-[spin_12s_linear_infinite] shadow-rose-300/60 ring-8 ring-rose-200/50' : 'shadow-slate-200'
                }`}
              >
                <img
                  src={
                    currentSong.cover_url ||
                    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=400'
                  }
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
                {/* Vinyl Center Notch */}
                <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-white/90 border-2 border-rose-300 shadow-inner flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                </div>
              </div>

              <div className="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-md text-rose-500 shadow-md z-10">
                <Heart className={`w-4 h-4 ${isPlaying ? 'fill-rose-500 animate-pulse' : ''}`} />
              </div>
            </div>

            {/* Song Details & Controls */}
            <div className="flex-1 w-full space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    Now Playing
                  </span>
                  <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-800 mt-1">
                    {currentSong.title}
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">{currentSong.artist}</p>
                </div>

                {/* Real-Time Equalizer Soundwave Animation */}
                {isPlaying && (
                  <div className="flex items-end space-x-1 h-7 px-3 py-1 rounded-full bg-rose-50 border border-rose-100">
                    <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.6s_infinite_100ms] h-full" />
                    <span className="w-1 bg-pink-500 rounded-full animate-[bounce_0.6s_infinite_300ms] h-3/4" />
                    <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-1/2" />
                    <span className="w-1 bg-pink-600 rounded-full animate-[bounce_0.6s_infinite_400ms] h-5/6" />
                    <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.6s_infinite_150ms] h-2/3" />
                  </div>
                )}
              </div>

              {currentSong.dedication && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3.5 py-2.5 rounded-2xl italic">
                  💌 "{currentSong.dedication}"
                </p>
              )}

              {/* Realtime Smooth Progress Bar */}
              <div className="space-y-2">
                <div className="relative w-full h-3 bg-rose-100 rounded-full overflow-hidden flex items-center cursor-pointer group">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-75"
                    style={{
                      width: `${duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0}%`
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={duration > 0 ? duration : 100}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => seekTo(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-500 font-mono font-medium">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={playPrev}
                    className="p-3 rounded-full hover:bg-rose-100/60 text-slate-600 hover:text-rose-600 transition-colors"
                    title="Previous Song"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-300 hover:scale-105 transition-all"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
                  </button>

                  <button
                    onClick={playNext}
                    className="p-3 rounded-full hover:bg-rose-100/60 text-slate-600 hover:text-rose-600 transition-colors"
                    title="Next Song"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>

                {/* Volume slider */}
                <div className="flex items-center space-x-2 bg-white/80 px-3.5 py-2 rounded-full border border-rose-200/60 shadow-xs">
                  {volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-rose-500" />
                  )}
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-20 h-1.5 bg-rose-200 accent-rose-500 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="glass-card p-8 rounded-3xl text-center border border-rose-100">
          <p className="text-slate-500">No song selected</p>
        </div>
      )}

      {/* Playlist List */}
      <div className="glass-card rounded-3xl p-6 border border-rose-100 space-y-4">
        <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-rose-500" />
          <span>Our Playlist ({songs.length} Tracks)</span>
        </h3>

        <div className="divide-y divide-rose-100">
          {songs.map((song, index) => {
            const isSelected = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                onClick={() => {
                  if (isSelected) {
                    togglePlay();
                  } else {
                    playSong(song);
                  }
                }}
                className={`p-3.5 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  isSelected ? 'bg-rose-100/70 border border-rose-300/80 shadow-xs' : 'hover:bg-rose-50/60'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-xs font-bold text-rose-400 w-5">{index + 1}</span>
                  <img
                    src={
                      song.cover_url ||
                      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=400'
                    }
                    alt={song.title}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-rose-600' : 'text-slate-800'}`}>
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => openEditModal(song, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100"
                    title="Edit Song"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteSong(song.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100"
                    title="Delete Song"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected && isPlaying ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'bg-rose-100 text-rose-600'}`}>
                    {isSelected && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload/Edit Song Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-20 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-rose-200 flex flex-col max-h-[90vh] my-auto overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-800 flex items-center space-x-2">
                <MusicIcon className="w-5 h-5 text-rose-500" />
                <span>{editingSong ? 'Edit Music Track' : 'Add Track to Music Corner'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSong} className="flex flex-col overflow-hidden flex-1">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Song Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Golden Hour Serenade"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Artist Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acoustic Love Strings"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dedication Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Our sunset song from Santorini beach trip"
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                <MediaUploader
                  bucket="music"
                  label="Upload Audio File MP3 (Music Bucket)"
                  accept="audio/*"
                  onUploadSuccess={(url) => setMusicUrl(url)}
                />

                <MediaUploader
                  bucket="photos"
                  label="Optional Cover Image (Photos Bucket)"
                  accept="image/*"
                  onUploadSuccess={(url) => setCoverUrl(url)}
                />
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
                  disabled={!musicUrl || !title}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 hover:scale-105 transition-all"
                >
                  {editingSong ? 'Update Track' : 'Save Track'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
