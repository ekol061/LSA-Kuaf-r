import React from 'react';
import { Appointment, Service, Staff } from '../types';
import {
  X,
  Phone,
  MessageCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  Bell,
  BellOff,
  Send,
} from 'lucide-react';
import { formatTurkishDate, generateWhatsAppLink, CORPORATE_BARBER_AVATAR } from '../data/defaults';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  service?: Service;
  staff?: Staff;
  whatsappGreeting?: string;
  onComplete: (id: number) => void;
  onEdit: (app: Appointment) => void;
  onCancel: (id: number) => void;
  onSendManualMessage: (app: Appointment) => void;
  onSkipAutoMessage: (app: Appointment) => void;
  onTriggerCountdownPrompt: (app: Appointment) => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  onClose,
  service,
  staff,
  whatsappGreeting,
  onComplete,
  onEdit,
  onCancel,
  onSendManualMessage,
  onSkipAutoMessage,
  onTriggerCountdownPrompt,
}) => {
  if (!appointment) return null;

  const cleanPhone = appointment.phone ? appointment.phone.replace(/\D/g, '') : '';
  const template =
    whatsappGreeting ||
    'Merhaba Sayın {MUSTERI}, L.S.A Bay Kuaför {SAAT} randevunuzu hatırlatır, keyifli günler dileriz.';
  const previewText = template
    .replace('{MUSTERI}', appointment.customer)
    .replace('{SAAT}', appointment.time);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl relative my-8 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Randevu & Mesaj Seçeneği
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {appointment.customer}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl btn-3d-white text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Prominent Message Send / Don't Send Section */}
        <div className="p-3.5 rounded-2xl bg-green-50/60 dark:bg-green-950/20 border border-green-200/80 dark:border-green-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-green-600 shrink-0" />
              <span>Randevu Hatırlatma Mesajı</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300">
              {appointment.reminderStatus === 'sent'
                ? 'Gönderildi'
                : appointment.reminderStatus === 'skipped'
                ? 'İptal Edildi'
                : '1 Saat Kala Otomatik'}
            </span>
          </div>

          <p className="text-[11px] text-gray-600 dark:text-gray-300 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-200/70 dark:border-zinc-800 leading-relaxed">
            "{previewText}"
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onSendManualMessage(appointment);
                onClose();
              }}
              className="h-10 px-3 rounded-xl btn-3d-green text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>Mesaj Gönder</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSkipAutoMessage(appointment);
                onClose();
              }}
              className={`h-10 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none ${
                appointment.reminderStatus === 'skipped' ? 'btn-3d-red' : 'btn-3d-white text-red-600'
              }`}
            >
              <BellOff className="w-3.5 h-3.5 shrink-0" />
              <span>Mesaj Gönderme</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onTriggerCountdownPrompt(appointment);
            }}
            className="w-full h-9 px-3 rounded-xl btn-3d-white text-[11px] font-bold text-gray-700 dark:text-gray-200 inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>10 Sn Sayaçlı Otomatik Gönderimi Test Et</span>
          </button>
        </div>

        {/* 2. Barber & Time Info Card (No Price Displayed!) */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-2.5">
            <img
              src={staff?.photo || CORPORATE_BARBER_AVATAR}
              alt={staff?.name || 'Berber'}
              className="w-10 h-10 rounded-xl object-cover border-2 border-red-600 shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = CORPORATE_BARBER_AVATAR;
              }}
            />
            <div className="min-w-0">
              <span className="text-[10px] text-gray-400 font-semibold block">Berber</span>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {staff?.name}
              </h4>
              <p className="text-[10px] text-red-600 dark:text-red-400 truncate">
                {service?.name || 'Hizmet'}
              </p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <span className="text-[10px] text-gray-400 font-medium block mb-0.5">Tarih & Saat</span>
            <span className="font-bold text-gray-900 dark:text-white block font-mono text-[11px]">
              {formatTurkishDate(appointment.date)}
            </span>
            <span className="text-red-600 font-mono font-black text-sm block mt-0.5">
              {appointment.time}
            </span>
          </div>
        </div>

        {/* Customer Phone & Direct Call */}
        {appointment.phone && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {appointment.phone}
              </span>
            </div>

            <a
              href={`tel:${cleanPhone}`}
              className="h-8 px-3 btn-3d-white rounded-xl text-[11px] font-bold inline-flex items-center justify-center"
            >
              Telefonla Ara
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
          {appointment.status === 'bekliyor' && (
            <button
              type="button"
              onClick={() => {
                onComplete(appointment.id);
                onClose();
              }}
              className="w-full h-11 btn-3d-red font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>İşlemi Tamamla & Kasaya İşle</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onEdit(appointment);
                onClose();
              }}
              className="h-10 btn-3d-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Düzenle</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onCancel(appointment.id);
                onClose();
              }}
              className="h-10 btn-3d-white text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Randevuyu Sil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
