import { useState, useEffect } from 'react';
import { useCreateProject } from '@/hooks/useQueries';
import { useBackendReadiness } from '@/hooks/useBackendReadiness';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatErrorForDisplay } from '@/utils/backendError';

interface ProjectDialogsProps {
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
}

export default function ProjectDialogs({ createDialogOpen, setCreateDialogOpen }: ProjectDialogsProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createProject = useCreateProject();
  const { isReady, message } = useBackendReadiness();

  // Close dialog if backend becomes unavailable while open
  useEffect(() => {
    if (createDialogOpen && !isReady) {
      setCreateDialogOpen(false);
      toast.error(message);
    }
  }, [createDialogOpen, isReady, message, setCreateDialogOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isReady) {
      toast.error(message);
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      await createProject.mutateAsync({ name: name.trim(), description: description.trim() });
      toast.success('Project created successfully!');
      setCreateDialogOpen(false);
      setName('');
      setDescription('');
    } catch (error) {
      // Log the full error for debugging
      console.error('Project creation error (full):', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', error && typeof error === 'object' ? Object.keys(error) : 'N/A');
      
      // Format and display user-friendly error
      const errorMessage = formatErrorForDisplay(error);
      toast.error(errorMessage);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open && !isReady) {
      toast.error(message);
      return;
    }
    setCreateDialogOpen(open);
  };

  return (
    <Dialog open={createDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start a new audio editing project with equalizer and stem separation tools.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Audio Project"
                className="mt-2"
                autoFocus
                disabled={!isReady}
              />
            </div>
            <div>
              <Label htmlFor="project-description">Description (optional)</Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project..."
                className="mt-2"
                rows={3}
                disabled={!isReady}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isReady || createProject.isPending || !name.trim()}>
              {createProject.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
