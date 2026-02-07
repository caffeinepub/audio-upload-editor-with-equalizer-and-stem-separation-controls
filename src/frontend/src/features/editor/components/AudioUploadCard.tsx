import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileAudio, Loader2, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { validateAudioFile } from '../utils/audioFileValidation';
import { useBackendReadiness } from '@/hooks/useBackendReadiness';
import type { AudioEngine } from '../hooks/useAudioEngine';
import { useAddFileToProject } from '@/hooks/useQueries';
import { ExternalBlob } from '@/backend';

interface AudioUploadCardProps {
  projectId: string;
  audioEngine: AudioEngine;
}

export default function AudioUploadCard({ projectId, audioEngine }: AudioUploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFile = useAddFileToProject();
  const { isReady, isConnecting, message } = useBackendReadiness();

  const handleFileSelect = async (file: File) => {
    if (!isReady) {
      toast.error(message);
      return;
    }

    const validation = validateAudioFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        console.log(`Upload progress: ${percentage}%`);
      });

      await addFile.mutateAsync({ projectId, file: blob });
      
      audioEngine.loadAudioFile(file);
      toast.success('Audio file uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload audio file');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isReady) {
      toast.error(message);
      return;
    }
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClearAudio = () => {
    audioEngine.clearAudio();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    if (!isReady) {
      toast.error(message);
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="w-5 h-5" />
          Audio File
        </CardTitle>
        <CardDescription>
          Upload an audio file (WAV, MP3, or MP4) to start editing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnecting && (
          <Alert className="mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {!audioEngine.audioFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed border-border rounded-lg p-12 text-center transition-colors ${
              isReady ? 'hover:border-amber-600 cursor-pointer' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={handleUploadClick}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop your audio file here</p>
            <p className="text-sm text-muted-foreground mb-4">
              {isReady ? 'or click to browse' : 'waiting for backend connection...'}
            </p>
            <p className="text-xs text-muted-foreground">Supports WAV, MP3, and MP4 files (max 100MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,.mp4,audio/wav,audio/mpeg,audio/mp4"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={!isReady}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-600/10 flex items-center justify-center">
                <FileAudio className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">{audioEngine.audioFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(audioEngine.audioFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClearAudio}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {audioEngine.isLoading && (
          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing audio file...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
