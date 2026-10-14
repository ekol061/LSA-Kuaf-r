import React, { useState } from 'react';
import { X, ShieldCheck, UserPlus, Check, Mail, User } from 'lucide-react';
import { GoogleUser } from '../types';
import { CORPORATE_BARBER_AVATAR, formatTurkishDate, getTodayDateString, getCurrentTimeString } from '../data/defaults';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: GoogleUser;
  onSignInSuccess: (user: GoogleUser) => void;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignInSuccess,
}) => {
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const presetAccounts = [
    {
      name: 'İbrahim Emre Kol',
      email: 'ibrahimemrekol@gmail.com',
      photo: CORPORATE_BARBER_AVATAR,
      role: 'Salon Kurucusu & Yönetici',
    },
    ...(currentUser.email && currentUser.email !== 'ibrahimemrekol@gmail.com'
      ? [
          {
            name: currentUser.name || 'Salon Yöneticisi',
            email: currentUser.email,
            photo: currentUser.photo || CORPORATE_BARBER_AVATAR,
            role: 'Kayıtlı Yönetici Hesabı',
          },
        ]
      : []),
  ];

  const completeSignIn = (name: string, email: string, photo: string) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onSignInSuccess({
        isLoggedIn: true,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        photo: photo || CORPORATE_BARBER_AVATAR,
        isDriveConnected: true,
        lastDriveBackup: `${formatTurkishDate(getTodayDateString())} ${getCurrentTimeString()}`,
      });
      onClose();
    }, 450);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const finalEmail = customEmail.includes('@')
      ? customEmail.trim()
      : `${customEmail.trim()}@gmail.com`;
    const finalName =
      customName.trim() ||
      finalEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

    completeSignIn(finalName, finalEmail, CORPORATE_BARBER_AVATAR);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl btn-3d-white flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Google Corporate Header */}
        <div className="text-center pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Google ile Oturum Açın
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            L.S.A Bay Kuaför Yönetici & Drive Bulut Yedekleme
          </p>
        </div>

        {isAuthenticating ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Google Hesabı ve Drive Yedekleme Bağlanıyor...
            </p>
          </div>
        ) : !useCustomAccount ? (
          <div className="pt-4 space-y-2.5">
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 px-1">
              Devam etmek için bir Google hesabı seçin:
            </p>

            {presetAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => completeSignIn(acc.name, acc.email, acc.photo)}
                className="w-full p-3 rounded-2xl btn-3d-white flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={acc.photo}
                    alt={acc.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-red-600 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {acc.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                      {acc.email}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 shrink-0 ml-2">
                  Bağlan →
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setUseCustomAccount(true)}
              className="w-full p-3 rounded-2xl btn-3d-white flex items-center gap-3 text-left cursor-pointer mt-2"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Başka bir Google hesabı kullan
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Farklı bir Gmail yönetici hesabı ile giriş yapın
                </p>
              </div>
            </button>

            <div className="pt-3 flex items-center gap-2 text-[10px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
              <span>
                Giriş yaptığınızda verileriniz kendi Google Drive hesabınızla senkronize edilir.
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="pt-4 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                Yönetici Adı Soyadı
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Örn: İbrahim Emre Kol"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                Google / Gmail Adresi *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="ornek@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white font-mono focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setUseCustomAccount(false)}
                className="px-3.5 py-2.5 rounded-xl btn-3d-white text-xs font-bold cursor-pointer"
              >
                Geri Dön
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl btn-3d-red text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Google ile Giriş Yap</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
