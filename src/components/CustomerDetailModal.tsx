import React from 'react';
import { Customer, Appointment, Service, Staff, Transaction } from '../types';
import {
  X,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  FileText,
  Plus,
  History,
} from 'lucide-react';
import { formatTurkishDate, formatCurrency, generateWhatsAppLink } from '../data/defaults';

interface CustomerDetailModalProps {
  customer: Customer | null;
  onClose: () => void;
  appointments: Appointment[];
  transactions: Transaction[];
  services: Service[];
  staffList: Staff[];
  onOpenNewAppointment: (customerName: string, customerPhone: string) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  appointments,
  transactions,
  services,
  staffList,
  onOpenNewAppointment,
}) => {
  if (!customer) return null;

  // Find all past appointments for this customer
  const customerAppointments = appointments
    .filter(
      (a) =>
        a.customer.toLowerCase().trim() === customer.name.toLowerCase().trim() ||
        (customer.phone && a.phone.replace(/\D/g, '') === customer.phone.replace(/\D/g, ''))
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

  // Calculate total spending and visits
  const totalSpent = customerAppointments
    .filter((a) => a.status === 'tamamlandi')
    .reduce((sum, a) => {
      const s = services.find((srv) => srv.id === a.serviceId);
      return sum + (s?.price || 0);
    }, 0);

  const cleanPhone = customer.phone ? customer.phone.replace(/\D/g, '') : '';
  const whatsappUrl = customer.phone
    ? `https://wa.me/${cleanPhone.startsWith('90') ? cleanPhone : '90' + cleanPhone}?text=${encodeURIComponent(
        `Merhaba Sayın ${customer.name}, L.S.A Bay Kuaför'den yazıyoruz.`
      )}`
    : '';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-600 text-white font-black text-lg flex items-center justify-center shrink-0 border-2 border-white dark:border-zinc-800 shadow-sm">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {customer.name}
              </h3>
              <p className="text-xs text-gray-500 font-mono">{customer.phone}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-black dark:hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4 shrink-0">
          {customer.phone ? (
            <a
              href={`tel:${cleanPhone}`}
              className="py-2 px-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-900 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Ara</span>
            </a>
          ) : (
            <div />
          )}

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          ) : (
            <div />
          )}

          <button
            onClick={() => {
              onOpenNewAppointment(customer.name, customer.phone);
              onClose();
            }}
            className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Randevu</span>
          </button>
        </div>

        {/* Lifetime Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 shrink-0">
          <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-800 text-center">
            <span className="text-[10px] text-gray-400 block font-medium">Toplam Ziyaret</span>
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {customerAppointments.length} Kez
            </span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-800 text-center">
            <span className="text-[10px] text-gray-400 block font-medium">Toplam Harcama</span>
            <span className="text-base font-black font-mono text-red-600 dark:text-red-400">
              {formatCurrency(totalSpent)}
            </span>
          </div>
        </div>

        {/* Customer Notes */}
        {customer.notes && (
          <div className="p-3 bg-red-50/60 dark:bg-red-950/20 border border-red-200/50 rounded-2xl mb-4 text-xs text-red-900 dark:text-red-200 shrink-0">
            <span className="text-[10px] font-bold text-red-700 dark:text-red-400 block mb-0.5">
              Müşteri Özel Notu:
            </span>
            <p>{customer.notes}</p>
          </div>
        )}

        {/* Past Transactions & History List ("eski işlemler gözüksün") */}
        <div className="flex-1 overflow-y-auto pr-1">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5 sticky top-0 bg-white dark:bg-zinc-900 py-1">
            <History className="w-3.5 h-3.5 text-red-600" />
            <span>Eski İşlemler & Randevu Geçmişi ({customerAppointments.length})</span>
          </h4>

          {customerAppointments.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 dark:bg-zinc-800/40 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <p className="text-xs text-gray-400">Henüz kayıtlı geçmiş işlem bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customerAppointments.map((app) => {
                const srv = services.find((s) => s.id === app.serviceId);
                const st = staffList.find((s) => s.id === app.staffId);

                return (
                  <div
                    key={app.id}
                    className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {srv?.name || 'Hizmet'}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                            app.status === 'tamamlandi'
                              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                              : app.status === 'iptal'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {app.status === 'tamamlandi'
                            ? 'Tamamlandı'
                            : app.status === 'iptal'
                            ? 'İptal'
                            : 'Bekliyor'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatTurkishDate(app.date)} · {app.time} · Usta:{' '}
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {st?.name || 'Personel'}
                        </span>
                      </p>
                    </div>

                    <span className="text-xs font-black font-mono text-gray-900 dark:text-white shrink-0">
                      {srv?.price || 0} ₺
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
