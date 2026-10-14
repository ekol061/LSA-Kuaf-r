import React from 'react';
import {
  X,
  Cloud,
  RefreshCw,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  HardDriveDownload,
  HardDriveUpload,
} from 'lucide-react';
import { DriveAccount, GoogleUser } from '../types';
import { CORPORATE_BARBER_AVATAR } from '../data/defaults';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  driveAccount: DriveAccount;
  googleUser: GoogleUser;
  isSyncing: boolean;
  onSignInDrivePopup: () => void;
  onLinkCurrentGoogleToDrive: () => void;
  onSignOutDrive: () => void;
  onBackupNow: () => void;
  onRestoreNow: () => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  driveAccount,
  googleUser,
  isSyncing,
  onSignInDrivePopup,
  onLinkCurrentGoogleToDrive,
  onSignOutDrive,
  onBackupNow,
  onRestoreNow,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl btn-3d-white flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md flex items-center justify-center mx-auto mb-3">
            {/* Official Google Drive Color Icon */}
            <svg className="w-8 h-8" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
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

          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Google Drive Giriş & Bulut Yedekleme
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Salon verilerinizi kendi kişisel Google Drive hesabınıza yedekleyin
          </p>
        </div>

        {/* Body */}
        {!driveAccount.isConnected ? (
          <div className="pt-5 space-y-3.5">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/80 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
              <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-red-600 shrink-0" />
                <span>Ayrı Google Drive Oturumu</span>
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                Google Drive hesabınızla giriş yaptığınızda randevular, müşteriler, personel ve kasa kayıtları doğrudan giriş yaptığınız Drive hesabına yedeklenir.
              </p>
            </div>

            {/* Option 1: Direct Google Drive OAuth Popup */}
            <button
              type="button"
              onClick={onSignInDrivePopup}
              disabled={isSyncing}
              className="w-full h-11 px-4 rounded-2xl btn-3d-red text-xs font-bold flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Cloud className="w-4 h-4 text-white shrink-0" />
              <span>Google Drive Hesabıyla Giriş Yap</span>
            </button>

            {/* Option 2: If already signed in to Google Manager, quick 1-click link */}
            {googleUser.isLoggedIn && (
              <button
                type="button"
                onClick={onLinkCurrentGoogleToDrive}
                disabled={isSyncing}
                className="w-full p-3 rounded-2xl btn-3d-white flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0 text-left">
                  <img
                    src={googleUser.photo || CORPORATE_BARBER_AVATAR}
                    alt={googleUser.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-red-600 shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = CORPORATE_BARBER_AVATAR;
                    }}
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-red-600 block">
                      Açık Google Hesabıyla Drive'a Bağlan
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
                      {googleUser.email}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-600 shrink-0">Bağla →</span>
              </button>
            )}

            <div className="pt-2 flex items-center gap-2 text-[10px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
              <span>
                Yalnızca kendi Google Drive hesabınızdaki L.S.A Kuaför yedek dosyasına erişilir.
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-4 space-y-4">
            {/* Connected Account Card */}
            <div className="flex items-center justify-between p-3.5 bg-green-50/60 dark:bg-green-950/25 border border-green-200 dark:border-green-900/60 rounded-2xl gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={driveAccount.photo || CORPORATE_BARBER_AVATAR}
                  alt={driveAccount.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-green-600 shrink-0"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = CORPORATE_BARBER_AVATAR;
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {driveAccount.name}
                    </h4>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-green-600 text-white rounded-md shrink-0">
                      Drive Aktif
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 font-mono truncate">
                    {driveAccount.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onSignOutDrive}
                className="h-8 px-2.5 rounded-xl btn-3d-white text-[11px] font-bold text-red-600 inline-flex items-center gap-1 cursor-pointer shrink-0"
                title="Drive Bağlantısını Kes"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Çıkış</span>
              </button>
            </div>

            {/* Backup Info */}
            <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700/80 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Son Google Drive Yedeği:
              </span>
              <span className="font-mono font-bold text-gray-900 dark:text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                {driveAccount.lastBackup || 'Hazır'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onBackupNow}
                disabled={isSyncing}
                className="h-11 px-3 rounded-2xl btn-3d-red text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <HardDriveUpload className="w-4 h-4 shrink-0" />
                )}
                <span>Drive'a Yedekle</span>
              </button>

              <button
                type="button"
                onClick={onRestoreNow}
                disabled={isSyncing}
                className="h-11 px-3 rounded-2xl btn-3d-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <HardDriveDownload className="w-4 h-4 text-red-600 shrink-0" />
                <span>Drive'dan Yükle</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
