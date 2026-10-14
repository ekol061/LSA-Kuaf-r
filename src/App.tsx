import React, { useState, useEffect } from 'react';
import {
  Appointment,
  Service,
  Staff,
  Customer,
  Transaction,
  SalonSettings,
  GoogleUser,
  DriveAccount,
  ToastMessage,
} from './types';
import {
  DEFAULT_SERVICES,
  DEFAULT_STAFF,
  DEFAULT_CUSTOMERS,
  DEFAULT_SALON_SETTINGS,
  generateInitialAppointments,
  generateInitialTransactions,
  getTodayDateString,
  getCurrentTimeString,
  formatTurkishDate,
  generateWhatsAppLink,
  CORPORATE_BARBER_AVATAR,
} from './data/defaults';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { AppointmentsTab } from './components/AppointmentsTab';
import { AccountingTab } from './components/AccountingTab';
import { CustomersTab } from './components/CustomersTab';
import { ProfileTab, ThemeMode } from './components/ProfileTab';
import { AppointmentModal } from './components/AppointmentModal';
import { AppointmentDetailModal } from './components/AppointmentDetailModal';
import { AutoReminderModal } from './components/AutoReminderModal';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { StaffModal } from './components/StaffModal';
import { BackupModal } from './components/BackupModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { SiriVoiceOverlay } from './components/SiriVoiceOverlay';
import { ToastContainer } from './components/ToastContainer';
import {
  auth,
  signInWithGooglePopup,
  signInWithGoogleDrivePopup,
  signOutGoogle,
  subscribeToAuthChanges,
  saveCloudBackupForUser,
  loadCloudBackupForUser,
  uploadBackupToGoogleDrive,
  downloadBackupFromGoogleDrive,
} from './firebase';

