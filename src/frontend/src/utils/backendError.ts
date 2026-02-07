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
    message: 'An unexpected error occurred. Please try again.',
    suggestedAction: 'If the problem persists, try refreshing the page.',
  };
}

/**
 * Parse error message string and return structured error info
 */
function parseErrorMessage(message: string): ParsedError {
  const lowerMessage = message.toLowerCase();

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

  // Actor not available - aligned with readiness messaging
  if (lowerMessage.includes('actor not available')) {
    return {
      message: 'Connecting to the backend… Please wait.',
      suggestedAction: 'Try again in a moment.',
    };
  }

  // Generic trap or rejection
  if (lowerMessage.includes('trap') || lowerMessage.includes('reject')) {
    // Try to extract the actual error message after "trap" or "reject"
    const trapMatch = message.match(/trap[:\s]+(.+)/i);
    const rejectMatch = message.match(/reject[:\s]+(.+)/i);
    const extractedMessage = trapMatch?.[1] || rejectMatch?.[1];

    if (extractedMessage) {
      // Recursively parse the extracted message
      return parseErrorMessage(extractedMessage);
    }

    return {
      message: 'The operation could not be completed.',
      suggestedAction: 'Please try again or refresh the page.',
    };
  }

  // Return the original message if no specific pattern matched
  return {
    message: message || 'An error occurred. Please try again.',
  };
}

/**
 * Format error for display in toast or UI
 */
export function formatErrorForDisplay(error: unknown): string {
  const parsed = parseBackendError(error);
  if (parsed.suggestedAction) {
    return `${parsed.message} ${parsed.suggestedAction}`;
  }
  return parsed.message;
}
