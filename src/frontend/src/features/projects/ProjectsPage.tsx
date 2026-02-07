import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllProjects } from '@/hooks/useQueries';
import { useBackendReadiness } from '@/hooks/useBackendReadiness';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FolderOpen, Loader2, Music, Calendar, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ProjectDialogs from './components/ProjectDialogs';
import LoginButton from '@/components/auth/LoginButton';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useGetAllProjects();
  const { isReady, isConnecting, isError, message, retry } = useBackendReadiness();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleOpenProject = (projectId: string) => {
    navigate({ to: '/editor/$projectId', params: { projectId } });
  };

  const handleNewProjectClick = () => {
    if (!isReady) {
      return;
    }
    setCreateDialogOpen(true);
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
          <p className="text-muted-foreground">Manage your audio editing projects</p>
        </div>
        <div className="flex items-center gap-3">
          <LoginButton />
          <Button onClick={handleNewProjectClick} size="lg" disabled={!isReady}>
            {isConnecting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            New Project
          </Button>
        </div>
      </div>

      {isConnecting && (
        <Alert className="mb-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{message}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retry}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleOpenProject(project.id)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 group-hover:text-amber-600 transition-colors">
                      <Music className="w-5 h-5" />
                      {project.name}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {project.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(project.createdTs)}
                  </div>
                  <div className="text-xs">
                    {project.files.length} file{project.files.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <Button className="w-full" variant="secondary">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Open Project
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Create your first audio project to start editing with equalizer and stem separation tools.
            </p>
            <Button onClick={handleNewProjectClick} disabled={!isReady}>
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      )}

      <ProjectDialogs
        createDialogOpen={createDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
      />
    </div>
  );
}
