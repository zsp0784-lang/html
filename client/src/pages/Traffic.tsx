import { useEffect, useRef } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

export default function Traffic() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // 初始化地圖
    const initMap = () => {
      if (!mapRef.current) return;

      mapInstanceRef.current = new (window as any).google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: 34.6618, lng: 133.9350 },
        mapTypeControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      trafficLayerRef.current = new (window as any).google.maps.TrafficLayer();
      trafficLayerRef.current.setMap(mapInstanceRef.current);
    };

    // 檢查 Google Maps API 是否已加載
    if ((window as any).google && (window as any).google.maps) {
      initMap();
    } else {
      // 如果未加載，等待加載完成
      const checkGoogleMaps = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          clearInterval(checkGoogleMaps);
          initMap();
        }
      }, 100);

      return () => clearInterval(checkGoogleMaps);
    }
  }, []);

  const goToLocation = (lat: number, lng: number, zoom: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(zoom);
    }
  };

  const findMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(pos);
            mapInstanceRef.current.setZoom(15);

            // 移除舊的標記
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            // 添加新的標記
            markerRef.current = new (window as any).google.maps.Marker({
              position: pos,
              map: mapInstanceRef.current,
              title: '你的位置',
              icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            });
          }
        },
        () => {
          alert('無法取得位置，請確認瀏覽器是否開啟定位權限。');
        }
      );
    } else {
      alert('您的瀏覽器不支援定位功能。');
    }
  };

  // 打開 Google 地圖導航
  const openGoogleMapsNavigation = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${name}`;
    window.open(url, '_blank');
  };

  // 按地區分組的導航位置
  const navigationByArea = {
    倉敷: [
      { name: '倉敷住宿', lat: 34.59673276260334, lng: 133.76723886626158 },
      { name: '天満屋超市21', lat: 34.59243322841246, lng: 133.76343332705244 },
      { name: '倉敷超市23', lat: 34.57582980117415, lng: 133.74162329288757 },
    ],
    尾道: [
      { name: '尾道本通商店街P', lat: 34.41072354952588, lng: 133.2037242696908 },
      { name: '鞆の浦第一P', lat: 34.382649869207796, lng: 133.38367193330157 },
    ],
    高松: [
      { name: '与島服務區', lat: 34.38589532386792, lng: 133.81684711458698 },
      { name: '高松超市22', lat: 34.33679729256442, lng: 134.0484432236862 },
      { name: '高松住宿', lat: 34.33943983419382, lng: 134.05602987486395 },
      { name: '栗林公園P', lat: 34.32817892798033, lng: 134.04515129099718 },
      { name: '丸亀町壱番街P', lat: 34.34688942504525, lng: 134.05130070996515 },
      { name: '高松港P', lat: 34.35195969835107, lng: 134.04978208893857 },
    ],
    小豆島: [
      { name: '小豆精肉店19', lat: 34.48320163437983, lng: 134.18549211300447 },
      { name: '小豆島超市22', lat: 34.47681903400871, lng: 134.17866943617284 },
      { name: '小豆島住宿', lat: 34.46930447973348, lng: 134.14756769859622 },
      { name: '寒霞溪P', lat: 34.51739158895655, lng: 134.30114380933722 },
      { name: '橄欖公園P', lat: 34.4713884965091, lng: 134.27407776435828 },
      { name: '天使之路P', lat: 34.47893257313272, lng: 134.18877856311227 },
      { name: '土庄港碼頭', lat: 34.489245152250845, lng: 134.1717610551651 },
    ],
    岡山: [
      { name: '烏城公園P', lat: 34.66361986640988, lng: 133.93414654472048 },
      { name: '後樂園P', lat: 34.669517400265434, lng: 133.93519460415564 },
      { name: '岡山加油', lat: 34.680330327234635, lng: 133.90283864754292 },
      { name: '機場加油', lat: 34.76115460214081, lng: 133.85460347357116 },
      { name: '平成租車機場', lat: 34.76283755341023, lng: 133.85450189145763 },
    ],
  };

  const mainLocations = [
    { name: '岡山中心', lat: 34.6618, lng: 133.9350, zoom: 13 },
    { name: '倉敷美觀', lat: 34.5966, lng: 133.7702, zoom: 14 },
    { name: '尾道市區', lat: 34.4095, lng: 133.2036, zoom: 14 },
    { name: '高松中心', lat: 34.3427, lng: 134.0466, zoom: 13 },
  ];

  const areaOrder = ['倉敷', '尾道', '高松', '小豆島', '岡山'] as const;

  return (
    <div className="min-h-screen bg-[#fdfaf5] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 1. 導航位置 - 按地區分組 */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            極速導航
          </h2>
          <div className="space-y-6">
            {areaOrder.map((area) => (
              <div key={area}>
                <h3 className="text-lg font-semibold text-primary mb-3 pl-2 border-l-4 border-accent">
                  {area}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {navigationByArea[area].map((location) => (
                    <button
                      key={location.name}
                      onClick={() => openGoogleMapsNavigation(location.lat, location.lng, location.name)}
                      className="px-4 py-4 rounded-lg font-semibold transition-all duration-300 text-base md:text-lg
                        bg-gradient-to-r from-accent/80 to-accent/60 text-accent-foreground 
                        hover:from-accent hover:to-accent/80 border border-accent/30 hover:border-accent/60
                        active:scale-95 shadow-sm hover:shadow-md flex items-center justify-between gap-2
                        group"
                    >
                      <span className="truncate">{location.name}</span>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 交通路況大標題卡片 */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="w-8 h-8 text-accent" />
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary">交通路況</h1>
            <MapPin className="w-8 h-8 text-accent" />
          </div>
          <p className="text-foreground/70 text-sm md:text-base">實時查看各地區交通狀況</p>
        </div>

        {/* 3. Google 地圖 */}
        <div
          ref={mapRef}
          className="w-full h-96 md:h-[600px] rounded-lg shadow-lg border border-border/50 mb-8"
          style={{ minHeight: '400px' }}
        />

        {/* 4. 路況區域快選標題 */}
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
            <span className="text-2xl">📍</span>
            區域快選
          </h2>
        </div>

        {/* 5. 地區選擇按鈕 - 4個地區 + 我的位置 */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {mainLocations.map((location) => (
              <button
                key={location.name}
                onClick={() => goToLocation(location.lat, location.lng, location.zoom)}
                className="px-4 py-3 md:py-4 rounded-lg font-semibold transition-all duration-300 text-sm md:text-base
                  bg-secondary/50 text-foreground hover:bg-secondary border border-border/30 hover:border-accent/50
                  active:scale-95 shadow-sm hover:shadow-md"
              >
                📍 {location.name}
              </button>
            ))}

            {/* GPS 定位按鈕 - 第5個按鈕 */}
            <button
              onClick={findMyLocation}
              className="col-span-2 md:col-span-1 px-4 py-3 md:py-4 rounded-lg font-semibold transition-all duration-300 text-sm md:text-base
                bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg
                active:scale-95 flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              我的位置
            </button>
          </div>
        </div>

        {/* 說明文字 */}
        <div className="mt-8 p-4 md:p-6 rounded-lg bg-accent/5 border border-accent/20">
          <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <span>💡</span> 使用說明
          </h3>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li>• 點擊上方的導航位置按鈕可直接在 Google 地圖中開啟導航</li>
            <li>• 紅色道路表示交通擁堵，黃色表示中等，綠色表示暢通</li>
            <li>• 點擊下方的地區按鈕快速查看該地區的交通路況</li>
            <li>• 點擊「我的位置」按鈕可顯示你目前的位置（需要開啟定位權限）</li>
            <li>• 使用滑鼠滾輪或雙指縮放來調整地圖縮放級別</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
