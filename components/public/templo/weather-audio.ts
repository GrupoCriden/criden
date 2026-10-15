import type { Weather } from "./weather";

// Sonido del clima, generado en el navegador con Web Audio (sin archivos de audio): lluvia, viento y
// truenos suaves. Nace apagado; solo suena si la persona lo activa, y su volumen tiene un techo bajo
// para que nunca sea fuerte ni tape el contenido.

const MASTER_CAP = 0.4; // incluso con el control al 100% el sonido es discreto

export type WeatherAudio = {
  enable(): void;
  disable(): void;
  setVolume(volume: number): void;
  setMode(mode: Weather): void;
  thunder(): void;
  destroy(): void;
};

export function createWeatherAudio(): WeatherAudio {
  let ctx: AudioContext | null = null;
  let master: GainNode;
  let rain: GainNode;
  let wind: GainNode;
  let noise: AudioBuffer;
  let enabled = false;
  let volume = 0.3;
  let mode: Weather = "clear";
  let suspendTimer = 0;

  // Ruido rosa (más cálido que el blanco): base de la lluvia, el viento y los truenos.
  function pinkNoise(c: AudioContext, seconds: number) {
    const buf = c.createBuffer(2, Math.round(c.sampleRate * seconds), c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < d.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }
    return buf;
  }

  function loop(c: AudioContext) {
    const s = c.createBufferSource();
    s.buffer = noise;
    s.loop = true;
    s.start(0, Math.random() * 3);
    return s;
  }

  function filter(c: AudioContext, type: BiquadFilterType, freq: number, q = 0.7) {
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    return f;
  }

  // Construye el grafo de audio la primera vez que se activa (requiere un gesto de la persona).
  function ensure() {
    if (ctx) return;
    ctx = new AudioContext();
    noise = pinkNoise(ctx, 4);
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Lluvia: un siseo agudo (gotas) y un cuerpo grave (agua sobre el techo), con variación lenta.
    rain = ctx.createGain();
    rain.gain.value = 0;
    rain.connect(master);
    const hiss = ctx.createGain();
    hiss.gain.value = 0.5;
    loop(ctx)
      .connect(filter(ctx, "highpass", 1400))
      .connect(filter(ctx, "lowpass", 8500))
      .connect(hiss)
      .connect(rain);
    const body = ctx.createGain();
    body.gain.value = 0.7;
    loop(ctx)
      .connect(filter(ctx, "lowpass", 650))
      .connect(body)
      .connect(rain);
    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.frequency.value = 0.13;
    lfoDepth.gain.value = 0.18;
    lfo.connect(lfoDepth).connect(hiss.gain);
    lfo.start();

    // Viento: ruido filtrado cuya banda sube y baja lentamente.
    wind = ctx.createGain();
    wind.gain.value = 0;
    wind.connect(master);
    const band = filter(ctx, "bandpass", 420, 0.8);
    loop(ctx).connect(band).connect(wind);
    const sweep = ctx.createOscillator();
    const sweepDepth = ctx.createGain();
    sweep.frequency.value = 0.07;
    sweepDepth.gain.value = 220;
    sweep.connect(sweepDepth).connect(band.frequency);
    sweep.start();
  }

  function apply() {
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.setTargetAtTime(enabled ? volume * MASTER_CAP : 0, t, 0.2);
    const r = mode === "rain" ? 0.7 : mode === "storm" ? 1 : 0;
    const w = mode === "wind" ? 0.85 : mode === "storm" ? 0.18 : 0;
    rain.gain.setTargetAtTime(r, t, 0.9);
    wind.gain.setTargetAtTime(w, t, 0.9);
  }

  // Sin clima con sonido (o silenciado) se suspende el contexto para no gastar batería.
  function maybeSuspend() {
    window.clearTimeout(suspendTimer);
    if (!ctx) return;
    const silent = !enabled || (mode !== "rain" && mode !== "storm" && mode !== "wind");
    if (silent) suspendTimer = window.setTimeout(() => void ctx?.suspend(), 2500);
    else void ctx.resume();
  }

  const onVisibility = () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else maybeSuspend();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    enable() {
      enabled = true;
      ensure();
      void ctx!.resume();
      apply();
      maybeSuspend();
    },
    disable() {
      enabled = false;
      apply();
      maybeSuspend();
    },
    setVolume(v) {
      volume = Math.min(1, Math.max(0, v));
      apply();
    },
    setMode(m) {
      mode = m;
      apply();
      maybeSuspend();
    },
    // Trueno lejano: un retumbo grave que baja de tono; llega un instante después del relámpago.
    thunder() {
      if (!ctx || !enabled || mode !== "storm") return;
      const c = ctx;
      const start = c.currentTime + 0.25 + Math.random() * 1.4;
      const dur = 3.2 + Math.random() * 2.4;
      const src = c.createBufferSource();
      src.buffer = noise;
      const lp = filter(c, "lowpass", 360);
      lp.frequency.setValueAtTime(360, start);
      lp.frequency.exponentialRampToValueAtTime(70, start + dur);
      const g = c.createGain();
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.9, start + 0.12);
      g.gain.exponentialRampToValueAtTime(0.35, start + 0.9);
      g.gain.linearRampToValueAtTime(0.55, start + 1.2); // segundo retumbo
      g.gain.exponentialRampToValueAtTime(0.001, start + dur);
      const pan = c.createStereoPanner();
      pan.pan.value = Math.random() * 1.2 - 0.6;
      src.connect(lp).connect(g).connect(pan).connect(master);
      src.start(start, Math.random() * 2);
      src.stop(start + dur + 0.1);
    },
    destroy() {
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(suspendTimer);
      void ctx?.close();
      ctx = null;
    },
  };
}
