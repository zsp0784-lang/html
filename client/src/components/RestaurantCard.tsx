import { Restaurant } from '@/lib/itinerary-data';
import { UtensilsCrossed, ExternalLink, Info, MapPin } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden flex flex-col h-full group">
      {/* Food Image Area */}
      {restaurant.foodImage && (
        <div className="relative h-52 overflow-hidden bg-secondary">
          <img loading="lazy"
            src={restaurant.foodImage}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Cuisine Tag */}
          <div className="absolute top-4 left-4 bg-accent text-accent-foreground text-[11px] font-black px-3 py-1 rounded-full shadow-lg backdrop-blur-sm tracking-wider">
            {restaurant.cuisine}
          </div>
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-serif font-bold text-primary text-lg leading-tight line-clamp-2">
              {restaurant.name}
            </h4>
          </div>
          <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-accent/5 flex-shrink-0">
            <UtensilsCrossed className="h-4 w-4 text-accent" />
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground/80 mb-4">
          <MapPin className="h-3 w-3 text-accent" />
          <span className="font-medium">{restaurant.location}</span>
        </div>

        {/* Description/Notes */}
        <div className="flex-1">
          <p className="text-sm text-foreground/70 leading-relaxed mb-6">
            {restaurant.notes || "這家餐廳提供當地特色美食，是旅途中不容錯過的美味選擇。"}
          </p>
        </div>
        
        {/* Action Button */}
        {restaurant.googleSearchUrl && (
          <a
            href={restaurant.googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent text-accent-foreground rounded-xl font-bold text-sm hover:bg-accent/90 transition-all shadow-sm hover:shadow-md"
          >
            <Info className="h-4 w-4" />
            <span>店家資訊</span>
            <ExternalLink className="h-3 w-3 opacity-50" />
          </a>
        )}
      </div>
    </div>
  );
}
