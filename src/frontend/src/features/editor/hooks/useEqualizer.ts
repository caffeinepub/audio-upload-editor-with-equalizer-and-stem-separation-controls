import { useState, useCallback } from 'react';

const DEFAULT_BANDS = [0, 0, 0, 0, 0];
const FREQUENCIES = [60, 250, 1000, 4000, 12000];

export function useEqualizer() {
  const [enabled, setEnabled] = useState(false);
  const [bands, setBands] = useState<number[]>(DEFAULT_BANDS);
  const [filterChain, setFilterChain] = useState<BiquadFilterNode[] | null>(null);

  const initialize = useCallback((audioContext: AudioContext) => {
    const filters = FREQUENCIES.map((freq, index) => {
      const filter = audioContext.createBiquadFilter();
      filter.type = index === 0 ? 'lowshelf' : index === FREQUENCIES.length - 1 ? 'highshelf' : 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1;
      filter.gain.value = bands[index];
      return filter;
    });

    for (let i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i + 1]);
    }

    setFilterChain(filters);
  }, [bands]);

  const setBand = useCallback((index: number, value: number) => {
    setBands(prev => {
      const newBands = [...prev];
      newBands[index] = value;
      return newBands;
    });

    if (filterChain && filterChain[index]) {
      filterChain[index].gain.value = value;
    }
  }, [filterChain]);

  const reset = useCallback(() => {
    setBands(DEFAULT_BANDS);
    if (filterChain) {
      filterChain.forEach(filter => {
        filter.gain.value = 0;
      });
    }
  }, [filterChain]);

  return {
    enabled,
    bands,
    filterChain,
    setEnabled,
    setBand,
    reset,
    initialize,
  };
}
