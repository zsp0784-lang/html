export interface Accommodation {
  id: string;
  name: string;
  location: string;
  description: string;
  images: string[];
  features: string[];
  amenities: string[];
  googleMapsUrl: string;
}

export const accommodations: Accommodation[] = [
  {
    id: "grand-base-kurashiki-chuo",
    name: "GRAND BASE Kurashiki Chūō",
    location: "倉敷市, 中央",
    description: "GRAND BASE Kurashiki Chuo 位於倉敷，距離三溪園 400 公尺，提供 WiFi（免費）和座位區。住宿設有空調、設備齊全的簡易廚房、平面電視以及附沖洗座、免費盥洗用品 and 吹風機的私人衛浴。房間寬敞、設備乾淨新穎，有廚房還有鍋碗瓢盆，距離倉敷美觀地區超近，步行即可到達。房間大配置合理，有空間可以整理行李，床大又好睡。電視可以聯網Youtube。附近有很多餐飲、咖啡店。",
    images: [
      "/images/accommodations/grand_base_kurashiki/1.webp",
      "/images/accommodations/grand_base_kurashiki/2.webp",
      "/images/accommodations/grand_base_kurashiki/3.webp",
      "/images/accommodations/grand_base_kurashiki/6.webp",
      "/images/accommodations/grand_base_kurashiki/4.webp",
      "/images/accommodations/grand_base_kurashiki/5.webp"
    ],
    features: ["3星級公寓式飯店", "評分 8.5（評比非常好）", "距離倉敷美觀地區超近", "衛浴廁所分開"],
    amenities: ["自助入住系統", "簡易廚房", "沙發休息區", "聯網電視 (YouTube)", "免費 WiFi", "電梯", "洗衣機", "空氣清淨機"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=岡山縣倉敷市Chuo+2-3-21"
  },
  {
    id: "fav-hotel-takamatsu",
    name: "Fav Hotel Takamatsu",
    location: "高松市, 瓦町",
    description: "fav TAKAMATSU 位於高松，提供 4 星級住宿，設有露台。為住客提供空調客房，所有房型均有書桌、電熱水壺、冰箱、微波爐、保險箱、平面電視以及附沖洗座的私人衛浴。房間寬敞，設備齊全，滾筒洗衣機加上好用的晾衣架，浴室可以烘乾衣服非常方便。新的裝潢，房間內設備都很新，間接照明很舒適不刺眼。下午3點至晚上9點有服務人員，入口處左邊有賣咖啡。",
    images: [
      "/images/accommodations/fav_takamatsu/1.webp",
      "/images/accommodations/fav_takamatsu/2.webp",
      "/images/accommodations/fav_takamatsu/3.webp",
      "/images/accommodations/fav_takamatsu/4.webp",
      "/images/accommodations/fav_takamatsu/5.webp",
      "/images/accommodations/fav_takamatsu/6.webp"
    ],
    features: ["4星級公寓式飯店", "評分 8.7（評比很棒）", "房間寬敞設備齊全", "早餐評價還不錯"],
    amenities: ["簡易廚房", "房內洗衣機", "免費 WiFi", "浴室烘乾功能", "電梯", "空氣清淨機", "電子鎖入住", "私人停車場（需付費）"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=香川縣高松市塩上町2-4-20"
  },
  {
    id: "holiday-villa-ta-view",
    name: "Holiday Villa 旅生 (Ta-View)",
    location: "小豆島, 土庄町",
    description: "這是一個擁有寬敞庭院的住宿，可以欣賞到平靜的瀨戶內海景色。還可以享受燒烤的樂趣。庭院約70坪，鋪設草坪，可一邊欣賞瀨戶內海的美景，一邊享受烤肉的樂趣。房間的面積約58平方公尺，為1LDK（包含臥室、客廳、廚房、洗手間、浴室及廁所）。配備洗衣機、冰箱、電飯煲、微波爐等設備，適合長期住宿。客廳內設有沙發床，讓您可以悠閒地度過時光。",
    images: [
      "/images/accommodations/ryosei/1.webp",
      "/images/accommodations/ryosei/2.webp",
      "/images/accommodations/ryosei/3.webp",
      "/images/accommodations/ryosei/4.webp",
      "/images/accommodations/ryosei/5.webp"
    ],
    features: ["整棟出租別墅", "瀨戶內海景觀", "70坪草坪庭院", "可烤肉（BBQ）"],
    amenities: ["免費停車位", "完整廚房設備", "洗衣機", "空調", "免費 WiFi", "沙發床", "浴缸", "非接觸式入住"],
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=香川縣小豆郡土庄町甲3402-2"
  }
];
