import React, { useState, useEffect } from 'react';
import { Appointment, Service, Staff } from '../types';
import { X, Calendar, Clock, User, Phone, Scissors, UserCheck, AlertTriangle } from 'lucide-react';
import { getTodayDateString, getCurrentTimeString } from '../data/defaults';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Appointment, 'id' | 'createdAt'>, existingId?: number) => void;
  services: Service[];
  staffList: Staff[];
  existingAppointments: Appointment[];
  appointmentToEdit?: Appointment | null;
  initialDate?: string;
  initialCustomer?: { name: string; phone: string } | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  services,
  staffList,
  existingAppointments,
  appointmentToEdit,
  initialDate,
  initialCustomer,
}) => {
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(initialDate || getTodayDateString());
  const [time, setTime] = useState(getCurrentTimeString());
  const [serviceId, setServiceId] = useState<number>(services[0]?.id || 1);
  const [staffId, setStaffId] = useState<number>(staffList[0]?.id || 1);
  const [note, setNote] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    if (appointmentToEdit) {
      setCustomer(appointmentToEdit.customer);
      setPhone(appointmentToEdit.phone || '');
      setDate(appointmentToEdit.date);
      setTime(appointmentToEdit.time);
      setServiceId(appointmentToEdit.serviceId);
      setStaffId(appointmentToEdit.staffId);
      setNote(appointmentToEdit.note || '');
    } else {
      setCustomer(initialCustomer?.name || '');
      setPhone(initialCustomer?.phone || '');
      setDate(initialDate || getTodayDateString());
      setTime(getCurrentTimeString());
      setServiceId(services[0]?.id || 1);
      setStaffId(staffList[0]?.id || 1);
      setNote('');
    }
  }, [appointmentToEdit, initialDate, initialCustomer, isOpen, services, staffList]);

  // Conflict checking
  useEffect(() => {
    if (!isOpen || !time || !staffId) {
      setConflictWarning(null);
      return;
    }

    const conflict = existingAppointments.find((app) => {
      if (appointmentToEdit && app.id === appointmentToEdit.id) return false;
      return (
        app.date === date &&
        app.time === time &&
        app.staffId === Number(staffId) &&
        app.status !== 'iptal'
      );
    });

    if (conflict) {
      const barber = staffList.find((s) => s.id === Number(staffId));
      setConflictWarning(
        `Çakışma: ${barber?.name || 'Seçili personel'} için saat ${time}'da randevu var (${conflict.customer}).`
      );
    } else {
      setConflictWarning(null);
    }
  }, [time, staffId, date, existingAppointments, appointmentToEdit, isOpen, staffList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) return;

    onSave(
      {
        customer: customer.trim(),
        phone: phone.trim(),
        date,
        time,
        serviceId: Number(serviceId),
        staffId: Number(staffId),
        status: appointmentToEdit?.status || 'bekliyor',
        note: note.trim(),
      },
      appointmentToEdit?.id
    );
    onClose();
  };

  const selectedService = services.find((s) => s.id === Number(serviceId));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-100 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <h3 className="font-bold text-sm text-gray-900">
              {appointmentToEdit ? 'Randevuyu Düzenle' : 'Yeni Randevu Ekle'}
            </h3>
            <p className="text-[11px] text-gray-500">Müşteri ve saat bilgilerini girin</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Conflict Alert */}
        {conflictWarning && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>{conflictWarning}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Müşteri Adı Soyadı *"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />

          <input
            type="tel"
            placeholder="Telefon (WhatsApp için Örn: 0555...)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">Tarih</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1">Saat</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">Hizmet</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(Number(e.target.value))}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-black"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.price} ₺)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-1">Personel / Usta</label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(Number(e.target.value))}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-black"
            >
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.role})
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="Not (Opsiyonel)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-black"
          />

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-xs mt-2 shadow-sm transition active:scale-95 cursor-pointer"
          >
            {appointmentToEdit ? 'Değişiklikleri Kaydet' : 'Randevuyu Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
};
