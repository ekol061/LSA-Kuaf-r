import React, { useState, useEffect, useRef } from 'react';
import { Staff } from '../types';
import { X, User, Phone, Briefcase, Clock, Trash2, Check, Upload, Loader2, Mic } from 'lucide-react';
import { playMicStartBeep, playMicStopBeep } from '../utils/soundEffects';
import { parseTurkishStaffVoiceInput } from '../utils/voiceParser';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffData: Omit<Staff, 'id'>, existingId?: number) => void;
  onDelete?: (id: number) => void;
  staffToEdit?: Staff | null;
}

const compressStaffImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const rawDataUrl = readerEvent.target?.result as string;
      if (!rawDataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed);
        } catch {
          resolve(rawDataUrl);
        }
      };

      img.onerror = () => {
        resolve(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      resolve('');
    };

    reader.readAsDataURL(file);
  });
};

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  staffToEdit,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Usta Berber');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');
  const [workingHours, setWorkingHours] = useState('09:00 - 20:00');
  const [commissionRate, setCommissionRate] = useState('50');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isListeningModal, setIsListeningModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRecognitionRef = useRef<any>(null);

  useEffect(() => {
    if (staffToEdit) {
      setName(staffToEdit.name || '');
      setRole(staffToEdit.role || 'Usta Berber');
      setPhone(staffToEdit.phone || '');
      setPhoto(staffToEdit.photo || '');
      setWorkingHours(staffToEdit.workingHours || '09:00 - 20:00');
      setCommissionRate(String(staffToEdit.commissionRate ?? 50));
    } else {
      setName('');
      setRole('Usta Berber');
      setPhone('');
      setPhoto('');
      setWorkingHours('09:00 - 20:00');
      setCommissionRate('50');
    }

    return () => {
      if (modalRecognitionRef.current) {
        try {
          modalRecognitionRef.current.abort();
        } catch {}
        modalRecognitionRef.current = null;
      }
      setIsListeningModal(false);
    };
  }, [staffToEdit, isOpen]);

  if (!isOpen) return null;

  const handleVoiceFill = () => {
    if (isListeningModal && modalRecognitionRef.current) {
      playMicStopBeep();
      try {
        modalRecognitionRef.current.abort();
      } catch {}
      modalRecognitionRef.current = null;
      setIsListeningModal(false);
      return;
    }

    playMicStartBeep();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListeningModal(true);
      };

      recognition.onresult = (event: any) => {
        let spoken = '';
        for (let i = 0; i < event.results.length; i++) {
          spoken += event.results[i][0].transcript + ' ';
        }
        const parsed = parseTurkishStaffVoiceInput(spoken);
        if (parsed.name) setName(parsed.name);
        if (parsed.role) setRole(parsed.role);
        if (parsed.commissionRate !== undefined) {
          setCommissionRate(String(parsed.commissionRate));
        }
        if (parsed.phone) setPhone(parsed.phone);
      };

      recognition.onerror = () => {
        setIsListeningModal(false);
      };

      recognition.onend = () => {
        setIsListeningModal(false);
      };

      modalRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListeningModal(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingPhoto(true);
      const compressedDataUrl = await compressStaffImage(file);
      if (compressedDataUrl) {
        setPhoto(compressedDataUrl);
      }
    } catch (err) {
      console.warn('Fotoğraf sıkıştırma hatası:', err);
    } finally {
      setIsProcessingPhoto(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rateVal = parseInt(commissionRate, 10);

    onSave(
      {
        name: name.trim(),
        role: role.trim() || 'Usta Berber',
        phone: phone.trim(),
        photo: photo.trim(),
        workingHours: workingHours.trim(),
        commissionRate: isNaN(rateVal) || rateVal < 0 ? 50 : rateVal,
      },
      staffToEdit?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {staffToEdit ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}
            </h3>
            <p className="text-[11px] text-gray-500">Berber ve usta bilgilerini güncelleyin</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleVoiceFill}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                isListeningModal ? 'btn-3d-red animate-pulse' : 'btn-3d-white text-red-600'
              }`}
              title="Sesle Personel Bilgisi Gir"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isListeningModal ? 'Dinliyor...' : 'Sesle Gir'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-black dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Direct Photo Upload Card */}
          <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-200/80 dark:border-zinc-800 flex items-center gap-3.5">
            <div className="relative shrink-0">
              {photo ? (
                <img
                  src={photo}
                  alt={name || 'Personel'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-red-600 shadow-md"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&fit=crop&crop=face';
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl btn-3d-dark text-white font-bold text-lg flex items-center justify-center">
                  {name ? name.slice(0, 2).toUpperCase() : <User className="w-7 h-7 text-red-500" />}
                </div>
              )}
              {isProcessingPhoto && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 block mb-1">
                Personel Fotoğrafı
              </span>
              <p className="text-[10px] text-gray-400 mb-2">Galeriden doğrudan fotoğraf seçin</p>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isProcessingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 btn-3d-red text-[11px] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPhoto ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  <span>{photo ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}</span>
                </button>

                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto('')}
                    className="px-2.5 py-1.5 text-[11px] font-bold btn-3d-white text-red-600 rounded-xl cursor-pointer"
                  >
                    Kaldır
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Adı Soyadı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: İbrahim Emre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Role & Commission Percentage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Unvan / Görev
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Usta Berber"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Ciro Payı (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="50"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full px-3 pr-7 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white font-mono font-bold focus:outline-none focus:border-red-600"
                />
                <span className="text-xs font-bold text-red-600 absolute right-3 top-1/2 -translate-y-1/2">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Phone & Working Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Telefon
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="0532..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white font-mono focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Mesai Saatleri
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="09:00 - 20:00"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {staffToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(staffToEdit.id);
                  onClose();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sil</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isProcessingPhoto}
              className="flex-1 py-3 btn-3d-red text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{staffToEdit ? 'Değişiklikleri Kaydet' : 'Personeli Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
