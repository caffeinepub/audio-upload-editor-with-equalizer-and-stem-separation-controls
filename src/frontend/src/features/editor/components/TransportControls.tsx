import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { AudioEngine } from '../hooks/useAudioEngine';

interface TransportControlsProps {
  audioEngine: AudioEngine;
}

export default function TransportControls({ audioEngine }: TransportControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          onClick={audioEngine.togglePlayPause}
          disabled={!audioEngine.audioFile}
          className="w-14 h-14 rounded-full"
        >
          {audioEngine.isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        <div className="flex-1">
          <Slider
            value={[audioEngine.currentTime]}
            max={audioEngine.duration || 100}
            step={0.1}
            onValueChange={([value]) => audioEngine.seek(value)}
            disabled={!audioEngine.audioFile}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{formatTime(audioEngine.currentTime)}</span>
            <span>{formatTime(audioEngine.duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-32">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => audioEngine.setVolume(audioEngine.volume > 0 ? 0 : 1)}
          >
            {audioEngine.volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <Slider
            value={[audioEngine.volume * 100]}
            max={100}
            step={1}
            onValueChange={([value]) => audioEngine.setVolume(value / 100)}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
