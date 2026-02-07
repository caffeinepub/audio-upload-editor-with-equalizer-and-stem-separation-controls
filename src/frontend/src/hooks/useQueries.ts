import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorConnection } from './useActorConnection';
import type { Project, UserProfile } from '@/backend';
import { ExternalBlob } from '@/backend';

export function useGetCallerUserProfile() {
  const { actor, isLoading: actorLoading } = useActorConnection();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorLoading,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorLoading || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActorConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllProjects() {
  const { actor, isLoading: actorLoading } = useActorConnection();

  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProjects();
    },
    enabled: !!actor && !actorLoading,
  });
}

export function useGetProject(projectId: string) {
  const { actor, isLoading: actorLoading } = useActorConnection();

  return useQuery<Project | null>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProject(projectId);
    },
    enabled: !!actor && !actorLoading && !!projectId,
  });
}

export function useCreateProject() {
  const { actor } = useActorConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProject(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useAddFileToProject() {
  const { actor } = useActorConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, file }: { projectId: string; file: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addFileToProject(projectId, file);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
