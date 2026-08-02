import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Plus, Sparkles, Heart, Pencil, Trash2, RotateCcw, X, Send, Check, ChevronLeft, ChevronRight, Calendar, User, Copy } from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { LoveLetter } from '../types';
import { dataService } from '../services/dataService';

export const Letter: React.FC = () => {
  const { settings } = useCouple();
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LoveLetter | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [sender, setSender] = useState(settings.partner1_name);
  const [receiver, setReceiver] = useState(settings.partner2_name);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [sealColor, setSealColor] = useState<'rose' | 'pink' | 'purple' | 'gold' | 'red'>('rose');

  const currentLetter = letters[selectedIndex];

  const handleCopy = () => {
    if (currentLetter?.content) {
      navigator.clipboard.writeText(currentLetter.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    setLoading(true);
    try {
      const data = await dataService.getLetters();
      setLetters(data);
    } catch (err) {
      console.error('Failed to load letters:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingLetter(null);
    setTitle('Letter For My Darling');
    setSender(settings.partner1_name);
    setReceiver(settings.partner2_name);
    setDate(new Date().toISOString().split('T')[0]);
    setContent('');
    setSealColor('rose');
    setIsModalOpen(true);
  };

  const openEditModal = (letter: LoveLetter) => {
    setEditingLetter(letter);
    setTitle(letter.title);
    setSender(letter.sender || settings.partner1_name);
    setReceiver(letter.receiver || settings.partner2_name);
    setDate(letter.date || new Date().toISOString().split('T')[0]);
    setContent(letter.content);
    setSealColor(letter.seal_color || 'rose');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    if (editingLetter) {
      await dataService.updateLetter({
        ...editingLetter,
        title,
        sender,
        receiver,
        date,
        content,
        seal_color: sealColor
      });
    } else {
      await dataService.addLetter({
        title,
        sender,
        receiver,
        date,
        content,
        seal_color: sealColor
      });
    }

    setIsModalOpen(false);
    await loadLetters();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah kamu yakin ingin menghapus surat cinta ini?')) {
      await dataService.deleteLetter(id);
      setIsOpen(false);
      const updated = letters.filter((l) => l.id !== id);
      setLetters(updated);
      if (selectedIndex >= updated.length) {
        setSelectedIndex(Math.max(0, updated.length - 1));
      }
    }
  };

  const getSealBg = (color?: string) => {
    switch (color) {
      case 'pink':
        return 'bg-pink-500 text-white border-pink-300';
      case 'purple':
        return 'bg-purple-600 text-white border-purple-300';
      case 'gold':
        return 'bg-amber-500 text-white border-amber-200';
      case 'red':
        return 'bg-red-600 text-white border-red-300';
      case 'rose':
      default:
        return 'bg-rose-600 text-white border-rose-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 min-h-[85vh] flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-pink-100/80 text-pink-700 text-xs font-sans font-bold mb-2 border border-pink-200 shadow-xs">
            <Mail className="w-3.5 h-3.5 text-pink-600" />
            <span>Interactive Pink Love Envelope</span>
          </div>
          <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#4A3B3E]">
            A Love Letter For You
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kumpulan surat cinta romantis beramplop pink dengan tampilan tulisan tangan yang manis.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-sans font-bold text-xs uppercase tracking-widest shadow-lg shadow-pink-200 hover:scale-105 active:scale-95 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Surat Baru</span>
        </button>
      </div>

      {/* Main Letters Area */}
      {letters.length > 0 && currentLetter ? (
        <div className="space-y-6 my-auto">
          
          {/* Letters Carousel Selector (if multiple letters) */}
          {letters.length > 1 && (
            <div className="flex items-center justify-center space-x-3 overflow-x-auto py-2">
              <button
                onClick={() => {
                  setSelectedIndex((prev) => (prev > 0 ? prev - 1 : letters.length - 1));
                  setIsOpen(false);
                }}
                className="p-2 rounded-full bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 shadow-xs cursor-pointer transition-transform active:scale-90"
                title="Surat Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 overflow-x-auto max-w-md px-2 py-1 scrollbar-none">
                {letters.map((letItem, idx) => (
                  <button
                    key={letItem.id}
                    onClick={() => {
                      setSelectedIndex(idx);
                      setIsOpen(false);
                    }}
                    className={`px-3.5 py-1.5 rounded-2xl text-xs font-sans font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedIndex === idx
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200/60 scale-105'
                        : 'bg-white text-slate-600 border border-pink-100 hover:bg-pink-50'
                    }`}
                  >
                    💌 {letItem.title || `Surat #${idx + 1}`}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setSelectedIndex((prev) => (prev < letters.length - 1 ? prev + 1 : 0));
                  setIsOpen(false);
                }}
                className="p-2 rounded-full bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 shadow-xs cursor-pointer transition-transform active:scale-90"
                title="Surat Selanjutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Interactive Pink Envelope & Unfolding Handwritten Letter Stage */}
          <div className="relative flex flex-col items-center justify-center my-4 py-2 min-h-[480px] sm:min-h-[540px]">
            
            {/* Background ambient floating heart glow */}
            <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
              <div className="w-80 h-80 rounded-full bg-pink-200/50 blur-3xl animate-pulse" />
            </div>

            <AnimatePresence mode="wait">
              {!isOpen ? (
                /* CLOSED ENVELOPE (MATCHING IMAGE 1 EXACTLY) */
                <motion.div
                  key={`envelope-closed-${currentLetter.id}`}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(true)}
                  className="relative w-full max-w-[480px] aspect-[16/10] sm:aspect-[16/9.5] rounded-[32px] bg-gradient-to-b from-[#FFE4EC] to-[#FCDDEC] p-6 shadow-xl border-2 border-white flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden group"
                >
                  {/* Top Triangular Flap SVG */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none">
                    <svg viewBox="0 0 500 220" className="w-full h-full" preserveAspectRatio="none">
                      <polygon points="0,0 500,0 250,180" fill="#F8C5D8" opacity="0.8" />
                      <polygon points="0,0 500,0 250,180" fill="none" stroke="#FFFFFF" strokeWidth="3" />
                    </svg>
                  </div>

                  {/* Circular Heart Wax Seal */}
                  <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#DB2777] to-[#F43F5E] flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-pink-200/60 group-hover:scale-110 transition-transform">
                      <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white drop-shadow-xs" />
                    </div>
                  </div>

                  {/* Envelope Text Content */}
                  <div className="z-10 mt-16 text-center space-y-3">
                    <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#4A2038] tracking-tight">
                      {currentLetter.title || `To ${currentLetter.receiver || 'MyLove'}`}
                    </h2>

                    <div>
                      <span className="inline-flex items-center px-5 py-1.5 rounded-full bg-white text-[#DB2777] font-sans font-bold text-xs shadow-sm group-hover:bg-pink-50 transition-colors">
                        Click to open 💌
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* OPENED HANDWRITTEN LETTER */
                <motion.div
                  key={`letter-opened-${currentLetter.id}`}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="paper-sheet w-full max-w-xl mx-auto rounded-[24px] sm:rounded-[28px] p-4 sm:p-7 relative text-slate-800 shadow-2xl border border-pink-200/80 overflow-hidden"
                >
                  {/* Top Header Bar with Icon-Only Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-rose-200/80">
                    {/* Left side tag & date */}
                    <div className="flex items-center space-x-1.5 text-rose-500 text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider min-w-0">
                      <span className="text-sm shrink-0">💌</span>
                      <span className="bg-rose-100/80 text-rose-700 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap">SURAT CINTA</span>
                      <span className="text-slate-300 shrink-0">•</span>
                      <span className="text-slate-500 font-medium text-[11px] truncate">{currentLetter.date || '2026-08-02'}</span>
                    </div>

                    {/* Right side Icon-Only Action Buttons */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {/* Salin Button (Icon Only) */}
                      <button
                        onClick={handleCopy}
                        className={`p-2 rounded-xl transition-all active:scale-90 border shadow-2xs ${
                          copied
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-white hover:bg-pink-50 text-pink-600 border-pink-200'
                        }`}
                        title={copied ? "Tersalin!" : "Salin isi surat"}
                        aria-label="Salin isi surat"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {/* Edit Button (Icon Only) */}
                      <button
                        onClick={() => openEditModal(currentLetter)}
                        className="p-2 rounded-xl bg-white hover:bg-pink-50 text-pink-600 border border-pink-200 transition-all active:scale-90 shadow-2xs"
                        title="Edit Surat"
                        aria-label="Edit Surat"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Hapus Button (Icon Only) */}
                      <button
                        onClick={() => handleDelete(currentLetter.id)}
                        className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-pink-200 transition-all active:scale-90 shadow-2xs"
                        title="Hapus Surat"
                        aria-label="Hapus Surat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Lipat Amplop Button (Icon Only) */}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-xl bg-gradient-to-tr from-[#DB2777] to-rose-500 text-white shadow-md hover:scale-105 active:scale-90 transition-all"
                        title="Lipat Amplop Kembali"
                        aria-label="Lipat Amplop Kembali"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Letter Content Area - Perfectly aligned to red margin line and notebook lines */}
                  <div className="pl-6 sm:pl-8 pr-1 space-y-3">
                    {/* Letter Title */}
                    <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#4A2038] tracking-tight leading-snug">
                      {currentLetter.title || `To ${currentLetter.receiver || 'MyLove'}`}
                    </h1>

                    {/* Salutation Greeting */}
                    <div className="font-caveat italic text-2xl sm:text-3xl font-semibold text-rose-800">
                      Untuk {currentLetter.receiver || 'Kamu yang Paling Spesial'},
                    </div>

                    {/* Handwritten Content Lines */}
                    <div className="font-caveat text-xl sm:text-2xl text-[#3D2C30] leading-[2.5rem] whitespace-pre-line min-h-[160px] pt-1">
                      {currentLetter.content}
                    </div>

                    {/* Bottom Footer Signature */}
                    <div className="mt-8 pt-4 border-t border-rose-200/80 flex flex-col items-end text-right space-y-1">
                      <div className="flex items-center space-x-1 text-rose-500 text-xs font-sans font-extrabold uppercase tracking-widest">
                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
                        <span>FOREVER & ALWAYS</span>
                      </div>
                      <div className="font-serif font-extrabold text-xl sm:text-2xl text-[#4A2038]">
                        {currentLetter.sender || settings.partner1_name || 'Rian'} & {currentLetter.receiver || settings.partner2_name || 'Anisa'} ❤️
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-3xl p-8 border border-pink-100 max-w-md mx-auto shadow-xs space-y-4 my-auto">
          <Sparkles className="w-12 h-12 text-pink-400 mx-auto" />
          <h3 className="font-serif font-bold text-xl text-slate-800">Belum Ada Surat Cinta</h3>
          <p className="text-xs text-slate-500">
            Tuliskan kata-kata indah pertama untuk pasanganmu untuk memulai koleksi surat romantis.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-sans font-bold text-xs uppercase tracking-widest shadow-md shadow-pink-200 hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Surat Sekarang</span>
          </button>
        </div>
      )}

      {/* Input / Edit Modal (CRUD) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-20 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-pink-200 flex flex-col max-h-[90vh] my-auto overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-pink-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-800 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                <span>{editingLetter ? 'Edit Surat Cinta' : 'Tulis Surat Cinta Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-pink-50 text-slate-400 hover:text-pink-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Surat</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surat Cinta Untuk Pacar Tersayang"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-400 text-xs sm:text-sm outline-none bg-white font-sans"
                  />
                </div>

                {/* Sender & Receiver Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pengirim (From)</label>
                    <input
                      type="text"
                      required
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-400 text-xs sm:text-sm outline-none bg-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Penerima (To)</label>
                    <input
                      type="text"
                      required
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-400 text-xs sm:text-sm outline-none bg-white font-sans"
                    />
                  </div>
                </div>

                {/* Date & Seal Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Surat</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-400 text-xs sm:text-sm outline-none bg-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Warna Segel Lilin</label>
                    <select
                      value={sealColor}
                      onChange={(e) => setSealColor(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-400 text-xs sm:text-sm outline-none bg-white font-sans"
                    >
                      <option value="rose">Rose Pink 🌹</option>
                      <option value="pink">Sweet Pink 💖</option>
                      <option value="purple">Royal Purple 💜</option>
                      <option value="gold">Golden Luxe ✨</option>
                      <option value="red">Passion Red ❤️</option>
                    </select>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Isi Surat Cinta</label>
                  <textarea
                    rows={8}
                    required
                    placeholder="Tuliskan ungkapan perasaanmu yang paling jujur dan mendalam di sini..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-4 rounded-xl border border-pink-200 focus:border-pink-400 text-lg sm:text-xl font-caveat text-slate-800 outline-none leading-relaxed bg-pink-50/20"
                  />
                </div>

              </div>

              {/* Modal Actions */}
              <div className="p-4 sm:p-5 border-t border-pink-100 flex items-center justify-end space-x-3 shrink-0 bg-white/95 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md hover:scale-105 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingLetter ? 'Simpan Perubahan' : 'Kirim / Simpan Surat'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
