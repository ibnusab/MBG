import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, Pin, Trash2, Edit2, Send, Heart, Sparkles, X } from 'lucide-react';
import { Note, Memory } from '../types';
import { dataService } from '../services/dataService';
import { useCouple } from '../context/CoupleContext';
import { MediaUploader } from '../components/MediaUploader';

export const Notes: React.FC = () => {
  const { settings } = useCouple();
  const [notes, setNotes] = useState<Note[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form state
  const [sender, setSender] = useState(settings.partner1_name);
  const [receiver, setReceiver] = useState(settings.partner2_name);
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState<'rose' | 'blush' | 'lavender' | 'mint' | 'gold'>('rose');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [memoryId, setMemoryId] = useState('');

  const loadData = async () => {
    const [fetchedNotes, fetchedMemories] = await Promise.all([
      dataService.getNotes(),
      dataService.getMemories()
    ]);
    setNotes(fetchedNotes);
    setMemories(fetchedMemories);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingNote(null);
    setSender(settings.partner1_name);
    setReceiver(settings.partner2_name);
    setMessage('');
    setTheme('rose');
    setAttachmentUrl('');
    setMemoryId('');
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setSender(note.sender);
    setReceiver(note.receiver);
    setMessage(note.message);
    setTheme(note.theme || 'rose');
    setAttachmentUrl(note.attachment_url || '');
    setMemoryId(note.memory_id || '');
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    if (editingNote) {
      await dataService.updateNote({
        ...editingNote,
        sender,
        receiver,
        message,
        theme,
        attachment_url: attachmentUrl || undefined,
        memory_id: memoryId || undefined
      });
    } else {
      await dataService.addNote({
        sender,
        receiver,
        message,
        theme,
        attachment_url: attachmentUrl || undefined,
        memory_id: memoryId || undefined,
        is_pinned: false
      });
    }

    setIsModalOpen(false);
    await loadData();
  };

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    await dataService.togglePinNote(id, !currentPin);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await dataService.deleteNote(id);
    await loadData();
  };

  const themeStyles = {
    rose: 'bg-rose-50/90 border-rose-200 text-slate-800 shadow-rose-100',
    blush: 'bg-pink-50/90 border-pink-200 text-slate-800 shadow-pink-100',
    lavender: 'bg-purple-50/90 border-purple-200 text-slate-800 shadow-purple-100',
    mint: 'bg-emerald-50/90 border-emerald-200 text-slate-800 shadow-emerald-100',
    gold: 'bg-amber-50/90 border-amber-200 text-slate-800 shadow-amber-100'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Heartfelt Whispers</span>
          </div>
          <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-slate-800">
            Love Notes Wall
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sticky sweet notes, morning greetings, and quiet words sent to each other.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-200 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Write Love Note</span>
        </button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {notes.map((note) => {
            const cardStyle = themeStyles[note.theme || 'rose'];
            const linkedMemory = memories.find((m) => m.id === note.memory_id);

            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-6 rounded-3xl border shadow-md relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${cardStyle}`}
              >
                {/* Pin Badge */}
                {note.is_pinned && (
                  <div className="absolute -top-3 right-6 bg-rose-500 text-white p-1.5 rounded-full shadow-md z-10">
                    <Pin className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}

                {/* Top sender receiver row */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                      <span className="px-2.5 py-1 rounded-full bg-white/80 shadow-xs border border-rose-100">
                        From: {note.sender}
                      </span>
                      <Heart className="w-3 h-3 text-rose-500 fill-current" />
                      <span className="px-2.5 py-1 rounded-full bg-white/80 shadow-xs border border-rose-100">
                        To: {note.receiver}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleTogglePin(note.id, Boolean(note.is_pinned))}
                        className={`p-1.5 rounded-xl transition-colors ${
                          note.is_pinned ? 'text-rose-600 bg-rose-100' : 'text-slate-400 hover:text-rose-600'
                        }`}
                        title={note.is_pinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(note)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-white/60"
                        title="Edit Note"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-white/60"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="font-serif text-sm sm:text-base text-slate-800 leading-relaxed italic pt-2">
                    "{note.message}"
                  </p>

                  {/* Linked Memory Badge */}
                  {linkedMemory && (
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/80 border border-rose-200 text-slate-700 text-[11px] font-semibold">
                      <Sparkles className="w-3 h-3 text-rose-500" />
                      <span>Linked Memory: {linkedMemory.title}</span>
                    </div>
                  )}

                  {/* Attachment image if present */}
                  {note.attachment_url && (
                    <div className="mt-3 rounded-2xl overflow-hidden max-h-48 border border-white/80 shadow-xs">
                      <img
                        src={note.attachment_url}
                        alt="Attachment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Footer timestamp */}
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center space-x-1 text-rose-500 font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span>Sent with love</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {notes.length === 0 && (
        <div className="text-center py-16 glass-card rounded-3xl p-8 border border-rose-100 max-w-xl mx-auto">
          <Sparkles className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h4 className="font-serif font-bold text-lg text-slate-800">No love notes on the wall yet</h4>
          <p className="text-xs text-slate-500 mt-1">Leave a sweet message for your partner to make their day!</p>
        </div>
      )}

      {/* Write / Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-20 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-rose-200 flex flex-col max-h-[90vh] my-auto overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-800 flex items-center space-x-2">
                <Send className="w-5 h-5 text-rose-500" />
                <span>{editingNote ? 'Edit Love Note' : 'Write a Love Note'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="flex flex-col overflow-hidden flex-1">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sender</label>
                    <select
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none bg-white"
                    >
                      <option value={settings.partner1_name}>{settings.partner1_name}</option>
                      <option value={settings.partner2_name}>{settings.partner2_name}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Receiver</label>
                    <select
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none bg-white"
                    >
                      <option value={settings.partner2_name}>{settings.partner2_name}</option>
                      <option value={settings.partner1_name}>{settings.partner1_name}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Card Theme Color</label>
                  <div className="flex items-center space-x-3 pt-1">
                    {(['rose', 'blush', 'lavender', 'mint', 'gold'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          t === 'rose'
                            ? 'bg-rose-200 border-rose-400'
                            : t === 'blush'
                            ? 'bg-pink-200 border-pink-400'
                            : t === 'lavender'
                            ? 'bg-purple-200 border-purple-400'
                            : t === 'mint'
                            ? 'bg-emerald-200 border-emerald-400'
                            : 'bg-amber-200 border-amber-400'
                        } ${theme === t ? 'scale-125 shadow-md' : 'opacity-70'}`}
                      />
                    ))}
                  </div>
                </div>

                {memories.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Link to Memory (Optional)</label>
                    <select
                      value={memoryId}
                      onChange={(e) => setMemoryId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-rose-200 text-xs sm:text-sm outline-none bg-white"
                    >
                      <option value="">None (General Note)</option>
                      {memories.map((m) => (
                        <option key={m.id} value={m.id}>
                          ✨ {m.title} ({m.date})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write something sweet and romantic..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-400 text-xs sm:text-sm outline-none bg-white"
                  />
                </div>

                <MediaUploader
                  bucket="notes-attachments"
                  label="Optional Attachment (Notes Attachment Bucket)"
                  accept="image/*"
                  onUploadSuccess={(url) => setAttachmentUrl(url)}
                />

                {attachmentUrl && (
                  <div className="rounded-xl overflow-hidden h-28 border border-rose-100">
                    <img src={attachmentUrl} alt="Attachment Preview" className="w-full h-full object-cover" />
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
                  disabled={!message}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md disabled:opacity-50 hover:scale-105 transition-all flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingNote ? 'Update Note' : 'Send Note'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
