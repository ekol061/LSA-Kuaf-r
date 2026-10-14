import React, { useState } from 'react';
import { Staff, Appointment, Transaction } from '../types';
import { Users, UserPlus, Phone, Edit2, Clock, Percent, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency, getTodayDateString } from '../data/defaults';

interface StaffTabProps {
  staffList: Staff[];
  appointments: Appointment[];
  transactions: Transaction[];
  onEditStaff: (staff: Staff) => void;
  onAddNewStaff: () => void;
}

export const StaffTab: React.FC<StaffTabProps> = ({
  staffList,
  appointments,
  transactions,
  onEditStaff,
  onAddNewStaff,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'gunluk' | 'haftalik' | 'aylik'>('gunluk');
  const todayStr = getTodayDateString();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Personel Kadrosu & Kazançlar</h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Usta berberler, ciro payı komisyonları ve dönemlik hakedişler
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Toggle */}
          <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-zinc-800 rounded-2xl border border-gray-200/60 dark:border-zinc-700/60">
            {(['gunluk', 'haftalik', 'aylik'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodFilter(p)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  periodFilter === p
                    ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs font-black'
                    : 'text-gray-500 hover:text-black dark:text-gray-400'
                }`}
              >
                {p === 'gunluk' ? 'Bugün' : p === 'haftalik' ? 'Bu Hafta' : 'Bu Ay'}
              </button>
            ))}
          </div>

          <button
            onClick={onAddNewStaff}
            className="px-3.5 py-1.5 bg-black dark:bg-amber-400 text-white dark:text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer hover:opacity-90 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Yeni Personel</span>
          </button>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {staffList.map((st) => {
          // Filter transactions for this staff by selected period
          const staffPeriodTx = transactions.filter((t) => {
            if (t.type !== 'gelir' || t.staffId !== st.id) return false;
            if (periodFilter === 'gunluk') return t.date === todayStr;

            const [tYear, tMonth, tDay] = t.date.split('-').map(Number);
            const tDate = new Date(tYear, tMonth - 1, tDay);

            if (periodFilter === 'haftalik') {
              return tDate >= startOfWeek && tDate <= now;
            } else if (periodFilter === 'aylik') {
              return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
            }
            return true;
          });

          const periodRevenue = staffPeriodTx.reduce((sum, t) => sum + t.amount, 0);
          const rate = st.commissionRate ?? 50;

          const staffEarnings = staffPeriodTx.reduce((sum, t) => {
            if (t.staffShare !== undefined) return sum + t.staffShare;
            return sum + Math.round((t.amount * rate) / 100);
          }, 0);

          const salonShare = periodRevenue - staffEarnings;

          // Today count
          const todayJobs = appointments.filter(
            (a) => a.date === todayStr && a.staffId === st.id && a.status === 'tamamlandi'
          ).length;

          return (
            <div
              key={st.id}
              onClick={() => onEditStaff(st)}
              className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-3xl p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src={
                      st.photo ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                    }
                    alt={st.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-red-600 shadow-sm shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {st.name}
                      </h4>
                      <span className="text-[10px] text-gray-400 group-hover:text-black dark:group-hover:text-amber-400 font-semibold flex items-center gap-0.5 transition">
                        <Edit2 className="w-3 h-3" />
                        Düzenle
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{st.role}</p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-200/50">
                        Ciro Payı: %{rate}
                      </span>
                    </div>
                  </div>
                </div>

                {st.phone && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />
                    <span>{st.phone}</span>
                  </p>
                )}

                {st.workingHours && (
                  <p className="text-[11px] text-gray-400 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{st.workingHours}</span>
                  </p>
                )}
              </div>

              {/* Earnings Breakdown Strip */}
              <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs bg-gray-50 dark:bg-zinc-800 p-2 rounded-xl">
                  <span className="text-gray-500 text-[11px]">
                    {periodFilter === 'gunluk' ? 'Bugünkü Ciro' : periodFilter === 'haftalik' ? 'Haftalık Ciro' : 'Aylık Ciro'}:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white font-mono">
                    {formatCurrency(periodRevenue)} ({staffPeriodTx.length} İş)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-green-50/70 dark:bg-green-950/30 p-2 rounded-xl border border-green-200/50">
                    <span className="text-[10px] text-green-700 dark:text-green-300 block font-semibold">
                      Usta Payı (%{rate})
                    </span>
                    <span className="font-black font-mono text-green-600 dark:text-green-400 text-xs">
                      {formatCurrency(staffEarnings)}
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-zinc-800 p-2 rounded-xl border border-gray-100 dark:border-zinc-700">
                    <span className="text-[10px] text-gray-400 block font-medium">Dükkan Kasası</span>
                    <span className="font-bold font-mono text-gray-900 dark:text-white text-xs">
                      {formatCurrency(salonShare)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
