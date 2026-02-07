import { useState, useCallback } from 'react';
import type { Stem } from './useAudioEngine';

export function useStemMixer() {
  const [stems, setStems] = useState<Stem[]>([]);

  const setVolume = useCallback((stemName: string, volume: number) => {
    setStems(prev => prev.map(stem =>
      stem.name === stemName ? { ...stem, volume } : stem
    ));
  }, []);

  const toggleMute = useCallback((stemName: string) => {
    setStems(prev => prev.map(stem =>
      stem.name === stemName ? { ...stem, muted: !stem.muted } : stem
    ));
  }, []);

  const toggleSolo = useCallback((stemName: string) => {
    setStems(prev => {
      const targetStem = prev.find(s => s.name === stemName);
      if (!targetStem) return prev;

      const newSoloState = !targetStem.solo;
      
      return prev.map(stem =>
        stem.name === stemName
          ? { ...stem, solo: newSoloState }
          : { ...stem, solo: false }
      );
    });
  }, []);

  const clearGeneratedStems = useCallback(() => {
    setStems(prev => prev.filter(stem => stem.type !== 'generated'));
  }, []);

  const reset = useCallback(() => {
    setStems([]);
  }, []);

  return {
    stems,
    setStems,
    setVolume,
    toggleMute,
    toggleSolo,
    clearGeneratedStems,
    reset,
  };
}
