import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Heart,
  Calendar,
  Image,
  Video,
  Music,
  FileText,
  BookOpen,
  Clock,
  Mail,
  Star,
  Settings as SettingsIcon,
  Menu,
  X,
  Play,
  Pause,
  Sparkles
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { useMusic } from '../context/MusicContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings, daysTogether } = useCouple();
  const { currentSong, isPlaying, togglePlay } = useMusic();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Heart },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/timeline', label: 'Timeline', icon: Sparkles },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/videos', label: 'Videos', icon: Video },
    { path: '/music', label: 'Music', icon: Music },
    { path: '/notes', label: 'Love Notes', icon: FileText },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: '/countdown', label: 'Countdown', icon: Clock },
    { path: '/letter', label: 'Love Letter', icon: Mail },
    { path: '/favorites', label: 'Favorites', icon: Star },
    { path: '/settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <header className="sticky top-0 z-30 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand / Couple Title */}
          <NavLink
            to="/"
            className="flex items-center space-x-3 group text-[#DB2777] transition-transform duration-300 hover:scale-105"
          >
            <div className="w-10 h-10 rounded-full bg-[#FFE4E9] flex items-center justify-center text-[#DB2777] border border-[#FDE2E8] shadow-sm">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-serif font-bold italic text-xl text-[#DB2777] tracking-tight">
                {settings.hero_title || 'sabrianisa'}
              </span>
              <p className="text-[10px] text-[#DB2777] font-sans font-bold tracking-[0.2em] uppercase opacity-70 hidden sm:block">
                {settings.partner1_name} & {settings.partner2_name} • {daysTogether} Days Together
              </p>
            </div>
          </NavLink>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  aria-label={item.label}
                  className={`p-2.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-[#DB2777] text-white shadow-md shadow-pink-200/50'
                      : 'text-[#4A3B3E] opacity-70 hover:opacity-100 hover:text-[#DB2777] hover:bg-[#FFE4E9]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#DB2777]'}`} />
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#DB2777] hover:bg-[#FFE4E9]/50 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-card border-t border-[#FDE2E8] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-300">
          <div className="text-[10px] font-sans font-bold text-[#DB2777] uppercase tracking-[0.2em] px-3 pt-1 pb-2">
            sabrianisa Navigation
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-sans font-bold transition-all ${
                    isActive
                      ? 'bg-[#DB2777] text-white shadow-sm'
                      : 'text-[#4A3B3E] bg-white/80 border border-[#FDE2E8] hover:bg-[#FFE4E9]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#DB2777]'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
