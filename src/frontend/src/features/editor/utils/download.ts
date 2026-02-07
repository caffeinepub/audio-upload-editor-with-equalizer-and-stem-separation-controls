import { encodeWAV } from './wavEncode';

export async function downloadAudioFile(audioBuffer: AudioBuffer, filename: string): Promise<void> {
  try {
    const wavBlob = encodeWAV(audioBuffer);
    
    const url = URL.createObjectURL(wavBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Failed to download audio file. Please try again.');
  }
}
