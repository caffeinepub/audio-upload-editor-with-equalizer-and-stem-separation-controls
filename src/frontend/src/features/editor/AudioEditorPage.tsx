import { useParams } from '@tanstack/react-router';
import { useGetProject } from '@/hooks/useQueries';
import { useBackendReadiness } from '@/hooks/useBackendReadiness';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AudioUploadCard from './components/AudioUploadCard';
import TransportControls from './components/TransportControls';
import EqualizerPanel from './components/EqualizerPanel';
import StemSeparationPanel from './components/StemSeparationPanel';
import AILikeAccompanimentPanel from './components/AILikeAccompanimentPanel';
import StemMixer from './components/StemMixer';
import ExportPanel from './components/ExportPanel';
import { useAudioEngine } from './hooks/useAudioEngine';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AudioEditorPage() {
  const { projectId } = useParams({ from: '/editor/$projectId' });
  const { data: project, isLoading } = useGetProject(projectId);
  const { isReady, isConnecting, isError, message, retry } = useBackendReadiness();
  const audioEngine = useAudioEngine(projectId);

  // Show error state when backend connection fails
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{message}</p>
            <Button 
              variant="outline" 
              onClick={retry}
            >
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show connecting state while backend is initializing
  if (isConnecting) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching project data
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  // Only show "not found" after backend is ready and project fetch completed
  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground">The requested project does not exist.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground">{project.description}</p>
        )}
      </div>

      {!isReady && !isError && (
        <Alert className="mb-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <AudioUploadCard projectId={projectId} audioEngine={audioEngine} />

        {audioEngine.audioFile && (
          <>
            <Card className="p-6">
              <TransportControls audioEngine={audioEngine} />
            </Card>

            <Tabs defaultValue="equalizer" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="equalizer">Equalizer</TabsTrigger>
                <TabsTrigger value="stems">Stem Separation</TabsTrigger>
                <TabsTrigger value="ai">AI Accompaniment</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>
              
              <TabsContent value="equalizer" className="mt-6">
                <EqualizerPanel audioEngine={audioEngine} />
              </TabsContent>
              
              <TabsContent value="stems" className="mt-6 space-y-6">
                <StemSeparationPanel audioEngine={audioEngine} />
                {audioEngine.stems.filter(s => s.type === 'separated').length > 0 && (
                  <StemMixer audioEngine={audioEngine} />
                )}
              </TabsContent>

              <TabsContent value="ai" className="mt-6 space-y-6">
                <AILikeAccompanimentPanel audioEngine={audioEngine} />
                {audioEngine.stems.filter(s => s.type === 'generated').length > 0 && (
                  <StemMixer audioEngine={audioEngine} />
                )}
              </TabsContent>
              
              <TabsContent value="export" className="mt-6">
                <ExportPanel audioEngine={audioEngine} projectName={project.name} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
