import { Appointment, Service, Staff, Customer, Transaction, SalonSettings } from '../types';

export const CORPORATE_BARBER_AVATAR =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&fit=crop&crop=face';

export const DEFAULT_SERVICES: Service[] = [
  { id: 1, name: 'Klasik Saç Kesimi', price: 350, duration: 30, category: 'Saç' },
  { id: 2, name: 'Sakal Tıraşı & Buhar', price: 200, duration: 20, category: 'Sakal' },
  { id: 3, name: 'Saç + Sakal Kombin', price: 500, duration: 45, category: 'Kombin' },
  { id: 4, name: 'Cilt Bakımı & Kil Maskesi', price: 400, duration: 30, category: 'Bakım' },
  { id: 5, name: 'Saç Yıkama, Fön & Şekillendirme', price: 150, duration: 20, category: 'Saç' },
  { id: 6, name: 'Çocuk Saç Kesimi', price: 250, duration: 25, category: 'Saç' },
  { id: 7, name: 'Keratin & Saç Botoksu', price: 650, duration: 60, category: 'Bakım' },
  { id: 8, name: 'VIP Damat Tıraşı Paketi', price: 1200, duration: 90, category: 'Özel' },
];

export const DEFAULT_STAFF: Staff[] = [
  {
    id: 1,
    name: 'İbrahim Emre',
    role: 'Kurucu Usta Berber',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&fit=crop&crop=face',
    phone: '0555 123 4567',
    workingHours: '09:00 - 20:00',
    commissionRate: 50, // %50 ciro payı
  },
  {
    id: 2,
    name: 'Ahmet Usta',
    role: 'Kıdemli Sakal & Saç Uzmanı',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&fit=crop&crop=face',
    phone: '0532 987 6543',
    workingHours: '09:30 - 20:30',
    commissionRate: 50,
  },
  {
    id: 3,
    name: 'Can Demir',
    role: 'Modern Saç Stilisti',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&fit=crop&crop=face',
    phone: '0544 555 1122',
    workingHours: '10:00 - 21:00',
    commissionRate: 40, // %40 ciro payı
  },
];

export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: 'Burak Yılmaz',
    phone: '0533 111 2233',
    notes: 'Yanlar sıfır, üstler doğal makas kesimi sever.',
    createdAt: '2026-09-10',
  },
  {
    id: 2,
    name: 'Serkan Kaya',
    phone: '0542 333 4455',
    notes: 'Sakal kontürü düz çizgi, hassas cilt buhar bakımı ister.',
    createdAt: '2026-09-15',
  },
  {
    id: 3,
    name: 'Onur Demir',
    phone: '0535 777 8899',
    notes: 'Haftada bir fön ve yıkamaya gelir.',
    createdAt: '2026-10-01',
  },
  {
    id: 4,
    name: 'Mehmet Erdem',
    phone: '0505 444 3322',
    notes: 'Cilt maskesi ve siyah nokta temizliği yaptırır.',
    createdAt: '2026-10-05',
  },
  {
    id: 5,
    name: 'Tolga Çelik',
    phone: '0551 222 9988',
    notes: 'Sıcak havlu buhar tıraşı.',
    createdAt: '2026-10-10',
  },
];

export const DEFAULT_SALON_SETTINGS: SalonSettings = {
  salonName: 'L.S.A BAY KUAFÖR',
  tagline: 'Kurumsal Salon Yönetim Sistemi',
  phone: '0555 123 4567',
  address: 'https://maps.google.com/?q=40.9829,29.0284',
  whatsappGreeting:
    'Merhaba Sayın {MUSTERI}, L.S.A Bay Kuaför {SAAT} randevunuzu hatırlatır, keyifli günler dileriz.',
  whatsappConnected: true,
  whatsappPhone: '0555 123 4567',
  whatsappBusinessName: 'L.S.A Bay Kuaför İletişim Hattı',
};

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTurkishDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    });
  } catch {
    return dateStr;
  }
}

export function generateInitialAppointments(): Appointment[] {
  const today = getTodayDateString();
  return [
    {
      id: 101,
      customer: 'Burak Yılmaz',
      phone: '0533 111 2233',
      time: '10:00',
      date: today,
      serviceId: 1,
      staffId: 1,
      status: 'tamamlandi',
      note: 'Klasik yanlar kısa üstler uzun',
      createdAt: new Date().toISOString(),
    },
    {
      id: 102,
      customer: 'Serkan Kaya',
      phone: '0542 333 4455',
      time: '11:30',
      date: today,
      serviceId: 3,
      staffId: 2,
      status: 'tamamlandi',
      note: 'Sakal kontürü düz çizgi',
      createdAt: new Date().toISOString(),
    },
    {
      id: 103,
      customer: 'Onur Demir',
      phone: '0535 777 8899',
      time: '14:00',
      date: today,
      serviceId: 1,
      staffId: 1,
      status: 'bekliyor',
      note: 'Önemli toplantı öncesi hızlı fön',
      createdAt: new Date().toISOString(),
    },
    {
      id: 104,
      customer: 'Mehmet Erdem',
      phone: '0505 444 3322',
      time: '15:30',
      date: today,
      serviceId: 4,
      staffId: 3,
      status: 'bekliyor',
      note: 'Cilt maskesi + siyah nokta temizliği',
      createdAt: new Date().toISOString(),
    },
    {
      id: 105,
      customer: 'Tolga Çelik',
      phone: '0551 222 9988',
      time: '17:00',
      date: today,
      serviceId: 2,
      staffId: 2,
      status: 'bekliyor',
      note: 'Sıcak havlu buhar bakımı',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function generateInitialTransactions(): Transaction[] {
  const today = getTodayDateString();
  return [
    {
      id: 201,
      type: 'gelir',
      title: 'Saç Kesimi - Burak Yılmaz',
      customer: 'Burak Yılmaz',
      amount: 350,
      time: '10:35',
      date: today,
      staffId: 1,
      serviceId: 1,
      category: 'Randevu Geliri',
      staffShare: 175,
      salonShare: 175,
    },
    {
      id: 202,
      type: 'gelir',
      title: 'Saç + Sakal - Serkan Kaya',
      customer: 'Serkan Kaya',
      amount: 500,
      time: '12:20',
      date: today,
      staffId: 2,
      serviceId: 3,
      category: 'Randevu Geliri',
      staffShare: 250,
      salonShare: 250,
    },
    {
      id: 203,
      type: 'gider',
      title: 'Kozmetik Şampuan & Wax Alımı',
      amount: 180,
      time: '12:45',
      date: today,
      category: 'Sarf Malzeme',
    },
  ];
}

export function generateWhatsAppLink(
  phone: string,
  customerName: string,
  time: string,
  template: string = DEFAULT_SALON_SETTINGS.whatsappGreeting
): string {
  let clean = phone.replace(/\D/g, '');
  if (!clean) return '';
  if (clean.startsWith('0')) clean = clean.substring(1);
  if (!clean.startsWith('90')) clean = '90' + clean;

  const message = template
    .replace('{MUSTERI}', customerName)
    .replace('{SAAT}', time);

  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
