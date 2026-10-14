import { Service, Staff } from '../types';
import { formatTurkishDate } from '../data/defaults';

export interface ParsedVoiceResult {
  customer: string;
  date: string;
  dateLabel: string;
  time: string;
  serviceId: number;
  serviceName: string;
  staffId: number;
  staffName: string;
  rawText: string;
}

export interface ParsedStaffVoiceResult {
  name: string;
  role: string;
  commissionRate: number;
  phone: string;
  rawText: string;
}

const TURKISH_WORD_NUMBERS: Record<string, number> = {
  bir: 1,
  birde: 1,
  bire: 1,
  iki: 2,
  ikide: 2,
  ikiye: 2,
  üç: 3,
  uc: 3,
  üçte: 3,
  ucte: 3,
  üçe: 3,
  dört: 4,
  dort: 4,
  dörtte: 4,
  dortte: 4,
  dörde: 4,
  beş: 5,
  bes: 5,
  beşte: 5,
  beste: 5,
  beşe: 5,
  altı: 6,
  alti: 6,
  altıda: 6,
  altida: 6,
  altıya: 6,
  yedi: 7,
  yedide: 7,
  yediye: 7,
  sekiz: 8,
  sekizde: 8,
  sekize: 8,
  dokuz: 9,
  dokuzda: 9,
  dokuza: 9,
  on: 10,
  onda: 10,
  ona: 10,
  onbir: 11,
  onbirde: 11,
  oniki: 12,
  onikide: 12,
};

const TURKISH_WEEKDAYS: { keys: string[]; dayIndex: number }[] = [
  { keys: ['pazartesi'], dayIndex: 1 },
  { keys: ['salı', 'sali'], dayIndex: 2 },
  { keys: ['çarşamba', 'carsamba'], dayIndex: 3 },
  { keys: ['perşembe', 'persembe'], dayIndex: 4 },
  { keys: ['cuma'], dayIndex: 5 },
  { keys: ['cumartesi'], dayIndex: 6 },
  { keys: ['pazar'], dayIndex: 0 },
];

