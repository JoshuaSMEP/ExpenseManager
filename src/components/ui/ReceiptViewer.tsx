import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText } from 'lucide-react';
import type { ReceiptFile } from '../../types';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ReceiptViewerProps {
  receipt: ReceiptFile;
  mode?: 'thumbnail' | 'full';
  className?: string;
  onClick?: () => void;
}

export function ReceiptViewer({
  receipt,
  mode = 'thumbnail',
  className = '',
  onClick,
}: ReceiptViewerProps) {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfError, setPdfError] = useState<boolean>(false);

  const isThumbnail = mode === 'thumbnail';
  const containerClasses = `${className} ${onClick ? 'cursor-pointer' : ''}`;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(false);
  };

  const onDocumentLoadError = () => {
    setPdfError(true);
  };

  if (receipt.type === 'image') {
    return (
      <div className={containerClasses} onClick={onClick}>
        <img
          src={receipt.url}
          alt={receipt.name}
          className={`object-cover ${isThumbnail ? 'w-full h-full' : 'max-w-full max-h-full object-contain'}`}
        />
      </div>
    );
  }

  // PDF rendering
  if (receipt.type === 'pdf') {
    if (pdfError) {
      return (
        <div
          className={`${containerClasses} flex flex-col items-center justify-center bg-white/5`}
          onClick={onClick}
        >
          <FileText className="w-8 h-8 text-white/40 mb-2" />
          <span className="text-white/60 text-xs text-center px-2">{receipt.name}</span>
        </div>
      );
    }

    if (isThumbnail) {
      return (
        <div
          className={`${containerClasses} flex items-center justify-center bg-white/5 overflow-hidden`}
          onClick={onClick}
        >
          <Document
            file={receipt.url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center justify-center">
                <FileText className="w-6 h-6 text-white/40" />
              </div>
            }
          >
            <Page
              pageNumber={1}
              width={100}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      );
    }

    // Full view with page navigation
    return (
      <div className={`${containerClasses} flex flex-col items-center`}>
        <Document
          file={receipt.url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-white/60 text-sm">Loading PDF...</span>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="max-w-full"
          />
        </Document>

        {/* Page navigation */}
        {numPages > 1 && (
          <div className="flex items-center gap-4 mt-4 p-2 rounded-xl bg-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPageNumber(prev => Math.max(1, prev - 1));
              }}
              disabled={pageNumber <= 1}
              className="px-3 py-1 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Previous
            </button>
            <span className="text-white/80 text-sm">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPageNumber(prev => Math.min(numPages, prev + 1));
              }}
              disabled={pageNumber >= numPages}
              className="px-3 py-1 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
