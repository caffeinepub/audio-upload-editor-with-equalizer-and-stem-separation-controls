import { useState, useCallback } from 'react';
import { estimateTempo } from '../utils/tempoAnalysis';

export function useTempoAnalysis() {
  const [estimatedBpm, setEstimatedBpm] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (audioBuffer: AudioBuffer) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const bpm = await estimateTempo(audioBuffer);
      setEstimatedBpm(bpm);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze tempo';
      setError(errorMessage);
      setEstimatedBpm(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setEstimatedBpm(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    estimatedBpm,
    isAnalyzing,
    error,
    analyze,
    reset,
  };
}
