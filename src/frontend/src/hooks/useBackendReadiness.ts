import { useActorConnection } from './useActorConnection';
import { parseBackendError } from '@/utils/backendError';

export interface BackendReadinessState {
  isReady: boolean;
  isConnecting: boolean;
  isError: boolean;
  message: string;
  retry: () => void;
}

/**
 * Hook to determine backend readiness state and provide consistent user-facing messaging.
 * 
 * @returns {BackendReadinessState} Object containing:
 *   - isReady: true when actor is available and not loading
 *   - isConnecting: true when actor is being initialized
 *   - isError: true when actor connection failed
 *   - message: English message to display when not ready or in error
 *   - retry: function to retry connection
 */
export function useBackendReadiness(): BackendReadinessState {
  const { actor, isLoading, isError, error, retry } = useActorConnection();

  const isReady = !!actor && !isLoading && !isError;
  const isConnecting = isLoading && !isError;

  let message = 'Connecting to the backend… Please wait.';
  
  if (isError) {
    const parsed = parseBackendError(error);
    message = parsed.message;
    if (parsed.suggestedAction) {
      message += ' ' + parsed.suggestedAction;
    }
  }

  return {
    isReady,
    isConnecting,
    isError,
    message,
    retry,
  };
}
