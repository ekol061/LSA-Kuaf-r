import React, { useState } from 'react';
import { SalonSettings, GoogleUser, DriveAccount } from '../types';
import {
  MapPin,
  MessageCircle,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Cloud,
  RefreshCw,
  HardDrive,
  Send,
  Check,
  LogIn,
  Smartphone,
} from 'lucide-react';
import { CORPORATE_BARBER_AVATAR } from '../data/defaults';
import { PWAInstallButton } from './PWAInstallButton';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ProfileTabProps {
  salonSettings: SalonSettings;
  googleUser: GoogleUser;
  driveAccount: DriveAccount;
  themeMode: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onUpdateSettings: (settings: SalonSettings) => void;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onOpenDriveModal: () => void;
  onDriveSignOut: () => void;
  onExportData: () => void;
  onOpenBackupModal: () => void;
  onDriveBackup: () => void;
  onDriveRestore: () => void;
  isDriveSyncing?: boolean;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  salonSettings,
  googleUser,
  driveAccount,
  themeMode,
  onThemeChange,
  onUpdateSettings,
  onGoogleSignIn,
  onGoogleSignOut,
  onOpenDriveModal,
  onDriveSignOut,
  onExportData,
  onOpenBackupModal,
  onDriveBackup,
  onDriveRestore,
  isDriveSyncing = false,
}) => {
  const [mapsLink, setMapsLink] = useState(
    salonSettings.address || 'https://maps.google.com/?q=40.9829,29.0284'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [whatsappGreeting, setWhatsappGreeting] = useState(
    salonSettings.whatsappGreeting ||
      'Merhaba Sayın {MUSTERI}, L.S.A Bay Kuaför {SAAT} randevunuzu hatırlatır, keyifli günler dileriz.'
  );
  const [whatsappSavedToast, setWhatsappSavedToast] = useState(false);

  const handleSaveMapsLink = () => {
    onUpdateSettings({
      ...salonSettings,
      address: mapsLink.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleShareOnWhatsApp = () => {
    const cleanLink = mapsLink.trim() || 'https://maps.google.com/?q=40.9829,29.0284';
    const text = `L.S.A Bay Kuaför Salon Konumumuz:\n${cleanLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleSaveWhatsAppTemplate = () => {
    onUpdateSettings({
      ...salonSettings,
      whatsappGreeting: whatsappGreeting.trim(),
    });
    setWhatsappSavedToast(true);
    setTimeout(() => setWhatsappSavedToast(false), 2200);
  };

  const handleTestWhatsAppMessage = () => {
    const sampleMsg = whatsappGreeting
      .replace('{MUSTERI}', 'Ahmet Bey')
      .replace('{SAAT}', '14:30');
    window.open(
      `https://wa.me/?text=${encodeURIComponent(sampleMsg)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="space-y-4">
      {/* 0. Mobile App Install Section (PWA) */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl btn-3d-red flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xs font-bold text-gray-900 dark:text-white">
            Mobil Uygulama Kurulumu
          </h3>
        </div>
        <PWAInstallButton />
      </div>

      {/* 1. Theme Selector (Clean - No Subtitles) */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white">
          Tema Görünümü
        </h3>

        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-gray-100 dark:bg-zinc-800/90 rounded-2xl border border-gray-200/60 dark:border-zinc-700/60 sm:w-auto">
          <button
            type="button"
            onClick={() => onThemeChange('light')}
            className={`h-9 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none ${
              themeMode === 'light' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 shrink-0" />
            <span>Beyaz</span>
          </button>

          <button
            type="button"
            onClick={() => onThemeChange('dark')}
            className={`h-9 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none ${
              themeMode === 'dark' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5 shrink-0" />
            <span>Siyah</span>
          </button>

          <button
            type="button"
            onClick={() => onThemeChange('auto')}
            className={`h-9 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none ${
              themeMode === 'auto' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Otomatik</span>
          </button>
        </div>
      </div>

      {/* 2. WhatsApp Otomatik Randevu Mesajı Şablonu */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl btn-3d-green flex items-center justify-center shrink-0">
              <MessageCircle className="w-4.5 h-4.5 fill-white" />
            </div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white">
              WhatsApp Otomatik Randevu Mesajı
            </h3>
          </div>

          {whatsappSavedToast && (
            <span className="text-xs font-bold text-green-600 flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" /> Kaydedildi
            </span>
          )}
        </div>

        <textarea
          rows={2}
          value={whatsappGreeting}
          onChange={(e) => setWhatsappGreeting(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-green-600 resize-none"
        />

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleSaveWhatsAppTemplate}
            className="h-10 px-3.5 rounded-xl btn-3d-green text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none"
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>Şablonu Kaydet</span>
          </button>

          <button
            type="button"
            onClick={handleTestWhatsAppMessage}
            className="h-10 px-3.5 rounded-xl btn-3d-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none"
          >
            <Send className="w-3.5 h-3.5 text-green-600 shrink-0" />
            <span>Test Et</span>
          </button>
        </div>
      </div>

      {/* 3. Google Yönetici Hesabı Girişi */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl btn-3d-red flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white">
              Google Yönetici Hesabı
            </h3>
          </div>

          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border shrink-0 ${
              googleUser.isLoggedIn
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800'
                : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700'
            }`}
          >
            {googleUser.isLoggedIn ? 'Açık' : 'Kapalı'}
          </span>
        </div>

        {googleUser.isLoggedIn ? (
          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-200/80 dark:border-zinc-700/80 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={googleUser.photo || CORPORATE_BARBER_AVATAR}
                alt={googleUser.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-red-600 shadow-sm shrink-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = CORPORATE_BARBER_AVATAR;
                }}
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {googleUser.name}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                  {googleUser.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onGoogleSignOut}
              className="h-9 px-3 rounded-xl btn-3d-white text-xs font-bold text-red-600 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onGoogleSignIn}
            className="w-full h-10 px-4 btn-3d-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap leading-none"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google ile Giriş Yap</span>
          </button>
        )}
      </div>

      {/* 4. Separate Google Drive Giriş Ekranı */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl btn-3d-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                  fill="#0066da"
                />
                <path
                  d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
                  fill="#00ac47"
                />
                <path
                  d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
                  fill="#ea4335"
                />
                <path
                  d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
                  fill="#00832d"
                />
                <path
                  d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
                  fill="#2684fc"
                />
                <path
                  d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
                  fill="#ffba00"
                />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white">
              Google Drive Yedekleme
            </h3>
          </div>

          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border shrink-0 ${
              driveAccount.isConnected
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800'
                : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700'
            }`}
          >
            {driveAccount.isConnected ? 'Bağlı' : 'Bağlı Değil'}
          </span>
        </div>

        {driveAccount.isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-green-50/50 dark:bg-green-950/20 rounded-2xl border border-green-200/80 dark:border-green-900/50 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={driveAccount.photo || CORPORATE_BARBER_AVATAR}
                  alt={driveAccount.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-green-600 shrink-0"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = CORPORATE_BARBER_AVATAR;
                  }}
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {driveAccount.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                    {driveAccount.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onDriveSignOut}
                className="h-8 px-2.5 rounded-xl btn-3d-white text-[11px] font-bold text-red-600 inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Çıkış</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onDriveBackup}
                disabled={isDriveSyncing}
                className="h-10 px-3 btn-3d-red text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap leading-none"
              >
                <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isDriveSyncing ? 'animate-spin' : ''}`} />
                <span>Drive'a Yedekle</span>
              </button>

              <button
                type="button"
                onClick={onDriveRestore}
                disabled={isDriveSyncing}
                className="h-10 px-3 btn-3d-white text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap leading-none"
              >
                <Cloud className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Drive'dan Yükle</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenDriveModal}
            className="w-full h-10 px-4 btn-3d-red rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap leading-none"
          >
            <LogIn className="w-4 h-4 shrink-0" />
            <span>Google Drive Giriş Ekranı</span>
          </button>
        )}
      </div>

      {/* 5. Salon Location */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl btn-3d-red flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white">Salon Konumu</h3>
          </div>

          {savedSuccess && (
            <span className="text-xs text-green-600 font-bold flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" /> Kaydedildi
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="https://maps.app.goo.gl/..."
            value={mapsLink}
            onChange={(e) => setMapsLink(e.target.value)}
            className="flex-1 h-10 px-3.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white font-mono focus:outline-none focus:border-red-600"
          />
          <button
            type="button"
            onClick={handleSaveMapsLink}
            className="h-10 px-4 btn-3d-red text-xs font-bold rounded-xl inline-flex items-center justify-center cursor-pointer whitespace-nowrap leading-none shrink-0"
          >
            Kaydet
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleShareOnWhatsApp}
            className="h-10 px-3.5 btn-3d-green font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none"
          >
            <MessageCircle className="w-4 h-4 fill-white shrink-0" />
            <span>Konumu Paylaş</span>
          </button>

          <a
            href={mapsLink || 'https://maps.google.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-3.5 btn-3d-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap leading-none"
          >
            <ExternalLink className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Haritada Aç</span>
          </a>
        </div>
      </div>

      {/* 6. Local JSON Backup */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl btn-3d-dark flex items-center justify-center shrink-0">
            <HardDrive className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate">
            Cihaza Yedek
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenBackupModal}
            className="h-9 px-3.5 text-xs font-bold btn-3d-white rounded-xl inline-flex items-center justify-center cursor-pointer whitespace-nowrap leading-none"
          >
            Yükle
          </button>
          <button
            type="button"
            onClick={onExportData}
            className="h-9 px-3.5 text-xs font-bold btn-3d-red rounded-xl inline-flex items-center justify-center cursor-pointer whitespace-nowrap leading-none"
          >
            İndir
          </button>
        </div>
      </div>
    </div>
  );
};
