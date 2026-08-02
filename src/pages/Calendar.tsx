import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Heart,
  BookOpen,
  FileText,
  Trophy,
  Trash2,
  X,
  Sparkles,
  MapPin,
  Calendar as CalendarIcon
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
  const [filterType, setFilterType] = useState<'all' | 'memory' | 'journal' | 'note'>('all');

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<any>('daily');
  const [formMood, setFormMood] = useState<any>('love');
  const [formSender, setFormSender] = useState('Sabrian');
  const [formReceiver, setFormReceiver] = useState('Anisa');
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

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'August', 'September', 'October', 'November', 'December',
    'January', 'February', 'March', 'April', 'May', 'June', 'July'
  ];

  // English month names matching the screenshot style
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNamesId = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  // Calculate Calendar 42 Grid Cells
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Prev Month Days
  const prevMonthDays = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIndex = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    prevMonthDays.push({ dayNum, dateStr, isCurrentMonth: false });
  }

  // Current Month Days
  const currentMonthDays = [];
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    currentMonthDays.push({ dayNum: d, dateStr, isCurrentMonth: true });
  }

  // Next Month Days to fill 42 cells (6 rows)
  const totalSoFar = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDaysCount = 42 - totalSoFar;
  const nextMonthDays = [];
  for (let d = 1; d <= nextMonthDaysCount; d++) {
    const nextMonthIndex = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    nextMonthDays.push({ dayNum: d, dateStr, isCurrentMonth: false });
  }

  const calendarCells = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

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

    setFormTitle('');
    setFormDescription('');
    setFormPhotoUrl('');
    setFormVideoUrl('');
    setFormLocation('');
    setIsModalOpen(false);

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

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const yearNum = parts[0];
    const monthNum = parseInt(parts[1], 10) - 1;
    const dayNum = parseInt(parts[2], 10);
    return `${dayNum} ${monthNamesId[monthNum]} ${yearNum}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* Clean Minimalist Header */}
      <div className="text-center space-y-2">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#2D2426] tracking-tight">
          Kalender Kenangan
        </h1>
        <p className="text-xs sm:text-sm text-[#4A3B3E]/70 max-w-md mx-auto">
          Pilih tanggal untuk melihat dan menambahkan momen manis kita.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Simple & Clean Calendar Card (Matches UI Screenshot) */}
        <div className="lg:col-span-7 bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-sm border border-[#FDE2E8] space-y-6">
          
          {/* Header Month Year & Controls */}
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#2D2426] tracking-tight">
              {monthNamesEn[month]} {year}
            </h2>

            <div className="flex items-center space-x-3">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-full hover:bg-pink-50 text-[#DB2777] transition-colors"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-full hover:bg-pink-50 text-[#DB2777] transition-colors"
                aria-label="Next Month"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 text-center pb-3 border-b border-[#FDE2E8]/80">
            {dayNames.map((d) => (
              <div
                key={d}
                className="text-xs font-sans font-bold text-[#4A3B3E]/70 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid (6 Rows x 7 Columns) */}
          <div className="grid grid-cols-7 gap-y-3 sm:gap-y-4 text-center">
            {calendarCells.map((cell, idx) => {
              const isSelected = selectedDateStr === cell.dateStr;
              const hasEvents = (eventsByDate[cell.dateStr] || []).length > 0;

              return (
                <div key={`${cell.dateStr}-${idx}`} className="flex flex-col items-center justify-center">
                  <button
                    onClick={() => {
                      setSelectedDateStr(cell.dateStr);
                      // If clicked outside current month, switch month view
                      if (!cell.isCurrentMonth) {
                        const clickedDate = new Date(cell.dateStr);
                        setCurrentDate(new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1));
                      }
                    }}
                    className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-sans transition-all ${
                      isSelected
                        ? 'bg-[#DB2777] text-white font-bold shadow-md shadow-pink-500/30 scale-105'
                        : cell.isCurrentMonth
                        ? 'text-[#2D2426] font-semibold hover:bg-pink-50 hover:text-[#DB2777]'
                        : 'text-slate-300 font-normal hover:text-slate-400'
                    }`}
                  >
                    <span>{cell.dayNum}</span>

                    {/* Has Events Indicator Dot */}
                    {hasEvents && !isSelected && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#DB2777]" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

        </div>

        {/* Selected Date Events & Memory List */}
        <div className="lg:col-span-5 bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-sm border border-[#FDE2E8] space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-[#FDE2E8]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DB2777]">
                Tanggal Terpilih
              </span>
              <h3 className="font-serif font-bold text-xl text-[#2D2426]">
                {formatDisplayDate(selectedDateStr)}
              </h3>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#DB2777] hover:bg-pink-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>

          {/* Filter Categories */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'memory', label: 'Memory' },
              { id: 'journal', label: 'Jurnal' },
              { id: 'note', label: 'Love Note' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterType === tab.id
                    ? 'bg-pink-100 text-[#DB2777]'
                    : 'bg-slate-100 text-slate-600 hover:bg-pink-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Event Cards */}
          <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-10 text-slate-400 text-xs">Memuat data...</div>
            ) : selectedDateEvents.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-pink-50/50 border border-dashed border-pink-200 space-y-3">
                <Sparkles className="w-8 h-8 text-pink-300 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Belum ada momen atau catatan pada tanggal ini.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-pink-100 text-[#DB2777] hover:bg-pink-200 text-xs font-bold inline-flex items-center space-x-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Momen</span>
                </button>
              </div>
            ) : (
              selectedDateEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#FDE2E8] shadow-xs hover:shadow-sm transition-all space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`p-1.5 rounded-xl border ${getEventBadgeClass(evt.type)}`}>
                        {getEventIcon(evt.type)}
                      </span>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          {evt.type}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-[#2D2426]">
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

                  {evt.description && (
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {evt.description}
                    </p>
                  )}

                  {evt.authorOrSender && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 pt-1 border-t border-pink-100/60">
                      <MapPin className="w-3 h-3 text-pink-400" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-pink-100 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-[#DB2777] uppercase tracking-wider">
                {formatDisplayDate(selectedDateStr)}
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#2D2426]">
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
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#DB2777] text-white border-[#DB2777] shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-pink-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Subjek</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Kencan pertama di taman..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#DB2777] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Pesan</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Tuliskan cerita atau kesan manis..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#DB2777] text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi / Pengirim</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Jakarta, Cafe Kenangan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#DB2777] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Upload Foto Media</label>
                <MediaUploader
                  type="image"
                  onUploadComplete={(url) => setFormPhotoUrl(url)}
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#DB2777] hover:bg-pink-700 text-white text-xs font-bold shadow-md shadow-pink-200"
                >
                  Simpan Data
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
