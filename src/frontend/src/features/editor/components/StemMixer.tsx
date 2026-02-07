import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX } from 'lucide-react';
import type { AudioEngine } from '../hooks/useAudioEngine';

interface StemMixerProps {
  audioEngine: AudioEngine;
}

export default function StemMixer({ audioEngine }: StemMixerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stem Mixer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audioEngine.stems.map((stem) => (
            <div key={stem.name} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-semibold">{stem.name}</Label>
                  <Badge 
                    variant={stem.type === 'generated' ? 'default' : 'secondary'} 
                    className="ml-2 text-xs"
                  >
                    {stem.type === 'generated' ? 'Generated' : 'Separated'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Volume</span>
                  <span className="font-medium">{Math.round(stem.volume * 100)}%</span>
                </div>
                <Slider
                  value={[stem.volume]}
                  onValueChange={(values) => audioEngine.setStemVolume(stem.name, values[0])}
                  min={0}
                  max={1}
                  step={0.01}
                  disabled={stem.muted}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={stem.muted ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => audioEngine.toggleStemMute(stem.name)}
                  className="flex-1"
                >
                  {stem.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant={stem.solo ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => audioEngine.toggleStemSolo(stem.name)}
                  className="flex-1"
                >
                  Solo
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
