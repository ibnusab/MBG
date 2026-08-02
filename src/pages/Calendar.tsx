import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Heart,
  BookOpen,
  FileText,
  Trophy,
  Trash2,
  X,
  Sparkles,
  MapPin,
  Smile,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Memory, Note, JournalEntry, Milestone } from '../types';
import { MediaUploader } from '../components/MediaUploader';

interface CalendarEvent {
  id: string;
  type: 'memory' | 'journal' | 'note' | 'milestone';
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
  photo_url?: string;
  video_url?: string;
  categoryOrMood?: string;
  authorOrSender?: string;
  raw: Memory | JournalEntry | Note | Milestone;
}

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const [memories, setMemories] = useState<Memory[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addType, setAddType] = useState<'memory' | 'journal' | 'note'>('memory');
  const [filterType, setFilterType] = useState<'all' | 'memory' | 'journal' | 'note' | 'milestone'>('all');

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<any>('daily');
  const [formMood, setFormMood] = useState<any>('love');
  const [formSender, setFormSender] = useState('Alex');
  const [formReceiver, setFormReceiver] = useState('Emma');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formLocation, setFormLocation] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [m, j, n, ms] = await Promise.all([
        dataService.getMemories(),
        dataService.getJournalEntries(),
        dataService.getNotes(),
        dataService.getMilestones()
      ]);
      setMemories(m || []);
      setJournalEntries(j || []);
      setNotes(n || []);
      setMilestones(ms || []);
    } catch (e) {
      console.warn('Failed to load data for calendar:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Helper to normalize dates to YYYY-MM-DD
  const formatDateToKey = (dateInput: string | Date): string => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string') {
      return dateInput.split('T')[0];
    }
    const year = dateInput.getFullYear();
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const day = String(dateInput.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Combine all items into event list
  const allEvents: CalendarEvent[] = [
    ...memories.map((m) => ({
      id: m.id,
      type: 'memory' as const,
      title: m.title,
      date: formatDateToKey(m.date),
      description: m.description,
      photo_url: m.photo_url,
      video_url: m.video_url,
      categoryOrMood: m.category || 'daily',
      authorOrSender: m.location,
      raw: m
    })),
    ...journalEntries.map((j) => ({
      id: j.id,
      type: 'journal' as const,
      title: j.title,
      date: formatDateToKey(j.created_at),
      description: j.content,
      photo_url: j.photo_url,
      video_url: j.video_url,
      categoryOrMood: j.mood || 'love',
      authorOrSender: j.author || 'Love',
      raw: j
    })),
    ...notes.map((n) => ({
      id: n.id,
      type: 'note' as const,
      title: `Love Note from ${n.sender}`,
      date: formatDateToKey(n.created_at),
      description: n.message,
      photo_url: n.attachment_url,
      authorOrSender: `${n.sender} → ${n.receiver}`,
      raw: n
    }))
  ];

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatDateToKey(today));
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Map events by date
  const eventsByDate = allEvents.reduce<Record<string, CalendarEvent[]>>((acc, evt) => {
    if (!acc[evt.date]) {
      acc[evt.date] = [];
    }
    acc[evt.date].push(evt);
    return acc;
  }, {});

  // Events for the selected date
  const selectedDateEvents = (eventsByDate[selectedDateStr] || []).filter((evt) => {
    if (filterType === 'all') return true;
    return evt.type === filterType;
  });

  // Handle adding new item
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() && addType !== 'note') return;

    if (addType === 'memory') {
      await dataService.addMemory({
        title: formTitle,
        description: formDescription,
        date: selectedDateStr,
        photo_url: formPhotoUrl || undefined,
        video_url: formVideoUrl || undefined,
        location: formLocation || undefined,
        category: formCategory
      });
    } else if (addType === 'journal') {
      await dataService.addJournalEntry({
        title: formTitle,
        content: formDescription,
        mood: formMood,
        author: formSender,
        photo_url: formPhotoUrl || undefined,
        video_url: formVideoUrl || undefined
      });
    } else if (addType === 'note') {
      await dataService.addNote({
        sender: formSender,
        receiver: formReceiver,
        message: formDescription || formTitle,
        attachment_url: formPhotoUrl || undefined,
        is_pinned: false,
        theme: 'rose'
      });
    }

    // Reset form
    setFormTitle('');
    setFormDescription('');
    setFormPhotoUrl('');
    setFormVideoUrl('');
    setFormLocation('');
    setIsModalOpen(false);

    // Refresh
    await loadAllData();
  };

  // Handle deleting item
  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (event.type === 'memory') {
      await dataService.deleteMemory(event.id);
    } else if (event.type === 'journal') {
      await dataService.deleteJournalEntry(event.id);
    } else if (event.type === 'note') {
      await dataService.deleteNote(event.id);
    }
    await loadAllData();
  };

  const getEventBadgeClass = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'memory':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'journal':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'note':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'milestone':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'memory':
        return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      case 'journal':
        return <BookOpen className="w-3.5 h-3.5 text-amber-500" />;
      case 'note':
        return <FileText className="w-3.5 h-3.5 text-pink-500" />;
      case 'milestone':
        return <Trophy className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  // Format display date (e.g. 20 Mei 2024)
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const yearNum = parts[0];
    const monthNum = parseInt(parts[1], 10) - 1;
    const dayNum = parseInt(parts[2], 10);
    return `${dayNum} ${monthNames[monthNum]} ${yearNum}`;
  };

  const todayStr = formatDateToKey(new Date());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Our Love Calendar & Memories</span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-slate-800 tracking-tight">
          Kalender Kenangan & Catatan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Catat dan jelajahi setiap momen manis, jurnal harian, serta pesan cinta berdasarkan tanggal spesial kita.
        </p>
      </div>

      {/* Main Grid & Panel Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Monthly Calendar (7 Cols on LG) */}
        <div className="lg:col-span-7 glass-card p-5 sm:p-6 rounded-3xl border border-rose-200/80 shadow-sm space-y-6">
          
          {/* Calendar Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-800">
                {monthNames[month]} {year}
              </h2>
              <p className="text-xs text-slate-500">
                {Object.keys(eventsByDate).filter(d => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} hari bermomen bulan ini
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all"
              >
                Hari Ini
              </button>
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-rose-100 pb-2">
            {dayNames.map((d, i) => (
              <div
                key={d}
                className={`text-xs font-bold uppercase tracking-wider py-1 ${
                  i === 0 ? 'text-rose-500' : 'text-slate-500'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-2xl bg-slate-50/40 border border-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              
              const dayEvents = eventsByDate[dayDateStr] || [];
              const isSelected = selectedDateStr === dayDateStr;
              const isToday = todayStr === dayDateStr;

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDateStr(dayDateStr)}
                  className={`relative h-14 sm:h-16 p-2 rounded-2xl border flex flex-col justify-between items-center transition-all duration-200 group overflow-hidden ${
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-300 scale-[1.02] z-10'
                      : isToday
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                      : 'bg-white/90 border-slate-100 text-slate-700 hover:border-rose-200 hover:bg-rose-50/40'
                  }`}
                >
                  {/* Date Number */}
                  <span
                    className={`text-xs sm:text-sm font-bold flex items-center justify-center ${
                      isSelected
                        ? 'text-white'
                        : isToday
                        ? 'w-6 h-6 rounded-full bg-rose-500 text-white text-xs shadow-xs'
                        : 'text-slate-700 group-hover:text-rose-600'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Event Color Dots */}
                  <div className="flex items-center justify-center gap-1 flex-wrap max-w-full px-1">
                    {dayEvents.slice(0, 4).map((evt, i) => (
                      <span
                        key={evt.id || i}
                        className={`w-2 h-2 rounded-full transition-transform ${
                          isSelected
                            ? 'bg-white'
                            : evt.type === 'memory'
                            ? 'bg-rose-500'
                            : evt.type === 'journal'
                            ? 'bg-amber-500'
                            : evt.type === 'note'
                            ? 'bg-pink-500'
                            : 'bg-emerald-500'
                        }`}
                        title={evt.title}
                      />
                    ))}
                    {dayEvents.length > 4 && (
                      <span className={`text-[8px] font-bold leading-none ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                        +
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-2 border-t border-rose-100">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Memories</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Journal</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              <span>Love Notes</span>
            </div>
          </div>

        </div>

        {/* Right Column: Selected Date Event Details & Quick Add (5 Cols on LG) */}
        <div className="lg:col-span-5 glass-card p-5 sm:p-6 rounded-3xl border border-rose-200/80 shadow-sm space-y-6">
          
          {/* Header for Selected Date */}
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                Momen Pada Tanggal
              </span>
              <h3 className="font-serif font-bold text-xl text-slate-800">
                {formatDisplayDate(selectedDateStr)}
              </h3>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-rose-500 text-white hover:bg-rose-600 text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Data</span>
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'memory', label: 'Memory' },
              { id: 'journal', label: 'Jurnal' },
              { id: 'note', label: 'Love Note' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  filterType === tab.id
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Selected Date Events List */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-10 text-slate-400 text-xs">Memuat data kalender...</div>
            ) : selectedDateEvents.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-rose-50/50 border border-dashed border-rose-200 space-y-3">
                <Sparkles className="w-8 h-8 text-rose-300 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Belum ada momen atau catatan pada tanggal ini.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-bold inline-flex items-center space-x-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Momen Baru</span>
                </button>
              </div>
            ) : (
              selectedDateEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`p-1.5 rounded-xl border ${getEventBadgeClass(evt.type)}`}>
                        {getEventIcon(evt.type)}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {evt.type}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-slate-800">
                          {evt.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(evt)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                      title="Hapus data ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Photo Preview if exists */}
                  {evt.photo_url && (
                    <div className="rounded-xl overflow-hidden max-h-40 border border-slate-100">
                      <img
                        src={evt.photo_url}
                        alt={evt.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Description */}
                  {evt.description && (
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {evt.description}
                    </p>
                  )}

                  {/* Metadata Footer */}
                  {evt.authorOrSender && (
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>{evt.authorOrSender}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* Modal Add Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-rose-100 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                {formatDisplayDate(selectedDateStr)}
              </span>
              <h3 className="font-serif font-bold text-2xl text-slate-800">
                Tambah Catatan / Momen
              </h3>
            </div>

            {/* Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'memory', label: 'Memory', icon: Heart },
                { id: 'journal', label: 'Jurnal', icon: BookOpen },
                { id: 'note', label: 'Love Note', icon: FileText }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = addType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAddType(item.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center space-y-1.5 transition-all ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              
              {addType !== 'note' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Momen</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Kencan Pertama di Cafe Rosetta"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                </div>
              )}

              {addType === 'memory' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi (Opsional)</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Contoh: Taman Bunga, Jakarta"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                </div>
              )}

              {addType === 'note' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pengirim</label>
                    <input
                      type="text"
                      value={formSender}
                      onChange={(e) => setFormSender(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Penerima</label>
                    <input
                      type="text"
                      value={formReceiver}
                      onChange={(e) => setFormReceiver(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {addType === 'note' ? 'Pesan Cinta' : 'Deskripsi / Cerita'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Tuliskan cerita manis atau perasaanmu..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none resize-none"
                />
              </div>

              {/* Photo Upload */}
              <MediaUploader
                label="Foto Kenangan (Opsional)"
                type="image"
                value={formPhotoUrl}
                onChange={setFormPhotoUrl}
              />

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Ke Kalender</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
