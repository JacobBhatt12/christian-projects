let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, duration: number, gain: number, type: OscillatorType = "square") {
  const audio = getContext();
  if (!audio) return;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.value = gain;
  amp.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  osc.connect(amp).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

export function playKeyTick() {
  tone(320 + Math.random() * 90, 0.03, 0.05);
}

export function playEnterBeep() {
  tone(520, 0.06, 0.06);
}

export function playAccessChime() {
  tone(660, 0.12, 0.07, "sine");
  setTimeout(() => tone(880, 0.18, 0.06, "sine"), 90);
}

export function playGlitchBurst() {
  tone(120, 0.09, 0.05, "sawtooth");
}
