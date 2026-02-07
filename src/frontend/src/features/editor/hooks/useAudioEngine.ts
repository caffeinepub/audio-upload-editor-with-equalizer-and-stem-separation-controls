import { useState, useEffect, useRef, useCallback } from 'react';
import { useEqualizer } from './useEqualizer';
import { useStemSeparation } from './useStemSeparation';
import { useStemMixer } from './useStemMixer';
import { useAudioTransport } from './useAudioTransport';
import { useTempoAnalysis } from './useTempoAnalysis';
import { generateAccompaniment } from '../utils/accompanimentGeneration';

export interface Stem {
  name: string;
  buffer: AudioBuffer;
  volume: number;
  muted: boolean;
  solo: boolean;
  type?: 'separated' | 'generated';
}

export interface AudioEngine {
  audioFile: File | null;
  isLoading: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  eqEnabled: boolean;
  eqBands: number[];
  stems: Stem[];
  isSeparating: boolean;
  stemSeparationProgress: number | null;
  stemSeparationError: string | null;
  estimatedBpm: number | null;
  isAnalyzingTempo: boolean;
  tempoAnalysisError: string | null;
  tempoOverride: number | null;
  isGeneratingAccompaniment: boolean;
  loadAudioFile: (file: File) => void;
  clearAudio: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setEqEnabled: (enabled: boolean) => void;
  setEqBand: (index: number, value: number) => void;
  resetEqualizer: () => void;
  startStemSeparation: () => void;
  setStemVolume: (stemName: string, volume: number) => void;
  toggleStemMute: (stemName: string) => void;
  toggleStemSolo: (stemName: string) => void;
  analyzeTempoAction: () => void;
  setTempoOverride: (bpm: number | null) => void;
  generateAccompanimentAction: () => void;
  clearGeneratedAccompaniment: () => void;
  audioContext: AudioContext | null;
  sourceNode: AudioBufferSourceNode | null;
}

