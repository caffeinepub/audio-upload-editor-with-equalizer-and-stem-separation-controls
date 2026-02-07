import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RotateCcw } from 'lucide-react';
import type { AudioEngine } from '../hooks/useAudioEngine';

interface EqualizerPanelProps {
  audioEngine: AudioEngine;
}

const EQ_BANDS = [
  { frequency: 60, label: '60 Hz' },
  { frequency: 250, label: '250 Hz' },
  { frequency: 1000, label: '1 kHz' },
  { frequency: 4000, label: '4 kHz' },
  { frequency: 12000, label: '12 kHz' },
];

export default function EqualizerPanel({ audioEngine }: EqualizerPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Equalizer</CardTitle>
            <CardDescription>Adjust frequency bands to shape your sound</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="eq-enabled"
                checked={audioEngine.eqEnabled}
                onCheckedChange={audioEngine.setEqEnabled}
              />
              <Label htmlFor="eq-enabled">Enable EQ</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={audioEngine.resetEqualizer}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-6">
          {EQ_BANDS.map((band, index) => (
            <div key={band.frequency} className="space-y-4">
              <div className="text-center">
                <Label className="text-sm font-medium">{band.label}</Label>
              </div>
              <div className="h-48 flex items-center justify-center">
                <Slider
                  orientation="vertical"
                  value={[audioEngine.eqBands[index]]}
                  min={-12}
                  max={12}
                  step={0.5}
                  onValueChange={([value]) => audioEngine.setEqBand(index, value)}
                  disabled={!audioEngine.eqEnabled}
                  className="h-full"
                />
              </div>
              <div className="text-center">
                <span className="text-sm font-mono text-muted-foreground">
                  {audioEngine.eqBands[index] > 0 ? '+' : ''}
                  {audioEngine.eqBands[index].toFixed(1)} dB
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
