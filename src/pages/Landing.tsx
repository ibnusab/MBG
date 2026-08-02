import React from 'react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { Heart, Sparkles, Music, ArrowRight, Calendar, Compass, MessageCircle, Star } from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { useMusic } from '../context/MusicContext';

export const Landing: React.FC = () => {
  const { settings, daysTogether, timeTogether } = useCouple();
  const { isPlaying, togglePlay, currentSong } = useMusic();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative overflow-hidden">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#FFE4E9] rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute left-1/4 bottom-10 w-64 h-64 bg-[#FBCFE8] rounded-full blur-[80px] opacity-40 pointer-events-none" />

      {/* Main Hero Banner Container */}
      <section className="relative w-full rounded-[32px] overflow-hidden bg-[#FFE4E9] shadow-xl shadow-pink-100/50 p-8 sm:p-12 border border-white flex flex-col md:flex-row items-center justify-between gap-8 z-10">
        <div className="z-10 max-w-xl space-y-4 text-center md:text-left">
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#DB2777] block">
            Today is {formattedDate}
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-[#4A3B3E] leading-tight font-serif">
            You are the <span className="italic font-normal text-[#DB2777]">stars</span> in my little sky.
          </h1>

          <p className="text-xs sm:text-sm text-[#4A3B3E] opacity-80 leading-relaxed font-sans max-w-lg">
            {settings.hero_subtitle || 'Counting every heartbeat, memory, and shared laughter in our quiet universe.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <NavLink
              to="/notes"
              className="px-6 py-3 bg-[#DB2777] text-white rounded-full text-xs font-sans font-bold uppercase tracking-widest shadow-lg shadow-pink-200 hover:bg-[#be185d] hover:scale-105 transition-all inline-flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Write a Note</span>
            </NavLink>

            <NavLink
              to="/timeline"
              className="px-6 py-3 bg-white text-[#4A3B3E] border border-[#FDE2E8] rounded-full text-xs font-sans font-bold uppercase tracking-widest hover:bg-[#FFF9FA] hover:scale-105 transition-all inline-flex items-center space-x-2"
            >
              <span>Explore Timeline</span>
              <ArrowRight className="w-4 h-4 text-[#DB2777]" />
            </NavLink>
          </div>
        </div>

        {/* Polaroid Style Couple Showcase Card */}
        <div className="w-56 sm:w-64 bg-white rounded-2xl p-3 rotate-3 shadow-xl border border-pink-100 shrink-0 hover:rotate-0 transition-transform duration-300">
          <div className="w-full h-56 rounded-xl overflow-hidden relative flex items-center justify-center bg-cover bg-center"
            style={{
              backgroundImage: `url(${settings.cover_photo || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200'})`
            }}
          >
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/30 to-transparent" />

            <div className="flex items-center -space-x-4 z-10">
              <img
                src={settings.partner1_avatar}
                alt={settings.partner1_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md hover:scale-105 transition-transform"
              />
              <img
                src={settings.partner2_avatar}
                alt={settings.partner2_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md z-10 hover:scale-105 transition-transform"
              />
            </div>
            <div className="absolute bottom-2.5 left-2 right-2 z-10 flex justify-center">
              <div className="w-full bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-pink-200 shadow-md overflow-hidden">
                <div className="overflow-hidden whitespace-nowrap w-full">
                  <motion.div
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{
                      repeat: Infinity,
                      repeatType: 'loop',
                      duration: 9,
                      ease: 'linear'
                    }}
                    className="inline-flex whitespace-nowrap font-sans font-bold text-[10px] sm:text-[11px] text-[#DB2777] tracking-wider uppercase leading-none"
                  >
                    <span className="pr-4">{settings.partner1_name} & {settings.partner2_name}</span>
                    <span className="pr-4 text-rose-400">💕</span>
                    <span className="pr-4">{settings.partner1_name} & {settings.partner2_name}</span>
                    <span className="pr-4 text-rose-400">💕</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2 text-center">
            <p className="font-serif italic text-xs text-[#4A3B3E]">"Our Endless Memory"</p>
          </div>
        </div>
      </section>

      {/* Grid Features: Anniversary Metric + Live Ticker + Music Player */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Anniversary Days Count */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#FDE2E8] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] opacity-60 text-[#4A3B3E]">
              Anniversary
            </h3>
            <div className="w-2.5 h-2.5 rounded-full bg-[#DB2777] animate-pulse" />
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-5xl font-bold font-serif text-[#DB2777] mb-1">
              {daysTogether}
            </div>
            <div className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#4A3B3E] opacity-60">
              Days Since Day One
            </div>
          </div>

          <div className="text-center italic font-serif text-xs text-[#4A3B3E] opacity-80 pt-2 border-t border-[#FDE2E8]">
            Relationship Started: {settings.relationship_start_date}
          </div>
        </div>

        {/* Realtime Live Ticker Breakdown */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#FDE2E8] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em] opacity-60 text-[#4A3B3E]">
              Time Counter
            </h3>
            <Calendar className="w-4 h-4 text-[#DB2777]" />
          </div>

          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="bg-[#FFF9FA] p-2.5 rounded-xl border border-[#FDE2E8] text-center">
              <span className="block font-serif font-bold text-xl text-[#DB2777]">{timeTogether.years}</span>
              <span className="text-[9px] font-sans font-bold uppercase text-[#4A3B3E] opacity-60">Years</span>
            </div>
            <div className="bg-[#FFF9FA] p-2.5 rounded-xl border border-[#FDE2E8] text-center">
              <span className="block font-serif font-bold text-xl text-[#DB2777]">{timeTogether.months}</span>
              <span className="text-[9px] font-sans font-bold uppercase text-[#4A3B3E] opacity-60">Months</span>
            </div>
            <div className="bg-[#FFF9FA] p-2.5 rounded-xl border border-[#FDE2E8] text-center">
              <span className="block font-serif font-bold text-xl text-[#DB2777]">{timeTogether.days}</span>
              <span className="text-[9px] font-sans font-bold uppercase text-[#4A3B3E] opacity-60">Days</span>
            </div>
            <div className="bg-[#FFF9FA] p-2.5 rounded-xl border border-[#FDE2E8] text-center">
              <span className="block font-serif font-bold text-xl text-[#DB2777]">{timeTogether.hours}</span>
              <span className="text-[9px] font-sans font-bold uppercase text-[#4A3B3E] opacity-60">Hours</span>
            </div>
            <div className="bg-[#FFF9FA] p-2.5 rounded-xl border border-[#FDE2E8] text-center">
              <span className="block font-serif font-bold text-xl text-[#DB2777]">{timeTogether.minutes}</span>
              <span className="text-[9px] font-sans font-bold uppercase text-[#4A3B3E] opacity-60">Mins</span>
            </div>
            <div className="bg-[#FFF9FA] p-2.5 rounded-xl border border-[#FDE2E8] text-center">
              <span className="block font-serif font-bold text-xl text-[#DB2777]">{timeTogether.seconds}</span>
              <span className="text-[9px] font-sans font-bold uppercase text-[#4A3B3E] opacity-60">Secs</span>
            </div>
          </div>

          <div className="text-center text-[10px] font-sans font-bold uppercase tracking-widest text-[#DB2777]">
            Every second is a sweet gift 💕
          </div>
        </div>

        {/* Dark Warm Cultural Audio Card */}
        <div className="bg-[#2D2426] rounded-[24px] p-6 shadow-xl flex flex-col text-white justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-pink-300 opacity-80">
              Now Playing
            </h3>
            <Music className="w-4 h-4 text-pink-400" />
          </div>

          <div className="flex items-center gap-4 my-2">
            <div className="w-14 h-14 rounded-xl bg-[#4A3B3E] border border-pink-900/40 shrink-0 overflow-hidden flex items-center justify-center">
              {currentSong?.cover_url ? (
                <img src={currentSong.cover_url} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <Heart className="w-6 h-6 text-pink-300" />
              )}
            </div>
            <div className="overflow-hidden text-left">
              <p className="font-serif font-bold text-sm text-white truncate">
                {currentSong?.title || 'Strawberries & Cigarettes'}
              </p>
              <p className="text-xs text-pink-200/70 truncate font-sans">
                {currentSong?.artist || 'Troye Sivan'}
              </p>
            </div>
          </div>

          <div className="w-full bg-[#4A3B3E] h-1.5 rounded-full my-3 relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-[65%] bg-[#DB2777] rounded-full" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] font-sans font-bold text-pink-200/60 uppercase tracking-widest">
              Background Melody
            </span>
            <button
              onClick={togglePlay}
              className="px-4 py-1.5 bg-white text-[#2D2426] rounded-full text-xs font-sans font-bold uppercase tracking-wider hover:bg-pink-100 transition-all flex items-center space-x-1"
            >
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-left">
        <NavLink
          to="/timeline"
          className="bg-white rounded-[24px] p-5 border border-[#FDE2E8] hover:border-[#DB2777] transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-full bg-[#FFE4E9] text-[#DB2777] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-base text-[#4A3B3E]">Timeline</h4>
          <p className="text-xs text-[#8C7A7D] mt-1 font-sans">Milestones, dates, and trips.</p>
        </NavLink>

        <NavLink
          to="/notes"
          className="bg-white rounded-[24px] p-5 border border-[#FDE2E8] hover:border-[#DB2777] transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-full bg-[#FFE4E9] text-[#DB2777] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-base text-[#4A3B3E]">Love Notes</h4>
          <p className="text-xs text-[#8C7A7D] mt-1 font-sans">Sticky letters & sweet messages.</p>
        </NavLink>

        <NavLink
          to="/letter"
          className="bg-white rounded-[24px] p-5 border border-[#FDE2E8] hover:border-[#DB2777] transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-full bg-[#FFE4E9] text-[#DB2777] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-base text-[#4A3B3E]">Unfold Letter</h4>
          <p className="text-xs text-[#8C7A7D] mt-1 font-sans">Envelope wax seal experience.</p>
        </NavLink>

        <NavLink
          to="/countdown"
          className="bg-white rounded-[24px] p-5 border border-[#FDE2E8] hover:border-[#DB2777] transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-full bg-[#FFE4E9] text-[#DB2777] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Star className="w-5 h-5" />
          </div>
          <h4 className="font-serif font-bold text-base text-[#4A3B3E]">Anniversary Ticker</h4>
          <p className="text-xs text-[#8C7A7D] mt-1 font-sans">Celebration & confetti milestones.</p>
        </NavLink>
      </div>

    </div>
  );
};
