export interface Activity {
  time: string;
  title: string;
  description?: string;
  location?: string;
  details?: string[];
}

export interface DayItinerary {
  date: string;
  day: string;
  activities: Activity[];
  accommodation?: string;
  headerImage?: string;
}

export interface WalkingRoute {
  name: string;
  description: string;
  locations: string[];
  routeImage?: string;
  googleMapsUrl?: string;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  location: string;
  notes?: string;
  googleSearchUrl?: string;
  foodImage?: string;
}

export const itineraryData: DayItinerary[] = [
  {
    date: '3/09',
    day: '星期一',
    headerImage: '/images/attractions/itinerary/1.webp',
    activities: [
      {
        time: '16:30',
        title: '抵達岡山機場',
        location: 'OKJ',
      },
      {
        time: '17:20',
        title: '倉敷住宿',
        description: '抵達住宿地點',
      },
      {
        time: '18:10',
        title: '倉敷美觀地區夜間散步',
        description: '探索倉敷的歷史街道',
        details: [
          '高砂橋',
          '倉敷アイビースクエア',
          '語らい座 大原本邸',
          '阿智神社',
        ],
      },
      {
        time: '17~23',
        title: 'ひだや燒肉',
        location: '倉敷',
      },
      {
        time: '21:00',
        title: '天滿屋ハピーズ老松店',
        description: '大型超市購物',
      },
      {
        time: '23:00',
        title: 'マルナカ中島店',
        description: '便利店',
      },
    ],
    accommodation: 'GRAND BASE Kurashiki Chuo',
  },
  {
    date: '3/10',
    day: '星期二',
    headerImage: '/images/attractions/itinerary/2.webp',
    activities: [
      {
        time: '09:00',
        title: '倉敷美觀地區散步',
        description: '上午探索倉敷',
        details: [
          '大原美術館外觀',
          '古街商店街',
          '川沿咖啡館',
        ],
      },
      {
        time: '11:00',
        title: '倉敷 → 尾道',
        description: '車程約60分鐘',
      },
      {
        time: '12:15',
        title: '千光寺纜車',
        description: '登上山頂展望台',
      },
      {
        time: '13:05',
        title: '貓之細道散步',
        description: '尋找貓咪的小巷',
      },
      {
        time: '14:05',
        title: '尾道商店街午餐',
        details: [
          '尾道拉麵',
          '咖啡館',
          '特色小店',
        ],
      },
      {
        time: '14:50',
        title: '尾道 → 鞆之浦',
        description: '車程約40分鐘',
      },
      {
        time: '15:30',
        title: '鞆之浦快閃遊覽',
        details: [
          '常夜燈',
          '港區老街',
          '對潮樓拍照',
        ],
      },
      {
        time: '16:20',
        title: '鞆之浦 → 高松',
        description: '車程2小時30分',
      },
      {
        time: '17:25',
        title: '鷲羽山展望台',
      },
      {
        time: '19:10',
        title: '晚餐',
        details: [
          '讚岐烏龍麵',
          '骨付鳥',
          '居酒屋',
        ],
      },
      {
        time: '20:30',
        title: 'North Shore / 北浜 Alley',
        description: '港邊夜景與散步',
      },
    ],
    accommodation: '高松 fav TAKAMATSU',
  },
  {
    date: '3/11',
    day: '星期三',
    headerImage: '/images/attractions/itinerary/3.webp',
    activities: [
      {
        time: '07:00',
        title: '栗林公園遊覽',
        description: '早晨散步',
      },
      {
        time: '11:00',
        title: '丸龜町商店街',
        description: '購物和午餐',
      },
      {
        time: '12:00',
        title: '高松 → 男木島',
        description: '搭乘雌雄島海運',
      },
      {
        time: '15:00',
        title: '男木島 → 高松港',
        description: '返回高松',
      },
      {
        time: '15:40',
        title: '高松港閒晃',
        description: '港邊散步',
      },
      {
        time: '16:50',
        title: '高松車載 → 池田港',
        description: '前往小豆島',
      },
      {
        time: '17:47',
        title: '岡上精肉店',
        description: '採買牛肉/烤肉食材（19:00 關門！）',
      },
      {
        time: '18:00',
        title: 'マルナカ (Marunaka) 新土庄店',
        description: '補採買',
      },
      {
        time: '19:00',
        title: '晚餐（歡樂烤肉DIY）',
        description: '自己動手烤肉',
      },
    ],
    accommodation: '小豆島住宿',
  },
  {
    date: '3/12',
    day: '星期四',
    headerImage: '/images/attractions/itinerary/4.webp',
    activities: [
      {
        time: '09:00',
        title: '出發 → 寒霞溪',
        description: '前往小豆島著名景點',
      },
      {
        time: '09:30',
        title: '山頂駐車場',
        description: '抵達停車場',
      },
      {
        time: '10:50',
        title: '小豆島橄欖公園快速逛',
        description: '參觀橄欖公園',
      },
      {
        time: '11:35',
        title: '天使之路散步拍照',
        description: '需依當日退潮時間調整',
      },
      {
        time: '12:30',
        title: '市區午餐',
        description: '享用當地美食',
      },
      {
        time: '13:00',
        title: 'マルナカ (Marunaka) 新土庄店',
        description: '採買',
      },
      {
        time: '13:40',
        title: '市區午餐或簡單小吃',
        description: '輕食或下午茶',
      },
    ],
    accommodation: '小豆島住宿',
  },
  {
    date: '3/13',
    day: '星期五',
    headerImage: '/images/attractions/itinerary/5.webp',
    activities: [
      {
        time: '07:00',
        title: '小豆島 → 新岡山港載車渡輪',
        description: '彈性班次：08:40',
      },
      {
        time: '08:10',
        title: '烏城公園駐車場',
        description: '抵達停車場',
      },
      {
        time: '11:00',
        title: '岡山城 & 後樂園 散步',
        description: '探索岡山著名景點',
        details: [
          '岡山城',
          '後樂園',
          '城市風景',
        ],
      },
      {
        time: '13:00',
        title: '岡山市表町商店街',
        description: '購物和午餐',
      },
      {
        time: '15:30',
        title: '還車',
        description: '歸還租賃車輛',
      },
      {
        time: '17:55',
        title: '飛機：岡山機場 → 高雄',
        location: 'OKJ',
      },
    ],
  },
];

