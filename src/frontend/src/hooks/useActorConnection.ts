import { useInternetIdentity } from './useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';

const ACTOR_CONNECTION_QUERY_KEY = 'actorConnection';

interface ActorConnectionResult {
  actor: backendInterface | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  retry: () => void;
}

/**
 * Resilient actor connection hook that supports anonymous/authenticated identities,
 * non-blocking optional admin-secret initialization, explicit connection states, and retry.
 * 
 * This hook replaces useActor for connection-aware components. It ensures that:
 * - Admin initialization failures don't block normal user flows
 * - Connection errors are surfaced explicitly (not infinite loading)
 * - Users can retry failed connections
 */
export function useActorConnection(): ActorConnectionResult {
  const { identity } = useInternetIdentity();
  const [retryCount, setRetryCount] = useState(0);

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_CONNECTION_QUERY_KEY, identity?.getPrincipal().toString(), retryCount],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      if (!isAuthenticated) {
        // Return anonymous actor if not authenticated
        return await createActorWithConfig();
      }

      const actorOptions = {
        agentOptions: {
          identity
        }
      };

      const actor = await createActorWithConfig(actorOptions);
      
      // Try to initialize admin access control, but don't block on failure
      try {
        const adminToken = getSecretParameter('caffeineAdminToken') || '';
        await actor._initializeAccessControlWithSecret(adminToken);
      } catch (adminInitError) {
        // Log the admin initialization failure but continue
        // This allows normal users to proceed without admin privileges
        console.warn('Admin initialization failed (non-blocking):', adminInitError);
      }
      
      return actor;
    },
    staleTime: Infinity,
    enabled: true,
    retry: false, // Don't auto-retry, let user trigger retry explicitly
  });

  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  return {
    actor: actorQuery.data || null,
    isLoading: actorQuery.isLoading || actorQuery.isFetching,
    isError: actorQuery.isError,
    error: actorQuery.error,
    retry,
  };
}
