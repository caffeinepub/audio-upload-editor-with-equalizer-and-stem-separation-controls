/**
 * Offline accompaniment generation using Web Audio synthesis.
 * Generates drums, bass, and guitar-like parts based on tempo.
 */

export interface GeneratedAccompaniment {
  drums: AudioBuffer;
  bass: AudioBuffer;
  guitar: AudioBuffer;
}

export async function generateAccompaniment(
  bpm: number,
  duration: number,
  sampleRate: number
): Promise<GeneratedAccompaniment> {
  const drums = await generateDrums(bpm, duration, sampleRate);
  const bass = await generateBass(bpm, duration, sampleRate);
  const guitar = await generateGuitar(bpm, duration, sampleRate);

  return { drums, bass, guitar };
}

async function generateDrums(bpm: number, duration: number, sampleRate: number): Promise<AudioBuffer> {
  const offlineContext = new OfflineAudioContext(2, duration * sampleRate, sampleRate);
  
  const beatDuration = 60 / bpm;
  const numBeats = Math.floor(duration / beatDuration);
  
  // Create kick, snare, and hi-hat patterns
  for (let beat = 0; beat < numBeats; beat++) {
    const time = beat * beatDuration;
    
    // Kick on beats 1 and 3 (in 4/4 time)
    if (beat % 4 === 0 || beat % 4 === 2) {
      createKick(offlineContext, time);
    }
    
    // Snare on beats 2 and 4
    if (beat % 4 === 1 || beat % 4 === 3) {
      createSnare(offlineContext, time);
    }
    
    // Hi-hat on every beat
    createHiHat(offlineContext, time);
  }
  
  return await offlineContext.startRendering();
}

function createKick(context: OfflineAudioContext, time: number) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);
  
  gain.gain.setValueAtTime(0.8, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
  
  osc.connect(gain);
  gain.connect(context.destination);
  
  osc.start(time);
  osc.stop(time + 0.15);
}

function createSnare(context: OfflineAudioContext, time: number) {
  // Noise-based snare
  const bufferSize = context.sampleRate * 0.1;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = context.createBufferSource();
  noise.buffer = buffer;
  
  const filter = context.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;
  
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  
  noise.start(time);
  noise.stop(time + 0.1);
}

function createHiHat(context: OfflineAudioContext, time: number) {
  // High-frequency noise for hi-hat
  const bufferSize = context.sampleRate * 0.05;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = context.createBufferSource();
  noise.buffer = buffer;
  
  const filter = context.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 5000;
  
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.2, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  
  noise.start(time);
  noise.stop(time + 0.05);
}

async function generateBass(bpm: number, duration: number, sampleRate: number): Promise<AudioBuffer> {
  const offlineContext = new OfflineAudioContext(2, duration * sampleRate, sampleRate);
  
  const beatDuration = 60 / bpm;
  const numBeats = Math.floor(duration / beatDuration);
  
  // Simple bass pattern: root note on beat 1, fifth on beat 3
  const rootFreq = 110; // A2
  const fifthFreq = 165; // E3
  
  for (let beat = 0; beat < numBeats; beat++) {
    const time = beat * beatDuration;
    const freq = (beat % 4 === 0 || beat % 4 === 1) ? rootFreq : fifthFreq;
    
    createBassNote(offlineContext, time, freq, beatDuration * 0.8);
  }
  
  return await offlineContext.startRendering();
}

function createBassNote(context: OfflineAudioContext, time: number, frequency: number, duration: number) {
  const osc = context.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = frequency;
  
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 2;
  
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.15, time + duration * 0.5);
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  
  osc.start(time);
  osc.stop(time + duration);
}

async function generateGuitar(bpm: number, duration: number, sampleRate: number): Promise<AudioBuffer> {
  const offlineContext = new OfflineAudioContext(2, duration * sampleRate, sampleRate);
  
  const beatDuration = 60 / bpm;
  const numBeats = Math.floor(duration / beatDuration);
  
  // Simple chord progression: A major, D major
  const chordA = [220, 277, 330]; // A, C#, E
  const chordD = [147, 185, 220]; // D, F#, A
  
  for (let beat = 0; beat < numBeats; beat++) {
    const time = beat * beatDuration;
    const chord = (Math.floor(beat / 4) % 2 === 0) ? chordA : chordD;
    
    // Strum on beats 1 and 3
    if (beat % 4 === 0 || beat % 4 === 2) {
      createGuitarChord(offlineContext, time, chord, beatDuration * 0.6);
    }
  }
  
  return await offlineContext.startRendering();
}

function createGuitarChord(context: OfflineAudioContext, time: number, frequencies: number[], duration: number) {
  frequencies.forEach((freq, index) => {
    const osc = context.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    
    const gain = context.createGain();
    const startTime = time + index * 0.01; // Slight strum delay
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.connect(gain);
    gain.connect(context.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}
