let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  audioContext ??= new window.AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function playTone(
  context: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  volume: number,
  type: OscillatorType,
  endFrequency = frequency,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(1, endFrequency),
    startAt + duration,
  );
  gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration);
}

export function playDiceRollSound() {
  const context = getAudioContext();
  if (!context) return;

  const startAt = context.currentTime + 0.015;
  for (let tick = 0; tick < 8; tick += 1) {
    const time = startAt + tick * 0.068;
    const pitch = 1450 + ((tick * 173) % 500);
    playTone(context, pitch, time, 0.025, 0.045, "square", pitch * 0.62);
  }
  playTone(context, 230, startAt + 0.59, 0.11, 0.12, "triangle", 105);
}

export function playTokenStepSound(step: number) {
  const context = getAudioContext();
  if (!context) return;

  const startAt = context.currentTime + 0.005;
  const pitch = 390 + (step % 4) * 42;
  playTone(context, pitch, startAt, 0.055, 0.075, "triangle", pitch * 0.68);
}
