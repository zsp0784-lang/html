import { WalkingRoute } from '@/lib/itinerary-data';
import { MapPin, ExternalLink, ChevronRight } from 'lucide-react';

interface WalkingRouteCardProps {
  route: WalkingRoute;
}

export function WalkingRouteCard({ route }: WalkingRouteCardProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
              <MapPin className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-primary">{route.name}</h3>
              <p className="mt-1 text-sm text-foreground/70">{route.description}</p>
            </div>
          </div>
          {route.googleMapsUrl && (
            <a 
              href={route.googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors bg-secondary/50 px-2 py-1 rounded"
            >
              Google Maps <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* 視覺化路線圖 */}
        {route.routeImage && (
          <div className="mb-6 relative rounded-xl overflow-hidden border border-border/30 bg-muted/10 group">
            <img loading="lazy" 
              src={route.routeImage} 
              alt={route.name}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        {/* 站點順序 */}
        <div className="flex flex-wrap items-center gap-y-3 gap-x-2">
          {route.locations.map((location, idx) => (
            <div key={idx} className="flex items-center">
              {idx > 0 && <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground/50" />}
              <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-full border border-border/20">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white font-bold">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-foreground/80">{location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
