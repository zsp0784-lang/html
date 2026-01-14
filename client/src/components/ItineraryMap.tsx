import { MapPin } from 'lucide-react';

const cities = [
  { name: '岡山', desc: '起點', position: 'left-[10%]' },
  { name: '倉敷', desc: '美觀地區', position: 'left-[30%]' },
  { name: '尾道', desc: '貓之細道', position: 'left-[50%]' },
  { name: '高松', desc: '終點', position: 'left-[70%]' },
];

export function ItineraryMap() {
  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden shadow-sm">
      <div className="p-6">
        <h3 className="font-serif text-lg font-bold text-primary mb-6">行程地圖</h3>
        
        {/* 簡化的地圖視覺化 */}
        <div className="relative h-48 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden">
          {/* 連接線 */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-accent/30 transform -translate-y-1/2" />
          
          {/* 城市標記 */}
          {cities.map((city, idx) => (
            <div
              key={idx}
              className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 ${city.position}`}
            >
              {/* 標記圓點 */}
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-accent border-2 border-primary flex items-center justify-center shadow-md">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                {/* 城市名稱 */}
                <div className="mt-3 text-center">
                  <p className="font-serif font-bold text-primary text-sm">{city.name}</p>
                  <p className="text-xs text-muted-foreground">{city.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 城市列表 */}
        <div className="mt-6 space-y-2">
          {cities.map((city, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50 transition-colors">
              <div className="w-3 h-3 rounded-full bg-accent flex-shrink-0" />
              <div>
                <p className="font-semibold text-primary text-sm">{city.name}</p>
                <p className="text-xs text-muted-foreground">{city.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
