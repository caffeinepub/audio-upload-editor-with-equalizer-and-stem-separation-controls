import { useState, useCallback } from 'react';
import type { Stem } from './useAudioEngine';

export function useStemSeparation() {
  const [isSeparating, setIsSeparating] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const separate = useCallback(async (audioBuffer: AudioBuffer, onComplete: (stems: Stem[]) => void) => {
    setIsSeparating(true);
    setProgress(0);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(25);

      const stems: Stem[] = await simulateStemSeparation(audioBuffer, setProgress);

      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onComplete(stems);
      setIsSeparating(false);
      setProgress(null);
    } catch (err) {
      setError('Stem separation failed. Please try again.');
      setIsSeparating(false);
      setProgress(null);
      console.error('Stem separation error:', err);
    }
  }, []);

  const reset = useCallback(() => {
    setIsSeparating(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    isSeparating,
    progress,
    error,
    separate,
    reset,
  };
}

async function simulateStemSeparation(
  audioBuffer: AudioBuffer,
  setProgress: (progress: number) => void
): Promise<Stem[]> {
  const stemNames = ['drums', 'bass', 'guitar', 'vocals'];
  const stems: Stem[] = [];

  for (let i = 0; i < stemNames.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const stemBuffer = createStemBuffer(audioBuffer, i);
    stems.push({
      name: stemNames[i],
      buffer: stemBuffer,
      volume: 1,
      muted: false,
      solo: false,
    });

    setProgress(25 + ((i + 1) / stemNames.length) * 70);
  }

  return stems;
}

function createStemBuffer(sourceBuffer: AudioBuffer, stemIndex: number): AudioBuffer {
  const context = new OfflineAudioContext(
    sourceBuffer.numberOfChannels,
    sourceBuffer.length,
    sourceBuffer.sampleRate
  );

  const buffer = context.createBuffer(
    sourceBuffer.numberOfChannels,
    sourceBuffer.length,
    sourceBuffer.sampleRate
  );

  for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel++) {
    const sourceData = sourceBuffer.getChannelData(channel);
    const bufferData = buffer.getChannelData(channel);
    
    for (let i = 0; i < sourceBuffer.length; i++) {
      const factor = 0.3 + (stemIndex * 0.15);
      bufferData[i] = sourceData[i] * factor * (Math.random() * 0.4 + 0.8);
    }
  }

  return buffer;
}
