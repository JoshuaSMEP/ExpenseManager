import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, FileText } from 'lucide-react';
import type { ReceiptFile } from '../../types';
import { ReceiptViewer } from './ReceiptViewer';

interface ReceiptGalleryProps {
  files: ReceiptFile[];
  className?: string;
}

export function ReceiptGallery({ files, className = '' }: ReceiptGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (files.length === 0) {
    return null;
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex < files.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedIndex === null) return;

    if (e.key === 'ArrowLeft' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (e.key === 'ArrowRight' && selectedIndex < files.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (e.key === 'Escape') {
      setSelectedIndex(null);
    }
  };

  return (
    <div className={className}>
      {/* Thumbnail grid */}
      <div className={`grid gap-3 ${files.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedIndex(index)}
          >
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
              <div className="w-full h-full flex flex-col items-center justify-center">
                <FileText className="w-8 h-8 text-white/40 mb-2" />
                <span className="text-white/60 text-xs text-center px-2 truncate max-w-full">
                  {file.name}
                </span>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white" />
            </div>

            {/* File count badge for multiple files */}
            {files.length > 1 && index === 0 && (
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                <span className="text-white text-xs font-medium">
                  {files.length} files
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Full-screen modal - rendered via portal to escape any overflow:hidden containers */}
      {createPortal(
        <AnimatePresence>
          {selectedIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center p-4 bg-black/95"
              style={{ zIndex: 9999 }}
              onClick={() => setSelectedIndex(null)}
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              {/* Close button */}
              <motion.button
                className="absolute top-6 right-6 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                style={{ zIndex: 10000 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(null);
                }}
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <X className="w-7 h-7 text-white" />
              </motion.button>

              {/* Navigation arrows */}
              {files.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ zIndex: 10000 }}
                    onClick={handlePrevious}
                    disabled={selectedIndex === 0}
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>

                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ zIndex: 10000 }}
                    onClick={handleNext}
                    disabled={selectedIndex === files.length - 1}
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              {/* Content */}
              <motion.div
                key={selectedIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-4xl max-h-[85vh] overflow-auto bg-white rounded-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <ReceiptViewer
                  receipt={files[selectedIndex]}
                  mode="full"
                  className="rounded-xl overflow-hidden"
                />
              </motion.div>

              {/* Page indicator */}
              {files.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                  {files.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === selectedIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* File name */}
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                <span className="text-white text-sm">
                  {files[selectedIndex].name}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
