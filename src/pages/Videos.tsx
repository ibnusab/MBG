import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Video as VideoIcon, Plus, Play, Sparkles, Trash2, Edit2, X } from 'lucide-react';
import { Memory } from '../types';
import { dataService } from '../services/dataService';
import { MediaUploader } from '../components/MediaUploader';
import { Lightbox } from '../components/Lightbox';

export const Videos: React.FC = () => {
  const [videos, setVideos] = useState<Memory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Memory | null>(null);
  const [activeVideo, setActiveVideo] = useState<Memory | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    const memories = await dataService.getMemories();
    setVideos(memories.filter((m) => Boolean(m.video_url)));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingVideo(null);
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (video: Memory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVideo(video);
    setTitle(video.title);
    setDescription(video.description || '');
    setVideoUrl(video.video_url || '');
    setDate(video.date || new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl || !title) return;

    if (editingVideo) {
      await dataService.updateMemory({
        ...editingVideo,
        title,
        description,
        date,
        video_url: videoUrl
      });
    } else {
      await dataService.addMemory({
        title,
        description,
        date,
        video_url: videoUrl,
        category: 'daily'
      });
    }

    setIsModalOpen(false);
    await loadData();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dataService.deleteMemory(id);
    await loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold mb-2">
            <VideoIcon className="w-3.5 h-3.5" />
            <span>Moving Moments</span>
          </div>
          <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-slate-800">
            Video Memories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Short clips, giggles, road trip singing, and live memory reels.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-200 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((vid) => (
          <motion.div
            key={vid.id}
            whileHover={{ y: -4 }}
            className="glass-card rounded-3xl overflow-hidden border border-rose-100/80 shadow-sm hover:shadow-md transition-all group relative"
          >
            <div
              onClick={() => setActiveVideo(vid)}
              className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden flex items-center justify-center"
            >
              <video src={vid.video_url} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 ml-1" />
                </div>
              </div>
            </div>

            <div className="p-5 flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold text-rose-500 uppercase">{vid.date}</span>
                <h3 className="font-serif font-bold text-base text-slate-800 mt-0.5">{vid.title}</h3>
                {vid.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{vid.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={(e) => openEditModal(vid, e)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Edit video"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(vid.id, e)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-16 glass-card rounded-3xl p-8 border border-rose-100 max-w-xl mx-auto">
          <Sparkles className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h4 className="font-serif font-bold text-lg text-slate-800">No video memories saved yet</h4>
          <p className="text-xs text-slate-500 mt-1">Upload our first video clip to store it in Supabase storage!</p>
        </div>
      )}

      {/* Upload/Edit Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-20 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-rose-200 flex flex-col max-h-[90vh] my-auto overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-800 flex items-center space-x-2">
                <VideoIcon className="w-5 h-5 text-rose-500" />
                <span>{editingVideo ? 'Edit Video Clip' : 'Upload Video Clip'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="flex flex-col overflow-hidden flex-1">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Video Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Laughing in the rain"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="What made this video special?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                <MediaUploader
                  bucket="videos"
                  label="Select Video File (Videos Bucket)"
                  accept="video/*"
                  onUploadSuccess={(url) => setVideoUrl(url)}
                />

                {videoUrl && (
                  <div className="rounded-xl overflow-hidden h-36 bg-black border border-rose-100">
                    <video src={videoUrl} controls className="w-full h-full object-cover" />
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
                  disabled={!videoUrl || !title}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 hover:scale-105 transition-all"
                >
                  {editingVideo ? 'Update Video' : 'Save Video'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Video Lightbox Player */}
      {activeVideo && (
        <Lightbox
          isOpen={Boolean(activeVideo)}
          onClose={() => setActiveVideo(null)}
          mediaUrl={activeVideo.video_url || ''}
          mediaType="video"
          title={activeVideo.title}
          description={activeVideo.description}
        />
      )}
    </div>
  );
};
