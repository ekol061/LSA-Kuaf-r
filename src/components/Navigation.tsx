import React from 'react';
import { Calendar, Wallet, Users, User, Mic } from 'lucide-react';
import { playMicStartBeep, playMicStopBeep } from '../utils/soundEffects';

export type TabKey = 'appointments' | 'accounting' | 'customers' | 'profile';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  pendingCount: number;
  onToggleVoice: () => void;
  isVoiceActive: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
  onToggleVoice,
  isVoiceActive,
}) => {
  const handleMicButtonClick = () => {
    if (!isVoiceActive) {
      playMicStartBeep();
    } else {
      playMicStopBeep();
    }
    onToggleVoice();
  };

  return (
    <>
      {/* Desktop Navigation Bar */}
      <div className="hidden md:block max-w-4xl mx-auto px-4 pt-3 pb-2">
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-2 rounded-3xl card-app">
          <nav className="flex items-center gap-2">
            {[
              { key: 'appointments' as TabKey, label: 'Randevular', icon: Calendar, badge: pendingCount },
              { key: 'accounting' as TabKey, label: 'Muhasebe & Fiyatlar', icon: Wallet },
              { key: 'customers' as TabKey, label: 'Müşteri & Personel', icon: Users },
              { key: 'profile' as TabKey, label: 'Profil & Salon', icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={`h-10 px-3.5 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap leading-none ${
                    isActive ? 'btn-3d-red' : 'btn-3d-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md leading-none ${
                        isActive ? 'bg-white text-red-600' : 'bg-red-600 text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop 3D Voice Trigger */}
          <button
            type="button"
            onClick={handleMicButtonClick}
            className={`h-10 px-4 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap leading-none btn-3d-red ${
              isVoiceActive ? 'ring-4 ring-red-400/50 scale-102' : ''
            }`}
          >
            <Mic className="w-4 h-4 shrink-0" />
            <span>{isVoiceActive ? 'Dinliyor...' : 'Sesli Asistan'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (Strict 5-Column Symmetrical Grid) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/98 dark:bg-zinc-950/98 backdrop-blur-md border-t border-gray-200/90 dark:border-zinc-800/90 py-2 px-2 grid grid-cols-5 items-end z-40 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        {/* 1. Randevu */}
        <button
          type="button"
          onClick={() => onTabChange('appointments')}
          className="flex flex-col items-center justify-center cursor-pointer relative"
        >
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                activeTab === 'appointments' ? 'btn-3d-red' : 'btn-3d-white'
              }`}
            >
              <Calendar className="w-4.5 h-4.5" />
            </div>
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full bg-red-600 text-white border border-white dark:border-zinc-950 leading-none">
                {pendingCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] mt-1 font-bold leading-none whitespace-nowrap ${
              activeTab === 'appointments' ? 'text-red-600 dark:text-red-400' : 'text-gray-500'
            }`}
          >
            Randevu
          </span>
        </button>

        {/* 2. Muhasebe */}
        <button
          type="button"
          onClick={() => onTabChange('accounting')}
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              activeTab === 'accounting' ? 'btn-3d-red' : 'btn-3d-white'
            }`}
          >
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <span
            className={`text-[10px] mt-1 font-bold leading-none whitespace-nowrap ${
              activeTab === 'accounting' ? 'text-red-600 dark:text-red-400' : 'text-gray-500'
            }`}
          >
            Muhasebe
          </span>
        </button>

        {/* 3. CENTER: 3D Mikrofon (Ortada - Symmetrical Center Column) */}
        <div className="flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleMicButtonClick}
            className={`-mt-5 w-14 h-14 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-950 cursor-pointer btn-3d-red ${
              isVoiceActive ? 'ring-4 ring-red-400/50 scale-105' : ''
            }`}
            title="Sesli Randevu / Personel Ekle"
          >
            <div className="w-9 h-9 rounded-full bg-white text-red-600 flex items-center justify-center shadow-inner">
              <Mic className={`w-4.5 h-4.5 ${isVoiceActive ? 'animate-bounce' : ''}`} />
            </div>
          </button>
          <span className="text-[10px] mt-1 font-bold leading-none text-red-600 dark:text-red-400 whitespace-nowrap">
            Sesli
          </span>
        </div>

        {/* 4. Müşteri & Personel */}
        <button
          type="button"
          onClick={() => onTabChange('customers')}
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              activeTab === 'customers' ? 'btn-3d-red' : 'btn-3d-white'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
          </div>
          <span
            className={`text-[10px] mt-1 font-bold leading-none whitespace-nowrap ${
              activeTab === 'customers' ? 'text-red-600 dark:text-red-400' : 'text-gray-500'
            }`}
          >
            Müşteri
          </span>
        </button>

        {/* 5. Profil & Salon */}
        <button
          type="button"
          onClick={() => onTabChange('profile')}
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              activeTab === 'profile' ? 'btn-3d-red' : 'btn-3d-white'
            }`}
          >
            <User className="w-4.5 h-4.5" />
          </div>
          <span
            className={`text-[10px] mt-1 font-bold leading-none whitespace-nowrap ${
              activeTab === 'profile' ? 'text-red-600 dark:text-red-400' : 'text-gray-500'
            }`}
          >
            Profil
          </span>
        </button>
      </nav>
    </>
  );
};
