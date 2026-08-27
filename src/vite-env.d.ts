/// <reference types="vite/client" />

declare module '*?url' {
  const content: string;
  export default content;
}

declare module 'pdfjs-dist' {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export interface TextContentItem {
    str: string;
  }
  export interface PDFPageProxy {
    getTextContent: () => Promise<{ items: TextContentItem[] }>;
  }
  export interface PDFDocumentProxy {
    numPages: number;
    getPage: (pageNumber: number) => Promise<PDFPageProxy>;
  }
  export function getDocument(src: { data: Uint8Array }): { promise: Promise<PDFDocumentProxy> };
}
