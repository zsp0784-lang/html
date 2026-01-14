import { Attraction } from "@/lib/attractions-data";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";

interface AttractionCardProps {
  attraction: Attraction;
}

export default function AttractionCard({ attraction }: AttractionCardProps) {
  const [activeImage, setActiveImage] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev + 1) % attraction.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev - 1 + attraction.images.length) % attraction.images.length);
  };

  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white mb-12">
      <div className="flex flex-col">
        {/* 標題與描述區域 */}
        <div className="p-6 sm:p-8 border-b border-slate-50">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary mb-4">
            {attraction.name}
          </h3>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6">
            {attraction.description}
          </p>
          
          {/* 亮點列表 */}
          <div className="flex flex-wrap gap-3">
            {attraction.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-accent/5 text-accent px-3 py-1.5 rounded-full text-sm font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                {highlight}
              </div>
            ))}
          </div>
        </div>

        {/* 圖片區域 - 單張大圖模式 */}
        <div className="relative w-full h-[300px] sm:h-[450px] lg:h-[550px] bg-slate-100 flex items-center justify-center overflow-hidden">
          <img loading="lazy"
            src={attraction.images[activeImage]}
            alt={`${attraction.name} - ${activeImage + 1}`}
            className="w-full h-full object-cover transition-all duration-700 [image-rendering:auto]"
            style={{ imageRendering: 'high-quality' } as any}
          />
          
          {/* 左右切換按鈕 */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* 圖片計數指示器 */}
          <div className="absolute bottom-6 right-6 px-4 py-1.5 rounded-full bg-black/50 text-white text-sm font-medium backdrop-blur-md">
            {activeImage + 1} / {attraction.images.length}
          </div>

          {/* 分頁小圓點 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
            {attraction.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeImage === idx ? "bg-white scale-125 shadow-md" : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
