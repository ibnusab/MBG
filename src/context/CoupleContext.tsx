import React, { createContext, useContext, useState, useEffect } from 'react';
import { CoupleSettings } from '../types';
import { dataService } from '../services/dataService';
import { isSupabaseConfigured } from '../lib/supabase';

interface CoupleContextType {
  settings: CoupleSettings;
  updateSettings: (newSettings: CoupleSettings) => Promise<void>;
  daysTogether: number;
  timeTogether: {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  isLoading: boolean;
  isSupabaseConnected: boolean;
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const CoupleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CoupleSettings>({
    partner1_name: 'Alex',
    partner2_name: 'Emma',
    partner1_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    partner2_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    cover_photo: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200',
    relationship_start_date: '2023-05-20',
    hero_title: 'sabrianisa',
    hero_subtitle: 'A sweet corner of the cosmos made entirely of our love, quiet laughs, and endless memories.',
    bg_music_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3',
    particle_type: 'hearts'
  });

  const [isLoading, setIsLoading] = useState(true);

  const [timeTogether, setTimeTogether] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [daysTogether, setDaysTogether] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const data = await dataService.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed loading settings', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Update time together clock every second
  useEffect(() => {
    const calculateTime = () => {
      const startDate = new Date(settings.relationship_start_date);
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - startDate.getTime());

      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      setDaysTogether(totalDays);

      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      let days = now.getDate() - startDate.getDate();
      let hours = now.getHours() - startDate.getHours();
      let minutes = now.getMinutes() - startDate.getMinutes();
      let seconds = now.getSeconds() - startDate.getSeconds();

      if (seconds < 0) {
        seconds += 60;
        minutes--;
      }
      if (minutes < 0) {
        minutes += 60;
        hours--;
      }
      if (hours < 0) {
        hours += 24;
        days--;
      }
      if (days < 0) {
        const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += previousMonth.getDate();
        months--;
      }
      if (months < 0) {
        months += 12;
        years--;
      }

      setTimeTogether({
        years: Math.max(0, years),
        months: Math.max(0, months),
        days: Math.max(0, days),
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        seconds: Math.max(0, seconds)
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.relationship_start_date]);

  const handleUpdateSettings = async (newSettings: CoupleSettings) => {
    setSettings(newSettings);
    await dataService.updateSettings(newSettings);
  };

  return (
    <CoupleContext.Provider
      value={{
        settings,
        updateSettings: handleUpdateSettings,
        daysTogether,
        timeTogether,
        isLoading,
        isSupabaseConnected: isSupabaseConfigured
      }}
    >
      {children}
    </CoupleContext.Provider>
  );
};

export const useCouple = () => {
  const context = useContext(CoupleContext);
  if (!context) {
    throw new Error('useCouple must be used within CoupleProvider');
  }
  return context;
};
