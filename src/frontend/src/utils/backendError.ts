/**
 * Parses backend errors and returns user-friendly messages with suggested actions.
 */

interface ParsedError {
  message: string;
  suggestedAction?: string;
}

/**
 * Extract the most relevant error message from various IC error structures
 */
function extractErrorMessage(error: unknown): string {
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle objects with various message properties
  if (error && typeof error === 'object') {
    // Try common IC error patterns in order of specificity
    const errorObj = error as Record<string, unknown>;
    
    // Check for reject_message (common in IC rejections)
    if (typeof errorObj.reject_message === 'string') {
      return errorObj.reject_message;
    }
    
    // Check for error_message
    if (typeof errorObj.error_message === 'string') {
      return errorObj.error_message;
    }
    
    // Check for message property
    if (typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    
    // Check for nested message in message property
    if (errorObj.message && typeof errorObj.message === 'object') {
      const nestedMsg = (errorObj.message as Record<string, unknown>).message;
      if (typeof nestedMsg === 'string') {
        return nestedMsg;
      }
    }
    
    // Check for error.message pattern
    if (errorObj.error && typeof errorObj.error === 'object') {
      const nestedError = errorObj.error as Record<string, unknown>;
      if (typeof nestedError.message === 'string') {
        return nestedError.message;
      }
    }
    
    // Try to stringify if it's a plain object
    try {
      const str = JSON.stringify(error);
      if (str !== '{}') {
        return str;
      }
    } catch {
      // Ignore stringify errors
    }
  }

  return '';
}

/**
 * Parse backend error and extract user-friendly message
 */
export function parseBackendError(error: unknown): ParsedError {
  const rawMessage = extractErrorMessage(error);
  return parseErrorMessage(rawMessage);
}

/**
 * Parse error message string and return structured error info
 */
function parseErrorMessage(message: string): ParsedError {
  const lowerMessage = message.toLowerCase();

  // Actor/connection errors
  if (
    lowerMessage.includes('actor not available') ||
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('fetch')
  ) {
    return {
      message: 'Failed to connect to the backend.',
      suggestedAction: 'Please check your connection and try again.',
    };
  }

  // Authorization errors - check for various patterns
  if (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('only users can') ||
    lowerMessage.includes('permission') ||
    lowerMessage.includes('not authorized') ||
    lowerMessage.includes('anonymous') ||
    lowerMessage.includes('guest')
  ) {
    return {
      message: 'You need to be logged in to perform this action.',
      suggestedAction: 'Please log in with Internet Identity to continue.',
    };
  }

  // Project already exists
  if (lowerMessage.includes('project already exists') || lowerMessage.includes('already exists')) {
    return {
      message: 'A project with this name already exists.',
      suggestedAction: 'Please choose a different project name.',
    };
  }

  // Project not found
  if (lowerMessage.includes('project does not exist') || lowerMessage.includes('not found')) {
    return {
      message: 'The project could not be found.',
      suggestedAction: 'It may have been deleted. Please refresh the page.',
    };
  }

  // Permission errors
  if (lowerMessage.includes('only project creator') || lowerMessage.includes('only the creator')) {
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

  // Canister trapped explicitly - extract the actual trap message
  if (lowerMessage.includes('trapped explicitly') || lowerMessage.includes('canister trapped')) {
    // Try to extract the actual trap message after "with message:"
    const trapMatch = message.match(/with message:\s*["']?([^"']+)["']?/i);
    if (trapMatch && trapMatch[1]) {
      // Recursively parse the extracted trap message
      return parseErrorMessage(trapMatch[1].trim());
    }
  }

  // Generic trap/rejection - but only if we haven't found a more specific message
  if (
    (lowerMessage.includes('reject') || lowerMessage.includes('trap')) &&
    message.length < 100 &&
    !message.includes(':')
  ) {
    return {
      message: 'The operation could not be completed.',
      suggestedAction: 'Please try again or contact support if the issue persists.',
    };
  }

  // If we have a meaningful message, return it
  if (message && message.length > 0 && message !== '{}') {
    return {
      message: message,
      suggestedAction: 'Please try again.',
    };
  }

  // Final fallback
  return {
    message: 'An unexpected error occurred.',
    suggestedAction: 'Please try again or contact support if the issue persists.',
  };
}

/**
 * Format error for display in toast notifications or UI
 */
export function formatErrorForDisplay(error: unknown): string {
  const parsed = parseBackendError(error);
  return parsed.suggestedAction ? `${parsed.message} ${parsed.suggestedAction}` : parsed.message;
}

/**
 * Alias for formatErrorForDisplay for backward compatibility
 */
export const formatErrorForToast = formatErrorForDisplay;
