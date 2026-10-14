import React, { useState, useEffect, useRef } from 'react';
import { Mic, Check, X, Keyboard, UserPlus, CalendarPlus } from 'lucide-react';
import { Service, Staff, Appointment } from '../types';
import {
  parseTurkishVoiceInput,
  ParsedVoiceResult,
  parseTurkishStaffVoiceInput,
  ParsedStaffVoiceResult,
} from '../utils/voiceParser';
import { getTodayDateString, CORPORATE_BARBER_AVATAR } from '../data/defaults';
import { playMicStartBeep, playMicStopBeep, playSuccessChime } from '../utils/soundEffects';

interface SiriVoiceOverlayProps {
  isActive: boolean;
  onClose: () => void;
  onAppointmentCreated: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onStaffCreated?: (staff: Omit<Staff, 'id'> & { id?: number }) => void;
  services: Service[];
  staffList: Staff[];
  initialMode?: 'appointment' | 'staff';
}

export const SiriVoiceOverlay: React.FC<SiriVoiceOverlayProps> = ({
  isActive,
  onClose,
  onAppointmentCreated,
  onStaffCreated,
  services,
  staffList,
  initialMode = 'appointment',
}) => {
  const [voiceMode, setVoiceMode] = useState<'appointment' | 'staff'>(initialMode);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedVoiceResult | null>(null);
  const [parsedStaff, setParsedStaff] = useState<ParsedStaffVoiceResult | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Bip! Dinleniyor... Şimdi konuşun');
  const [showManualInput, setShowManualInput] = useState(false);

  // Refs to prevent useEffect from ever aborting SpeechRecognition on state/prop updates
  const recognitionRef = useRef<any>(null);
  const shouldKeepListeningRef = useRef<boolean>(false);
  const accumulatedFinalRef = useRef<string>('');
  const countdownIntervalRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const retriedPermissionRef = useRef<boolean>(false);

  const servicesRef = useRef(services);
  const staffListRef = useRef(staffList);
  const onCloseRef = useRef(onClose);
  const onAppointmentCreatedRef = useRef(onAppointmentCreated);
  const onStaffCreatedRef = useRef(onStaffCreated);
  const voiceModeRef = useRef(voiceMode);
  const parsedResultRef = useRef<ParsedVoiceResult | null>(null);
  const parsedStaffRef = useRef<ParsedStaffVoiceResult | null>(null);

  useEffect(() => {
    servicesRef.current = services;
    staffListRef.current = staffList;
    onCloseRef.current = onClose;
    onAppointmentCreatedRef.current = onAppointmentCreated;
    onStaffCreatedRef.current = onStaffCreated;
  }, [services, staffList, onClose, onAppointmentCreated, onStaffCreated]);

  useEffect(() => {
    setVoiceMode(initialMode);
    voiceModeRef.current = initialMode;
  }, [initialMode, isActive]);

  const clearTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const stopRecognitionCleanly = () => {
    shouldKeepListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const executeSave = () => {
    clearTimers();
    stopRecognitionCleanly();

    if (voiceModeRef.current === 'staff' && parsedStaffRef.current && parsedStaffRef.current.name) {
      const st = parsedStaffRef.current;
      if (onStaffCreatedRef.current) {
        playSuccessChime();
        onStaffCreatedRef.current({
          name: st.name,
          role: st.role || 'Usta Berber',
          phone: st.phone || '',
          photo: CORPORATE_BARBER_AVATAR,
          workingHours: '09:00 - 21:00',
          commissionRate: st.commissionRate ?? 50,
        });
        onCloseRef.current();
        return;
      }
    }

    if (parsedResultRef.current) {
      const toSave = parsedResultRef.current;
      playSuccessChime();
      onAppointmentCreatedRef.current({
        customer: toSave.customer,
        phone: '',
        date: toSave.date,
        time: toSave.time,
        serviceId: toSave.serviceId,
        staffId: toSave.staffId,
        status: 'bekliyor',
        note: `Sesli Kayıt: "${toSave.rawText}"`,
      });
      onCloseRef.current();
    }
  };

  const startAutoSaveCountdown = () => {
    clearTimers();
    let sec = 3;
    setCountdown(sec);

    countdownIntervalRef.current = setInterval(() => {
      sec -= 1;
      setCountdown(sec);
      if (sec <= 0) {
        clearTimers();
        executeSave();
      }
    }, 1000);
  };

  const handleTranscriptUpdate = (text: string, scheduleAutoSave: boolean) => {
    setTranscript(text);
    const trimmed = text.trim();

    if (!trimmed) {
      setParsedResult(null);
      parsedResultRef.current = null;
      setParsedStaff(null);
      parsedStaffRef.current = null;
      clearTimers();
      setCountdown(null);
      return;
    }

    // Check if the user explicitly said "personel ekle ..."
    const lower = trimmed.toLocaleLowerCase('tr-TR');
    const isExplicitStaffCommand =
      lower.startsWith('personel ekle') ||
      lower.startsWith('yeni personel') ||
      voiceModeRef.current === 'staff';

    if (isExplicitStaffCommand && onStaffCreatedRef.current) {
      if (voiceModeRef.current !== 'staff') {
        setVoiceMode('staff');
        voiceModeRef.current = 'staff';
      }
      const staffParsed = parseTurkishStaffVoiceInput(trimmed);
      setParsedStaff(staffParsed);
      parsedStaffRef.current = staffParsed;

      if (scheduleAutoSave && staffParsed.name.length >= 2) {
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = setTimeout(() => {
          startAutoSaveCountdown();
        }, 1400);
      }
    } else {
      const todayStr = getTodayDateString();
      const appParsed = parseTurkishVoiceInput(
        trimmed,
        todayStr,
        servicesRef.current,
        staffListRef.current
      );
      setParsedResult(appParsed);
      parsedResultRef.current = appParsed;

      if (scheduleAutoSave && trimmed.length >= 3) {
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = setTimeout(() => {
          startAutoSaveCountdown();
        }, 1400);
      }
    }
  };

  const launchRecognitionInstance = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(false);
      setShowManualInput(true);
      setStatusMessage('Tarayıcı ses tanımayı desteklemiyor, aşağıdan yazabilirsiniz');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.interimResults = true;
      // continuous = false is much more reliable on mobile Android/iOS; we auto-restart onend if still listening
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('Bip! Dinleniyor... Şimdi konuşun');
      };

      recognition.onresult = (event: any) => {
        let interimChunk = '';
        let newFinalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinalChunk += piece + ' ';
          } else {
            interimChunk += piece;
          }
        }

        if (newFinalChunk) {
          accumulatedFinalRef.current = (accumulatedFinalRef.current + ' ' + newFinalChunk).trim();
        }

        const combined = (accumulatedFinalRef.current + ' ' + interimChunk).trim();
        if (combined) {
          handleTranscriptUpdate(combined, true);
        }
      };

      recognition.onerror = (event: any) => {
        const err = event.error;
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          // Try requesting microphone permission via getUserMedia once
          if (!retriedPermissionRef.current && navigator.mediaDevices?.getUserMedia) {
            retriedPermissionRef.current = true;
            setStatusMessage('Mikrofon izni isteniyor...');
            navigator.mediaDevices
              .getUserMedia({ audio: true })
              .then((stream) => {
                // Immediately release hardware tracks so SpeechRecognition can use the mic
                stream.getTracks().forEach((t) => t.stop());
                if (shouldKeepListeningRef.current) {
                  setTimeout(() => launchRecognitionInstance(), 150);
                }
              })
              .catch(() => {
                shouldKeepListeningRef.current = false;
                setIsListening(false);
                setShowManualInput(true);
                setStatusMessage('Mikrofon izni reddedildi. Klavye ile yazabilirsiniz.');
              });
          } else {
            shouldKeepListeningRef.current = false;
            setIsListening(false);
            setShowManualInput(true);
            setStatusMessage('Mikrofon izni kapalı. Aşağıdan yazarak ekleyebilirsiniz.');
          }
        } else if (err === 'no-speech') {
          // Keep listening or allow tap
          if (!accumulatedFinalRef.current) {
            setStatusMessage('Ses duyulmadı, konuşmaya başlayabilirsiniz...');
          }
        } else if (err === 'network') {
          shouldKeepListeningRef.current = false;
          setIsListening(false);
          setShowManualInput(true);
          setStatusMessage('Ağ ses servisi hatası, aşağıdan hızlıca yazabilirsiniz.');
        }
      };

      recognition.onend = () => {
        // Seamlessly restart if user hasn't closed and we are still actively listening
        if (shouldKeepListeningRef.current) {
          try {
            recognition.start();
            return;
          } catch {
            // Fall through
          }
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setShowManualInput(true);
      setStatusMessage('Ses tanıma başlatılamadı, aşağıdan yazabilirsiniz.');
    }
  };

  // ONLY depends on [isActive]! Never aborts on state or prop re-renders!
  useEffect(() => {
    if (!isActive) {
      stopRecognitionCleanly();
      setTranscript('');
      setParsedResult(null);
      parsedResultRef.current = null;
      setParsedStaff(null);
      parsedStaffRef.current = null;
      accumulatedFinalRef.current = '';
      setCountdown(null);
      setShowManualInput(false);
      clearTimers();
      return;
    }

    accumulatedFinalRef.current = '';
    retriedPermissionRef.current = false;
    shouldKeepListeningRef.current = true;
    launchRecognitionInstance();

    return () => {
      stopRecognitionCleanly();
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  if (!isActive) return null;

  const switchMode = (newMode: 'appointment' | 'staff') => {
    setVoiceMode(newMode);
    voiceModeRef.current = newMode;
    if (transcript.trim()) {
      handleTranscriptUpdate(transcript, false);
    }
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md pointer-events-auto">
      <div className="bg-zinc-950/95 text-white backdrop-blur-xl border border-red-500/60 rounded-3xl p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.5),0_0_20px_rgba(220,38,38,0.28)] animate-in slide-in-from-bottom-3">
        {/* Top Mode Selector Strip (Randevu vs Personel Sesle Ekle) */}
        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => switchMode('appointment')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                voiceMode === 'appointment'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarPlus className="w-3 h-3" />
              <span>Sesle Randevu</span>
            </button>
            {onStaffCreated && (
              <button
                type="button"
                onClick={() => switchMode('staff')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                  voiceMode === 'staff'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3 h-3" />
                <span>Sesle Personel Ekle</span>
              </button>
            )}
          </div>

          {countdown !== null && (
            <span className="text-[10px] text-amber-400 font-mono font-bold animate-pulse">
              {countdown} sn içinde kaydediliyor...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Mic Button (Tap to re-trigger beep & listen) */}
          <button
            type="button"
            onClick={() => {
              playMicStartBeep();
              accumulatedFinalRef.current = '';
              setTranscript('');
              setParsedResult(null);
              parsedResultRef.current = null;
              setParsedStaff(null);
              parsedStaffRef.current = null;
              setCountdown(null);
              clearTimers();
              shouldKeepListeningRef.current = true;
              launchRecognitionInstance();
            }}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer btn-3d-red ${
              isListening ? 'ring-4 ring-red-500/40 scale-105' : ''
            }`}
            title="Tekrar Dinle"
          >
            <Mic className={`w-5 h-5 text-white ${isListening ? 'animate-bounce' : ''}`} />
          </button>

          {/* Center Speech-to-Text Display */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              {isListening && (
                <span className="flex items-center gap-0.5 h-2.5">
                  <span className="w-0.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="w-0.5 h-3.5 bg-red-400 rounded-full animate-pulse" />
                  <span className="w-0.5 h-2 bg-red-500 rounded-full animate-pulse" />
                </span>
              )}
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider truncate">
                {statusMessage}
              </span>
            </div>

            {showManualInput ? (
              <input
                type="text"
                autoFocus
                value={transcript}
                onChange={(e) => handleTranscriptUpdate(e.target.value, false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    executeSave();
                  }
                }}
                placeholder={
                  voiceMode === 'staff'
                    ? 'Örn: Mehmet Yılmaz Usta Berber yüzde 50'
                    : 'Örn: Ahmet Yalçın cuma günü saat ikide İbrahim'
                }
                className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
              />
            ) : (
              <div
                onClick={() => setShowManualInput(true)}
                className="text-xs font-semibold text-white truncate cursor-text hover:text-red-200 transition"
                title="Metni düzenlemek için dokunun"
              >
                {transcript ? (
                  <span className="text-white font-bold">"{transcript}"</span>
                ) : (
                  <span className="text-zinc-400 italic">
                    {voiceMode === 'staff'
                      ? '"Mehmet Yılmaz Usta Berber yüzde 50..."'
                      : '"Ahmet Yalçın cuma günü saat ikide İbrahim..."'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Quick Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowManualInput((v) => !v)}
              className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition cursor-pointer border border-zinc-700"
              title="Klavye ile Yaz / Düzenle"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>

            {((voiceMode === 'appointment' && parsedResult) ||
              (voiceMode === 'staff' && parsedStaff?.name)) && (
              <button
                type="button"
                onClick={executeSave}
                className="w-8 h-8 rounded-xl btn-3d-green flex items-center justify-center cursor-pointer"
                title="Onayla ve Kaydet"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                playMicStopBeep();
                stopRecognitionCleanly();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer border border-zinc-700"
              title="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Parsed Appointment Preview Strip */}
        {voiceMode === 'appointment' && parsedResult && (
          <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between gap-2 text-[11px] text-zinc-200">
            <div className="truncate font-semibold">
              <span className="text-red-400 font-bold">{parsedResult.customer}</span>
              <span className="mx-1.5 text-zinc-600">·</span>
              <span>{parsedResult.dateLabel}</span>
              <span className="mx-1.5 text-zinc-600">·</span>
              <span className="font-mono font-bold text-white">{parsedResult.time}</span>
              <span className="mx-1.5 text-zinc-600">·</span>
              <span className="text-zinc-300">{parsedResult.staffName}</span>
            </div>
            <button
              type="button"
              onClick={executeSave}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold shrink-0 cursor-pointer"
            >
              Kaydet
            </button>
          </div>
        )}

        {/* Live Parsed Staff Preview Strip */}
        {voiceMode === 'staff' && parsedStaff && parsedStaff.name && (
          <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between gap-2 text-[11px] text-zinc-200">
            <div className="truncate font-semibold">
              <span className="text-red-400 font-bold">{parsedStaff.name}</span>
              <span className="mx-1.5 text-zinc-600">·</span>
              <span>{parsedStaff.role}</span>
              <span className="mx-1.5 text-zinc-600">·</span>
              <span className="font-mono font-bold text-white">
                Ciro Payı: %{parsedStaff.commissionRate}
              </span>
            </div>
            <button
              type="button"
              onClick={executeSave}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold shrink-0 cursor-pointer"
            >
              Personeli Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