export function useAudioEngine(projectId: string): AudioEngine {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(null);
  const [tempoOverride, setTempoOverride] = useState<number | null>(null);
  const [isGeneratingAccompaniment, setIsGeneratingAccompaniment] = useState(false);

  const transport = useAudioTransport();
  const equalizer = useEqualizer();
  const stemSeparation = useStemSeparation();
  const stemMixer = useStemMixer();
  const tempoAnalysis = useTempoAnalysis();

  // Refs for stem playback nodes
  const stemSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const stemGainsRef = useRef<GainNode[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    setAudioContext(ctx);
    return () => {
      ctx.close();
    };
  }, []);

  const loadAudioFile = useCallback(async (file: File) => {
    if (!audioContext) return;

    setIsLoading(true);
    setAudioFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      transport.setDuration(buffer.duration);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoading(false);
    }
  }, [audioContext, transport]);

  const clearAudio = useCallback(() => {
    // Stop all stem sources
    stemSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    stemSourcesRef.current = [];
    stemGainsRef.current = [];

    if (sourceNode) {
      try {
        sourceNode.stop();
      } catch (e) {
        // Already stopped
      }
      setSourceNode(null);
    }
    setAudioFile(null);
    setAudioBuffer(null);
    transport.reset();
    stemSeparation.reset();
    stemMixer.reset();
    tempoAnalysis.reset();
    setTempoOverride(null);
  }, [sourceNode, transport, stemSeparation, stemMixer, tempoAnalysis]);

  const togglePlayPause = useCallback(() => {
    if (!audioContext || !audioBuffer) return;

    if (transport.isPlaying) {
      // Stop playback
      if (stemMixer.stems.length > 0) {
        stemSourcesRef.current.forEach(source => {
          try {
            source.stop();
          } catch (e) {
            // Already stopped
          }
        });
        stemSourcesRef.current = [];
      } else if (sourceNode) {
        sourceNode.stop();
        setSourceNode(null);
      }
      transport.pause();
    } else {
      // Start playback
      if (stemMixer.stems.length > 0) {
        // Play stems with mixer
        playStemsWithMixer();
      } else {
        // Play original audio
        playOriginalAudio();
      }
      transport.play();
    }
  }, [audioContext, audioBuffer, transport, equalizer, sourceNode, stemMixer.stems]);

  const playOriginalAudio = useCallback(() => {
    if (!audioContext || !audioBuffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    let destination: AudioNode = audioContext.destination;

    if (equalizer.enabled && equalizer.filterChain) {
      source.connect(equalizer.filterChain[0]);
      equalizer.filterChain[equalizer.filterChain.length - 1].connect(destination);
    } else {
      source.connect(destination);
    }

    source.start(0, transport.currentTime);
    setSourceNode(source);

    source.onended = () => {
      if (transport.currentTime >= transport.duration) {
        transport.pause();
        transport.seek(0);
        setSourceNode(null);
      }
    };
  }, [audioContext, audioBuffer, transport, equalizer]);

  const playStemsWithMixer = useCallback(() => {
    if (!audioContext) return;

    // Clear previous sources
    stemSourcesRef.current = [];
    stemGainsRef.current = [];

    // Create master gain node
    const masterGain = audioContext.createGain();
    masterGain.gain.value = transport.volume;
    masterGainRef.current = masterGain;

    // Determine if any stem is soloed
    const hasSolo = stemMixer.stems.some(stem => stem.solo);

    // Create source and gain for each stem
    stemMixer.stems.forEach((stem) => {
      const source = audioContext.createBufferSource();
      source.buffer = stem.buffer;

      const gainNode = audioContext.createGain();
      
      // Calculate effective gain based on volume, mute, and solo
      let effectiveGain = stem.volume;
      if (stem.muted) {
        effectiveGain = 0;
      } else if (hasSolo && !stem.solo) {
        effectiveGain = 0;
      }
      
      gainNode.gain.value = effectiveGain;

      // Connect: source -> gain -> master -> EQ (if enabled) -> destination
      source.connect(gainNode);
      gainNode.connect(masterGain);

      stemSourcesRef.current.push(source);
      stemGainsRef.current.push(gainNode);

      source.start(0, transport.currentTime);
    });

    // Connect master gain to EQ or destination
    let destination: AudioNode = audioContext.destination;
    if (equalizer.enabled && equalizer.filterChain) {
      masterGain.connect(equalizer.filterChain[0]);
      equalizer.filterChain[equalizer.filterChain.length - 1].connect(destination);
    } else {
      masterGain.connect(destination);
    }

    // Handle playback end
    if (stemSourcesRef.current.length > 0) {
      stemSourcesRef.current[0].onended = () => {
        if (transport.currentTime >= transport.duration) {
          transport.pause();
          transport.seek(0);
          stemSourcesRef.current = [];
          stemGainsRef.current = [];
        }
      };
    }
  }, [audioContext, stemMixer.stems, transport, equalizer]);

  // Update stem gains in real-time when mixer state changes
  useEffect(() => {
    if (stemGainsRef.current.length > 0 && transport.isPlaying) {
      const hasSolo = stemMixer.stems.some(stem => stem.solo);
      
      stemMixer.stems.forEach((stem, index) => {
        const gainNode = stemGainsRef.current[index];
        if (gainNode) {
          let effectiveGain = stem.volume;
          if (stem.muted) {
            effectiveGain = 0;
          } else if (hasSolo && !stem.solo) {
            effectiveGain = 0;
          }
          gainNode.gain.value = effectiveGain;
        }
      });
    }
  }, [stemMixer.stems, transport.isPlaying]);

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = transport.volume;
    }
  }, [transport.volume]);

  const seek = useCallback((time: number) => {
    const wasPlaying = transport.isPlaying;
    if (wasPlaying) {
      if (stemMixer.stems.length > 0) {
        stemSourcesRef.current.forEach(source => {
          try {
            source.stop();
          } catch (e) {
            // Already stopped
          }
        });
        stemSourcesRef.current = [];
        stemGainsRef.current = [];
      } else if (sourceNode) {
        sourceNode.stop();
        setSourceNode(null);
      }
      transport.pause();
    }
    transport.seek(time);
    if (wasPlaying) {
      setTimeout(() => togglePlayPause(), 50);
    }
  }, [transport, sourceNode, togglePlayPause, stemMixer.stems]);

  const startStemSeparation = useCallback(() => {
    if (!audioBuffer) return;
    stemSeparation.separate(audioBuffer, (stems) => {
      const separatedStems = stems.map(stem => ({ ...stem, type: 'separated' as const }));
      stemMixer.setStems(separatedStems);
    });
  }, [audioBuffer, stemSeparation, stemMixer]);

  const analyzeTempoAction = useCallback(() => {
    if (!audioBuffer) return;
    tempoAnalysis.analyze(audioBuffer);
  }, [audioBuffer, tempoAnalysis]);

  const generateAccompanimentAction = useCallback(async () => {
    if (!audioBuffer || !audioContext) return;
    
    const bpm = tempoOverride || tempoAnalysis.estimatedBpm;
    if (!bpm) return;

    setIsGeneratingAccompaniment(true);

    try {
      const accompaniment = await generateAccompaniment(
        bpm,
        audioBuffer.duration,
        audioContext.sampleRate
      );

      const generatedStems: Stem[] = [
        {
          name: 'Drums (Generated)',
          buffer: accompaniment.drums,
          volume: 0.7,
          muted: false,
          solo: false,
          type: 'generated',
        },
        {
          name: 'Bass (Generated)',
          buffer: accompaniment.bass,
          volume: 0.6,
          muted: false,
          solo: false,
          type: 'generated',
        },
        {
          name: 'Guitar (Generated)',
          buffer: accompaniment.guitar,
          volume: 0.5,
          muted: false,
          solo: false,
          type: 'generated',
        },
      ];

      // Add original audio as a stem if no stems exist yet
      if (stemMixer.stems.length === 0) {
        const originalStem: Stem = {
          name: 'Original',
          buffer: audioBuffer,
          volume: 0.8,
          muted: false,
          solo: false,
          type: 'separated',
        };
        stemMixer.setStems([originalStem, ...generatedStems]);
      } else {
        // Add to existing stems
        stemMixer.setStems([...stemMixer.stems, ...generatedStems]);
      }
    } catch (error) {
      console.error('Error generating accompaniment:', error);
    } finally {
      setIsGeneratingAccompaniment(false);
    }
  }, [audioBuffer, audioContext, tempoOverride, tempoAnalysis.estimatedBpm, stemMixer]);

  const clearGeneratedAccompaniment = useCallback(() => {
    stemMixer.clearGeneratedStems();
  }, [stemMixer]);

  useEffect(() => {
    if (audioContext && equalizer.enabled) {
      equalizer.initialize(audioContext);
    }
  }, [audioContext, equalizer.enabled]);

  return {
    audioFile,
    isLoading,
    isPlaying: transport.isPlaying,
    currentTime: transport.currentTime,
    duration: transport.duration,
    volume: transport.volume,
    eqEnabled: equalizer.enabled,
    eqBands: equalizer.bands,
    stems: stemMixer.stems,
    isSeparating: stemSeparation.isSeparating,
    stemSeparationProgress: stemSeparation.progress,
    stemSeparationError: stemSeparation.error,
    estimatedBpm: tempoAnalysis.estimatedBpm,
    isAnalyzingTempo: tempoAnalysis.isAnalyzing,
    tempoAnalysisError: tempoAnalysis.error,
    tempoOverride,
    isGeneratingAccompaniment,
    loadAudioFile,
    clearAudio,
    togglePlayPause,
    seek,
    setVolume: transport.setVolume,
    setEqEnabled: equalizer.setEnabled,
    setEqBand: equalizer.setBand,
    resetEqualizer: equalizer.reset,
    startStemSeparation,
    setStemVolume: stemMixer.setVolume,
    toggleStemMute: stemMixer.toggleMute,
    toggleStemSolo: stemMixer.toggleSolo,
    analyzeTempoAction,
    setTempoOverride,
    generateAccompanimentAction,
    clearGeneratedAccompaniment,
    audioContext,
    sourceNode,
  };
}
