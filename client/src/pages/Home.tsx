import { ItineraryCard } from '@/components/ItineraryCard';
import { RestaurantCard } from '@/components/RestaurantCard';
import { WeatherWidget } from '@/components/WeatherWidget';
import { VisitJapanCard } from '@/components/VisitJapanCard';
import { WalkingRouteCard } from '@/components/WalkingRouteCard';
import AccommodationCard from '@/components/AccommodationCard';
import AttractionCard from '@/components/AttractionCard';
import { itineraryData, restaurants, walkingRoutes } from '@/lib/itinerary-data';
import { attractions } from '@/lib/attractions-data';
import { accommodations } from '@/lib/accommodations-data';
import { MapPin, Utensils, Compass, Image, Home as HomeIcon, Ship, Banknote, Navigation } from 'lucide-react';
import { FerrySchedule } from '@/components/FerrySchedule';
import { BackToTop } from '@/components/BackToTop';
import { useState, useEffect } from 'react';
import Money from './Money';
import Traffic from './Traffic';

const heroImage = '/images/ui/hero-banner.png';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'routes' | 'restaurants' | 'money' | 'attractions' | 'accommodations' | 'ferry' | 'traffic'>('itinerary');
  const [deploymentTime, setDeploymentTime] = useState<string>('');

  useEffect(() => {
    const fetchDeploymentTime = async () => {
      try {
        const response = await fetch('/api/deployment-time');
        if (response.ok) {
          const data = await response.json();
          const date = new Date(data.deploymentTime);
          const formattedTime = date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          setDeploymentTime(formattedTime);
        }
      } catch (error) {
        console.error('Failed to fetch deployment time:', error);
      }
    };
    fetchDeploymentTime();
  }, []);

  const navTabs = [
    { id: 'itinerary' as const, label: '行程', icon: MapPin },
    { id: 'money' as const, label: '記帳', icon: Banknote },
    { id: 'ferry' as const, label: '船班', icon: Ship },
    { id: 'traffic' as const, label: '導航', icon: Navigation },
    { id: 'attractions' as const, label: '景點', icon: Image },
    { id: 'restaurants' as const, label: '餐廳', icon: Utensils },
    { id: 'accommodations' as const, label: '住宿', icon: HomeIcon },
    { id: 'routes' as const, label: '散步', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-[#fdfaf5] relative overflow-hidden">
      <BackToTop />

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
      </div>
      <div className="absolute top-40 right-0 w-96 h-96 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')] opacity-10 pointer-events-none"></div>

      <div className="relative overflow-hidden">
        <img loading="lazy"
          src={heroImage}
          alt="日本行程"
          width={1200}
          height={384}
          className="h-96 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-4">
            <img loading="lazy" src="/images/ui/original-style-title.png" alt="山陽&晴天之國" width={400} height={192} className="h-40 md:h-48 drop-shadow-lg" />
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 md:py-12">
        <div className="mb-8 md:mb-12 sticky top-0 z-50 bg-[#fdfaf5]/90 backdrop-blur-sm py-4 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center items-center">
            <span className="text-2xl hidden md:inline">⛩️</span>
            {navTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-full md:rounded-lg font-semibold transition-all duration-300 text-sm md:text-base whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50 border-2 border-accent/40'  
                }`}
              >
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
                {label}
              </button>
            ))}
            <span className="text-2xl hidden md:inline">⛩️</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'attractions' && (
              <div className="space-y-8">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-8">熱門景點</h2>
                {attractions.map((attraction) => (
                  <AttractionCard key={attraction.id} attraction={attraction} />
                ))}
              </div>
            )}
            {activeTab === 'itinerary' && (
              <div className="space-y-2">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-8">行程安排</h2>
                {itineraryData.map((day, idx) => (
                  <ItineraryCard
                    key={idx}
                    day={day}
                  />
                ))}
              </div>
            )}

            {activeTab === 'routes' && (
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-8">散步路線</h2>
                <div className="space-y-6">
                  {walkingRoutes.map((route, idx) => (
                    <WalkingRouteCard key={idx} route={route} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'restaurants' && (
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-8">餐廳推薦</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {restaurants.map((restaurant, idx) => (
                    <RestaurantCard key={idx} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'accommodations' && (
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-8">精選住宿</h2>
                <div className="space-y-8">
                  {accommodations.map((accommodation) => (
                    <AccommodationCard key={accommodation.id} accommodation={accommodation} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ferry' && (
              <FerrySchedule />
            )}

            {activeTab === 'money' && (
              <Money />
            )}

            {activeTab === 'traffic' && (
              <Traffic />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <WeatherWidget />
              <VisitJapanCard />

              <div className="rounded-lg border border-border/50 bg-card p-6 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-primary mb-4">行程概覽</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold">📅</span>
                    <span className="text-foreground/70">2025年3月9-13日</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold">📍</span>
                    <span className="text-foreground/70">4個城市</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold">🎯</span>
                    <span className="text-foreground/70">5天行程</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold">🍽️</span>
                    <span className="text-foreground/70">21家餐廳</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold">🏨</span>
                    <span className="text-foreground/70">3間精選住宿</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-accent/20 bg-accent/5 p-6">
                <h3 className="font-serif text-lg font-bold text-primary mb-3">💡 提示</h3>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li>• 記得購買旅遊不便險</li>
                  <li>• 備好防寒衣物</li>
                  <li>• 事先填好入境網站資料</li>
                  <li>• 準備好享受日本文化</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 bg-secondary/30 py-8 mt-16">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            ✨ 祝您有一個美好的日本之旅 ✨
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            最後更新：{deploymentTime || '加載中...'}
          </p>
        </div>
      </div>
    </div>
  );
}