export function parseTurkishVoiceInput(
  rawText: string,
  baseDateStr: string,
  services: Service[],
  staffList: Staff[]
): ParsedVoiceResult {
  const cleanText = rawText.trim();
  let workingText = cleanText.toLocaleLowerCase('tr-TR');

  // 1. Parse Target Date (Bugün, Yarın, Öbür gün, Haftanın günleri)
  const [bY, bM, bD] = baseDateStr.split('-').map(Number);
  const targetDateObj = new Date(bY, bM - 1, bD);

  if (workingText.includes('öbür gün') || workingText.includes('obur gun') || workingText.includes('ertesi gün')) {
    targetDateObj.setDate(targetDateObj.getDate() + 2);
    workingText = workingText.replace(/öbür gün|obur gun|ertesi gün/gi, ' ');
  } else if (workingText.includes('yarın') || workingText.includes('yarin')) {
    targetDateObj.setDate(targetDateObj.getDate() + 1);
    workingText = workingText.replace(/yarın|yarin/gi, ' ');
  } else if (workingText.includes('bugün') || workingText.includes('bugun')) {
    workingText = workingText.replace(/bugün|bugun/gi, ' ');
  } else {
    for (const wd of TURKISH_WEEKDAYS) {
      let matchedKey = '';
      for (const k of wd.keys) {
        const regex = new RegExp(`\\b${k}(\\s+günü|\\s+gunu)?\\b`, 'i');
        if (regex.test(workingText)) {
          matchedKey = k;
          workingText = workingText.replace(regex, ' ');
          break;
        }
      }
      if (matchedKey) {
        const currentDay = targetDateObj.getDay();
        let diff = wd.dayIndex - currentDay;
        if (diff <= 0) diff += 7;
        targetDateObj.setDate(targetDateObj.getDate() + diff);
        break;
      }
    }
  }

  const parsedDateStr = `${targetDateObj.getFullYear()}-${String(
    targetDateObj.getMonth() + 1
  ).padStart(2, '0')}-${String(targetDateObj.getDate()).padStart(2, '0')}`;

  // 2. Parse Time (e.g., "14:30", "14.30", "saat 15", "saat üç buçuk", "saat ikide", "16 da")
  let parsedHour = 14;
  let parsedMin = 0;
  let timeFound = false;

  const colonTimeMatch = workingText.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/);
  if (colonTimeMatch) {
    parsedHour = parseInt(colonTimeMatch[1], 10);
    parsedMin = parseInt(colonTimeMatch[2], 10);
    if (parsedHour >= 1 && parsedHour <= 7) parsedHour += 12;
    timeFound = true;
    workingText = workingText.replace(colonTimeMatch[0], ' ');
  }

  if (!timeFound) {
    const numTimeMatch = workingText.match(
      /(?:saat\s+)?\b(\d{1,2})\s*(buçuk|bucuk|çeyrek|ceyrek)?\s*(?:de|da|te|ta|ye|ya|e|a)?\b/i
    );
    if (numTimeMatch) {
      const h = parseInt(numTimeMatch[1], 10);
      if (h >= 1 && h <= 23) {
        parsedHour = h >= 1 && h <= 7 ? h + 12 : h;
        if (numTimeMatch[2]) {
          const mod = numTimeMatch[2].toLowerCase();
          parsedMin = mod.includes('buçuk') || mod.includes('bucuk') ? 30 : 15;
        }
        timeFound = true;
        workingText = workingText.replace(numTimeMatch[0], ' ');
      }
    }
  }

  if (!timeFound) {
    const words = workingText.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const w = words[i].replace(/[^a-zçğıöşü]/gi, '');
      if (w === 'on' && words[i + 1]) {
        const nextW = words[i + 1].replace(/[^a-zçğıöşü]/gi, '');
        if (TURKISH_WORD_NUMBERS[nextW] && TURKISH_WORD_NUMBERS[nextW] <= 2) {
          parsedHour = 10 + TURKISH_WORD_NUMBERS[nextW];
          words[i] = '';
          words[i + 1] = '';
          if (words[i + 2] && (words[i + 2].includes('buçuk') || words[i + 2].includes('bucuk'))) {
            parsedMin = 30;
            words[i + 2] = '';
          }
          timeFound = true;
          break;
        }
      }
      if (TURKISH_WORD_NUMBERS[w] !== undefined) {
        let h = TURKISH_WORD_NUMBERS[w];
        if (h >= 1 && h <= 7) h += 12;
        parsedHour = h;
        words[i] = '';
        if (words[i + 1] && (words[i + 1].includes('buçuk') || words[i + 1].includes('bucuk'))) {
          parsedMin = 30;
          words[i + 1] = '';
        }
        timeFound = true;
        break;
      }
    }
    if (timeFound) {
      workingText = words.join(' ');
    }
  }

  workingText = workingText.replace(/\b(saat|buçuk|bucuk|buçukta|bucukta|çeyrek|geçe|kala)\b/gi, ' ');

  const parsedTime = `${String(parsedHour).padStart(2, '0')}:${String(parsedMin).padStart(2, '0')}`;

  // 3. Parse Staff Member
  let matchedStaff = staffList[0] || { id: 1, name: 'İbrahim' };
  for (const st of staffList) {
    const stFirst = st.name.toLocaleLowerCase('tr-TR').split(' ')[0];
    const stRegex = new RegExp(`\\b${stFirst}(?:\\s*usta|\\s*bey)?(?:de|da|e|a|ye|ya|ile)?\\b`, 'i');
    if (stRegex.test(workingText)) {
      matchedStaff = st;
      workingText = workingText.replace(stRegex, ' ');
      break;
    }
  }

  // 4. Parse Service
  let matchedService = services[0] || { id: 1, name: 'Saç Kesimi', price: 350, duration: '45 Dk' };
  const hasSac = /saç|sac|traş|tras|kesim/i.test(workingText);
  const hasSakal = /sakal/i.test(workingText);
  const hasCilt = /cilt|maske|bakım|bakim/i.test(workingText);
  const hasDamat = /damat|vip/i.test(workingText);
  const hasCocuk = /çocuk|cocuk/i.test(workingText);

  if (hasDamat) {
    matchedService = services.find((s) => /damat|vip/i.test(s.name)) || matchedService;
  } else if (hasSac && hasSakal) {
    matchedService =
      services.find((s) => /saç/i.test(s.name) && /sakal/i.test(s.name)) || matchedService;
  } else if (hasCilt) {
    matchedService = services.find((s) => /cilt|bakım/i.test(s.name)) || matchedService;
  } else if (hasCocuk) {
    matchedService = services.find((s) => /çocuk|cocuk/i.test(s.name)) || matchedService;
  } else if (hasSakal) {
    matchedService =
      services.find((s) => /sakal/i.test(s.name) && !/saç/i.test(s.name)) || matchedService;
  } else if (hasSac) {
    matchedService =
      services.find((s) => /saç/i.test(s.name) && !/sakal/i.test(s.name)) || matchedService;
  }

  workingText = workingText.replace(
    /\b(saç|sac|sakal|kesimi|kesim|traşı|trasi|traş|tras|cilt|bakımı|bakimi|bakım|damat|paketi|çocuk|cocuk|randevu|randevusu|ekle|kaydet|yaz|için|icin|günü|gunu)\b/gi,
    ' '
  );

  // 5. Remaining words become Customer Name
  const cleanedCustomerWords = workingText
    .replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR'));

  const customerName =
    cleanedCustomerWords.length > 0 ? cleanedCustomerWords.slice(0, 3).join(' ') : 'Misafir Müşteri';

  return {
    customer: customerName,
    date: parsedDateStr,
    dateLabel: formatTurkishDate(parsedDateStr),
    time: parsedTime,
    serviceId: matchedService.id,
    serviceName: matchedService.name,
    staffId: matchedStaff.id,
    staffName: matchedStaff.name,
    rawText: cleanText,
  };
}

