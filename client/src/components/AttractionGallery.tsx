import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface Attraction {
  id: string;
  name: string;
  description: string;
  images: string[];
  highlights: string[];
}

interface AttractionGalleryProps {
  attraction: Attraction;
  isOpen: boolean;
  onClose: () => void;
}

export function AttractionGallery({ attraction, isOpen, onClose }: AttractionGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const currentImage = attraction.images[currentImageIndex];
  const hasMultipleImages = attraction.images.length > 1;

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? attraction.images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === attraction.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-background shadow-2xl">
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* 圖片展示區域 */}
        <div className="relative flex flex-col lg:flex-row">
          {/* 主圖片 */}
          <div className="relative flex-1 overflow-hidden bg-black">
            <img loading="lazy"
              src={currentImage}
              alt={`${attraction.name} - ${currentImageIndex + 1}`}
              className="h-full w-full object-cover"
            />

            {/* 導航按鈕 */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white hover:bg-white/50 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white hover:bg-white/50 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* 圖片計數器 */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-white text-sm">
                  {currentImageIndex + 1} / {attraction.images.length}
                </div>
              </>
            )}
          </div>

          {/* 信息面板 */}
          <div className="flex flex-col justify-between bg-card p-6 lg:w-80">
            <div>
              <h2 className="font-serif text-2xl font-bold text-primary mb-2">{attraction.name}</h2>
              <p className="text-sm text-foreground/70 mb-6">{attraction.description}</p>

              {/* 亮點 */}
              <div>
                <h3 className="font-semibold text-primary mb-3">景點亮點</h3>
                <ul className="space-y-2">
                  {attraction.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground/70">
                      <span className="mt-1 h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 縮略圖導航 */}
            {hasMultipleImages && (
              <div className="mt-6 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">更多圖片</p>
                <div className="grid grid-cols-3 gap-2">
                  {attraction.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                        idx === currentImageIndex
                          ? 'border-accent ring-2 ring-accent'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <img loading="lazy"
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="h-16 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