export const walkingRoutes: WalkingRoute[] = [
  {
    name: '倉敷美觀地區夜間散步',
    description: '探索倉敷的歷史街道和傳統建築',
    locations: ['GRAND BASE', '高砂橋', 'Ivy Square', '本町通', '大原本邸', '阿智神社'],
    routeImage: '/images/routes/kurashiki_route.png',
    googleMapsUrl: 'https://maps.app.goo.gl/45bGTQ4xx169rBhh9'
  },
  {
    name: '鞆之浦快閃遊覽',
    description: '發現港邊小鎮的魅力',
    locations: ['停車場', '常夜燈', '港區老街', '對潮樓'],
    routeImage: '/images/routes/tomonoura_route.png',
    googleMapsUrl: 'https://maps.app.goo.gl/WzT4GG4jsYb7tGiE8'
  },
  {
    name: '貓之細道',
    description: '尋找貓咪的隱藏小巷',
    locations: ['纜車山頂站', '千光寺', '貓之細道', '艮神社', '纜車山麓站'],
    routeImage: '/images/routes/onomichi_route.png',
    googleMapsUrl: 'https://maps.app.goo.gl/Bxi6E9iQyUxn48EVA'
  },
];

export const restaurants: Restaurant[] = [
  { name: 'Yakiniku Hidaya Kurashiki', cuisine: '倉敷燒肉首選', location: '倉敷', foodImage: '/images/restaurants/hidaya.webp', googleSearchUrl: 'https://www.google.com/maps/search/Yakiniku+Hidaya+Kurashiki', notes: '主打「厚切牛舌」與黑毛和牛，使用七輪炭火燒烤，肉質鮮美且價格實惠，是倉敷站周邊的高人氣燒肉店。' },
  { name: 'Futaba', cuisine: '倉敷燒肉備選', location: '倉敷', foodImage: '/images/restaurants/futaba.webp', googleSearchUrl: 'https://www.google.com/maps/search/Futaba+Kurashiki', notes: '炭火燒肉老店，提供高品質的鹽味牛舌、菲力與橫膈膜，氣氛溫馨，深受當地老饕喜愛。' },
  { name: 'Toriyoshi 鳥好 倉敷本店', cuisine: '倉敷首選燒鳥', location: '倉敷', foodImage: '/images/restaurants/toriyoshi.webp', googleSearchUrl: 'https://www.google.com/maps/search/Toriyoshi+Kurashiki', notes: '倉敷著名的燒鳥老店，招牌「雞皮」採用獨特技法烤製，外酥內嫩，搭配特製醬汁，是完美的下酒菜。' },
  { name: 'ぶっかけうどん ふるいち 仲店', cuisine: '倉敷烏龍', location: '倉敷', foodImage: '/images/restaurants/furuichi.webp', googleSearchUrl: 'https://www.google.com/maps/search/Furuichi+Kurashiki', notes: '倉敷「溫泉蛋烏龍麵」的發源地，麵條極具彈性，搭配甘甜的特製醬汁與豐富配料，是來到倉敷必吃的平民美食。' },
  { name: '倉敷雞屋まさるやん', cuisine: '倉敷燒鳥', location: '倉敷', foodImage: '/images/restaurants/masaruyan.webp', googleSearchUrl: 'https://www.google.com/maps/search/Masaruyan+Kurashiki', notes: '提供新鮮的在地雞肉料理，燒鳥種類豐富且調味道地，是倉敷站前非常受歡迎的居酒屋。' },
  { name: 'くらしき 高田屋', cuisine: '倉敷燒鳥', location: '倉敷', foodImage: '/images/restaurants/takadaya.webp', googleSearchUrl: 'https://www.google.com/maps/search/Takadaya+Kurashiki', notes: '位於美觀地區的古民家燒鳥店，氣氛極佳，推薦其鮮嫩的雞肉串與特色雞肉料理。' },
  { name: '名代とんかつかっぱ', cuisine: '倉敷炸豬排', location: '倉敷', foodImage: '/images/restaurants/kappa.webp', googleSearchUrl: 'https://www.google.com/maps/search/Kappa+Tonkatsu+Kurashiki', notes: '倉敷排隊名店，招牌「淋醬炸豬排」外皮酥脆，淋上特製的濃郁多米格拉斯醬，風味獨特且份量十足。' },
  { name: 'くらしき桃子 總本店', cuisine: '倉敷甜點', location: '倉敷', foodImage: '/images/restaurants/momoko.webp', googleSearchUrl: 'https://www.google.com/maps/search/Kurashiki+Momoko', notes: '岡山水果聖代的代表店，嚴選白桃、麝香葡萄等在地頂級水果，精緻的層次感讓每一口都是視覺與味覺的享受。' },
  { name: '尾道拉麵 喰海', cuisine: '尾道拉麵', location: '尾道', foodImage: '/images/restaurants/kuukai-ramen.webp', googleSearchUrl: 'https://www.google.com/maps/search/Onomichi+Ramen+Kuukai', notes: '正宗尾道拉麵，湯頭融合了瀨戶內海小魚乾的鮮甜與豬背脂的濃郁，搭配特製平打麵，風味層次分明。' },
  { name: 'Karasawa Ice Cream', cuisine: '尾道冰淇淋', location: '尾道', foodImage: '/images/restaurants/karasawa.webp', googleSearchUrl: 'https://www.google.com/maps/search/Karasawa+Ice+Cream+Onomichi', notes: '尾道海邊的超人氣冰淇淋店，招牌「冰淇淋最中」外殼酥脆，內餡蛋香濃郁且清爽不膩，是散步尾道的必吃甜點。' },
  { name: '小野貓點心鋪', cuisine: '尾道布丁', location: '尾道', foodImage: '/images/restaurants/ononeko.webp', googleSearchUrl: 'https://www.google.com/maps/search/Ono+Neko+Onomichi', notes: '可愛貓咪主題的布丁專賣店，布丁口感綿密滑順，搭配特製糖漿，是尾道貓之細道散步後的最佳點心。' },
  { name: 'ドン・キホーテ 高松丸亀町店', cuisine: '綜合購物商場', location: '高松', foodImage: '/images/restaurants/donki-logo-fixed.webp', googleSearchUrl: 'https://www.google.com/maps/search/Don+Quijote+Takamatsu+Marugamemachi', notes: '日本著名的驚安殿堂，提供藥妝、零食、電器等豐富商品，支援免稅服務，是旅途中補貨與購買伴手禮的最佳去處。' },
  { name: '骨付鳥 一鶴 高松店', cuisine: '高松名物骨付鳥', location: '高松', foodImage: '/images/restaurants/ikkaku.webp', googleSearchUrl: 'https://www.google.com/maps/search/Honetori+Ikkaku+Takamatsu', notes: '骨付鳥的始祖店，提供嚼勁十足的「老雞」與鮮嫩多汁的「雛雞」，濃郁的蒜香與胡椒味讓人欲罷不能。' },
  { name: '手打うどん 風月', cuisine: '高松烏龍首選', location: '高松', foodImage: '/images/restaurants/fugetsu.webp', googleSearchUrl: 'https://www.google.com/maps/search/Fugetsu+Udon+Takamatsu', notes: '高松市區的烏龍麵名店，現點現做的麵條極具韌性，招牌「天婦羅烏龍麵」份量十足且口感酥脆。' },
  { name: '月城苑', cuisine: '高松燒肉', location: '高松', foodImage: '/images/restaurants/yakiniku-grill-1.webp', googleSearchUrl: 'https://www.google.com/maps/search/Getsujoen+Takamatsu', notes: '高松車站附近的燒肉老店，以高CP值著稱。除了優質燒肉外，其招牌「韓式冷麵」與各式韓式側菜也是老饕必點的美味。' },
  { name: '燒肉なかむら 西の丸店', cuisine: '高松燒肉', location: '高松', foodImage: '/images/restaurants/yakiniku-grill-2.webp', googleSearchUrl: 'https://www.google.com/maps/search/Nakamura+Yakiniku+Takamatsu', notes: '主打嚴選黑毛和牛與香川名產「橄欖牛」，提供全包廂式的隱密用餐空間，肉質油花分佈均勻，入口即化。' },
  { name: '燒肉 丸惠', cuisine: '高松燒肉', location: '高松', foodImage: '/images/restaurants/yakiniku-plate-1.webp', googleSearchUrl: 'https://www.google.com/maps/search/Marukei+Yakiniku+Takamatsu', notes: '高松在地超人氣排隊名店，以厚切牛舌、橫膈膜與新鮮內臟聞名，肉量十足且調味極佳，是肉食愛好者的天堂。' },
  { name: 'Tamaki Meat Shop', cuisine: '肉品專賣店', location: '高松', foodImage: '/images/restaurants/butcher-display-1.webp', googleSearchUrl: 'https://www.google.com/maps/search/Tamaki+Meat+Shop+Takamatsu', notes: '高松在地的肉品專賣店，供應高品質的讚岐牛與各式新鮮肉品，適合想購買頂級食材回住宿地點烹飪的旅客。' },
  { name: 'ミートショップ モリヤマ', cuisine: '肉品專賣店', location: '高松', foodImage: '/images/restaurants/butcher-display-2.webp', googleSearchUrl: 'https://www.google.com/maps/search/Moriyama+Meat+Shop+Takamatsu', notes: '專業的肉品零售店，提供多樣化的肉類選擇與精細的切割服務，是尋找高品質在地肉材的好地方。' },
  { name: '川原精肉店', cuisine: '肉品專賣店', location: '高松', foodImage: '/images/restaurants/meat-detail-1.webp', googleSearchUrl: 'https://www.google.com/maps/search/Kawahara+Meat+Takamatsu', notes: '歷史悠久的精肉店，以嚴選的在地肉品聞名，除了生肉外有時也提供美味的炸肉餅等現做小食。' },
  { name: '小豆島拉麵HISHIO', cuisine: '小豆島拉麵', location: '小豆島', foodImage: '/images/restaurants/hishio.webp', googleSearchUrl: 'https://www.google.com/maps/search/HISHIO+Shodoshima', notes: '主打「醬油拉麵」，使用小豆島百年老店醬油熬製湯頭，鮮甜回甘，在天使之路店還能一邊用餐一邊欣賞絕美海景。' },
];

export const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  '岡山': { lat: 34.6552, lng: 133.9204 },
  '倉敷': { lat: 34.5947, lng: 133.7721 },
  '尾道': { lat: 34.4027, lng: 133.2129 },
  '高松': { lat: 34.3401, lng: 134.0432 },
};
