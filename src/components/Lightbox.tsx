import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  title?: string;
  description?: string;
  onNext?: () => void;
  onPrev?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  mediaType = 'image',
  title,
  description,
  onNext,
  onPrev,
  hasPrev,
  hasNext
}) => {
  const [zoom, setZoom] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      {/* Top Controls */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[110] flex items-center space-x-2">
        {mediaType === 'image' && (
          <>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
          </>
        )}
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500 text-white transition-all"
          title="Close Lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Prev Button */}
      {hasPrev && onPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-40"
          title="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Button */}
      {hasNext && onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-40"
          title="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Media Viewport */}
      <div className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden">
        {mediaType === 'video' ? (
          <video
            src={mediaUrl}
            controls
            autoPlay
            className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl"
          />
        ) : (
          <div className="overflow-auto max-h-[75vh] max-w-full flex items-center justify-center">
            <img
              src={mediaUrl}
              alt={title || 'Enlarged photo'}
              style={{ transform: `scale(${zoom})` }}
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl transition-transform duration-200"
            />
          </div>
        )}

        {/* Caption Bar */}
        {(title || description) && (
          <div className="mt-4 text-center max-w-xl px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md text-white">
            {title && <h4 className="font-serif font-bold text-lg text-rose-200">{title}</h4>}
            {description && <p className="text-xs text-slate-200 mt-1">{description}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
