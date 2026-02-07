import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, Music, Trash2, AlertCircle } from 'lucide-react';
import type { AudioEngine } from '../hooks/useAudioEngine';

interface AILikeAccompanimentPanelProps {
  audioEngine: AudioEngine;
}

export default function AILikeAccompanimentPanel({ audioEngine }: AILikeAccompanimentPanelProps) {
  const hasGeneratedStems = audioEngine.stems.some(stem => stem.name.includes('(Generated)'));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI-Like Accompaniment
        </CardTitle>
        <CardDescription>
          Analyze tempo and generate virtual instruments (drums, bass, guitar) to accompany your track
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tempo Analysis Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Tempo Analysis</Label>
            {audioEngine.estimatedBpm && (
              <span className="text-sm font-medium text-amber-600">
                {audioEngine.estimatedBpm} BPM
              </span>
            )}
          </div>
          
          <Button
            onClick={audioEngine.analyzeTempoAction}
            disabled={audioEngine.isAnalyzingTempo || !audioEngine.audioFile || audioEngine.isGeneratingAccompaniment}
            variant="outline"
            className="w-full"
          >
            {audioEngine.isAnalyzingTempo ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Music className="w-4 h-4 mr-2" />
                Analyze Tempo
              </>
            )}
          </Button>

          {audioEngine.tempoAnalysisError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{audioEngine.tempoAnalysisError}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Tempo Override Section */}
        {audioEngine.estimatedBpm && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tempo Override (Optional)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[audioEngine.tempoOverride || audioEngine.estimatedBpm]}
                onValueChange={(values) => audioEngine.setTempoOverride(values[0])}
                min={60}
                max={180}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium w-16 text-right">
                {audioEngine.tempoOverride || audioEngine.estimatedBpm} BPM
              </span>
            </div>
            {audioEngine.tempoOverride && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => audioEngine.setTempoOverride(null)}
                className="text-xs"
              >
                Reset to detected tempo
              </Button>
            )}
          </div>
        )}

        {/* Generate Section */}
        {audioEngine.estimatedBpm && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Generate Accompaniment</Label>
            <Button
              onClick={audioEngine.generateAccompanimentAction}
              disabled={audioEngine.isGeneratingAccompaniment || hasGeneratedStems}
              size="lg"
              className="w-full"
            >
              {audioEngine.isGeneratingAccompaniment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : hasGeneratedStems ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Parts Already Generated
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Parts
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Generates drums, bass, and guitar parts that match your track's tempo
            </p>
          </div>
        )}

        {/* Clear Generated Parts */}
        {hasGeneratedStems && (
          <div className="space-y-3">
            <Button
              onClick={audioEngine.clearGeneratedAccompaniment}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Generated Parts
            </Button>
            <Alert>
              <AlertDescription>
                Generated accompaniment is active. Use the mixer below to adjust levels or clear to remove.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
