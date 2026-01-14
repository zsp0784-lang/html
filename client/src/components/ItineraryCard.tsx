import { DayItinerary } from '@/lib/itinerary-data';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ItineraryCardProps {
  day: DayItinerary;
  image?: string;
}

export function ItineraryCard({ day, image }: ItineraryCardProps) {
  const displayImage = image || day.headerImage;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-8 scroll-mt-20">
      <div className="relative">
        {/* Date Badge */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 border border-accent/30">
            <span className="font-serif text-sm font-bold text-primary">{day.date}</span>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-primary">{day.day}</h2>
          </div>
        </div>

        {/* Image if provided */}
        {displayImage && (
          <div className="mb-4 overflow-hidden rounded-lg border border-border/50 shadow-sm">
            <img loading="lazy"
              src={displayImage}
              alt={`${day.date} - ${day.day}`}
              width={800}
              height={256}
              className="h-64 w-full object-cover"
            />
          </div>
        )}

        {/* Activities */}
        <div className="space-y-4 rounded-lg border border-border/50 bg-card p-4 md:p-6 shadow-sm">
          {day.activities.slice(0, expanded ? undefined : 3).map((activity, idx) => (
            <div key={idx} className="flex gap-3 md:gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-accent/30 border-2 border-accent flex items-center justify-center">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-accent" />
                </div>
                {idx < (expanded ? day.activities.length : 3) - 1 && (
                  <div className="flex-1 w-0.5 bg-border/30 my-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2">
                  <span className="font-mono font-bold text-accent text-xs md:text-sm">{activity.time}</span>
                  <h3 className="font-serif text-base md:text-lg font-bold text-primary leading-tight">{activity.title}</h3>
                </div>
                {activity.location && (
                  <p className="text-sm text-muted-foreground mt-1">📍 {activity.location}</p>
                )}
                {activity.description && (
                  <p className="text-sm text-foreground/70 mt-2">{activity.description}</p>
                )}
                {activity.details && activity.details.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-foreground/60">
                    {activity.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-accent">→</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

          {/* Show More Button */}
          {!expanded && day.activities.length > 3 && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
              顯示更多 ({day.activities.length - 3} 項)
            </button>
          )}

          {expanded && day.activities.length > 3 && (
            <button
              onClick={() => setExpanded(false)}
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
            >
              <ChevronDown className="h-4 w-4 rotate-180" />
              收起
            </button>
          )}
        </div>

        {/* Accommodation */}
        {day.accommodation && (
          <div className="mt-4 rounded-lg border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm font-semibold text-primary">🏨 住宿</p>
            <p className="text-sm text-foreground/70 mt-1">{day.accommodation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
