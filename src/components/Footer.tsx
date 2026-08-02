import React from 'react';
import { Heart, Sparkles, ShieldCheck, Database } from 'lucide-react';
import { useCouple } from '../context/CoupleContext';

export const Footer: React.FC = () => {
  const { settings, daysTogether, isSupabaseConnected } = useCouple();

  return (
    <footer className="mt-20 border-t border-[#FDE2E8] bg-[#FFF9FA] py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          
          {/* Couple info & quote */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex items-center -space-x-3">
              <img
                src={settings.partner1_avatar}
                alt={settings.partner1_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div className="w-8 h-8 rounded-full bg-[#DB2777] text-white flex items-center justify-center border-2 border-white z-10 shadow-md">
                <Heart className="w-4 h-4 fill-current animate-pulse" />
              </div>
              <img
                src={settings.partner2_avatar}
                alt={settings.partner2_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#4A3B3E]">
                {settings.partner1_name} & {settings.partner2_name}'s Universe
              </h3>
              <p className="text-xs text-[#DB2777] italic mt-0.5 font-serif">
                "In all the world, there is no heart for me like yours."
              </p>
            </div>
          </div>

          {/* Days Together Counter Badge */}
          <div className="glass-card px-6 py-3 rounded-[24px] flex items-center space-x-3 shadow-sm border border-[#FDE2E8] bg-white">
            <Sparkles className="w-5 h-5 text-[#DB2777]" />
            <div className="text-left">
              <div className="text-lg font-bold font-serif text-[#DB2777] leading-tight">
                {daysTogether} Days
              </div>
              <div className="text-[10px] text-[#4A3B3E] opacity-60 uppercase tracking-[0.2em] font-sans font-bold">
                Of Loving Each Other
              </div>
            </div>
          </div>

          {/* Copyright note */}
          <div className="flex flex-col items-center md:items-end text-xs text-[#4A3B3E] space-y-1">
            <p className="text-[11px] text-[#8C7A7D]">
              Made with endless love for {settings.partner1_name} & {settings.partner2_name}
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};
