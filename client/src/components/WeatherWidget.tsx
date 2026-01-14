import { Cloud, CloudRain, Sun, Wind, Droplets, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
}

interface CityWeather {
  city: string;
  currentTemp: number;
  currentCondition: string;
  currentIcon: string;
  forecast: DailyForecast[];
}

export function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<CityWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const cities = [
          { name: 'Okayama', zh: '岡山', lat: 34.6552, lng: 133.9204 },
          { name: 'Kurashiki', zh: '倉敷', lat: 34.5850, lng: 133.7722 },
          { name: 'Takamatsu', zh: '高松', lat: 34.3401, lng: 134.0432 },
          { name: 'Shodoshima', zh: '小豆島', lat: 34.4861, lng: 134.2422 },
          { name: 'Onomichi', zh: '尾道', lat: 34.4027, lng: 133.2129 },
        ];

        const allCityData: CityWeather[] = [];

        for (const city of cities) {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia/Tokyo`
          );
          const data = await response.json();
          
          const forecast: DailyForecast[] = data.daily.time.map((time: string, index: number) => ({
            date: formatDate(time),
            tempMax: Math.round(data.daily.temperature_2m_max[index]),
            tempMin: Math.round(data.daily.temperature_2m_min[index]),
            condition: getWeatherCondition(data.daily.weather_code[index]),
            icon: getWeatherIcon(data.daily.weather_code[index]),
          }));

          allCityData.push({
            city: city.zh,
            currentTemp: Math.round(data.current.temperature_2m),
            currentCondition: getWeatherCondition(data.current.weather_code),
            currentIcon: getWeatherIcon(data.current.weather_code),
            forecast: forecast,
          });
        }

        setWeatherData(allCityData);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  };

  const getWeatherCondition = (code: number) => {
    if (code === 0) return '晴天';
    if (code === 1 || code === 2) return '多雲';
    if (code === 3) return '陰天';
    if (code >= 51 && code <= 67) return '雨天';
    if (code >= 80 && code <= 82) return '陣雨';
    return '多雲';
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return 'sun';
    if (code === 1 || code === 2) return 'cloud';
    if (code >= 51 && code <= 82) return 'rain';
    return 'cloud';
  };

  const WeatherIcon = ({ icon, className = "h-6 w-6" }: { icon: string, className?: string }) => {
    switch (icon) {
      case 'sun':
        return <Sun className={`${className} text-yellow-400`} />;
      case 'cloud':
        return <Cloud className={`${className} text-gray-400`} />;
      case 'rain':
        return <CloudRain className={`${className} text-blue-400`} />;
      default:
        return <Cloud className={`${className} text-gray-400`} />;
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-6 shadow-sm">
        <h3 className="font-serif text-xl font-bold text-primary mb-4">天氣預報</h3>
        <div className="text-center text-muted-foreground py-8">載入中...</div>
      </div>
    );
  }

  const currentCity = weatherData[selectedCityIndex];

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="font-serif text-lg md:text-xl font-bold text-primary flex items-center gap-2">
          <Calendar className="h-4 w-4 md:h-5 md:w-5 text-accent" />
          一週天氣預報
        </h3>
      </div>

      {/* 城市切換 */}
      <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {weatherData.map((city, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCityIndex(idx)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selectedCityIndex === idx
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'bg-secondary/50 text-foreground/60 hover:bg-secondary'
            }`}
          >
            {city.city}
          </button>
        ))}
      </div>

      {/* 當前城市天氣 */}
      <div className="bg-accent/5 rounded-xl p-4 mb-6 border border-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <WeatherIcon icon={currentCity.currentIcon} className="h-12 w-12" />
            <div>
              <p className="text-2xl font-bold text-primary">{currentCity.currentTemp}°C</p>
              <p className="text-sm text-muted-foreground">{currentCity.currentCondition}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary">{currentCity.city}</p>
            <p className="text-xs text-muted-foreground">今日概況</p>
          </div>
        </div>
      </div>

      {/* 未來一週預報 */}
      <div className="space-y-3">
        {currentCity.forecast.slice(1, 7).map((day, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
            <span className="text-sm font-medium text-foreground/70 w-24">{day.date}</span>
            <div className="flex items-center gap-2 flex-1 justify-center">
              <WeatherIcon icon={day.icon} className="h-5 w-5" />
              <span className="text-xs text-muted-foreground">{day.condition}</span>
            </div>
            <div className="text-right w-24">
              <span className="text-sm font-bold text-primary">{day.tempMax}°</span>
              <span className="text-sm text-muted-foreground ml-2">{day.tempMin}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
