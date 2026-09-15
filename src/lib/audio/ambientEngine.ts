"use client";

/**
 * Kitapmeetup etkileşim sesleri — tamamen üretimseldir (Web Audio API
 * osilatörleri + prosedürel gürültü ile anlık üretilir). Hiçbir ses dosyası
 * indirilmez/gömülmez: telif hakkı derdi yok, bundle boyutuna hiç etkisi yok.
 *
 * Beğenme, RSVP, kulübe katılma, sekme değiştirme gibi anlarda çalan kısa,
 * göze/kulağa batmayan geri bildirim sesleri. (Not: önceki sürümde burada
 * sürekli çalan bir "okuma odası" arka plan ambiyansı da vardı — kullanıcı
 * geri bildirimiyle tamamen kaldırıldı, sadece bu kısa etkileşim sesleri
 * kaldı.)
 */

const CHIME_SCALE = [440, 523.25, 587.33, 659.25, 783.99]; // A minör pentatonik

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  /** Kısa bir ton — frekans freqFrom'dan freqTo'ya kayar (kart aç/kapa efektlerinin çekirdeği). */
  private playTone(freqFrom: number, freqTo: number, duration: number, volume: number, type: OscillatorType = "sine") {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freqFrom, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqTo, 1), t + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volume, t + Math.min(0.02, duration / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g);
    g.connect(this.master ?? ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  /** Kısa, filtrelenmiş bir gürültü patlaması — "hışırtı/whoosh" hissi (sayfa çevirme, kart kayması). */
  private playNoiseBurst(duration: number, volume: number, filterFreqFrom: number, filterFreqTo: number) {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;
    const bufferLen = Math.max(1, Math.ceil(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferLen; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(filterFreqFrom, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(filterFreqTo, 1), t + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(volume, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    src.connect(filter);
    filter.connect(g);
    g.connect(this.master ?? ctx.destination);
    src.start(t);
    src.stop(t + duration + 0.02);
  }

  /** Eşleşme kartı açılırken — yükselen bir ton + parlak bir "sayfa hışırtısı". */
  playCardOpen() {
    this.playNoiseBurst(0.12, 0.05, 1200, 4000);
    this.playTone(320, 820, 0.18, 0.06, "triangle");
  }

  /** Eşleşme kartı kapanırken — inen bir ton + yumuşak bir hışırtı. */
  playCardClose() {
    this.playTone(700, 260, 0.14, 0.05, "triangle");
    this.playNoiseBurst(0.08, 0.03, 3000, 900);
  }

  /** Kartlar arası kaydırma (swipe) — kısa, havadar bir "whoosh". */
  playSwipe() {
    this.playNoiseBurst(0.15, 0.045, 2500, 600);
  }

  /** Navigasyon menüsünde sekme değiştirirken — çok kısa, göze batmayan bir "tık". */
  playNavTick() {
    this.playTone(900, 680, 0.055, 0.03, "sine");
  }

  /** Beğenme, kulübe katılma, RSVP gibi olumlu bir onay anı — küçük, keyifli bir "pop". */
  playPop() {
    this.playTone(480, 920, 0.1, 0.055, "sine");
    this.playNoiseBurst(0.05, 0.02, 3500, 5500);
  }

  /** Aynı onayı geri almak (beğeniyi kaldırmak, kulüpten ayrılmak) — daha sessiz, inen bir ton. */
  playUnpop() {
    this.playTone(620, 380, 0.08, 0.035, "sine");
  }

  /** Kitap Ruleti gibi ayrı bir etkileşimin de çağırabileceği tek seferlik "kıvılcım" sesi. */
  playChime(volume = 0.09) {
    const ctx = this.ensureContext();
    const notes = 2 + Math.floor(Math.random() * 2);
    const startIdx = Math.floor(Math.random() * CHIME_SCALE.length);
    for (let i = 0; i < notes; i++) {
      const freq = CHIME_SCALE[(startIdx + i * 2) % CHIME_SCALE.length];
      const t = ctx.currentTime + i * 0.14;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(volume, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      osc.connect(g);
      g.connect(this.master ?? ctx.destination);
      osc.start(t);
      osc.stop(t + 1.2);
    }
  }
}

export const ambientEngine = new AmbientEngine();
