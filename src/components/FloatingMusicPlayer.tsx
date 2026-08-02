import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  ChevronDown,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const FloatingMusicPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume
  } = useMusic();

  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="fixed bottom-16 lg:bottom-6 right-3 lg:right-6 z-40 flex flex-col items-end pointer-events-auto transition-all duration-300">
      
      {/* Expanded Floating Player Card */}
      {isExpanded && (
        <div className="mb-3 w-[calc(100vw-1.5rem)] sm:w-80 glass-card p-4 sm:p-5 rounded-3xl border border-rose-200/90 shadow-2xl bg-white/95 backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-200 relative overflow-hidden">
          
          {/* Top Bar with Hide / Expand controls */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-100">
            <div className="flex items-center space-x-2 text-rose-600">
              <Sparkles className="w-4 h-4 animate-spin text-rose-500" />
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider">
                Now Playing
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <NavLink
                to="/music"
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-full hover:bg-rose-100/60 text-slate-500 hover:text-rose-600 transition-colors"
                title="Full Playlist"
              >
                <ExternalLink className="w-4 h-4" />
              </NavLink>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-full hover:bg-rose-100/60 text-slate-500 hover:text-rose-600 transition-colors"
                title="Close player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Song Cover & Info */}
          <div className="flex items-center space-x-3.5 mb-3">
            <div className="relative shrink-0 flex items-center justify-center">
              <div
                className={`w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md relative transition-transform duration-500 ${
                  isPlaying ? 'animate-[spin_10s_linear_infinite] ring-4 ring-rose-200/60' : ''
                }`}
              >
                <img
                  src={currentSong.cover_url || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80'}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-white/90 border border-rose-300 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-rose-500" />
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-serif font-bold text-slate-800 text-sm truncate">
                {currentSong.title}
              </h4>
              <p className="text-xs text-slate-500 truncate">{currentSong.artist}</p>
              {currentSong.dedication && (
                <p className="text-[10px] text-rose-500 italic truncate mt-0.5">
                  💌 "{currentSong.dedication}"
                </p>
              )}
            </div>
          </div>

          {/* Realtime Progress Bar */}
          <div className="space-y-1 mb-3">
            <div className="relative w-full h-2 bg-rose-100 rounded-full overflow-hidden flex items-center cursor-pointer group">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
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

            <div className="flex justify-between text-[10px] text-slate-500 font-mono font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between">
            {/* Volume control */}
            <div className="flex items-center space-x-1.5 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
              <button
                onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                className="text-rose-500 hover:text-rose-600"
              >
                {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-12 h-1 bg-rose-200 accent-rose-500 rounded-lg cursor-pointer"
              />
            </div>

            {/* Prev, Play/Pause, Next */}
            <div className="flex items-center space-x-2">
              <button
                onClick={playPrev}
                className="p-1.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-100/50 transition-colors"
                title="Previous"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-300 transition-all active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={playNext}
                className="p-1.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-100/50 transition-colors"
                title="Next"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Floating Music Button (Music Logo Only) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative group w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isPlaying
            ? 'bg-gradient-to-tr from-[#DB2777] via-pink-600 to-rose-500 text-white shadow-pink-500/40 ring-4 ring-pink-300/40'
            : 'bg-white/95 text-[#DB2777] border-2 border-pink-200 shadow-rose-200/50 hover:bg-pink-50'
        }`}
        title={isExpanded ? 'Tutup Pemutar Musik' : 'Buka Pemutar Musik'}
        aria-label="Toggle Music Player"
      >
        {/* Animated Sound Wave Rings when playing */}
        {isPlaying && (
          <span className="absolute inset-0 rounded-full border-2 border-pink-400 animate-ping opacity-30 pointer-events-none" />
        )}

        {/* Music Logo / Spinning Vinyl Disc */}
        <div className={`relative flex items-center justify-center ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`}>
          <Music className="w-6 h-6" />
        </div>

        {/* Play indicator dot badge */}
        {isPlaying && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </span>
        )}
      </button>

    </div>
  );
};
