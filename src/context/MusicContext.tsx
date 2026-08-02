import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { dataService } from '../services/dataService';

interface MusicContextType {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  togglePlay: () => void;
  playSong: (song: Song) => void;
  playNext: () => void;
  playPrev: () => void;
  setVolume: (vol: number) => void;
  seekTo: (time: number) => void;
  reloadSongs: () => Promise<void>;
  addSong: (song: Omit<Song, 'id'>) => Promise<Song>;
  updateSong: (song: Song) => Promise<Song>;
  deleteSong: (id: string) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.7);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playNextRef = useRef<() => void>(() => {});

  const currentSong = songs[currentSongIndex] || null;

  const playNext = () => {
    if (songs.length === 0) return;
    const nextIdx = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIdx);
  };

  const playPrev = () => {
    if (songs.length === 0) return;
    const prevIdx = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevIdx);
  };

  useEffect(() => {
    playNextRef.current = playNext;
  });

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      playNextRef.current();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleMetadata);
    audio.addEventListener('durationchange', handleMetadata);
    audio.addEventListener('canplay', handleMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleMetadata);
      audio.removeEventListener('durationchange', handleMetadata);
      audio.removeEventListener('canplay', handleMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, []);

  // Fetch playlist from dataService
  const reloadSongs = async () => {
    try {
      const fetched = await dataService.getSongs();
      setSongs(fetched);
    } catch (err) {
      console.error('Failed to load songs:', err);
    }
  };

  useEffect(() => {
    reloadSongs();
  }, []);

  // Change audio src when current song changes
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audio = audioRef.current;
      const isSameSrc = audio.src === currentSong.music_url;
      if (!isSameSrc) {
        audio.src = currentSong.music_url;
        setCurrentTime(0);
        setDuration(0);
        if (isPlaying) {
          audio.play().catch(console.warn);
        }
      }
    }
  }, [currentSongIndex, songs]);

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Playback error (user interaction required):', err);
      });
    }
  };

  const playSong = (song: Song) => {
    const index = songs.findIndex((s) => s.id === song.id);
    if (index !== -1) {
      setCurrentSongIndex(index);
      if (audioRef.current) {
        audioRef.current.src = song.music_url;
        setCurrentTime(0);
        setDuration(0);
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
      }
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, vol));
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const addSong = async (song: Omit<Song, 'id'>) => {
    const created = await dataService.addSong(song);
    const updatedList = await dataService.getSongs();
    setSongs(updatedList);
    const idx = updatedList.findIndex(s => s.id === created.id);
    if (idx !== -1) {
      setCurrentSongIndex(idx);
      if (audioRef.current) {
        audioRef.current.src = created.music_url;
        setCurrentTime(0);
        setDuration(0);
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
      }
    }
    return created;
  };

  const updateSong = async (song: Song) => {
    const updated = await dataService.updateSong(song);
    const updatedList = await dataService.getSongs();
    setSongs(updatedList);
    if (currentSong?.id === song.id && audioRef.current) {
      if (audioRef.current.src !== song.music_url) {
        audioRef.current.src = song.music_url;
        if (isPlaying) {
          audioRef.current.play().catch(console.warn);
        }
      }
    }
    return updated;
  };

  const deleteSong = async (id: string) => {
    const isCurrent = currentSong?.id === id;
    await dataService.deleteSong(id);
    const updatedList = await dataService.getSongs();
    setSongs(updatedList);

    if (updatedList.length === 0) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      setIsPlaying(false);
      setCurrentSongIndex(0);
    } else if (isCurrent) {
      const nextIndex = currentSongIndex % updatedList.length;
      setCurrentSongIndex(nextIndex);
      if (audioRef.current) {
        audioRef.current.src = updatedList[nextIndex].music_url;
        setCurrentTime(0);
        setDuration(0);
        if (isPlaying) {
          audioRef.current.play().catch(console.warn);
        }
      }
    } else {
      // readjust index if deleted song was before current index
      const newIndex = updatedList.findIndex(s => s.id === currentSong?.id);
      if (newIndex !== -1) {
        setCurrentSongIndex(newIndex);
      }
    }
  };

  return (
    <MusicContext.Provider
      value={{
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
        reloadSongs,
        addSong,
        updateSong,
        deleteSong
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};