/**
 * Parses Turkish voice input for adding a new Staff member (Personel).
 * Example: "Mehmet Yılmaz Usta Berber yüzde 50" or "Caner Demir Kalfa yüzde 40"
 */
export function parseTurkishStaffVoiceInput(rawText: string): ParsedStaffVoiceResult {
  const cleanText = rawText.trim();
  let working = cleanText;

  // 1. Extract commission rate if spoken (e.g. "yüzde 50", "%60", "payı 45")
  let commissionRate = 50;
  const rateMatch = working.match(/(?:yüzde|yuzde|%|payı|payi|komisyon)\s*(\d{1,3})/i);
  if (rateMatch) {
    const val = parseInt(rateMatch[1], 10);
    if (val >= 0 && val <= 100) {
      commissionRate = val;
    }
    working = working.replace(rateMatch[0], ' ');
  }

  // 2. Extract phone if spoken
  let phone = '';
  const phoneMatch = working.match(/(0?\s*5\d{2}[\s\d]{7,10})/);
  if (phoneMatch) {
    phone = phoneMatch[1].replace(/\s+/g, ' ').trim();
    working = working.replace(phoneMatch[0], ' ');
  }

  // 3. Extract role if spoken
  let role = 'Usta Berber';
  if (/\b(kalfa)\b/i.test(working)) {
    role = 'Kalfa';
    working = working.replace(/\b(kalfa)\b/gi, ' ');
  } else if (/\b(çırak|cirak)\b/i.test(working)) {
    role = 'Çırak';
    working = working.replace(/\b(çırak|cirak)\b/gi, ' ');
  } else if (/\b(baş\s*berber|bas\s*berber|salon\s*şefi|yönetici)\b/i.test(working)) {
    role = 'Baş Berber';
    working = working.replace(/\b(baş\s*berber|bas\s*berber|salon\s*şefi|yönetici)\b/gi, ' ');
  } else if (/\b(usta\s*berber|usta|berber|kuaför|kuafor)\b/i.test(working)) {
    role = 'Usta Berber';
    working = working.replace(/\b(usta\s*berber|usta|berber|kuaför|kuafor)\b/gi, ' ');
  }

  // Remove filler command words
  working = working.replace(
    /\b(personel|ekle|kaydet|yeni|ciro|payı|payi|komisyon|yüzde|yuzde|numarası|telefon)\b/gi,
    ' '
  );

  // Remaining words become Staff Name
  const nameWords = working
    .replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR'));

  const name = nameWords.length > 0 ? nameWords.slice(0, 3).join(' ') : '';

  return {
    name,
    role,
    commissionRate,
    phone,
    rawText: cleanText,
  };
}
