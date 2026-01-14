import { attractions } from '@/lib/attractions-data';
import { MapPin, Compass, Utensils, Image } from 'lucide-react';
import { Link } from 'wouter';

export default function Attractions() {
  const navTabs = [
    { id: 'itinerary', label: '行程', icon: MapPin, href: '/' },
    { id: 'routes', label: '散步', icon: Compass, href: '/' },
    { id: 'restaurants', label: '餐廳', icon: Utensils, href: '/' },
    { id: 'attractions', label: '景點', icon: Image, href: '/attractions' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 導覽列 */}
      <div className="border-b border-border/50 bg-background py-6">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-3">
            {navTabs.map(({ id, label, icon: Icon, href }) => (
              <Link key={id} href={href}>
                <button className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-base ${
                  id === 'attractions'
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50 border border-border/30'
                }`}>
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 頁面標題 */}
      <div className="border-b border-border/50 bg-secondary/30 py-12">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Image className="h-6 w-6 text-accent" />
            <h1 className="font-serif text-4xl font-bold text-primary">景點圖片庫</h1>
          </div>
          <p className="text-foreground/70 max-w-2xl">
            探索日本行程中的主要景點，欣賞精美的風景照片，感受每個地方的獨特魅力。
          </p>
        </div>
      </div>

      {/* 景點展示 - 直觀模式 */}
      <div className="container mx-auto py-12">
        {attractions.map((attraction) => (
          <div key={attraction.id} className="mb-16">
            {/* 景點標題和描述 */}
            <div className="mb-6">
              <h2 className="font-serif text-3xl font-bold text-primary mb-3">{attraction.name}</h2>
              <p className="text-lg text-foreground/70 mb-4">{attraction.description}</p>
              
              {/* 亮點列表 */}
              <div className="space-y-2">
                {attraction.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-foreground/80">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 圖片網格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attraction.images.map((image, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-lg bg-secondary h-64 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <img loading="lazy"
                    src={image}
                    alt={`${attraction.name} - ${idx + 1}`}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>

            {/* 分隔線 */}
            {attraction.id !== attractions[attractions.length - 1].id && (
              <div className="border-t border-border/30 mt-16" />
            )}
          </div>
        ))}
      </div>

      {/* 頁腳 */}
      <div className="border-t border-border/50 bg-secondary/30 py-8 mt-16">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            ✨ 享受日本山陽地區的絕美風景
          </p>
        </div>
      </div>
    </div>
  );
}
