import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Scissors, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AudioEngine } from '../hooks/useAudioEngine';

interface StemSeparationPanelProps {
  audioEngine: AudioEngine;
}

export default function StemSeparationPanel({ audioEngine }: StemSeparationPanelProps) {
  const separatedStems = audioEngine.stems.filter(stem => stem.type === 'separated');
  const hasSeparatedStems = separatedStems.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="w-5 h-5" />
          Stem Separation
        </CardTitle>
        <CardDescription>
          Separate your audio into individual instrument stems (drums, bass, guitar, vocals)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasSeparatedStems && !audioEngine.stemSeparationProgress && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No stems separated yet. Click below to start stem separation.
            </p>
            <Button
              onClick={audioEngine.startStemSeparation}
              disabled={audioEngine.isSeparating || !audioEngine.audioFile}
              size="lg"
            >
              {audioEngine.isSeparating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Separating...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 mr-2" />
                  Start Stem Separation
                </>
              )}
            </Button>
          </div>
        )}

        {audioEngine.isSeparating && audioEngine.stemSeparationProgress !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Processing audio...</span>
              <span className="font-medium">{audioEngine.stemSeparationProgress}%</span>
            </div>
            <Progress value={audioEngine.stemSeparationProgress} />
          </div>
        )}

        {audioEngine.stemSeparationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{audioEngine.stemSeparationError}</AlertDescription>
          </Alert>
        )}

        {hasSeparatedStems && (
          <Alert>
            <AlertDescription>
              Stem separation complete! {separatedStems.length} stems generated. Use the mixer below to control each stem.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
