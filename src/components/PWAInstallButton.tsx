import React, { useState } from 'react';
import { Smartphone, X, Share, PlusSquare, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { LsaLogo } from './LsaLogo';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleTrigger = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={handleTrigger}
          className="h-9 sm:h-10 px-2.5 sm:px-3 text-xs font-bold btn-3d-white rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none"
          title="Telefona Uygulama Olarak Yükle"
        >
          <Smartphone className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span className="hidden sm:inline">Telefona Kur</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleTrigger}
          className="h-10 px-4 btn-3d-red rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap leading-none shrink-0"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Telefona Uygulama Olarak Yükle</span>
        </button>
      )}

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl btn-3d-white flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-zinc-800">
              <LsaLogo size={48} />
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  L.S.A Bay Kuaför Mobil Uygulama
                </h3>
                <span className="text-[11px] text-red-600 font-bold">
                  Ana Ekrana Ekle & Tam Ekran Kullan
                </span>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/70">
                  <Share className="w-5 h-5 text-red-600 shrink-0" />
                  <span>
                    1. Safari alt menüsündeki <strong>Paylaş</strong> tuşuna dokunun.
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/70">
                  <PlusSquare className="w-5 h-5 text-red-600 shrink-0" />
                  <span>
                    2. <strong>Ana Ekrana Ekle</strong> seçeneğine dokunup <strong>Ekle</strong> deyin.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/70">
                  <Smartphone className="w-5 h-5 text-red-600 shrink-0" />
                  <span>
                    1. Tarayıcınızın sağ üst köşesindeki <strong>Menü (⋮)</strong> simgesine dokunun.
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/70">
                  <PlusSquare className="w-5 h-5 text-red-600 shrink-0" />
                  <span>
                    2. <strong>Uygulamayı Yükle</strong> veya <strong>Ana Ekrana Ekle</strong> seçeneğine dokunun.
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full h-10 rounded-xl btn-3d-red text-xs font-bold cursor-pointer"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </>
  );
};
