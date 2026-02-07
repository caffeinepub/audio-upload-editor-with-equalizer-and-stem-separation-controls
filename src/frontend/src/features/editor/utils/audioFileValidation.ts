const ALLOWED_EXTENSIONS = ['.wav', '.mp3', '.mp4'];
const ALLOWED_MIME_TYPES = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/x-wav'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAudioFile(file: File): ValidationResult {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file type. Please upload a WAV, MP3, or MP4 file.`,
    };
  }

  if (!ALLOWED_MIME_TYPES.some(type => file.type.includes(type.split('/')[1]))) {
    return {
      valid: false,
      error: `Invalid audio format. Please upload a valid audio file.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 100MB limit. Please upload a smaller file.`,
    };
  }

  return { valid: true };
}
