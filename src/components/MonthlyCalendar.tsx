import React, { useState } from 'react';
import { Appointment, Staff, Service } from '../types';
import { ChevronLeft, ChevronRight, Calendar, Check, MessageCircle } from 'lucide-react';
import { formatTurkishDate, CORPORATE_BARBER_AVATAR } from '../data/defaults';

interface MonthlyCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  appointments: Appointment[];
  staffList: Staff[];
  services: Service[];
  onOpenNewAppointmentForDate: (date: string) => void;
  onCompleteAppointment: (id: number) => void;
  onViewAppointmentDetails?: (app: Appointment) => void;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  selectedDate,
  onSelectDate,
  appointments,
  staffList,
  services,
  onCompleteAppointment,
  onViewAppointmentDetails,
}) => {
  const [currentYear, setCurrentYear] = useState(() => {
    const [y] = selectedDate.split('-').map(Number);
    return y || new Date().getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const [, m] = selectedDate.split('-').map(Number);
    return m ? m - 1 : new Date().getMonth();
  });

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const totalSlots = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;

  const selectedDayAppointments = appointments.filter(
    (a) => a.date === selectedDate && a.status !== 'iptal'
  );

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Month Navigator Header (Flat Symmetrical Design - No Subtitles) */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-100 dark:border-red-900/50 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
            {monthNames[currentMonth]} {currentYear}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer"
            title="Önceki Ay"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer"
            title="Sonraki Ay"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        <span>Pzt</span>
        <span>Sal</span>
        <span>Çar</span>
        <span>Per</span>
        <span>Cum</span>
        <span>Cmt</span>
        <span className="text-red-500">Paz</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: totalSlots }).map((_, idx) => {
          const dayNum = idx - startingDayOfWeek + 1;
          const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;

          if (!isCurrentMonth) {
            return <div key={idx} className="h-11 rounded-lg bg-transparent" />;
          }

          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
            dayNum
          ).padStart(2, '0')}`;

          const dayApps = appointments.filter(
            (a) => a.date === dateStr && a.status !== 'iptal'
          );
          const isSelected = selectedDate === dateStr;

          const now = new Date();
          const isToday =
            now.getFullYear() === currentYear &&
            now.getMonth() === currentMonth &&
            now.getDate() === dayNum;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`h-11 rounded-lg flex flex-col items-center justify-center gap-0.5 p-1 text-xs transition cursor-pointer ${
                isSelected
                  ? 'bg-red-600 text-white font-bold'
                  : isToday
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 font-bold'
                  : 'bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 font-medium'
              }`}
            >
              <span className="text-[11px] leading-none">{dayNum}</span>

              {dayApps.length > 0 && (
                <span
                  className={`text-[9px] px-1.5 rounded font-mono font-bold leading-tight ${
                    isSelected ? 'bg-white text-red-600' : 'bg-red-600 text-white'
                  }`}
                >
                  {dayApps.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Details Strip */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white">
            {formatTurkishDate(selectedDate)}
          </h4>
        </div>

        {selectedDayAppointments.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 dark:bg-zinc-800/40 rounded-xl border border-gray-100 dark:border-zinc-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Randevu bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayAppointments.map((app) => {
              const staff = staffList.find((s) => s.id === app.staffId) || staffList[0];
              const service = services.find((s) => s.id === app.serviceId) || services[0];

              return (
                <div
                  key={app.id}
                  onClick={() => onViewAppointmentDetails && onViewAppointmentDetails(app)}
                  className="flex items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-zinc-800/50 hover:border-red-400 rounded-xl border border-gray-200/70 dark:border-zinc-800 cursor-pointer transition overflow-hidden"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={staff?.photo || CORPORATE_BARBER_AVATAR}
                      alt={staff?.name || 'Berber'}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-red-600 shadow-xs shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = CORPORATE_BARBER_AVATAR;
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {app.customer}
                        </span>
                        <span className="text-[10px] font-mono bg-red-600 text-white px-2 py-0.5 rounded-md font-bold shrink-0">
                          {app.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {service?.name} ·{' '}
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {staff?.name}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onViewAppointmentDetails && onViewAppointmentDetails(app)}
                      className="w-8 h-8 rounded-lg btn-3d-green inline-flex items-center justify-center cursor-pointer"
                      title="Mesaj Seçeneği"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    </button>

                    {app.status === 'bekliyor' && (
                      <button
                        type="button"
                        onClick={() => onCompleteAppointment(app.id)}
                        className="h-8 px-2.5 btn-3d-red text-[10px] font-bold rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer leading-none"
                      >
                        <Check className="w-3 h-3" />
                        <span>Bitti</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
