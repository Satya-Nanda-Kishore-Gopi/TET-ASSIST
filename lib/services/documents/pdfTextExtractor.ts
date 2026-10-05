import { extractText } from 'unpdf';

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
}

/**
 * Server-side PDF Text Extractor using unpdf (Node.js runtime).
 * Performs deterministic text extraction without sending full PDFs to external AI APIs.
 */
export async function extractPdfText(
  file: Buffer | ArrayBuffer | Uint8Array
): Promise<ExtractedPdfResult> {
  try {
    let uint8: Uint8Array;

    if (Buffer.isBuffer(file)) {
      uint8 = new Uint8Array(file);
    } else if (file instanceof Uint8Array) {
      uint8 = file;
    } else if (file instanceof ArrayBuffer) {
      uint8 = new Uint8Array(file);
    } else {
      throw new Error('Unsupported file buffer type provided for PDF extraction.');
    }

    if (uint8.byteLength === 0) {
      throw new Error('Empty PDF file buffer provided.');
    }

    // Extract text page-by-page from PDF
    const result = await extractText(uint8, { mergePages: false });

    const pages = Array.isArray(result.text)
      ? result.text
      : typeof result.text === 'string'
      ? [result.text]
      : [];

    const pageCount = result.totalPages || pages.length || 1;
    const combinedText = pages.join('\n\n--- Page Break ---\n\n').trim();

    return {
      text: combinedText,
      pageCount,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`PDF text extraction error: ${message}`);
  }
}
