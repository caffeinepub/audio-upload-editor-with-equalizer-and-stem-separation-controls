import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type { AudioEngine } from '../hooks/useAudioEngine';
import { renderMixedAudio, renderStemAudio } from '../utils/offlineRender';
import { downloadAudioFile } from '../utils/download';

interface ExportPanelProps {
  audioEngine: AudioEngine;
  projectName: string;
}

export default function ExportPanel({ audioEngine, projectName }: ExportPanelProps) {
  const handleExportMix = async () => {
    try {
      const audioBuffer = await renderMixedAudio(audioEngine);
      await downloadAudioFile(audioBuffer, `${projectName}_mixed.wav`);
      toast.success('Mixed audio exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export mixed audio');
    }
  };

  const handleExportStem = async (stemName: string) => {
    try {
      const stem = audioEngine.stems.find(s => s.name === stemName);
      if (!stem) return;
      
      const audioBuffer = await renderStemAudio(stem);
      await downloadAudioFile(audioBuffer, `${projectName}_${stemName}.wav`);
      toast.success(`${stemName} stem exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${stemName} stem`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Audio</CardTitle>
        <CardDescription>
          Download your mixed audio or individual stems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Mixed Output</h3>
          <Button
            onClick={handleExportMix}
            disabled={!audioEngine.audioFile}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Mixed Audio
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Exports the current mix with EQ and stem settings applied
          </p>
        </div>

        {audioEngine.stems.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Individual Stems</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {audioEngine.stems.map((stem) => (
                <Button
                  key={stem.name}
                  variant="outline"
                  onClick={() => handleExportStem(stem.name)}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export {stem.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
