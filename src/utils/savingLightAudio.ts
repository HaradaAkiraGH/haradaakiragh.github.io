// Музыкальный движок экрана входа: "Saving Light (Menu Ver.)" — Wuthering Waves 1.0
// Автоматически подхватывает /audio/saving-light.mp3 при наличии в public/audio/,
// а если файла нет — исполняет многоголосную фортепианно-эмбиентную тему "Saving Light"
// (тональность D minor / F major, 120 BPM) через Web Audio API с концертным ревербератором.

class SavingLightPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private playing = false;
  private volume = 0.65;
  private muted = false;
  private stepIndex = 0;
  private timerId: number | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private usingHtmlAudio = false;
  private listeners = new Set<() => void>();

  // Партитура "Saving Light (Wuthering Waves 1.0 Login Theme)" в D minor / F major
  // Каждый шаг = восьмая длительность (250 мс при 120 BPM)
  private readonly sequence: Array<{
    melody?: number[];
    bass?: number[];
    pad?: number[];
    vel?: number;
  }> = [
    // Такт 1: Dm9 (D3 - A3 -E4 - F4) + мотив Saving Light (A5 -> F5 -> G5 -> E5)
    { bass: [146.83, 220.0], pad: [293.66, 349.23, 440.0, 659.25], melody: [880.0], vel: 0.85 },
    { bass: [329.63] },
    { melody: [698.46], bass: [349.23], vel: 0.72 },
    { melody: [783.99], vel: 0.78 },
    { melody: [659.25], bass: [220.0], vel: 0.75 },
    { bass: [349.23] },
    { melody: [587.33], vel: 0.68 },
    { melody: [659.25], vel: 0.64 },

    // Такт 2: BbMaj7 (Bb2 - F3 - A3 - D4)
    { bass: [116.54, 174.61], pad: [233.08, 349.23, 440.0, 587.33], melody: [880.0], vel: 0.88 },
    { bass: [220.0] },
    { melody: [932.33], bass: [293.66], vel: 0.82 },
    { melody: [880.0], vel: 0.76 },
    { melody: [783.99], bass: [174.61], vel: 0.74 },
    { bass: [293.66] },
    { melody: [698.46], vel: 0.7 },
    { melody: [659.25], vel: 0.65 },

    // Такт 3: Fmaj9 (F2 - C3 - G3 - A3)
    { bass: [87.31, 130.81], pad: [174.61, 261.63, 392.0, 440.0], melody: [698.46], vel: 0.84 },
    { bass: [196.0] },
    { melody: [587.33], bass: [220.0], vel: 0.72 },
    { melody: [659.25], vel: 0.76 },
    { melody: [783.99], bass: [130.81], vel: 0.82 },
    { bass: [261.63] },
    { melody: [880.0], vel: 0.86 },
    { melody: [698.46], vel: 0.7 },

    // Такт 4: Cadd9 -> A7sus4 (C3 - G3 - D4 - E4)
    { bass: [130.81, 196.0], pad: [261.63, 329.63, 392.0, 587.33], melody: [659.25], vel: 0.8 },
    { bass: [293.66] },
    { melody: [587.33], bass: [329.63], vel: 0.74 },
    { melody: [523.25], vel: 0.7 },
    { bass: [110.0, 164.81], pad: [220.0, 277.18, 329.63, 554.37], melody: [587.33], vel: 0.78 },
    { bass: [220.0] },
    { melody: [659.25], vel: 0.74 },
    { melody: [880.0], vel: 0.8 },

    // Такт 5: Gm9 (G2 - D3 - A3 - Bb3) — кульминационный подъём Saving Light
    { bass: [98.0, 146.83], pad: [196.0, 293.66, 349.23, 466.16], melody: [932.33, 466.16], vel: 0.9 },
    { bass: [220.0] },
    { melody: [880.0], bass: [233.08], vel: 0.82 },
    { melody: [783.99], vel: 0.78 },
    { melody: [698.46], bass: [146.83], vel: 0.8 },
    { bass: [293.66] },
    { melody: [783.99], vel: 0.76 },
    { melody: [880.0], vel: 0.84 },

    // Такт 6: Dm/F (F2 - D3 - A3 - D4)
    { bass: [87.31, 146.83], pad: [220.0, 293.66, 349.23, 587.33], melody: [698.46, 349.23], vel: 0.86 },
    { bass: [220.0] },
    { melody: [659.25], bass: [293.66], vel: 0.76 },
    { melody: [587.33], vel: 0.74 },
    { melody: [523.25], bass: [146.83], vel: 0.7 },
    { bass: [220.0] },
    { melody: [587.33], vel: 0.74 },
    { melody: [659.25], vel: 0.78 },

    // Такт 7: Asus4 -> A7 (A2 - E3 - A3 - D4 -> C#4)
    { bass: [110.0, 164.81], pad: [220.0, 293.66, 329.63, 440.0], melody: [587.33], vel: 0.82 },
    { bass: [220.0] },
    { melody: [523.25], bass: [293.66], vel: 0.74 },
    { melody: [493.88], vel: 0.7 },
    { bass: [110.0], pad: [220.0, 277.18, 329.63, 440.0], melody: [554.37], vel: 0.8 },
    { bass: [164.81] },
    { melody: [659.25], vel: 0.78 },
    { melody: [440.0], vel: 0.68 },

    // Такт 8: Dmadd9 (D2 - A2 - D3 - E4 - F4) — разрешение в эфирное эхо Соларис-3
    { bass: [73.42, 146.83], pad: [220.0, 293.66, 329.63, 349.23], melody: [587.33, 293.66], vel: 0.88 },
    { bass: [220.0] },
    { bass: [293.66], melody: [659.25], vel: 0.68 },
    { melody: [698.46], vel: 0.72 },
    { melody: [880.0], bass: [329.63], vel: 0.76 },
    { bass: [349.23] },
    { melody: [1174.66], vel: 0.64 },
    { bass: [220.0] },
  ];

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  getState() {
    return {
      playing: this.playing,
      volume: this.volume,
      muted: this.muted,
    };
  }

  private ensureContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.volume;

      // Создаём мягкий импульс концертного холла для эфирного звучания Wuthering Waves
      const rate = this.ctx.sampleRate;
      const length = Math.floor(rate * 2.8);
      const impulse = this.ctx.createBuffer(2, length, rate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) {
          const decay = Math.pow(1 - i / length, 2.4);
          data[i] = (Math.random() * 2 - 1) * decay * 0.35;
        }
      }
      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = impulse;

      const wetGain = this.ctx.createGain();
      wetGain.gain.value = 0.48;
      const dryGain = this.ctx.createGain();
      dryGain.gain.value = 0.75;

      this.masterGain.connect(dryGain);
      dryGain.connect(this.ctx.destination);

      this.masterGain.connect(this.reverbNode);
      this.reverbNode.connect(wetGain);
      wetGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playPianoNote(freq: number, duration: number, velocity = 0.75, isBass = false) {
    const ctx = this.ctx;
    const out = this.masterGain;
    if (!ctx || !out) return;

    const now = ctx.currentTime;
    const noteGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBass ? 950 : 2800 * velocity + 600, now);
    filter.frequency.exponentialRampToValueAtTime(isBass ? 260 : 520, now + duration);

    const peak = (isBass ? 0.11 : 0.16) * velocity;
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(peak, now + 0.018);
    noteGain.gain.exponentialRampToValueAtTime(peak * 0.38, now + 0.28);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Основной тон + мягкая вторая гармоника для тембра рояля
    const osc1 = ctx.createOscillator();
    osc1.type = isBass ? 'triangle' : 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);
    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(isBass ? 0.12 : 0.22, now);
    harmGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.45);

    osc1.connect(filter);
    osc2.connect(harmGain);
    harmGain.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(out);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  private playPadChord(freqs: number[], duration = 2.0) {
    const ctx = this.ctx;
    const out = this.masterGain;
    if (!ctx || !out) return;

    const now = ctx.currentTime;
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((idx - 1.5) * 4, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.028, now + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(out);

      osc.start(now);
      osc.stop(now + duration + 0.08);
    });
  }

  private tick = () => {
    if (!this.playing) return;
    const step = this.sequence[this.stepIndex % this.sequence.length];
    const vel = step.vel ?? 0.72;

    if (step.pad) {
      this.playPadChord(step.pad, 2.1);
    }
    if (step.bass) {
      step.bass.forEach((f) => this.playPianoNote(f, 1.45, vel * 0.85, true));
    }
    if (step.melody) {
      step.melody.forEach((f, i) =>
        this.playPianoNote(f, 1.65, i === 0 ? vel : vel * 0.65, false),
      );
    }

    this.stepIndex = (this.stepIndex + 1) % this.sequence.length;
  };

  async start() {
    if (this.playing) return;

    // Если в проекте лежит файл /audio/saving-light.mp3 — пробуем воспроизвести его
    if (!this.audioEl && typeof window !== 'undefined') {
      try {
        const audio = new Audio('/audio/saving-light.mp3');
        audio.loop = true;
        audio.volume = this.muted ? 0 : this.volume;
        this.audioEl = audio;
      } catch {
        this.audioEl = null;
      }
    }

    if (this.audioEl) {
      try {
        await this.audioEl.play();
        this.usingHtmlAudio = true;
        this.playing = true;
        this.notify();
        return;
      } catch {
        // Нет локального mp3 или заблокирован — переключаемся на синтезатор Saving Light
        this.usingHtmlAudio = false;
      }
    }

    this.ensureContext();
    this.playing = true;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
    }
    this.tick();
    this.timerId = window.setInterval(this.tick, 260);
    this.notify();
  }

  stop() {
    this.playing = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.audioEl && this.usingHtmlAudio) {
      try {
        this.audioEl.pause();
      } catch {
        /* ignore */
      }
    }
    this.notify();
  }

  toggle() {
    if (this.playing) {
      this.stop();
    } else {
      this.start();
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.04);
    }
    if (this.audioEl) {
      this.audioEl.volume = muted ? 0 : this.volume;
    }
    this.notify();
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.volume > 0 && this.muted) {
      this.muted = false;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0 : this.volume,
        this.ctx.currentTime,
        0.04,
      );
    }
    if (this.audioEl) {
      this.audioEl.volume = this.muted ? 0 : this.volume;
    }
    this.notify();
  }
}

export const savingLightPlayer = new SavingLightPlayer();
