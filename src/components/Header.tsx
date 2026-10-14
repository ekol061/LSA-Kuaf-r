import React, { useState, useEffect } from 'react';
import { Plus, Download } from 'lucide-react';
import { formatTurkishDate, getTodayDateString } from '../data/defaults';
import { LsaLogo } from './LsaLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenManualModal: () => void;
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenManualModal,
  onOpenBackupModal,
}) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = getTodayDateString();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-200/80 dark:border-zinc-800/80 px-3 sm:px-6 py-2.5 shadow-xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: High-Contrast Brand Logo & Clean Brand Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <LsaLogo size={42} />
          <h1 className="font-black text-xs sm:text-base tracking-wide text-gray-900 dark:text-white uppercase whitespace-nowrap leading-none">
            L.S.A BAY KUAFÖR
          </h1>
        </div>

        {/* Center: Live Date & Time (Desktop) */}
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
          <span>{formatTurkishDate(todayStr)}</span>
          <span className="text-gray-300 dark:text-zinc-700">·</span>
          <span className="font-mono font-bold text-red-600 dark:text-red-400">{currentTime}</span>
        </div>

        {/* Right: Mobile Install Button + Backup + New Appointment */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <PWAInstallButton compact />

          <button
            type="button"
            onClick={onOpenBackupModal}
            className="h-9 sm:h-10 px-2.5 sm:px-3 text-xs font-bold btn-3d-white rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none"
            title="Veri Yedekleme"
          >
            <Download className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="hidden sm:inline">Yedek</span>
          </button>

          <button
            type="button"
            onClick={onOpenManualModal}
            className="h-9 sm:h-10 px-3 sm:px-3.5 text-xs font-bold btn-3d-red rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none"
          >
            <Plus className="w-3.5 h-3.5 text-white stroke-[3] shrink-0" />
            <span>Randevu Ekle</span>
          </button>
        </div>
      </div>
    </header>
  );
};
