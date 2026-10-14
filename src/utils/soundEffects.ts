// Web Audio API Synthesizer for Instant Mobile App Sound Effects (Zero external file dependency)

let sharedAudioCtx: AudioContext | null = null;

function runWithAudioContext(callback: (ctx: AudioContext) => void): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }

    const ctx = sharedAudioCtx;
    if (ctx.state === 'suspended') {
      ctx
        .resume()
        .then(() => {
          callback(ctx);
        })
        .catch(() => {
          // Try running directly even if resume promise rejects
          try {
            callback(ctx);
          } catch {}
        });
    } else {
      callback(ctx);
    }
  } catch {
    // Ignore audio context restrictions if any
  }
}

/**
 * Plays a crisp, audible "Bip!" sound when the microphone button is pressed.
 */
export function playMicStartBeep(): void {
  runWithAudioContext((ctx) => {
    const now = ctx.currentTime;

    // Tone 1: 740 Hz -> 987.77 Hz (Clear Siri/Assistant "Bip!")
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(740, now);
    osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.11);

    gain1.gain.setValueAtTime(0.02, now);
    gain1.gain.exponentialRampToValueAtTime(0.48, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.23);

    // Tone 2: 1174.66 Hz (D6) bright harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1174.66, now + 0.06);

    gain2.gain.setValueAtTime(0.01, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.35, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.27);
  });
}

/**
 * Plays a gentle descending tone when the microphone is turned off.
 */
export function playMicStopBeep(): void {
  runWithAudioContext((ctx) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(783.99, now);
    osc.frequency.exponentialRampToValueAtTime(493.88, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  });
}

/**
 * Plays a pleasant confirmation chime when voice appointment/staff is created.
 */
export function playSuccessChime(): void {
  runWithAudioContext((ctx) => {
    const now = ctx.currentTime;
    const notes = [587.33, 880, 1174.66]; // D5, A5, D6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.065;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.24);
    });
  });
}
