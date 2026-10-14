import React, { useState, useEffect, useRef } from 'react';
import { Service, Staff, Appointment } from '../types';
import { Mic, MicOff, Sparkles, Check, X, Volume2, User, Clock, Scissors, UserCheck } from 'lucide-react';
import { getTodayDateString, getCurrentTimeString } from '../data/defaults';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  services: Service[];
  staffList: Staff[];
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onConfirmAppointment,
  services,
  staffList,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parsed fields
  const [customer, setCustomer] = useState('Yeni Müşteri');
  const [time, setTime] = useState(getCurrentTimeString());
  const [serviceId, setServiceId] = useState<number>(services[0]?.id || 1);
  const [staffId, setStaffId] = useState<number>(staffList[0]?.id || 1);
  const [parsed, setParsed] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setIsListening(false);
      setTranscript('');
      setErrorMessage(null);
      setParsed(false);
      return;
    }

    // Initialize speech recognition if available
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Tarayıcınız Web Speech ses tanıma API özelliğini doğrudan desteklemiyor. Aşağıdaki örnek komut butonları ile sesli komut motorunu test edebilirsiniz.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        parseVoiceInput(text);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage(
            'Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından mikrofon iznini kontrol edin veya örnek hazır butonları deneyin.'
          );
        } else if (event.error === 'no-speech') {
          setErrorMessage('Herhangi bir ses algılanamadı. Lütfen mikrofona tekrar konuşun.');
        } else {
          setErrorMessage(`Ses tanıma uyarısı: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      // Auto-start listening on open
      try {
        recognition.start();
      } catch {}
    } catch (err: any) {
      setErrorMessage('Ses tanıma servisi başlatılamadı: ' + err.message);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setErrorMessage(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        // Already started
      }
    }
  };

  const parseVoiceInput = (text: string) => {
    const raw = text.toLowerCase();

    // 1. Extract Time
    let detectedTime = getCurrentTimeString();
    // Matches 14:30 or 14.30
    const timeMatch = raw.match(/([0-1]?[0-9]|2[0-3])[:.]([0-5][0-9])/);
    if (timeMatch) {
      detectedTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    } else {
      // Matches "saat 14", "saat 3", "saat 16"
      const hourMatch = raw.match(/saat\s*(\d{1,2})/);
      if (hourMatch) {
        let h = parseInt(hourMatch[1], 10);
        if (h >= 1 && h <= 7) h += 12; // e.g. "saat 2" -> 14:00
        detectedTime = `${String(h).padStart(2, '0')}:00`;
      } else {
        // Matches number before 'da', 'de', 'te', 'ta' like "15'te", "14 te"
        const atHourMatch = raw.match(/(\d{1,2})\s*(te|ta|de|da)/);
        if (atHourMatch) {
          let h = parseInt(atHourMatch[1], 10);
          if (h >= 1 && h <= 7) h += 12;
          detectedTime = `${String(h).padStart(2, '0')}:00`;
        }
      }
    }
    setTime(detectedTime);

    // 2. Extract Service
    let matchedService = services[0];
    if (raw.includes('saç') && raw.includes('sakal')) {
      const combo = services.find((s) => s.name.toLowerCase().includes('kombin') || (s.name.includes('Saç') && s.name.includes('Sakal')));
      if (combo) matchedService = combo;
    } else if (raw.includes('sakal')) {
      const beard = services.find((s) => s.name.toLowerCase().includes('sakal') && !s.name.toLowerCase().includes('saç'));
      if (beard) matchedService = beard;
    } else if (raw.includes('cilt') || raw.includes('maske') || raw.includes('bakım')) {
      const skin = services.find((s) => s.name.toLowerCase().includes('cilt'));
      if (skin) matchedService = skin;
    } else if (raw.includes('yıkama') || raw.includes('fön')) {
      const wash = services.find((s) => s.name.toLowerCase().includes('fön') || s.name.toLowerCase().includes('yıkama'));
      if (wash) matchedService = wash;
    } else if (raw.includes('çocuk')) {
      const child = services.find((s) => s.name.toLowerCase().includes('çocuk'));
      if (child) matchedService = child;
    } else if (raw.includes('keratin') || raw.includes('botoks')) {
      const keratin = services.find((s) => s.name.toLowerCase().includes('keratin'));
      if (keratin) matchedService = keratin;
    } else if (raw.includes('damat') || raw.includes('vip')) {
      const damat = services.find((s) => s.name.toLowerCase().includes('damat'));
      if (damat) matchedService = damat;
    } else if (raw.includes('saç') || raw.includes('kesim') || raw.includes('tıraş')) {
      const hair = services.find((s) => s.name.toLowerCase().includes('saç kesimi'));
      if (hair) matchedService = hair;
    }
    setServiceId(matchedService.id);

    // 3. Extract Barber
    let matchedStaff = staffList[0];
    for (const staff of staffList) {
      const staffTokens = staff.name.toLowerCase().split(' ');
      if (staffTokens.some((token) => token.length > 2 && raw.includes(token))) {
        matchedStaff = staff;
        break;
      }
    }
    setStaffId(matchedStaff.id);

    // 4. Extract Customer Name
    let cleanName = raw;
    // Remove service keywords
    cleanName = cleanName
      .replace(/saç ve sakal|saç sakal|saç kesimi|sakal tıraşı|cilt bakımı|damat tıraşı|fön|yıkama/gi, '')
      .replace(/saç|sakal|kesim|tıraşı|tıraş|randevusu|randevu|yaz|ekle|için|bana|lütfen|ustam/gi, '')
      .replace(/saat\s*\d{1,2}(:\d{2})?/gi, '')
      .replace(/\d{1,2}[:.]\d{2}/gi, '')
      .replace(/\d{1,2}\s*(te|ta|de|da)/gi, '');

    // Remove staff name if mentioned
    staffList.forEach((st) => {
      st.name.split(' ').forEach((w) => {
        if (w.length > 2) {
          cleanName = cleanName.replace(new RegExp(w, 'gi'), '');
        }
      });
    });

    // Remove stray punctuation and spaces
    cleanName = cleanName.replace(/[.,;!?0-9]/g, ' ').replace(/\s+/g, ' ').trim();

    if (cleanName.length >= 2) {
      const formatted = cleanName
        .split(' ')
        .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1))
        .join(' ');
      setCustomer(formatted);
    } else {
      setCustomer('Müşteri (Sesli Kayıt)');
    }

    setParsed(true);
  };

  const handleTestPhrase = (phrase: string) => {
    setTranscript(phrase);
    setErrorMessage(null);
    parseVoiceInput(phrase);
  };

  const handleConfirm = () => {
    onConfirmAppointment({
      customer,
      phone: '',
      date: getTodayDateString(),
      time,
      serviceId,
      staffId,
      status: 'bekliyor',
      note: `Sesli Asistan: "${transcript}"`,
    });
    onClose();
  };

  if (!isOpen) return null;

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedStaff = staffList.find((s) => s.id === staffId);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Sesli Randevu Asistanı</h3>
              <p className="text-xs text-zinc-400">Türkçe doğal konuşma ile anında randevu oluşturun</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pulse / Mic Radar Zone */}
        <div className="py-6 flex flex-col items-center justify-center">
          <div className="relative mb-4">
            {isListening && (
              <>
                <div className="absolute -inset-4 rounded-full bg-amber-400/20 animate-ping" />
                <div className="absolute -inset-8 rounded-full bg-amber-400/10 animate-pulse" />
              </>
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                isListening
                  ? 'bg-amber-400 text-zinc-950 scale-105 shadow-amber-400/40 ring-4 ring-amber-400/30'
                  : 'bg-zinc-800 text-amber-400 hover:bg-zinc-700 hover:scale-105 border-2 border-zinc-700'
              }`}
            >
              {isListening ? (
                <Mic className="w-8 h-8 animate-bounce" />
              ) : (
                <MicOff className="w-8 h-8" />
              )}
            </button>
          </div>

          <p className="text-xs font-semibold text-center mb-1">
            {isListening ? (
              <span className="text-amber-400 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 animate-pulse" />
                Sizi Dinliyorum... Şimdi Konuşun
              </span>
            ) : (
              <span className="text-zinc-400">
                Mikrofona tıklayarak konuşmaya başlayın veya hazır örnekleri deneyin
              </span>
            )}
          </p>

          {/* Transcript View */}
          {transcript && (
            <div className="w-full mt-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
              <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">
                Algılanan Cümle
              </span>
              <p className="text-sm font-medium text-zinc-200 italic">"{transcript}"</p>
            </div>
          )}

          {errorMessage && (
            <div className="w-full mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200 text-xs">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Quick Test Chips */}
        <div className="mb-4">
          <span className="text-[11px] font-semibold text-zinc-400 block mb-2">
            Örnek Komutlar (Tıklayarak Test Edin):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Ahmet Bey saat 14:30 saç kesimi',
              'Burak saat 16 saç ve sakal İbrahim Emre',
              'Can Demir saat 17:00 sakal tıraşı Ahmet Usta',
              'Kemal Yılmaz saat 15 cilt bakımı',
            ].map((phrase, i) => (
              <button
                key={i}
                onClick={() => handleTestPhrase(phrase)}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>

        {/* Extracted Structured Card */}
        {parsed && (
          <div className="bg-zinc-950/80 border border-amber-500/30 p-4 rounded-2xl mb-4 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Otomatik Ayrıştırılan Randevu Detayları
              </span>
              <span className="text-[10px] text-zinc-400">Bugün İçin</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-400" /> Müşteri
                </span>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-100 font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> Saat
                </span>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-100 font-mono font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block mb-1 flex items-center gap-1">
                  <Scissors className="w-3 h-3 text-amber-400" /> Hizmet
                </span>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-xs text-zinc-100 font-semibold focus:border-amber-400 focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.price} ₺)
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] block mb-1 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-amber-400" /> Personel
                </span>
                <select
                  value={staffId}
                  onChange={(e) => setStaffId(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-1.5 py-1 text-xs text-zinc-100 font-semibold focus:border-amber-400 focus:outline-none"
                >
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-1/3 py-3 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold transition"
          >
            Kapat
          </button>
          <button
            onClick={handleConfirm}
            disabled={!parsed}
            className="w-2/3 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Randevuyu Onayla ve Ekle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
