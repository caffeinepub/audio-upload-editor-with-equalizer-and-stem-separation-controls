import type { AudioEngine, Stem } from '../hooks/useAudioEngine';

export async function renderMixedAudio(audioEngine: AudioEngine): Promise<AudioBuffer> {
  if (!audioEngine.audioContext) {
    throw new Error('Audio context not initialized');
  }

  const duration = audioEngine.duration;
  const sampleRate = audioEngine.audioContext.sampleRate;
  
  const offlineContext = new OfflineAudioContext(2, duration * sampleRate, sampleRate);
  
  // If stems exist, render the stem mix
  if (audioEngine.stems.length > 0) {
    return renderStemMix(audioEngine, offlineContext);
  }
  
  // Otherwise render the original audio
  if (!audioEngine.sourceNode?.buffer) {
    throw new Error('No audio buffer available');
  }

  const source = offlineContext.createBufferSource();
  source.buffer = audioEngine.sourceNode.buffer;
  
  // Apply EQ if enabled
  if (audioEngine.eqEnabled && audioEngine.eqBands) {
    const filters = createEQFilters(offlineContext, audioEngine.eqBands);
    let currentNode: AudioNode = source;
    
    filters.forEach(filter => {
      currentNode.connect(filter);
      currentNode = filter;
    });
    
    currentNode.connect(offlineContext.destination);
  } else {
    source.connect(offlineContext.destination);
  }
  
  source.start(0);
  
  return await offlineContext.startRendering();
}

function renderStemMix(audioEngine: AudioEngine, offlineContext: OfflineAudioContext): Promise<AudioBuffer> {
  const hasSolo = audioEngine.stems.some(stem => stem.solo);
  
  // Create master gain
  const masterGain = offlineContext.createGain();
  masterGain.gain.value = audioEngine.volume;
  
  // Create sources and gains for each stem
  audioEngine.stems.forEach((stem) => {
    const source = offlineContext.createBufferSource();
    source.buffer = stem.buffer;
    
    const gainNode = offlineContext.createGain();
    
    // Calculate effective gain
    let effectiveGain = stem.volume;
    if (stem.muted) {
      effectiveGain = 0;
    } else if (hasSolo && !stem.solo) {
      effectiveGain = 0;
    }
    
    gainNode.gain.value = effectiveGain;
    
    source.connect(gainNode);
    gainNode.connect(masterGain);
    
    source.start(0);
  });
  
  // Apply EQ if enabled
  if (audioEngine.eqEnabled && audioEngine.eqBands) {
    const filters = createEQFilters(offlineContext, audioEngine.eqBands);
    let currentNode: AudioNode = masterGain;
    
    filters.forEach(filter => {
      currentNode.connect(filter);
      currentNode = filter;
    });
    
    currentNode.connect(offlineContext.destination);
  } else {
    masterGain.connect(offlineContext.destination);
  }
  
  return offlineContext.startRendering();
}

function createEQFilters(context: BaseAudioContext, bands: number[]): BiquadFilterNode[] {
  const frequencies = [60, 250, 1000, 4000, 12000];
  
  return bands.map((gain, index) => {
    const filter = context.createBiquadFilter();
    
    if (index === 0) {
      filter.type = 'lowshelf';
    } else if (index === bands.length - 1) {
      filter.type = 'highshelf';
    } else {
      filter.type = 'peaking';
      filter.Q.value = 1;
    }
    
    filter.frequency.value = frequencies[index];
    filter.gain.value = gain;
    
    return filter;
  });
}

export async function renderStemAudio(stem: Stem): Promise<AudioBuffer> {
  return stem.buffer;
}
