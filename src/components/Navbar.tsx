import React from 'react';
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
  Sparkles
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';

export const Navbar: React.FC = () => {
  const { settings, daysTogether } = useCouple();
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
    <>
      <header className="sticky top-0 z-30 glass-nav transition-all duration-300 border-b border-pink-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Brand / Couple Title */}
            <NavLink
              to="/"
              className="flex items-center space-x-3 group text-[#DB2777] transition-transform duration-300 hover:scale-105"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFE4E9] to-pink-100 flex items-center justify-center text-[#DB2777] border border-[#FDE2E8] shadow-sm group-hover:rotate-6 transition-transform">
                <Sparkles className="w-5 h-5 animate-pulse text-[#DB2777]" />
              </div>
              <div>
                <span className="font-serif font-bold italic text-xl text-[#DB2777] tracking-tight">
                  {settings.hero_title || 'sabrianisa'}
                </span>
                <p className="text-[10px] text-[#DB2777] font-sans font-bold tracking-[0.18em] uppercase opacity-75 hidden sm:block">
                  {settings.partner1_name} & {settings.partner2_name} • {daysTogether} Days Together
                </p>
              </div>
            </NavLink>

            {/* Desktop Nav Items */}
            <nav className="hidden lg:flex items-center space-x-1 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-pink-100/80 shadow-xs">
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
                        ? 'bg-[#DB2777] text-white shadow-md shadow-pink-200/60 scale-105'
                        : 'text-[#4A3B3E] opacity-70 hover:opacity-100 hover:text-[#DB2777] hover:bg-[#FFE4E9]/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#DB2777]'}`} />
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile Header Right - Love Icon Badge replacing Menu button */}
            <div className="flex items-center space-x-2 lg:hidden">
              <NavLink
                to="/letter"
                className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-100 to-pink-50 border border-pink-200/80 shadow-xs flex items-center space-x-1.5 active:scale-95 transition-all text-[#DB2777]"
                title="Love Letter"
              >
                <Heart className="w-5 h-5 fill-[#DB2777] text-[#DB2777] animate-pulse" />
              </NavLink>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Horizontally Scrollable Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-pink-200/60 shadow-[0_-4px_25px_rgba(219,39,119,0.12)]">
        <div className="flex items-center space-x-2 px-3 py-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center justify-center shrink-0 px-3.5 py-1.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#DB2777] to-pink-600 text-white shadow-md shadow-pink-200/80 scale-102'
                    : 'text-slate-600 hover:text-[#DB2777] hover:bg-pink-50/80'
                }`}
              >
                <div className="p-0.5 rounded-xl">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#DB2777]'}`} />
                </div>
                <span className={`text-[11px] font-sans font-bold whitespace-nowrap mt-0.5 ${isActive ? 'text-white' : 'text-slate-600'}`}>
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};
