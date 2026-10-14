import React, { useRef } from 'react';
import { Download, Upload, RotateCcw, AlertTriangle, X, CheckCircle2, Database } from 'lucide-react';
import { Appointment, Service, Staff, Transaction } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (data: any) => void;
  onLoadDemo: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  onLoadDemo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        onImport(parsed);
        onClose();
      } catch (err: any) {
        alert('Geçersiz JSON dosyası: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Veri Yedekleme</h3>
              <p className="text-[11px] text-gray-500">JSON dosya yedekleme ve geri yükleme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => {
              onExport();
              onClose();
            }}
            className="w-full p-3 bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-800 dark:text-white flex items-center justify-between transition cursor-pointer"
          >
            <div className="text-left">
              <span>Yedek Dosyası İndir</span>
              <p className="text-[10px] text-gray-400 font-normal">Tüm randevuları ve kasayı kaydet</p>
            </div>
            <Download className="w-4 h-4 text-red-600" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-800 dark:text-white flex items-center justify-between transition cursor-pointer"
          >
            <div className="text-left">
              <span>Yedekten Geri Yükle</span>
              <p className="text-[10px] text-gray-400 font-normal">Cihazdan JSON dosyası yükle</p>
            </div>
            <Upload className="w-4 h-4 text-red-600" />
          </button>

          <button
            onClick={() => {
              if (confirm('Örnek veriler yüklensin mi?')) {
                onLoadDemo();
                onClose();
              }
            }}
            className="w-full p-3 bg-red-50/60 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-2xl border border-red-100 dark:border-red-900/40 text-xs font-bold text-red-900 dark:text-red-300 flex items-center justify-between transition cursor-pointer"
          >
            <div className="text-left">
              <span>Örnek Demo Verileri Doldur</span>
              <p className="text-[10px] text-red-600 dark:text-red-400 font-normal">Test için randevu ve ciroları yükle</p>
            </div>
            <RotateCcw className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
