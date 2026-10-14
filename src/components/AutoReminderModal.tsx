import React, { useEffect, useState } from 'react';
import { Appointment } from '../types';
import { MessageCircle, BellRing, X, Check, Clock } from 'lucide-react';
import { generateWhatsAppLink } from '../data/defaults';
import { playMicStartBeep } from '../utils/soundEffects';

interface AutoReminderModalProps {
  appointment: Appointment | null;
  whatsappGreeting?: string;
  onConfirmSend: (app: Appointment) => void;
  onSkipSend: (app: Appointment) => void;
}

export const AutoReminderModal: React.FC<AutoReminderModalProps> = ({
  appointment,
  whatsappGreeting,
  onConfirmSend,
  onSkipSend,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (!appointment) return;
    setSecondsLeft(10);
    playMicStartBeep();

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [appointment?.id]);

  // When countdown reaches 0 without user response, send automatically!
  useEffect(() => {
    if (appointment && secondsLeft === 0) {
      onConfirmSend(appointment);
    }
  }, [secondsLeft, appointment]);

  if (!appointment) return null;

  const template =
    whatsappGreeting ||
    'Merhaba Sayın {MUSTERI}, L.S.A Bay Kuaför {SAAT} randevunuzu hatırlatır, keyifli günler dileriz.';
  const messagePreview = template
    .replace('{MUSTERI}', appointment.customer)
    .replace('{SAAT}', appointment.time);

  const progressPercent = (secondsLeft / 10) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border-2 border-red-600 rounded-3xl w-full max-w-sm p-5 shadow-2xl relative overflow-hidden space-y-4">
        {/* Top Countdown Progress Bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl btn-3d-red flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 block">
                Otomatik Randevu Hatırlatma
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Mesaj Gönderilsin mi?
              </h3>
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex flex-col items-center justify-center shrink-0">
            <span className="text-sm font-black font-mono text-red-600 dark:text-red-400 leading-none">
              {secondsLeft}
            </span>
            <span className="text-[8px] font-bold text-red-500 uppercase">sn</span>
          </div>
        </div>

        {/* Appointment Info */}
        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200/80 dark:border-zinc-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {appointment.customer}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-red-600 text-white text-xs font-mono font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {appointment.time}
            </span>
          </div>
          {appointment.phone && (
            <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
              Tel: {appointment.phone}
            </p>
          )}
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">
            "{messagePreview}"
          </div>
        </div>

        <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 font-medium">
          Cevap vermezseniz <strong className="text-red-600 dark:text-red-400">{secondsLeft} saniye</strong> içinde otomatik olarak gönderilecektir.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onSkipSend(appointment)}
            className="h-11 px-3 rounded-2xl btn-3d-white text-xs font-bold text-red-600 inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4 shrink-0" />
            <span>Gönderme</span>
          </button>

          <button
            type="button"
            onClick={() => onConfirmSend(appointment)}
            className="h-11 px-3 rounded-2xl btn-3d-green text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white shrink-0" />
            <span>Gönder ({secondsLeft}s)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
