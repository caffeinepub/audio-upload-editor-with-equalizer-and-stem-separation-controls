/**
 * Parses backend errors and returns user-friendly messages with suggested actions.
 */

interface ParsedError {
  message: string;
  suggestedAction?: string;
}

/**
 * Parse backend error and extract user-friendly message
 */
export function parseBackendError(error: unknown): ParsedError {
  // Handle string errors
  if (typeof error === 'string') {
    return parseErrorMessage(error);
  }

  // Handle Error objects
  if (error instanceof Error) {
    return parseErrorMessage(error.message);
  }

  // Handle objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return parseErrorMessage(message);
    }
  }

  // Fallback for unknown error types
  return {
    message: 'Failed to connect to the backend.',
    suggestedAction: 'Please check your connection and try again.',
  };
}

/**
 * Parse error message string and return structured error info
 */
function parseErrorMessage(message: string): ParsedError {
  const lowerMessage = message.toLowerCase();

  // Actor/connection errors
  if (lowerMessage.includes('actor not available') || 
      lowerMessage.includes('failed to fetch') ||
      lowerMessage.includes('network') ||
      lowerMessage.includes('connection')) {
    return {
      message: 'Failed to connect to the backend.',
      suggestedAction: 'Please check your connection and try again.',
    };
  }

  // Authorization errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('only users can')) {
    return {
      message: 'You need to be logged in to perform this action.',
      suggestedAction: 'Please log out and log in again to refresh your session.',
    };
  }

  // Project already exists
  if (lowerMessage.includes('project already exists')) {
    return {
      message: 'A project with this name already exists.',
      suggestedAction: 'Please choose a different project name.',
    };
  }

  // Project not found
  if (lowerMessage.includes('project does not exist')) {
    return {
      message: 'The project could not be found.',
      suggestedAction: 'It may have been deleted. Please refresh the page.',
    };
  }

  // Permission errors
  if (lowerMessage.includes('only project creator')) {
    return {
      message: 'You do not have permission to modify this project.',
      suggestedAction: 'Only the project creator can make changes.',
    };
  }

  // File size errors
  if (lowerMessage.includes('file too large') || lowerMessage.includes('size limit')) {
    return {
      message: 'The file is too large to upload.',
      suggestedAction: 'Please choose a smaller file (maximum 50MB).',
    };
  }

  // Generic trap/rejection
  if (lowerMessage.includes('reject') || lowerMessage.includes('trap')) {
    return {
      message: 'The operation could not be completed.',
      suggestedAction: 'Please try again or contact support if the issue persists.',
    };
  }

  // Return the original message if no specific pattern matches
  return {
    message: message || 'An unexpected error occurred.',
    suggestedAction: 'Please try again.',
  };
}

/**
 * Format error for display in toast notifications or UI
 */
export function formatErrorForDisplay(error: unknown): string {
  const parsed = parseBackendError(error);
  return parsed.suggestedAction 
    ? `${parsed.message} ${parsed.suggestedAction}`
    : parsed.message;
}

/**
 * Alias for formatErrorForDisplay for backward compatibility
 */
export const formatErrorForToast = formatErrorForDisplay;
