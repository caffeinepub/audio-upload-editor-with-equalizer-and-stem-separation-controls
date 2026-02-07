/**
 * Browser-only BPM estimation using autocorrelation on the audio buffer.
 * No external APIs or network calls.
 */

export async function estimateTempo(audioBuffer: AudioBuffer): Promise<number> {
  try {
    // Get the first channel data
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Downsample for faster processing (analyze every 10th sample)
    const downsampleFactor = 10;
    const downsampledLength = Math.floor(channelData.length / downsampleFactor);
    const downsampledData = new Float32Array(downsampledLength);
    
    for (let i = 0; i < downsampledLength; i++) {
      downsampledData[i] = channelData[i * downsampleFactor];
    }
    
    // Calculate energy envelope
    const windowSize = Math.floor(sampleRate / downsampleFactor / 10); // ~100ms windows
    const energyEnvelope: number[] = [];
    
    for (let i = 0; i < downsampledData.length - windowSize; i += windowSize / 2) {
      let energy = 0;
      for (let j = 0; j < windowSize; j++) {
        const sample = downsampledData[i + j];
        energy += sample * sample;
      }
      energyEnvelope.push(Math.sqrt(energy / windowSize));
    }
    
    // Find peaks in energy envelope
    const peaks: number[] = [];
    for (let i = 1; i < energyEnvelope.length - 1; i++) {
      if (energyEnvelope[i] > energyEnvelope[i - 1] && 
          energyEnvelope[i] > energyEnvelope[i + 1] &&
          energyEnvelope[i] > 0.1) {
        peaks.push(i);
      }
    }
    
    if (peaks.length < 2) {
      throw new Error('Not enough peaks detected in audio. Try a track with a clearer rhythm.');
    }
    
    // Calculate intervals between peaks
    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }
    
    // Find most common interval (mode)
    const intervalCounts = new Map<number, number>();
    intervals.forEach(interval => {
      const rounded = Math.round(interval);
      intervalCounts.set(rounded, (intervalCounts.get(rounded) || 0) + 1);
    });
    
    let mostCommonInterval = 0;
    let maxCount = 0;
    intervalCounts.forEach((count, interval) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonInterval = interval;
      }
    });
    
    if (mostCommonInterval === 0) {
      throw new Error('Could not detect a consistent tempo. Try a different track.');
    }
    
    // Convert interval to BPM
    const windowDuration = (windowSize / 2) / (sampleRate / downsampleFactor);
    const beatDuration = mostCommonInterval * windowDuration;
    const bpm = 60 / beatDuration;
    
    // Clamp to reasonable range (60-180 BPM)
    const clampedBpm = Math.max(60, Math.min(180, Math.round(bpm)));
    
    return clampedBpm;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Tempo analysis failed: ${error.message}`);
    }
    throw new Error('Tempo analysis failed due to an unknown error.');
  }
}