export default function App() {
  // --- Persistent State ---
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('lsa_appointments');
      return saved ? JSON.parse(saved) : generateInitialAppointments();
    } catch {
      return generateInitialAppointments();
    }
  });

  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem('lsa_services');
      return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
    } catch {
      return DEFAULT_SERVICES;
    }
  });

  const [staffList, setStaffList] = useState<Staff[]>(() => {
    try {
      const saved = localStorage.getItem('lsa_staff');
      if (!saved) return DEFAULT_STAFF;
      const parsed: Staff[] = JSON.parse(saved);
      return parsed.map((st) => ({
        ...st,
        photo:
          !st.photo || st.photo.includes('1534528741775-53994a69daeb')
            ? CORPORATE_BARBER_AVATAR
            : st.photo,
      }));
    } catch {
      return DEFAULT_STAFF;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('lsa_customers');
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
    } catch {
      return DEFAULT_CUSTOMERS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('lsa_transactions');
      return saved ? JSON.parse(saved) : generateInitialTransactions();
    } catch {
      return generateInitialTransactions();
    }
  });

  const [salonSettings, setSalonSettings] = useState<SalonSettings>(() => {
    try {
      const saved = localStorage.getItem('lsa_salon_settings');
      return saved ? { ...DEFAULT_SALON_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SALON_SETTINGS;
    } catch {
      return DEFAULT_SALON_SETTINGS;
    }
  });

  const [googleUser, setGoogleUser] = useState<GoogleUser>({
    isLoggedIn: false,
    name: '',
    email: '',
    photo: '',
    isDriveConnected: false,
  });

  // Separate Google Drive Account State
  const [driveAccount, setDriveAccount] = useState<DriveAccount>(() => {
    try {
      const saved = localStorage.getItem('lsa_drive_account');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      isConnected: false,
      name: '',
      email: '',
      photo: '',
    };
  });

  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // 1-Hour Auto Reminder 10-Second Countdown State
  const [reminderPromptAppointment, setReminderPromptAppointment] = useState<Appointment | null>(
    null
  );

  // Theme state: light / dark / auto
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('lsa_theme') as ThemeMode) || 'light';
  });

  // Apply theme to document (saate göre gündüz gece otomatik değişimi)
  useEffect(() => {
    localStorage.setItem('lsa_theme', themeMode);
    const root = document.documentElement;

    const applyTheme = () => {
      if (themeMode === 'dark') {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else if (themeMode === 'light') {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      } else {
        const hour = new Date().getHours();
        const isDaytime = hour >= 7 && hour < 19;
        if (isDaytime) {
          root.classList.remove('dark');
          document.body.classList.remove('dark');
        } else {
          root.classList.add('dark');
          document.body.classList.add('dark');
        }
      }
    };

    applyTheme();

    const interval = setInterval(() => {
      if (themeMode === 'auto') {
        applyTheme();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [themeMode]);

  // Navigation & Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>('appointments');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>(undefined);
  const [modalInitialCustomer, setModalInitialCustomer] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  // Appointment Detail Modal state
  const [selectedAppointmentForDetails, setSelectedAppointmentForDetails] =
    useState<Appointment | null>(null);

  // Customer Detail Modal state
  const [selectedCustomerForDetails, setSelectedCustomerForDetails] =
    useState<Customer | null>(null);

  // Staff Modal state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);

  // Siri Voice state
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isDriveSyncing, setIsDriveSyncing] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('lsa_appointments', JSON.stringify(appointments));
    } catch (e) {
      console.warn('LocalStorage error (appointments):', e);
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem('lsa_services', JSON.stringify(services));
    } catch (e) {
      console.warn('LocalStorage error (services):', e);
    }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem('lsa_staff', JSON.stringify(staffList));
    } catch (e) {
      console.warn('LocalStorage error (staff):', e);
    }
  }, [staffList]);

  useEffect(() => {
    try {
      localStorage.setItem('lsa_customers', JSON.stringify(customers));
    } catch (e) {
      console.warn('LocalStorage error (customers):', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem('lsa_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.warn('LocalStorage error (transactions):', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('lsa_salon_settings', JSON.stringify(salonSettings));
    } catch (e) {
      console.warn('LocalStorage error (salonSettings):', e);
    }
  }, [salonSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('lsa_drive_account', JSON.stringify(driveAccount));
    } catch {}
  }, [driveAccount]);

  // Listen to real Firebase Google Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (fbUser) => {
      if (fbUser) {
        setGoogleUser((prev) => ({
          isLoggedIn: true,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Salon Yöneticisi',
          email: fbUser.email || '',
          photo: fbUser.photoURL || CORPORATE_BARBER_AVATAR,
          isDriveConnected: true,
          lastDriveBackup: prev.lastDriveBackup,
        }));
        try {
          const existingBackup = await loadCloudBackupForUser(fbUser);
          if (existingBackup?.updatedAt) {
            setGoogleUser((prev) => ({
              ...prev,
              lastDriveBackup: existingBackup.updatedAt,
            }));
            setDriveAccount((prev) =>
              prev.isConnected
                ? { ...prev, lastBackup: existingBackup.updatedAt }
                : prev
            );
          }
        } catch {}
      } else {
        setGoogleUser({
          isLoggedIn: false,
          name: '',
          email: '',
          photo: '',
          isDriveConnected: false,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 1-Hour-Before Automatic Appointment Reminder Watcher (Checks every 15s) ---
  useEffect(() => {
    const checkUpcomingAppointments = () => {
      if (reminderPromptAppointment) return;
      const todayStr = getTodayDateString();
      const now = new Date();
      const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();

      const dueApp = appointments.find((app) => {
        if (app.date !== todayStr) return false;
        if (app.status !== 'bekliyor') return false;
        if (app.reminderStatus === 'sent' || app.reminderStatus === 'skipped') return false;

        const [h, m] = app.time.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return false;
        const appTotalMinutes = h * 60 + m;
        const diffMinutes = appTotalMinutes - nowTotalMinutes;

        // Trigger when 1 hour or less remains before the appointment (0 < diffMinutes <= 60)
        return diffMinutes > 0 && diffMinutes <= 60;
      });

      if (dueApp) {
        setReminderPromptAppointment(dueApp);
      }
    };

    checkUpcomingAppointments();
    const timer = setInterval(checkUpcomingAppointments, 15000);
    return () => clearInterval(timer);
  }, [appointments, reminderPromptAppointment]);

  // Toast Helper
  const addToast = (
    title: string,
    description?: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Appointment Reminder Handlers (Manual & 10-Second Auto) ---
  const handleSendAppointmentMessage = (app: Appointment) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, reminderStatus: 'sent' } : a))
    );
    setReminderPromptAppointment(null);

    const whatsappUrl = generateWhatsAppLink(
      app.phone || '05320000000',
      app.customer,
      app.time,
      salonSettings.whatsappGreeting
    );

    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();

    addToast(
      'Hatırlatma Mesajı Gönderildi',
      `${app.customer} (${app.time}) için WhatsApp mesajı iletildi.`,
      'success'
    );
  };

  const handleSkipAppointmentMessage = (app: Appointment) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === app.id
          ? {
              ...a,
              reminderStatus: a.reminderStatus === 'skipped' ? 'pending' : 'skipped',
            }
          : a
      )
    );
    setReminderPromptAppointment(null);

    if (app.reminderStatus === 'skipped') {
      addToast(
        'Otomatik Mesaj Açıldı',
        `${app.customer} randevusu için 1 saat kala hatırlatma tekrar aktif.`,
        'info'
      );
    } else {
      addToast(
        'Otomatik Mesaj İptal Edildi',
        `${app.customer} randevusu için otomatik mesaj gönderilmeyecek.`,
        'info'
      );
    }
  };

  // --- Appointment Handlers (Does NOT auto-save customer to directory!) ---
  const handleSaveAppointment = (
    data: Omit<Appointment, 'id' | 'createdAt'>,
    existingId?: number
  ) => {
    if (existingId) {
      setAppointments((prev) =>
        prev.map((app) => (app.id === existingId ? { ...app, ...data } : app))
      );
      addToast('Randevu Güncellendi', `${data.customer} randevusu kaydedildi.`, 'success');
    } else {
      const newApp: Appointment = {
        ...data,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        reminderStatus: 'pending',
      };
      setAppointments((prev) => [...prev, newApp]);

      addToast(
        'Randevu Kaydedildi',
        `${data.customer} için ${data.date} saat ${data.time}'e eklendi.`,
        'success'
      );
    }
    setAppointmentToEdit(null);
  };

  const handleCompleteAppointment = (id: number) => {
    const app = appointments.find((a) => a.id === id);
    if (!app) return;

    const srv = services.find((s) => s.id === app.serviceId);
    const price = srv ? srv.price : 0;
    const st = staffList.find((s) => s.id === app.staffId);
    const rate = st?.commissionRate ?? 50;

    const staffShare = Math.round((price * rate) / 100);
    const salonShare = price - staffShare;

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'tamamlandi' } : a))
    );

    const newTx: Transaction = {
      id: Date.now(),
      type: 'gelir',
      title: `${srv ? srv.name : 'Hizmet'} - ${app.customer}`,
      customer: app.customer,
      amount: price,
      time: getCurrentTimeString(),
      date: app.date,
      staffId: app.staffId,
      serviceId: app.serviceId,
      category: 'Randevu Geliri',
      staffShare,
      salonShare,
    };
    setTransactions((prev) => [...prev, newTx]);

    addToast(
      'İşlem Kasaya İşlendi',
      `${app.customer} (+${price} ₺) · Usta: ${staffShare} ₺ | Salon: ${salonShare} ₺`,
      'success'
    );
  };

  const handleCancelAppointment = (id: number) => {
    const app = appointments.find((a) => a.id === id);
    if (!app) return;

    setAppointments((prev) => prev.filter((a) => a.id !== id));
    addToast('Randevu Silindi', `"${app.customer}" randevusu listeden kaldırıldı.`, 'info');
  };

  const handleEditAppointment = (app: Appointment) => {
    setAppointmentToEdit(app);
    setModalInitialDate(app.date);
    setIsManualModalOpen(true);
  };

  const handleOpenNewAppointmentForDate = (date: string) => {
    setAppointmentToEdit(null);
    setModalInitialDate(date);
    setModalInitialCustomer(null);
    setIsManualModalOpen(true);
  };

  // --- Siri Voice Handler (Does NOT auto-save customer to directory!) ---
  const handleVoiceAppointmentCreated = (data: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newApp: Appointment = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      reminderStatus: 'pending',
    };
    setAppointments((prev) => [...prev, newApp]);

    addToast(
      'Sesli Randevu Kaydedildi',
      `${data.customer} · ${data.date} saat ${data.time}`,
      'success'
    );
  };

  // --- Customer Manual Handlers (Add, Edit, Delete) ---
  const handleAddCustomer = (custData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCust: Customer = {
      ...custData,
      id: Date.now(),
      createdAt: getTodayDateString(),
    };
    setCustomers((prev) => [...prev, newCust]);
    addToast('Müşteri Kaydedildi', `${newCust.name} rehbere eklendi.`, 'success');
  };

  const handleUpdateCustomer = (id: number, custData: Omit<Customer, 'id' | 'createdAt'>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...custData } : c))
    );
    addToast('Müşteri Güncellendi', `${custData.name} bilgileri güncellendi.`, 'success');
  };

  const handleDeleteCustomer = (id: number) => {
    const target = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    addToast('Müşteri Silindi', `${target?.name || 'Müşteri'} rehberden kaldırıldı.`, 'info');
  };

  // --- Staff Handlers ---
  const handleSaveStaff = (staffData: Omit<Staff, 'id'>, existingId?: number) => {
    if (existingId) {
      setStaffList((prev) =>
        prev.map((st) => (st.id === existingId ? { ...st, ...staffData } : st))
      );
      addToast('Personel Güncellendi', `${staffData.name} bilgileri kaydedildi.`, 'success');
    } else {
      const newStaff: Staff = {
        ...staffData,
        id: Date.now(),
      };
      setStaffList((prev) => [...prev, newStaff]);
      addToast('Personel Eklendi', `${newStaff.name} kadroya dahil edildi.`, 'success');
    }
    setStaffToEdit(null);
  };

  const handleDeleteStaff = (id: number) => {
    if (staffList.length <= 1) {
      addToast('Silinemez', 'Sistemde en az 1 personel kalmalıdır.', 'error');
      return;
    }
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    addToast('Personel Silindi', 'Personel listeden kaldırıldı.', 'info');
  };

  // --- Accounting Handlers ---
  const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...t,
      id: Date.now(),
    };
    setTransactions((prev) => [...prev, newTx]);
    addToast('Kasa Güncellendi', `${t.title} (${t.amount} ₺) eklendi.`, 'success');
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addToast('İşlem Silindi', 'Kasa kaydı silindi.', 'info');
  };

  const handleClearAccounting = () => {
    const today = getTodayDateString();
    setTransactions((prev) => prev.filter((t) => t.date !== today));
    addToast('Kasa Sıfırlandı', 'Bugünkü işlem kayıtları temizlendi.', 'info');
  };

  // --- Pricing Handlers ---
  const handleUpdatePrice = (id: number, newPrice: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price: newPrice } : s))
    );
    addToast('Fiyat Güncellendi', 'Hizmet bedeli kaydedildi.', 'success');
  };

  const handleAddService = (newService: Omit<Service, 'id'>) => {
    const srv: Service = {
      ...newService,
      id: Date.now(),
    };
    setServices((prev) => [...prev, srv]);
    addToast('Hizmet Eklendi', `${srv.name} fiyat listesine dahil edildi.`, 'success');
  };

  const handleDeleteService = (id: number) => {
    if (services.length <= 1) {
      addToast('Silinemez', 'En az 1 hizmet bulunmalıdır.', 'error');
      return;
    }
    setServices((prev) => prev.filter((s) => s.id !== id));
    addToast('Hizmet Silindi', 'Hizmet kaldırıldı.', 'info');
  };

  // --- 1. Google Manager Login Handlers ---
  const handleGoogleSignIn = async () => {
    try {
      const fbUser = await signInWithGooglePopup();
      const timestamp = `${formatTurkishDate(getTodayDateString())} ${getCurrentTimeString()}`;

      setGoogleUser({
        isLoggedIn: true,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Salon Yöneticisi',
        email: fbUser.email || '',
        photo: fbUser.photoURL || CORPORATE_BARBER_AVATAR,
        isDriveConnected: true,
        lastDriveBackup: timestamp,
      });

      addToast(
        'Google Yönetici Hesabı Bağlandı',
        `${fbUser.displayName || fbUser.email} olarak giriş yapıldı.`,
        'success'
      );
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        addToast(
          'Google Giriş Hatası',
          'Açılır pencere engellenmiş olabilir, lütfen tekrar deneyin.',
          'error'
        );
      }
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutGoogle();
      setGoogleUser({
        isLoggedIn: false,
        name: '',
        email: '',
        photo: '',
        isDriveConnected: false,
      });
      addToast('Oturum Kapatıldı', 'Google yönetici oturumu sonlandırıldı.', 'info');
    } catch {
      addToast('Hata', 'Oturum kapatılırken bir sorun oluştu.', 'error');
    }
  };

  // --- 2. Separate Google Drive Login & Backup Handlers ---
  const handleSignInDrivePopup = async () => {
    try {
      setIsDriveSyncing(true);
      const { user: fbUser, accessToken } = await signInWithGoogleDrivePopup();
      const timestamp = `${formatTurkishDate(getTodayDateString())} ${getCurrentTimeString()}`;

      setDriveAccount({
        isConnected: true,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Drive Kullanıcısı',
        email: fbUser.email || '',
        photo: fbUser.photoURL || CORPORATE_BARBER_AVATAR,
        accessToken,
        lastBackup: timestamp,
      });

      setGoogleUser({
        isLoggedIn: true,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Salon Yöneticisi',
        email: fbUser.email || '',
        photo: fbUser.photoURL || CORPORATE_BARBER_AVATAR,
        isDriveConnected: true,
        lastDriveBackup: timestamp,
      });

      addToast(
        'Google Drive Bağlandı',
        `${fbUser.email} Google Drive yedekleme hesabı aktif edildi.`,
        'success'
      );
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        addToast(
          'Google Drive Giriş Hatası',
          'Drive giriş penceresi açılamadı, lütfen tekrar deneyin.',
          'error'
        );
      }
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const handleLinkCurrentGoogleToDrive = () => {
    if (!googleUser.isLoggedIn) return;
    const timestamp = `${formatTurkishDate(getTodayDateString())} ${getCurrentTimeString()}`;
    setDriveAccount({
      isConnected: true,
      name: googleUser.name,
      email: googleUser.email,
      photo: googleUser.photo || CORPORATE_BARBER_AVATAR,
      lastBackup: googleUser.lastDriveBackup || timestamp,
    });
    addToast(
      'Google Drive Bağlandı',
      `${googleUser.email} hesabı Google Drive yedekleme için bağlandı.`,
      'success'
    );
  };

  const handleSignOutDrive = () => {
    setDriveAccount({
      isConnected: false,
      name: '',
      email: '',
      photo: '',
    });
    addToast('Google Drive Ayrıldı', 'Google Drive oturumu kapatıldı.', 'info');
  };

  const handleDriveBackup = async () => {
    if (!driveAccount.isConnected && !googleUser.isLoggedIn) {
      setIsDriveModalOpen(true);
      return;
    }

    setIsDriveSyncing(true);
    try {
      const timestamp = `${formatTurkishDate(getTodayDateString())} ${getCurrentTimeString()}`;
      const targetEmail = driveAccount.email || googleUser.email || auth.currentUser?.email || '';
      const allData = {
        salonName: salonSettings.salonName,
        appointments,
        transactions,
        services,
        staffList,
        customers,
        salonSettings,
        backupTime: new Date().toISOString(),
        manager: targetEmail,
      };

      // 1. If OAuth accessToken is available, upload LSA_Kuafor_Yedek.json directly to Google Drive
      if (driveAccount.accessToken) {
        await uploadBackupToGoogleDrive(driveAccount.accessToken, allData);
      }

      // 2. Also save to authenticated user's Firestore cloud backup document
      if (auth.currentUser) {
        await saveCloudBackupForUser(auth.currentUser, allData, timestamp);
      }

      setDriveAccount((prev) => ({
        ...prev,
        isConnected: true,
        lastBackup: timestamp,
      }));

      setGoogleUser((prev) => ({
        ...prev,
        lastDriveBackup: timestamp,
      }));

      addToast(
        'Google Drive Yedeği Alındı',
        `${targetEmail} hesabına tüm salon verileri yedeklendi.`,
        'success'
      );
    } catch {
      addToast('Yedekleme Hatası', 'Google Drive yedeği kaydedilirken bir hata oluştu.', 'error');
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const handleDriveRestore = async () => {
    if (!driveAccount.isConnected && !googleUser.isLoggedIn) {
      setIsDriveModalOpen(true);
      return;
    }

    setIsDriveSyncing(true);
    try {
      let restoredData: any = null;
      let restoredTime = '';

      // 1. Try restoring from Google Drive API if accessToken is present
      if (driveAccount.accessToken) {
        restoredData = await downloadBackupFromGoogleDrive(driveAccount.accessToken);
      }

      // 2. Fallback to Firestore Cloud Backup for this user
      if (!restoredData && auth.currentUser) {
        const backup = await loadCloudBackupForUser(auth.currentUser);
        if (backup?.data) {
          restoredData = backup.data;
          restoredTime = backup.updatedAt;
        }
      }

      if (!restoredData) {
        addToast(
          'Yedek Bulunamadı',
          'Bu Google Drive hesabına ait kayıtlı bir yedek bulunamadı.',
          'info'
        );
        return;
      }

      if (Array.isArray(restoredData.appointments)) setAppointments(restoredData.appointments);
      if (Array.isArray(restoredData.services)) setServices(restoredData.services);
      if (Array.isArray(restoredData.staffList)) setStaffList(restoredData.staffList);
      if (Array.isArray(restoredData.customers)) setCustomers(restoredData.customers);
      if (Array.isArray(restoredData.transactions)) setTransactions(restoredData.transactions);
      if (restoredData.salonSettings) setSalonSettings(restoredData.salonSettings);

      if (restoredTime) {
        setDriveAccount((prev) => ({ ...prev, lastBackup: restoredTime }));
        setGoogleUser((prev) => ({ ...prev, lastDriveBackup: restoredTime }));
      }

      addToast(
        'Google Drive Yedeği Yüklendi',
        'Kayıtlı bulut yedeği başarıyla geri yüklendi.',
        'success'
      );
    } catch {
      addToast('Yükleme Hatası', 'Google Drive yedeği okunurken bir hata oluştu.', 'error');
    } finally {
      setIsDriveSyncing(false);
    }
  };

  // --- Local Offline Backup Handlers ---
  const handleExportData = () => {
    const allData = {
      salonName: salonSettings.salonName,
      appointments,
      transactions,
      services,
      staffList,
      customers,
      salonSettings,
      exportDate: new Date().toISOString(),
    };

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `LSA_Kuafor_Yedek_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast('Yedek İndirildi', 'Tüm veriler JSON olarak indirildi.', 'success');
  };

  const handleImportData = (data: any) => {
    if (Array.isArray(data.appointments)) setAppointments(data.appointments);
    if (Array.isArray(data.services)) setServices(data.services);
    if (Array.isArray(data.staffList)) setStaffList(data.staffList);
    if (Array.isArray(data.customers)) setCustomers(data.customers);
    if (Array.isArray(data.transactions)) setTransactions(data.transactions);
    if (data.salonSettings) setSalonSettings(data.salonSettings);

    addToast('Veriler Yüklendi', 'Yedek başarıyla geri yüklendi.', 'success');
  };

  const handleLoadDemoData = () => {
    setAppointments(generateInitialAppointments());
    setTransactions(generateInitialTransactions());
    setServices(DEFAULT_SERVICES);
    setStaffList(DEFAULT_STAFF);
    setCustomers(DEFAULT_CUSTOMERS);
    setSalonSettings(DEFAULT_SALON_SETTINGS);
    addToast('Demo Veriler Yüklendi', 'Örnek randevular, kasa ve müşteriler yüklendi.', 'success');
  };

  const pendingCount = appointments.filter(
    (a) => a.date === getTodayDateString() && a.status === 'bekliyor'
  ).length;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex flex-col font-sans pb-28 md:pb-12 transition-colors duration-200">
      {/* Toast Alert System */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* 1-Hour Auto Reminder 10-Second Countdown Confirmation Modal */}
      <AutoReminderModal
        appointment={reminderPromptAppointment}
        whatsappGreeting={salonSettings.whatsappGreeting}
        onConfirmSend={handleSendAppointmentMessage}
        onSkipSend={handleSkipAppointmentMessage}
      />

      {/* Siri Voice Recognition Floating Message Bubble */}
      <SiriVoiceOverlay
        isActive={isVoiceActive}
        onClose={() => setIsVoiceActive(false)}
        onAppointmentCreated={handleVoiceAppointmentCreated}
        onStaffCreated={(staffData) => handleSaveStaff(staffData)}
        services={services}
        staffList={staffList}
      />

      {/* Header */}
      <Header
        onOpenManualModal={() => {
          setAppointmentToEdit(null);
          setModalInitialDate(selectedDate);
          setModalInitialCustomer(null);
          setIsManualModalOpen(true);
        }}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingCount}
        onToggleVoice={() => setIsVoiceActive((prev) => !prev)}
        isVoiceActive={isVoiceActive}
      />

      {/* Main Tab Views */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4">
        {activeTab === 'appointments' && (
          <AppointmentsTab
            appointments={appointments}
            services={services}
            staffList={staffList}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onCompleteAppointment={handleCompleteAppointment}
            onCancelAppointment={handleCancelAppointment}
            onEditAppointment={handleEditAppointment}
            onOpenManualModal={() => {
              setAppointmentToEdit(null);
              setModalInitialDate(selectedDate);
              setModalInitialCustomer(null);
              setIsManualModalOpen(true);
            }}
            onOpenNewAppointmentForDate={handleOpenNewAppointmentForDate}
            onViewAppointmentDetails={(app) => setSelectedAppointmentForDetails(app)}
            whatsappGreeting={salonSettings.whatsappGreeting}
          />
        )}

        {activeTab === 'accounting' && (
          <AccountingTab
            transactions={transactions}
            staffList={staffList}
            services={services}
            appointments={appointments}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onClearAccounting={handleClearAccounting}
            onUpdatePrice={handleUpdatePrice}
            onAddService={handleAddService}
            onDeleteService={handleDeleteService}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersTab
            customers={customers}
            appointments={appointments}
            services={services}
            staffList={staffList}
            transactions={transactions}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onSelectCustomer={(c) => setSelectedCustomerForDetails(c)}
            onEditStaff={(staff) => {
              setStaffToEdit(staff);
              setIsStaffModalOpen(true);
            }}
            onDeleteStaff={handleDeleteStaff}
            onAddNewStaff={() => {
              setStaffToEdit(null);
              setIsStaffModalOpen(true);
            }}
            onSaveStaff={(staffData) => handleSaveStaff(staffData)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            salonSettings={salonSettings}
            googleUser={googleUser}
            driveAccount={driveAccount}
            themeMode={themeMode}
            onThemeChange={setThemeMode}
            onUpdateSettings={setSalonSettings}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
            onOpenDriveModal={() => setIsDriveModalOpen(true)}
            onDriveSignOut={handleSignOutDrive}
            onExportData={handleExportData}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
            onDriveBackup={handleDriveBackup}
            onDriveRestore={handleDriveRestore}
            isDriveSyncing={isDriveSyncing}
          />
        )}
      </main>

      {/* Appointment Detail & Message Send/Skip Modal (On appointment click) */}
      <AppointmentDetailModal
        appointment={selectedAppointmentForDetails}
        onClose={() => setSelectedAppointmentForDetails(null)}
        service={services.find(
          (s) => s.id === selectedAppointmentForDetails?.serviceId
        )}
        staff={staffList.find(
          (st) => st.id === selectedAppointmentForDetails?.staffId
        )}
        whatsappGreeting={salonSettings.whatsappGreeting}
        onComplete={handleCompleteAppointment}
        onEdit={(app) => {
          setSelectedAppointmentForDetails(null);
          handleEditAppointment(app);
        }}
        onCancel={handleCancelAppointment}
        onSendManualMessage={handleSendAppointmentMessage}
        onSkipAutoMessage={handleSkipAppointmentMessage}
        onTriggerCountdownPrompt={(app) => setReminderPromptAppointment(app)}
      />

      {/* Separate Google Drive Login & Backup Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        driveAccount={driveAccount}
        googleUser={googleUser}
        isSyncing={isDriveSyncing}
        onSignInDrivePopup={handleSignInDrivePopup}
        onLinkCurrentGoogleToDrive={handleLinkCurrentGoogleToDrive}
        onSignOutDrive={handleSignOutDrive}
        onBackupNow={handleDriveBackup}
        onRestoreNow={handleDriveRestore}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomerForDetails}
        onClose={() => setSelectedCustomerForDetails(null)}
        appointments={appointments}
        transactions={transactions}
        services={services}
        staffList={staffList}
        onOpenNewAppointment={(name, phone) => {
          setSelectedCustomerForDetails(null);
          setAppointmentToEdit(null);
          setModalInitialDate(selectedDate);
          setModalInitialCustomer({ name, phone });
          setIsManualModalOpen(true);
        }}
      />

      {/* Manual Add/Edit Appointment Modal */}
      <AppointmentModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setAppointmentToEdit(null);
          setModalInitialCustomer(null);
        }}
        onSave={handleSaveAppointment}
        services={services}
        staffList={staffList}
        existingAppointments={appointments}
        appointmentToEdit={appointmentToEdit}
        initialDate={modalInitialDate}
        initialCustomer={modalInitialCustomer}
      />

      {/* Staff Edit & Add Modal */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setStaffToEdit(null);
        }}
        onSave={handleSaveStaff}
        onDelete={handleDeleteStaff}
        staffToEdit={staffToEdit}
      />

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onExport={handleExportData}
        onImport={handleImportData}
        onLoadDemo={handleLoadDemoData}
      />
    </div>
  );
}
