import { useActor } from './useActor';

export interface BackendReadinessState {
  isReady: boolean;
  isConnecting: boolean;
  message: string;
}

/**
 * Hook to determine backend readiness state and provide consistent user-facing messaging.
 * 
 * @returns {BackendReadinessState} Object containing:
 *   - isReady: true when actor is available and not fetching
 *   - isConnecting: true when actor is being initialized
 *   - message: English message to display when not ready
 */
export function useBackendReadiness(): BackendReadinessState {
  const { actor, isFetching } = useActor();

  const isReady = !!actor && !isFetching;
  const isConnecting = !actor || isFetching;

  return {
    isReady,
    isConnecting,
    message: 'Connecting to the backend… Please wait.',
  };
}
