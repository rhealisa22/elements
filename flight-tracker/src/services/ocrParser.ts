import Tesseract from 'tesseract.js';

export async function recognizeImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const result = await Tesseract.recognize(file, 'eng', {
    logger: (info) => {
      if (info.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(info.progress * 100));
      }
    },
  });

  return result.data.text;
}
