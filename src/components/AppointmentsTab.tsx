import React, { useState, useMemo } from 'react';
import { Appointment, Service, Staff } from '../types';
import {
  MessageCircle,
  Trash2,
  Edit2,
  CalendarCheck,
  Search,
  Check,
} from 'lucide-react';
import {
  formatTurkishDate,
  getTodayDateString,
  CORPORATE_BARBER_AVATAR,
} from '../data/defaults';
import { MonthlyCalendar } from './MonthlyCalendar';

interface AppointmentsTabProps {
  appointments: Appointment[];
  services: Service[];
  staffList: Staff[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onCompleteAppointment: (id: number) => void;
  onCancelAppointment: (id: number) => void;
  onEditAppointment: (app: Appointment) => void;
  onOpenManualModal: () => void;
  onOpenNewAppointmentForDate: (date: string) => void;
  onViewAppointmentDetails: (app: Appointment) => void;
  whatsappGreeting?: string;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  appointments,
  services,
  staffList,
  selectedDate,
  onSelectDate,
  onCompleteAppointment,
  onCancelAppointment,
  onEditAppointment,
  onOpenNewAppointmentForDate,
  onViewAppointmentDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = getTodayDateString();

  const daytimeAppointments = useMemo(() => {
    return appointments
      .filter((app) => {
        if (app.date !== selectedDate) return false;
        if (app.status !== 'bekliyor') return false;
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          return (
            app.customer.toLowerCase().includes(q) ||
            app.phone.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate, searchTerm]);

  return (
    <div className="space-y-5">
      {/* 1. Daytime Appointments Section */}
      <section className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app space-y-3.5 overflow-hidden">
        {/* Section Top Header (Clean - No Explanatory Subtitles) */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 gap-2">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
            {selectedDate === todayStr ? 'Gündüz Randevuları' : 'Randevu Listesi'}
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold whitespace-nowrap">
            {formatTurkishDate(selectedDate)}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Müşteri adı veya telefon ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600 transition"
          />
        </div>

        {/* Appointments Cards (Clean Mobile Layout - Zero Overflow) */}
        <div className="space-y-3">
          {daytimeAppointments.length === 0 ? (
            <div className="text-center py-9 bg-gray-50/70 dark:bg-zinc-800/40 rounded-2xl border border-gray-200/70 dark:border-zinc-800">
              <CalendarCheck className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Bekleyen randevu bulunmuyor.
              </p>
            </div>
          ) : (
            daytimeAppointments.map((app) => {
              const staff = staffList.find((s) => s.id === app.staffId) || staffList[0];
              const service = services.find((s) => s.id === app.serviceId) || services[0];

              return (
                <div
                  key={app.id}
                  onClick={() => onViewAppointmentDetails(app)}
                  className="group rounded-2xl p-3.5 border border-gray-200/90 dark:border-zinc-800 hover:border-red-400 dark:hover:border-red-800 transition-all duration-200 cursor-pointer bg-white dark:bg-zinc-900 card-app overflow-hidden"
                >
                  {/* Top Row: Barber Avatar, Customer Info & Time Badge */}
                  <div className="flex items-center justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={staff?.photo || CORPORATE_BARBER_AVATAR}
                        alt={staff?.name || 'Berber'}
                        className="w-11 h-11 rounded-2xl object-cover border-2 border-red-600 shadow-sm shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = CORPORATE_BARBER_AVATAR;
                        }}
                      />

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {app.customer}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          <span>{service?.name}</span>
                          <span className="mx-1">·</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {staff?.name}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Corporate 3D Time Block */}
                    <span className="h-8 px-2.5 text-xs font-mono font-bold btn-3d-red rounded-xl inline-flex items-center justify-center leading-none shrink-0">
                      {app.time}
                    </span>
                  </div>

                  {/* Symmetrical Bottom Action Bar (Fits 100% on Mobile without Overflow) */}
                  <div
                    className="flex items-center justify-between gap-2 pt-2.5 border-t border-gray-100 dark:border-zinc-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewAppointmentDetails(app)}
                        className="w-9 h-9 rounded-xl btn-3d-green inline-flex items-center justify-center shrink-0 cursor-pointer"
                        title="Mesaj Seçeneği"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditAppointment(app)}
                        className="w-9 h-9 rounded-xl btn-3d-white inline-flex items-center justify-center cursor-pointer shrink-0"
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onCancelAppointment(app.id)}
                        className="w-9 h-9 rounded-xl btn-3d-white inline-flex items-center justify-center cursor-pointer shrink-0"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>

                    {app.status === 'bekliyor' && (
                      <button
                        type="button"
                        onClick={() => onCompleteAppointment(app.id)}
                        className="h-9 px-4 btn-3d-red text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none shrink-0"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Tamamla</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 2. Monthly Calendar */}
      <MonthlyCalendar
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        appointments={appointments}
        staffList={staffList}
        services={services}
        onOpenNewAppointmentForDate={onOpenNewAppointmentForDate}
        onCompleteAppointment={onCompleteAppointment}
        onViewAppointmentDetails={onViewAppointmentDetails}
      />
    </div>
  );
};
