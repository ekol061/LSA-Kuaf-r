import React, { useState, useMemo } from 'react';
import { Transaction, Staff, Service, Appointment } from '../types';
import {
  Wallet,
  Plus,
  Trash2,
  RotateCcw,
  Clock,
  Scissors,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Check,
  Receipt,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
} from 'lucide-react';
import {
  formatCurrency,
  getTodayDateString,
  getCurrentTimeString,
  formatTurkishDate,
  CORPORATE_BARBER_AVATAR,
} from '../data/defaults';

interface AccountingTabProps {
  transactions: Transaction[];
  staffList: Staff[];
  services: Service[];
  appointments: Appointment[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: number) => void;
  onClearAccounting: () => void;
  onUpdatePrice: (id: number, newPrice: number) => void;
  onAddService: (service: Omit<Service, 'id'>) => void;
  onDeleteService: (id: number) => void;
}

type FilterMode = 'bugun' | 'haftalik' | 'aylik' | 'gun' | 'aralik';

export const AccountingTab: React.FC<AccountingTabProps> = ({
  transactions,
  staffList,
  services,
  onAddTransaction,
  onDeleteTransaction,
  onClearAccounting,
  onUpdatePrice,
  onAddService,
  onDeleteService,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'kasa' | 'hakedis' | 'rapor' | 'fiyatlar'>('kasa');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Date Filtering State
  const todayStr = getTodayDateString();
  const [filterMode, setFilterMode] = useState<FilterMode>('bugun');
  const [selectedDay, setSelectedDay] = useState<string>(todayStr);
  const [rangeStart, setRangeStart] = useState<string>(todayStr);
  const [rangeEnd, setRangeEnd] = useState<string>(todayStr);

  // New Transaction Form State
  const [newType, setNewType] = useState<'gelir' | 'gider'>('gelir');
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Hizmet');
  const [newStaffId, setNewStaffId] = useState<number>(staffList[0]?.id || 1);
  const [newTxDate, setNewTxDate] = useState<string>(todayStr);

  // Pricing Form State
  const [editedPrices, setEditedPrices] = useState<Record<number, string>>({});
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const startOfWeek = useMemo(() => {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);

  const endOfWeek = useMemo(() => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [startOfWeek]);

  const toDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterMode === 'bugun') {
        return t.date === todayStr;
      }
      if (filterMode === 'gun') {
        return t.date === selectedDay;
      }
      if (filterMode === 'haftalik') {
        const [tYear, tMonth, tDay] = t.date.split('-').map(Number);
        const tDate = new Date(tYear, tMonth - 1, tDay);
        return tDate >= startOfWeek && tDate <= endOfWeek;
      }
      if (filterMode === 'aylik') {
        const [tYear, tMonth] = t.date.split('-').map(Number);
        return tYear === currentYear && tMonth - 1 === currentMonth;
      }
      if (filterMode === 'aralik') {
        return t.date >= rangeStart && t.date <= rangeEnd;
      }
      return true;
    });
  }, [
    transactions,
    filterMode,
    todayStr,
    selectedDay,
    startOfWeek,
    endOfWeek,
    currentYear,
    currentMonth,
    rangeStart,
    rangeEnd,
  ]);

  const activePeriodLabel = useMemo(() => {
    if (filterMode === 'bugun') {
      return `Bugün (${formatTurkishDate(todayStr)})`;
    }
    if (filterMode === 'gun') {
      return selectedDay === todayStr
        ? `Bugün (${formatTurkishDate(selectedDay)})`
        : `Seçili Gün: ${formatTurkishDate(selectedDay)}`;
    }
    if (filterMode === 'haftalik') {
      return `Bu Hafta (${formatTurkishDate(toDateString(startOfWeek))} – ${formatTurkishDate(toDateString(endOfWeek))})`;
    }
    if (filterMode === 'aylik') {
      const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
      ];
      return `Bu Ay (${monthNames[currentMonth]} ${currentYear})`;
    }
    if (filterMode === 'aralik') {
      return `${formatTurkishDate(rangeStart)} – ${formatTurkishDate(rangeEnd)}`;
    }
    return 'Tüm Dönem';
  }, [filterMode, todayStr, selectedDay, startOfWeek, endOfWeek, currentMonth, currentYear, rangeStart, rangeEnd]);

  const handleStepDay = (step: number) => {
    const baseStr = filterMode === 'gun' ? selectedDay : todayStr;
    const [y, m, d] = baseStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + step);
    const nextStr = toDateString(date);
    setSelectedDay(nextStr);
    setFilterMode('gun');
  };

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'gelir')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'gider')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const staffCommissions = useMemo(() => {
    return staffList.map((st) => {
      const staffTrans = filteredTransactions.filter(
        (t) => t.type === 'gelir' && t.staffId === st.id
      );
      const grossRevenue = staffTrans.reduce((sum, t) => sum + t.amount, 0);
      const rate = st.commissionRate ?? 50;

      const staffEarnings = staffTrans.reduce((sum, t) => {
        if (t.staffShare !== undefined) return sum + t.staffShare;
        return sum + Math.round((t.amount * rate) / 100);
      }, 0);

      const salonEarnings = grossRevenue - staffEarnings;

      return {
        staff: st,
        jobCount: staffTrans.length,
        grossRevenue,
        rate,
        staffEarnings,
        salonEarnings,
      };
    });
  }, [staffList, filteredTransactions]);

  const totalStaffEarnings = staffCommissions.reduce((sum, s) => sum + s.staffEarnings, 0);
  const totalSalonRetained = totalIncome - totalStaffEarnings;
  const netSalonProfit = totalSalonRetained - totalExpense;

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(amountVal) || amountVal <= 0) return;

    const st = staffList.find((s) => s.id === newStaffId);
    const rate = st?.commissionRate ?? 50;
    const staffShare = newType === 'gelir' ? Math.round((amountVal * rate) / 100) : 0;
    const salonShare = newType === 'gelir' ? amountVal - staffShare : 0;

    onAddTransaction({
      type: newType,
      title: newTitle.trim(),
      amount: amountVal,
      time: getCurrentTimeString(),
      date: newTxDate || (filterMode === 'gun' ? selectedDay : todayStr),
      category: newCategory,
      staffId: newType === 'gelir' ? newStaffId : undefined,
      staffShare,
      salonShare,
    });

    setNewTitle('');
    setNewAmount('');
    setIsAddModalOpen(false);
  };

  const handlePriceChange = (id: number, val: string) => {
    setEditedPrices((prev) => ({ ...prev, [id]: val }));
  };

  const handleSavePrice = (id: number) => {
    const val = editedPrices[id];
    if (val !== undefined) {
      const p = parseFloat(val);
      if (!isNaN(p) && p >= 0) {
        onUpdatePrice(id, p);
        setEditedPrices((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    }
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(newServicePrice);
    const dur = parseInt(newServiceDuration, 10);
    if (!newServiceName.trim() || isNaN(p) || p <= 0) return;

    onAddService({
      name: newServiceName.trim(),
      price: p,
      duration: isNaN(dur) || dur <= 0 ? 30 : dur,
    });

    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('30');
  };

  return (
    <div className="space-y-3.5">
      {/* 1. COMPACT SYMMETRICAL DATE FILTER TOOLBAR (3D Buttons) */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-3.5 card-app space-y-2">
        {/* Row 1: 3 Equal-Width Symmetrical Preset Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setFilterMode('bugun');
              setSelectedDay(todayStr);
            }}
            className={`h-9 px-3 text-xs font-bold rounded-xl inline-flex items-center justify-center cursor-pointer whitespace-nowrap leading-none ${
              filterMode === 'bugun' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            Bugün
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('haftalik')}
            className={`h-9 px-3 text-xs font-bold rounded-xl inline-flex items-center justify-center cursor-pointer whitespace-nowrap leading-none ${
              filterMode === 'haftalik' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            Bu Hafta
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('aylik')}
            className={`h-9 px-3 text-xs font-bold rounded-xl inline-flex items-center justify-center cursor-pointer whitespace-nowrap leading-none ${
              filterMode === 'aylik' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            Bu Ay
          </button>
        </div>

        {/* Row 2: 2 Equal-Width Symmetrical Calendar Mode Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFilterMode('gun')}
            className={`h-9 px-3 text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none ${
              filterMode === 'gun' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span>Gün Seç</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('aralik')}
            className={`h-9 px-3 text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none ${
              filterMode === 'aralik' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5 shrink-0" />
            <span>Aralık Seç</span>
          </button>
        </div>

        {/* Dynamic Calendar Controls */}
        {filterMode === 'gun' && (
          <div className="flex items-center gap-2 pt-1.5 border-t border-gray-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => handleStepDay(-1)}
              className="p-1.5 rounded-xl btn-3d-white cursor-pointer"
              title="Önceki Gün"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex-1">
              <input
                type="date"
                value={selectedDay}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDay(e.target.value);
                    setFilterMode('gun');
                  }
                }}
                className="w-full text-xs font-semibold px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <button
              type="button"
              onClick={() => handleStepDay(1)}
              className="p-1.5 rounded-xl btn-3d-white cursor-pointer"
              title="Sonraki Gün"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {filterMode === 'aralik' && (
          <div className="flex items-center gap-2 pt-1.5 border-t border-gray-100 dark:border-zinc-800 text-xs">
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 block mb-0.5">Başlangıç</label>
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="w-full text-xs font-semibold px-2.5 py-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>
            <span className="text-gray-400 mt-3 font-bold">–</span>
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 block mb-0.5">Bitiş</label>
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="w-full text-xs font-semibold px-2.5 py-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] pt-1 text-gray-500 dark:text-gray-400">
          <span className="font-semibold truncate">{activePeriodLabel}</span>
          <span className="font-mono font-bold shrink-0 text-gray-700 dark:text-gray-300">
            {filteredTransactions.length} Hareket
          </span>
        </div>
      </div>

      {/* 2. MASTER KPI DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-3.5 sm:p-4 rounded-3xl card-app text-center">
          <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block">
            Toplam Brüt Ciro
          </span>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-3.5 sm:p-4 rounded-3xl card-app text-center">
          <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block">
            Usta Hakedişleri
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
            {formatCurrency(totalStaffEarnings)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-3.5 sm:p-4 rounded-3xl card-app text-center">
          <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block">
            Dükkan Giderleri
          </span>
          <p className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 font-mono mt-1">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-950 p-3.5 sm:p-4 rounded-3xl card-app text-center bg-gradient-to-b from-white to-red-50/30 dark:from-zinc-900 dark:to-red-950/20">
          <span className="text-[10px] sm:text-[11px] text-red-600 dark:text-red-400 font-black uppercase tracking-wider block">
            Salon Net Kasa
          </span>
          <p className="text-xl sm:text-2xl font-black text-green-600 dark:text-green-400 font-mono mt-1">
            {formatCurrency(netSalonProfit)}
          </p>
        </div>
      </div>

      {/* 3. SYMMETRICAL SUBTAB SELECTOR & QUICK ACTION 3D BUTTONS */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-3 rounded-3xl card-app space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('kasa')}
            className={`h-10 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center cursor-pointer whitespace-nowrap leading-none ${
              activeSubTab === 'kasa' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            Kasa Hareketleri
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('hakedis')}
            className={`h-10 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center cursor-pointer whitespace-nowrap leading-none ${
              activeSubTab === 'hakedis' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            Usta Ciro Payı
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('rapor')}
            className={`h-10 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center cursor-pointer whitespace-nowrap leading-none ${
              activeSubTab === 'rapor' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            Dönemsel Rapor
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('fiyatlar')}
            className={`h-10 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center cursor-pointer whitespace-nowrap leading-none ${
              activeSubTab === 'fiyatlar' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            Fiyat Tarifesi
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setNewTxDate(filterMode === 'gun' ? selectedDay : todayStr);
              setIsAddModalOpen(true);
            }}
            className="h-10 px-3.5 btn-3d-red text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Gelir / Gider Ekle</span>
          </button>
          <button
            type="button"
            onClick={onClearAccounting}
            className="h-10 px-3.5 btn-3d-white rounded-xl text-xs font-bold text-red-600 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none"
            title="Bugünkü Kayıtları Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Kaydı Sıfırla</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: KASA HAREKETLERİ */}
      {activeSubTab === 'kasa' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-red-600" />
                <span>Kasa İşlemleri ({filteredTransactions.length})</span>
              </h3>
              <span className="text-[11px] text-gray-500 font-mono">
                {activePeriodLabel}
              </span>
            </div>

            <div className="space-y-2">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-10 bg-gray-50/60 dark:bg-zinc-800/40 rounded-2xl border border-gray-100 dark:border-zinc-800">
                  <Wallet className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Bu seçilen dönemde ({activePeriodLabel}) henüz kasa hareketi bulunmuyor.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTxDate(filterMode === 'gun' ? selectedDay : todayStr);
                      setIsAddModalOpen(true);
                    }}
                    className="mt-3 px-4 py-2 rounded-xl btn-3d-red text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Gelir veya Gider Ekle</span>
                  </button>
                </div>
              ) : (
                filteredTransactions
                  .slice()
                  .reverse()
                  .map((tx) => {
                    const isIncome = tx.type === 'gelir';
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-200/70 dark:border-zinc-800 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isIncome ? 'btn-3d-green' : 'btn-3d-red'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="text-xs font-bold text-gray-900 dark:text-white block truncate">
                              {tx.title}
                            </span>
                            <div className="text-[10px] text-gray-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="font-mono">
                                {tx.date !== todayStr ? `${tx.date} · ` : ''}
                                {tx.time}
                              </span>
                              <span>·</span>
                              <span>{tx.category || (isIncome ? 'Hizmet' : 'Gider')}</span>
                              {isIncome && tx.staffShare !== undefined && (
                                <span className="text-red-600 dark:text-red-400 font-semibold">
                                  · Usta: {formatCurrency(tx.staffShare)} / Kasa: {formatCurrency(tx.salonShare || 0)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span
                            className={`text-sm font-mono font-black ${
                              isIncome
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="w-8 h-8 rounded-xl btn-3d-white text-red-600 flex items-center justify-center cursor-pointer"
                            title="Kaydı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: USTA CİRO PAYI & HAKEDİŞ */}
      {activeSubTab === 'hakedis' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {staffCommissions.map((sc) => (
              <div
                key={sc.staff.id}
                className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 card-app space-y-3"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-zinc-800">
                  <img
                    src={sc.staff.photo || CORPORATE_BARBER_AVATAR}
                    alt={sc.staff.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-red-600 shadow-xs shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = CORPORATE_BARBER_AVATAR;
                    }}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {sc.staff.name}
                    </h4>
                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400">
                      Ciro Payı: %{sc.rate}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-800 p-2.5 rounded-xl">
                    <span className="text-gray-500 dark:text-gray-400">Üretilen Brüt Ciro:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {formatCurrency(sc.grossRevenue)} ({sc.jobCount} İş)
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-red-50/70 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200/60">
                    <span className="font-bold text-red-900 dark:text-red-300">
                      Usta Kazancı (%{sc.rate}):
                    </span>
                    <span className="font-mono font-black text-red-600 dark:text-red-400 text-sm">
                      {formatCurrency(sc.staffEarnings)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-green-50/70 dark:bg-green-950/30 p-2.5 rounded-xl border border-green-200/60">
                    <span className="font-bold text-green-900 dark:text-green-300">
                      Dükkana Kalan Pay:
                    </span>
                    <span className="font-mono font-black text-green-700 dark:text-green-400 text-sm">
                      {formatCurrency(sc.salonEarnings)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: DÖNEMSEL RAPORLAMA */}
      {activeSubTab === 'rapor' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Personel Performans & Hakediş Özeti
              </h4>
              <span className="text-[11px] text-gray-500 font-mono font-medium">
                {activePeriodLabel}
              </span>
            </div>

            <div className="space-y-2">
              {staffCommissions.map((sc) => (
                <div
                  key={sc.staff.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={sc.staff.photo || CORPORATE_BARBER_AVATAR}
                      alt={sc.staff.name}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-red-600"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = CORPORATE_BARBER_AVATAR;
                      }}
                    />
                    <div>
                      <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                        {sc.staff.name}
                      </h5>
                      <span className="text-[10px] text-gray-500">
                        {sc.jobCount} Tamamlanan Randevu · Ciro Payı: %{sc.rate}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-red-600 block">
                      Hakediş: {formatCurrency(sc.staffEarnings)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      (Brüt: {formatCurrency(sc.grossRevenue)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: HİZMET & FİYAT TARİFESİ */}
      {activeSubTab === 'fiyatlar' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app space-y-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-zinc-800">
              Fiyat Tarifesi & Hizmet Düzenleme
            </h3>

            <div className="space-y-2">
              {services.map((s) => {
                const currentVal =
                  editedPrices[s.id] !== undefined ? editedPrices[s.id] : String(s.price);
                const isChanged =
                  editedPrices[s.id] !== undefined && parseFloat(editedPrices[s.id]) !== s.price;

                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl btn-3d-red flex items-center justify-center shrink-0">
                        <Scissors className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{s.name}</h4>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{s.duration} Dakika</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-24">
                        <input
                          type="number"
                          value={currentVal}
                          onChange={(e) => handlePriceChange(s.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs text-right font-mono font-bold bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                          ₺
                        </span>
                      </div>

                      {isChanged && (
                        <button
                          type="button"
                          onClick={() => handleSavePrice(s.id)}
                          className="px-3 py-1.5 btn-3d-red text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Kaydet</span>
                        </button>
                      )}

                      {services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteService(s.id)}
                          className="w-8 h-8 rounded-xl btn-3d-white text-red-600 flex items-center justify-center cursor-pointer"
                          title="Hizmeti Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={handleCreateService}
              className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs"
            >
              <input
                type="text"
                required
                placeholder="Yeni Hizmet Adı"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
              />
              <input
                type="number"
                required
                placeholder="Fiyat (₺)"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <input
                type="number"
                placeholder="Süre (Dk)"
                value={newServiceDuration}
                onChange={(e) => setNewServiceDuration(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="submit"
                className="py-2 px-4 btn-3d-red font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Hizmet Ekle</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD TRANSACTION MODAL */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Yeni Kasa Kaydı Ekle
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl btn-3d-white text-gray-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 dark:bg-zinc-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setNewType('gelir')}
                  className={`py-2 text-xs font-bold rounded-xl cursor-pointer ${
                    newType === 'gelir' ? 'btn-3d-green' : 'btn-3d-white'
                  }`}
                >
                  + Gelir (Tahsilat)
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('gider')}
                  className={`py-2 text-xs font-bold rounded-xl cursor-pointer ${
                    newType === 'gider' ? 'btn-3d-red' : 'btn-3d-white'
                  }`}
                >
                  - Gider (Masraf)
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  İşlem Açıklaması *
                </label>
                <input
                  type="text"
                  required
                  placeholder={newType === 'gelir' ? 'Örn: Saç Kesimi - Ahmet Bey' : 'Örn: Dükkan Elektrik Faturası'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tutar (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="350"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white font-mono font-bold focus:outline-none focus:border-red-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Kayıt Tarihi
                  </label>
                  <input
                    type="date"
                    value={newTxDate}
                    onChange={(e) => setNewTxDate(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white font-semibold focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {newType === 'gelir' && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    İşlemi Yapan Personel (Ciro Payı için)
                  </label>
                  <select
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} (Payı: %{st.commissionRate ?? 50})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  placeholder={newType === 'gelir' ? 'Hizmet / Ürün' : 'Kira, Fatura, Malzeme vb.'}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-3.5 rounded-xl btn-3d-white text-xs font-bold cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl btn-3d-red text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Kasaya Ekle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
