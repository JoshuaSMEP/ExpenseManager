import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Image } from 'lucide-react';
import { pdfjs } from 'react-pdf';
import type { ReceiptFile } from '../../types';

// Use the same PDF.js worker configuration as ReceiptViewer
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ReceiptUploaderProps {
  files: ReceiptFile[];
  onFilesChange: (files: ReceiptFile[], originalFile?: File) => void;
  required?: boolean;
  maxFiles?: number;
  className?: string;
}

export function ReceiptUploader({
  files,
  onFilesChange,
  required = false,
  maxFiles = 10,
  className = '',
}: ReceiptUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const getFileType = (file: File): 'image' | 'pdf' => {
    if (file.type === 'application/pdf') return 'pdf';
    return 'image';
  };

  // Generate a high-resolution thumbnail image from PDF first page
  const generatePdfThumbnail = async (pdfDataUrl: string): Promise<string> => {
    try {
      const loadingTask = pdfjs.getDocument({ url: pdfDataUrl });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      // Use scale of 2.0 for high-resolution thumbnail (good for retina displays)
      const scale = 2.0;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Use higher quality JPEG for better compression with good quality
      return canvas.toDataURL('image/jpeg', 0.92);
    } catch (error) {
      console.error('Failed to generate PDF thumbnail:', error);
      return '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: ReceiptFile[] = [];
    let firstFile: File | null = null;

    for (let i = 0; i < selectedFiles.length; i++) {
      if (files.length + newFiles.length >= maxFiles) break;

      const file = selectedFiles[i];
      const fileType = getFileType(file);

      // Store first file for OCR
      if (!firstFile) {
        firstFile = file;
      }

      // Convert to data URL
      const url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Generate thumbnail for PDFs
      let thumbnailUrl: string | undefined;
      if (fileType === 'pdf') {
        thumbnailUrl = await generatePdfThumbnail(url);
      }

      newFiles.push({
        id: generateId(),
        url,
        type: fileType,
        name: file.name,
        thumbnailUrl,
      });
    }

    // Update files and pass original file for OCR processing
    onFilesChange([...files, ...newFiles], firstFile || undefined);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  };

  const canAddMore = files.length < maxFiles;

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload area */}
      {canAddMore && (
        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-6 border-2 border-dashed border-white/20 rounded-[22px] hover:border-accent-primary/50 transition-colors"
          style={{ margin: '5px' }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex flex-col items-center">
            <Upload className="w-6 h-6 text-white/40 mx-auto mb-2" />
            <p className="text-white/60 text-sm">
              Add Receipt{required ? ' (Required)' : ' (Optional)'}
            </p>
            <p className="text-white/40 text-xs mt-1">
              Images or PDF files
            </p>
          </div>
        </motion.button>
      )}

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
            style={{ marginLeft: '15px', marginRight: '15px', marginTop: '5px', marginBottom: '5px' }}
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : file.thumbnailUrl ? (
                    <img
                      src={file.thumbnailUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-6 h-6 text-white/60" />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.name}</p>
                  <p className="text-white/50 text-xs flex items-center gap-1">
                    {file.type === 'image' ? (
                      <>
                        <Image className="w-3 h-3" />
                        Image
                      </>
                    ) : (
                      <>
                        <FileText className="w-3 h-3" />
                        PDF
                      </>
                    )}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.id)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File count indicator */}
      {files.length > 0 && (
        <p className="text-white/40 text-xs mt-2 text-center">
          {files.length} of {maxFiles} files
        </p>
      )}
    </div>
  );
}
