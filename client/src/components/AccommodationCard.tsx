import { Accommodation } from "@/lib/accommodations-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface AccommodationCardProps {
  accommodation: Accommodation;
}

export default function AccommodationCard({ accommodation }: AccommodationCardProps) {
  const [activeImage, setActiveImage] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev + 1) % accommodation.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev - 1 + accommodation.images.length) % accommodation.images.length);
  };

  return (
    <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group bg-white/90 backdrop-blur-sm mb-8">
      <div className="flex flex-col lg:flex-row">
        {/* 圖片區域 */}
        <div className="relative w-full lg:w-1/2 h-[300px] sm:h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden">
          <img loading="lazy"
            src={accommodation.images[activeImage]}
            alt={`${accommodation.name} - ${activeImage + 1}`}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
          
          {/* 左右切換按鈕 - 加大點擊區域以利手機操作 */}
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* 圖片計數指示器 */}
          <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/50 text-white text-xs backdrop-blur-md">
            {activeImage + 1} / {accommodation.images.length}
          </div>

          {/* 分頁小圓點 - 保留但加大間距 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            {accommodation.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeImage === idx ? "bg-white scale-125 shadow-md" : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <div className="absolute top-4 left-4">
            <Badge className="bg-primary/90 text-white border-none px-3 py-1 shadow-md">
              精選住宿
            </Badge>
          </div>
        </div>

        {/* 內容區域 */}
        <CardContent className="p-6 sm:p-8 lg:w-1/2 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight mb-2">
                {accommodation.name}
              </h3>
              <div className="flex items-center text-slate-500 text-sm sm:text-base">
                <MapPin className="w-4 h-4 mr-1.5 text-primary flex-shrink-0" />
                {accommodation.location}
              </div>
            </div>
            
            <div className="prose prose-slate prose-sm sm:prose-base max-w-none mb-8">
              <p className="text-slate-600 leading-relaxed">
                {accommodation.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-primary" />
                  特色亮點
                </h4>
                <div className="flex flex-wrap gap-2">
                  {accommodation.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-primary/5 text-primary border-none px-3 py-1">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                  設施服務
                </h4>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                  {accommodation.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center text-xs sm:text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-slate-400 italic">※ 建議提前預約以確保房位</span>
            <a
              href={accommodation.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center px-6 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
            >
              在 Google Maps 查看位置
            </a>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
