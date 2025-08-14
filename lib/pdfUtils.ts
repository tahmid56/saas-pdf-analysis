// lib/pdfUtils.ts
import type { TextContent } from 'pdfjs-dist/types/src/display/api';
import { PDF_PROCESSING } from './constants';

export const extractTextFromPDF = async (file: File): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('PDF extraction is only supported in the browser');
  }

  console.log('pdfUtils.ts running in:', typeof window === 'undefined' ? 'server' : 'client');

  let pdfjsLib;
  try {
    console.log('Attempting to import pdfjs-dist');
    pdfjsLib = await import('pdfjs-dist');
    console.log('pdfjs-dist imported successfully');
  } catch (error) {
    console.error('Failed to import pdfjs-dist:', error);
    throw new Error(`Failed to load PDF.js library: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const { getDocument, GlobalWorkerOptions, version } = pdfjsLib;
  GlobalWorkerOptions.workerSrc = PDF_PROCESSING.WORKER_SRC;

  console.log(`PDF.js version: ${version}`);
  console.log('Worker src set to:', GlobalWorkerOptions.workerSrc);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;
    console.log('PDF loaded with', pdf.numPages, 'pages');
    const numPages = pdf.numPages;

    let text = '';
    const pagePromises = Array.from({ length: numPages }, (_, i) => i + 1).map(
      async (pageNum) => {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent() as TextContent;
        return content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
      }
    );
    const pageTexts = await Promise.all(pagePromises);
    text = pageTexts.join('\n');
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to extract text from PDF: ${error.message}`
        : 'Unknown error'
    );
  }
};