import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Customer, Appointment, Service, Staff, Transaction } from '../types';
import {
  Search,
  UserPlus,
  Phone,
  MessageCircle,
  X,
  Clock,
  Users,
  Contact,
  Edit2,
  Trash2,
  Check,
  Mic,
} from 'lucide-react';
import {
  generateWhatsAppLink,
  CORPORATE_BARBER_AVATAR,
} from '../data/defaults';
import { playMicStartBeep, playMicStopBeep, playSuccessChime } from '../utils/soundEffects';
import { parseTurkishStaffVoiceInput, ParsedStaffVoiceResult } from '../utils/voiceParser';

interface CustomersTabProps {
  customers: Customer[];
  appointments: Appointment[];
  services: Service[];
  staffList: Staff[];
  transactions: Transaction[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onUpdateCustomer: (id: number, customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onDeleteCustomer: (id: number) => void;
  onSelectCustomer: (customer: Customer) => void;
  onEditStaff: (staff: Staff) => void;
  onDeleteStaff: (id: number) => void;
  onAddNewStaff: () => void;
  onSaveStaff?: (staffData: Omit<Staff, 'id'> & { id?: number }) => void;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  customers,
  appointments,
  services,
  staffList,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onSelectCustomer,
  onEditStaff,
  onDeleteStaff,
  onAddNewStaff,
  onSaveStaff,
}) => {
  const [activePage, setActivePage] = useState<'musteriler' | 'personel'>('musteriler');

  // Customer state (Manual Add & Edit Modal)
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Touch Swipe-left state for mobile
  const [swipedCustomerId, setSwipedCustomerId] = useState<number | null>(null);
  const [swipedStaffId, setSwipedStaffId] = useState<number | null>(null);

  const dragStartXRef = useRef<number | null>(null);
  const dragCurrentDeltaRef = useRef<number>(0);
  const didSwipeRef = useRef<boolean>(false);

  // Staff Voice Add State
  const [isStaffVoiceOpen, setIsStaffVoiceOpen] = useState(false);
  const [isStaffListening, setIsStaffListening] = useState(false);
  const [staffVoiceText, setStaffVoiceText] = useState('');
  const [parsedStaffVoice, setParsedStaffVoice] = useState<ParsedStaffVoiceResult | null>(null);
  const [staffVoiceStatus, setStaffVoiceStatus] = useState('Dinleniyor...');

  const staffRecognitionRef = useRef<any>(null);
  const wantStaffListenRef = useRef<boolean>(false);
  const staffFinalAccumRef = useRef<string>('');

  const stopStaffVoice = () => {
    wantStaffListenRef.current = false;
    if (staffRecognitionRef.current) {
      try {
        staffRecognitionRef.current.onend = null;
        staffRecognitionRef.current.abort();
      } catch {}
      staffRecognitionRef.current = null;
    }
    setIsStaffListening(false);
  };

  useEffect(() => {
    return () => {
      stopStaffVoice();
    };
  }, []);

  const handleStaffVoiceTextChange = (text: string) => {
    setStaffVoiceText(text);
    if (!text.trim()) {
      setParsedStaffVoice(null);
      return;
    }
    const parsed = parseTurkishStaffVoiceInput(text);
    setParsedStaffVoice(parsed);
  };

  const startStaffVoiceRecognition = () => {
    playMicStartBeep();
    setIsStaffVoiceOpen(true);
    staffFinalAccumRef.current = '';
    setStaffVoiceText('');
    setParsedStaffVoice(null);

    if (staffRecognitionRef.current) {
      try {
        staffRecognitionRef.current.onend = null;
        staffRecognitionRef.current.abort();
      } catch {}
      staffRecognitionRef.current = null;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsStaffListening(false);
      setStaffVoiceStatus('Ses desteklenmiyor');
      return;
    }

    wantStaffListenRef.current = true;

    const launch = () => {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'tr-TR';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
          setIsStaffListening(true);
          setStaffVoiceStatus('Dinleniyor...');
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          let finalChunk = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalChunk += t + ' ';
            } else {
              interim += t;
            }
          }
          if (finalChunk) {
            staffFinalAccumRef.current = (staffFinalAccumRef.current + ' ' + finalChunk).trim();
          }
          const combined = (staffFinalAccumRef.current + ' ' + interim).trim();
          if (combined) {
            handleStaffVoiceTextChange(combined);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            if (navigator.mediaDevices?.getUserMedia) {
              navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                  stream.getTracks().forEach((tr) => tr.stop());
                  if (wantStaffListenRef.current) {
                    setTimeout(() => launch(), 150);
                  }
                })
                .catch(() => {
                  wantStaffListenRef.current = false;
                  setIsStaffListening(false);
                });
            } else {
              wantStaffListenRef.current = false;
              setIsStaffListening(false);
            }
          }
        };

        recognition.onend = () => {
          if (wantStaffListenRef.current) {
            try {
              recognition.start();
              return;
            } catch {}
          }
          setIsStaffListening(false);
        };

        staffRecognitionRef.current = recognition;
        recognition.start();
      } catch {
        setIsStaffListening(false);
      }
    };

    launch();
  };

  const handleConfirmStaffVoice = () => {
    if (!parsedStaffVoice || !parsedStaffVoice.name.trim()) return;
    stopStaffVoice();
    playSuccessChime();

    if (onSaveStaff) {
      onSaveStaff({
        name: parsedStaffVoice.name.trim(),
        role: parsedStaffVoice.role || 'Usta Berber',
        phone: parsedStaffVoice.phone || '',
        photo: CORPORATE_BARBER_AVATAR,
        workingHours: '09:00 - 21:00',
        commissionRate: parsedStaffVoice.commissionRate ?? 50,
      });
    }
    setIsStaffVoiceOpen(false);
    setStaffVoiceText('');
    setParsedStaffVoice(null);
  };

  const enrichedCustomers = useMemo(() => {
    return customers
      .map((c) => {
        const cApps = appointments.filter(
          (a) =>
            a.customer.toLowerCase().trim() === c.name.toLowerCase().trim() ||
            (c.phone && a.phone.replace(/\D/g, '') === c.phone.replace(/\D/g, ''))
        );

        const completedCount = cApps.filter((a) => a.status === 'tamamlandi').length;
        const totalSpent = cApps
          .filter((a) => a.status === 'tamamlandi')
          .reduce((sum, a) => {
            const srv = services.find((s) => s.id === a.serviceId);
            return sum + (srv ? srv.price : 0);
          }, 0);

        const lastVisit = cApps.length > 0 ? cApps[0].date : c.createdAt;

        return {
          ...c,
          totalVisits: cApps.length,
          completedCount,
          totalSpent,
          lastVisit,
        };
      })
      .filter((c) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.notes && c.notes.toLowerCase().includes(q))
        );
      });
  }, [customers, appointments, services, searchTerm]);

  const openNewCustomerModal = () => {
    setEditingCustomer(null);
    setNewName('');
    setNewPhone('');
    setNewNotes('');
    setIsCustomerModalOpen(true);
  };

  const openEditCustomerModal = (c: Customer) => {
    setEditingCustomer(c);
    setNewName(c.name);
    setNewPhone(c.phone || '');
    setNewNotes(c.notes || '');
    setIsCustomerModalOpen(true);
    setSwipedCustomerId(null);
  };

  const handleSaveCustomerForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (editingCustomer) {
      onUpdateCustomer(editingCustomer.id, {
        name: newName.trim(),
        phone: newPhone.trim(),
        notes: newNotes.trim(),
      });
    } else {
      onAddCustomer({
        name: newName.trim(),
        phone: newPhone.trim(),
        notes: newNotes.trim(),
      });
    }

    setNewName('');
    setNewPhone('');
    setNewNotes('');
    setEditingCustomer(null);
    setIsCustomerModalOpen(false);
  };

  // Touch & Mouse Drag Left Swipe Support
  const handleSwipeStart = (clientX: number) => {
    dragStartXRef.current = clientX;
    dragCurrentDeltaRef.current = 0;
    didSwipeRef.current = false;
  };

  const handleSwipeMove = (clientX: number) => {
    if (dragStartXRef.current === null) return;
    const delta = clientX - dragStartXRef.current;
    dragCurrentDeltaRef.current = delta;
    if (Math.abs(delta) > 12) {
      didSwipeRef.current = true;
    }
  };

  const handleCustomerSwipeEnd = (id: number) => {
    if (dragStartXRef.current === null) return;
    const delta = dragCurrentDeltaRef.current;
    dragStartXRef.current = null;
    if (delta < -30) {
      setSwipedCustomerId(id);
    } else if (delta > 30) {
      if (swipedCustomerId === id) setSwipedCustomerId(null);
    }
  };

  const handleStaffSwipeEnd = (id: number) => {
    if (dragStartXRef.current === null) return;
    const delta = dragCurrentDeltaRef.current;
    dragStartXRef.current = null;
    if (delta < -30) {
      setSwipedStaffId(id);
    } else if (delta > 30) {
      if (swipedStaffId === id) setSwipedStaffId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Sub-Page Switcher */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 p-2 rounded-3xl card-app">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setActivePage('musteriler');
              setSwipedStaffId(null);
            }}
            className={`h-10 px-3 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none ${
              activePage === 'musteriler' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            <Contact className="w-4 h-4 shrink-0" />
            <span>Müşteri Rehberi ({customers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePage('personel');
              setSwipedCustomerId(null);
            }}
            className={`h-10 px-3 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none ${
              activePage === 'personel' ? 'btn-3d-red font-black' : 'btn-3d-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Personel Kadrosu ({staffList.length})</span>
          </button>
        </div>
      </div>

      {/* --- PAGE 1: MÜŞTERİLER (Hover or Swipe Left Slides Row to Reveal Düzenle / Sil - No Extra Toggle Button) --- */}
      {activePage === 'musteriler' && (
        <div className="space-y-3.5 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                Müşteri Rehberi
              </h3>

              <button
                type="button"
                onClick={openNewCustomerModal}
                className="h-9 sm:h-10 px-3.5 btn-3d-red text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap leading-none"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span>Yeni Müşteri</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rehberde müşteri adı veya telefon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600 transition"
              />
            </div>
          </div>

          {/* Single-Column Phone Contacts List: Slides Left on Hover or Swipe */}
          <div className="flex flex-col space-y-2">
            {enrichedCustomers.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800">
                <Contact className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Kayıtlı müşteri bulunamadı.
                </p>
              </div>
            ) : (
              enrichedCustomers.map((c) => {
                const whatsappUrl = c.phone
                  ? generateWhatsAppLink(c.phone, c.name, '14:00')
                  : '';
                const cleanTel = c.phone ? c.phone.replace(/\s+/g, '') : '';
                const isSwiped = swipedCustomerId === c.id;

                return (
                  <div
                    key={c.id}
                    className="group relative overflow-hidden rounded-2xl"
                  >
                    {/* Right Action Tray (Revealed when hovered or swiped left) */}
                    <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 pr-2 pl-3 bg-gray-100 dark:bg-zinc-800/95 rounded-r-2xl z-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCustomerModal(c);
                        }}
                        className="h-9 px-3 rounded-xl btn-3d-white text-xs font-bold text-gray-800 dark:text-white inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Düzenle</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSwipedCustomerId(null);
                          onDeleteCustomer(c.id);
                        }}
                        className="h-9 px-3 rounded-xl btn-3d-red text-xs font-bold text-white inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Sil</span>
                      </button>
                    </div>

                    {/* Foreground Contact Card (Slides Left on Hover OR Touch Swipe - No Arrow Button!) */}
                    <div
                      onTouchStart={(e) => handleSwipeStart(e.touches[0].clientX)}
                      onTouchMove={(e) => handleSwipeMove(e.touches[0].clientX)}
                      onTouchEnd={() => handleCustomerSwipeEnd(c.id)}
                      onMouseDown={(e) => handleSwipeStart(e.clientX)}
                      onMouseMove={(e) => {
                        if (e.buttons === 1) handleSwipeMove(e.clientX);
                      }}
                      onMouseUp={() => handleCustomerSwipeEnd(c.id)}
                      onClick={() => {
                        if (didSwipeRef.current) {
                          didSwipeRef.current = false;
                          return;
                        }
                        if (isSwiped) {
                          setSwipedCustomerId(null);
                        } else {
                          onSelectCustomer(c);
                        }
                      }}
                      className={`relative z-10 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 group-hover:border-red-400 dark:group-hover:border-red-800 px-3.5 py-3 rounded-2xl card-app transition-transform duration-200 cursor-pointer flex items-center justify-between gap-3 select-none group-hover:-translate-x-[158px] ${
                        isSwiped ? '-translate-x-[158px]' : 'translate-x-0'
                      }`}
                    >
                      {/* Left: Avatar + Contact Name */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl btn-3d-red text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {c.name}
                          </h4>
                          {c.phone && (
                            <p className="text-[11px] font-mono text-gray-400 truncate">
                              {c.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Only Clean Phone & WhatsApp Icons (No Extra Swipe Button) */}
                      {(cleanTel || whatsappUrl) && (
                        <div
                          className="flex items-center gap-1.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {cleanTel && (
                            <a
                              href={`tel:${cleanTel}`}
                              className="w-9 h-9 rounded-xl btn-3d-white inline-flex items-center justify-center"
                              title={`Ara: ${c.phone}`}
                            >
                              <Phone className="w-4 h-4 text-red-600" />
                            </a>
                          )}

                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-9 h-9 rounded-xl btn-3d-green inline-flex items-center justify-center"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4 fill-white" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- PAGE 2: PERSONEL KADROSU (Slides Left on Hover or Swipe for Değiştir / Sil - No Extra Toggle Button) --- */}
      {activePage === 'personel' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 card-app space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Personel Kadrosu
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isStaffVoiceOpen && isStaffListening) {
                    playMicStopBeep();
                    stopStaffVoice();
                  } else {
                    startStaffVoiceRecognition();
                  }
                }}
                className={`h-10 px-3.5 text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none ${
                  isStaffVoiceOpen ? 'btn-3d-red ring-2 ring-red-400' : 'btn-3d-white'
                }`}
              >
                <Mic className={`w-3.5 h-3.5 shrink-0 ${isStaffListening ? 'animate-bounce text-white' : 'text-red-600'}`} />
                <span>Sesle Ekle</span>
              </button>

              <button
                type="button"
                onClick={onAddNewStaff}
                className="h-10 px-3.5 btn-3d-red text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap leading-none"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span>Yeni Personel</span>
              </button>
            </div>
          </div>

          {/* Active Voice Staff Creation Panel */}
          {isStaffVoiceOpen && (
            <div className="bg-zinc-950 text-white border border-red-500/60 rounded-3xl p-4 shadow-xl space-y-3 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startStaffVoiceRecognition}
                    className={`w-9 h-9 rounded-xl btn-3d-red flex items-center justify-center cursor-pointer ${
                      isStaffListening ? 'ring-4 ring-red-500/30' : ''
                    }`}
                  >
                    <Mic className={`w-4 h-4 text-white ${isStaffListening ? 'animate-bounce' : ''}`} />
                  </button>
                  <span className="text-xs font-bold text-red-400">
                    {staffVoiceStatus}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playMicStopBeep();
                    stopStaffVoice();
                    setIsStaffVoiceOpen(false);
                  }}
                  className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={staffVoiceText}
                  onChange={(e) => handleStaffVoiceTextChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmStaffVoice();
                  }}
                  placeholder="Personel adı ve ciro payı..."
                  className="flex-1 px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
                />

                <button
                  type="button"
                  disabled={!parsedStaffVoice?.name}
                  onClick={handleConfirmStaffVoice}
                  className="px-3.5 py-2 rounded-xl btn-3d-green text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          )}

          {/* Staff Single-Column List: Slides Left on Hover or Swipe (No Extra Toggle Button) */}
          <div className="flex flex-col space-y-2.5">
            {staffList.map((st) => {
              const rate = st.commissionRate ?? 50;
              const isSwiped = swipedStaffId === st.id;

              return (
                <div
                  key={st.id}
                  className="group relative overflow-hidden rounded-2xl"
                >
                  {/* Right Action Tray (Revealed on Hover or Swipe Left: Değiştir & Sil) */}
                  <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 pr-2.5 pl-3 bg-gray-100 dark:bg-zinc-800/95 rounded-r-2xl z-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSwipedStaffId(null);
                        onEditStaff(st);
                      }}
                      className="h-10 px-3.5 rounded-xl btn-3d-white text-xs font-bold text-gray-800 dark:text-white inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Değiştir</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSwipedStaffId(null);
                        onDeleteStaff(st.id);
                      }}
                      className="h-10 px-3.5 rounded-xl btn-3d-red text-xs font-bold text-white inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Sil</span>
                    </button>
                  </div>

                  {/* Foreground Staff Card (Slides Left on Hover OR Touch Swipe - Clean Visuals) */}
                  <div
                    onTouchStart={(e) => handleSwipeStart(e.touches[0].clientX)}
                    onTouchMove={(e) => handleSwipeMove(e.touches[0].clientX)}
                    onTouchEnd={() => handleStaffSwipeEnd(st.id)}
                    onMouseDown={(e) => handleSwipeStart(e.clientX)}
                    onMouseMove={(e) => {
                      if (e.buttons === 1) handleSwipeMove(e.clientX);
                    }}
                    onMouseUp={() => handleStaffSwipeEnd(st.id)}
                    onClick={() => {
                      if (didSwipeRef.current) {
                        didSwipeRef.current = false;
                        return;
                      }
                      if (isSwiped) {
                        setSwipedStaffId(null);
                      } else {
                        onEditStaff(st);
                      }
                    }}
                    className={`relative z-10 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 group-hover:border-red-400 dark:group-hover:border-red-800 rounded-2xl p-3.5 card-app transition-transform duration-200 cursor-pointer flex items-center justify-between gap-3 select-none group-hover:-translate-x-[172px] ${
                      isSwiped ? '-translate-x-[172px]' : 'translate-x-0'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <img
                        src={st.photo || CORPORATE_BARBER_AVATAR}
                        alt={st.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-red-600 shadow-sm shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = CORPORATE_BARBER_AVATAR;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {st.name}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {st.role}
                          </span>
                          <span className="text-gray-300 dark:text-zinc-700">·</span>
                          <span className="text-[11px] font-bold text-red-600 dark:text-red-400">
                            %{rate}
                          </span>
                        </div>
                        {(st.phone || st.workingHours) && (
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                            {st.phone && (
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-red-600" />
                                {st.phone}
                              </span>
                            )}
                            {st.workingHours && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {st.workingHours}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Add / Edit Customer Modal */}
      {isCustomerModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsCustomerModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800 mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="w-8 h-8 rounded-xl btn-3d-white text-gray-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomerForm} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ahmet Yalçın"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  placeholder="0532 000 00 00"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white font-mono focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Not
                </label>
                <input
                  type="text"
                  placeholder="Not..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-3d-red text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Check className="w-4 h-4" />
                <span>Kaydet</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
