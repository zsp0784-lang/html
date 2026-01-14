import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 爬蟲配置 - 統一管理超時和請求頭
const SCRAPE_CONFIG = {
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

// 時間格式化函數 - 確保時間格式為 HH:MM
function formatTime(time: string): string {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, '0')}:${match[2]}`;
  }
  return time;
}

const STATIC_DATA = {
  "shodoshima": {
    "name": "高松 ⇔ 小豆島 (池田)",
    "operator": "國際兩備渡輪",
    "url": "https://ryobi-shodoshima.jp/timetable/timetable_takamatsu/",
    "outbound_label": "去程：高松 ➔ 小豆島 (池田)",
    "inbound_label": "回程：小豆島 (池田) ➔ 高松",
    "outbound": [
      { "out": "06:50", "arr": "07:50" },
      { "out": "08:32", "arr": "09:32" },
      { "out": "09:30", "arr": "10:30" },
      { "out": "11:10", "arr": "12:10" },
      { "out": "12:10", "arr": "13:10" },
      { "out": "14:10", "arr": "15:10" },
      { "out": "14:48", "arr": "15:48" },
      { "out": "16:47", "arr": "17:47" },
      { "out": "17:40", "arr": "18:40" },
      { "out": "19:30", "arr": "20:30" },
      { "out": "20:30", "arr": "21:30" }
    ],
    "inbound": [
      { "out": "05:30", "arr": "06:30" },
      { "out": "07:10", "arr": "08:10" },
      { "out": "08:10", "arr": "09:10" },
      { "out": "09:50", "arr": "10:50" },
      { "out": "11:00", "arr": "12:00" },
      { "out": "13:00", "arr": "14:00" },
      { "out": "13:40", "arr": "14:40" },
      { "out": "15:30", "arr": "16:30" },
      { "out": "16:25", "arr": "17:25" },
      { "out": "18:00", "arr": "19:00" },
      { "out": "19:00", "arr": "20:00" }
    ]
  },
  "ogi": {
    "name": "高松 ⇔ 男木島 (NOD)",
    "operator": "雌雄島海運",
    "url": "https://meon.co.jp/access",
    "outbound_label": "去程：高松 ➔ 女木 ➔ 男木",
    "inbound_label": "回程：男木 ➔ 女木 ➔ 高松",
    "outbound": [
      { "out": "07:30", "arr": "08:50", "stop": "女木 08:20" },
      { "out": "09:00", "arr": "10:20", "stop": "女木 09:30" },
      { "out": "10:30", "arr": "11:50", "stop": "女木 11:00" },
      { "out": "12:00", "arr": "13:20", "stop": "女木 12:30" },
      { "out": "14:00", "arr": "15:20", "stop": "女木 14:30" },
      { "out": "15:30", "arr": "16:50", "stop": "女木 16:00" },
      { "out": "17:00", "arr": "18:20", "stop": "女木 17:30" }
    ],
    "inbound": [
      { "out": "06:00", "arr": "07:20", "stop": "女木 07:50" },
      { "out": "08:30", "arr": "09:50", "stop": "女木 10:20" },
      { "out": "10:00", "arr": "11:20", "stop": "女木 11:50" },
      { "out": "11:30", "arr": "12:50", "stop": "女木 13:20" },
      { "out": "13:30", "arr": "14:50", "stop": "女木 15:20" },
      { "out": "15:00", "arr": "16:20", "stop": "女木 16:50" },
      { "out": "16:30", "arr": "17:50", "stop": "女木 18:20" }
    ]
  },
  "uno": {
    "name": "小豆島 (土庄) ⇔ 岡山",
    "operator": "四國渡輪",
    "url": "https://www.shikokuferry.com/route3",
    "outbound_label": "去程：小豆島 (土庄) ➔ 岡山",
    "inbound_label": "回程：岡山 ➔ 小豆島 (土庄)",
    "outbound": [
      { "out": "07:00", "arr": "08:10" },
      { "out": "08:40", "arr": "09:50" },
      { "out": "10:10", "arr": "11:20" },
      { "out": "11:40", "arr": "12:50" },
      { "out": "14:00", "arr": "15:10" },
      { "out": "15:40", "arr": "16:50" },
      { "out": "17:00", "arr": "18:10" },
      { "out": "18:30", "arr": "19:40" }
    ],
    "inbound": [
      { "out": "06:20", "arr": "07:30" },
      { "out": "08:40", "arr": "09:50" },
      { "out": "10:10", "arr": "11:20" },
      { "out": "11:40", "arr": "12:50" },
      { "out": "14:00", "arr": "15:10" },
      { "out": "15:40", "arr": "16:50" },
      { "out": "17:00", "arr": "18:10" },
      { "out": "18:30", "arr": "19:40" }
    ]
  }
};

// 爬蟲函數：小豆島 (池田)
async function scrapeShodoshima() {
  try {
    console.log('Scraping Shodoshima ferry...');
    const url = 'https://ryobi-shodoshima.jp/timetable/timetable_takamatsu/';
    const { data } = await axios.get(url, SCRAPE_CONFIG);
    const $ = cheerio.load(data);

    const outbound: { out: string; arr: string }[] = [];
    const inbound: { out: string; arr: string }[] = [];

    const table = $('table.tbl-time').first();
    
    table.find('tbody tr').each((i, el) => {
      const cells = $(el).find('td');
      
      if (cells.length >= 1) {
        const outboundDiv = $(cells[0]).find('div.time-trip');
        const outTime = outboundDiv.find('p.time-from').text().trim();
        const arrTime = outboundDiv.find('p.time-to').text().trim();
        
        if (outTime && arrTime) {
          outbound.push({ 
            out: formatTime(outTime), 
            arr: formatTime(arrTime) 
          });
        }
      }
      
      if (cells.length >= 2) {
        const inboundDiv = $(cells[1]).find('div.time-trip');
        const outTime = inboundDiv.find('p.time-from').text().trim();
        const arrTime = inboundDiv.find('p.time-to').text().trim();
        
        if (outTime && arrTime) {
          inbound.push({ 
            out: formatTime(outTime), 
            arr: formatTime(arrTime) 
          });
        }
      }
    });

    const success = outbound.length > 0 && inbound.length > 0;
    console.log(`Shodoshima scrape ${success ? 'SUCCESS' : 'FALLBACK'} - Outbound: ${outbound.length}, Inbound: ${inbound.length}`);
    
    return {
      outbound: outbound.length > 0 ? outbound : STATIC_DATA.shodoshima.outbound,
      inbound: inbound.length > 0 ? inbound : STATIC_DATA.shodoshima.inbound,
      success
    };
  } catch (error) {
    console.error('Shodoshima scrape failed:', error);
    return {
      outbound: STATIC_DATA.shodoshima.outbound,
      inbound: STATIC_DATA.shodoshima.inbound,
      success: false
    };
  }
}

// 爬蟲函數：男木島
async function scrapeOgi() {
  try {
    console.log('Scraping Ogijima ferry...');
    const url = 'https://meon.co.jp/access';
    const { data } = await axios.get(url, SCRAPE_CONFIG);
    const $ = cheerio.load(data);

    const outbound: { out: string; arr: string; stop?: string }[] = [];
    const inbound: { out: string; arr: string; stop?: string }[] = [];

    $('table').first().find('tr').each((i, el) => {
      if (i === 0) return;
      const cols = $(el).find('td');
      
      if (cols.length >= 3) {
        const takamatsuOut = $(cols[0]).text().trim();
        const womenOut = $(cols[1]).text().trim();
        const ogijimaArr = $(cols[2]).text().trim();
        
        if (takamatsuOut && ogijimaArr && ogijimaArr !== '–' && !takamatsuOut.includes('*')) {
          outbound.push({
            out: formatTime(takamatsuOut),
            arr: formatTime(ogijimaArr),
            stop: womenOut ? `女木 ${formatTime(womenOut)}` : undefined
          });
        }
      }
    });

    $('table').eq(1).find('tr').each((i, el) => {
      if (i === 0) return;
      const cols = $(el).find('td');
      
      if (cols.length >= 3) {
        const ogijimaOut = $(cols[0]).text().trim();
        const womenOut = $(cols[1]).text().trim();
        const takamatsuArr = $(cols[2]).text().trim();
        
        if (ogijimaOut && takamatsuArr && ogijimaOut !== '–' && !ogijimaOut.includes('*')) {
          inbound.push({
            out: formatTime(ogijimaOut),
            arr: formatTime(takamatsuArr),
            stop: womenOut ? `女木 ${formatTime(womenOut)}` : undefined
          });
        }
      }
    });

    const success = outbound.length > 0 && inbound.length > 0;
    console.log(`Ogijima scrape ${success ? 'SUCCESS' : 'FALLBACK'} - Outbound: ${outbound.length}, Inbound: ${inbound.length}`);
    
    return {
      outbound: outbound.length > 0 ? outbound : STATIC_DATA.ogi.outbound,
      inbound: inbound.length > 0 ? inbound : STATIC_DATA.ogi.inbound,
      success
    };
  } catch (error) {
    console.error('Ogijima scrape failed:', error);
    return {
      outbound: STATIC_DATA.ogi.outbound,
      inbound: STATIC_DATA.ogi.inbound,
      success: false
    };
  }
}

// 爬蟲函數：岡山
async function scrapeUno() {
  try {
    console.log('Scraping Uno (Okayama) ferry...');
    const url = 'https://www.shikokuferry.com/route3';
    const { data } = await axios.get(url, SCRAPE_CONFIG);
    const $ = cheerio.load(data);

    const outbound: { out: string; arr: string }[] = [];
    const inbound: { out: string; arr: string }[] = [];

    // 去程：小豆島 (土庄) ➔ 岡山
    $('table').first().find('tr').each((i, el) => {
      if (i === 0) return;
      const cols = $(el).find('td');
      if (cols.length >= 2) {
        const time = $(cols[0]).text().trim();
        const arrival = $(cols[1]).text().trim();
        if (time && arrival && !time.includes('*')) {
          outbound.push({ 
            out: formatTime(time), 
            arr: formatTime(arrival) 
          });
        }
      }
    });

    // 回程：岡山 ➔ 小豆島 (土庄)
    $('table').eq(1).find('tr').each((i, el) => {
      if (i === 0) return;
      const cols = $(el).find('td');
      if (cols.length >= 2) {
        const time = $(cols[0]).text().trim();
        const arrival = $(cols[1]).text().trim();
        if (time && arrival && !time.includes('*')) {
          inbound.push({ 
            out: formatTime(time), 
            arr: formatTime(arrival) 
          });
        }
      }
    });

    const success = outbound.length > 0;
    console.log(`Uno scrape ${success ? 'SUCCESS' : 'FALLBACK'} - Outbound: ${outbound.length}, Inbound: ${inbound.length}`);
    
    return {
      outbound: outbound.length > 0 ? outbound : STATIC_DATA.uno.outbound,
      inbound: inbound.length > 0 ? inbound : STATIC_DATA.uno.inbound,
      success
    };
  } catch (error) {
    console.error('Uno scrape failed:', error);
    return {
      outbound: STATIC_DATA.uno.outbound,
      inbound: STATIC_DATA.uno.inbound,
      success: false
    };
  }
}

async function scrapeFerry() {
  try {
    console.log('Starting ferry scrape for all three routes...');
    
    // 並行爬蟲三個船班
    const [shodosima, ogi, uno] = await Promise.all([
      scrapeShodoshima(),
      scrapeOgi(),
      scrapeUno()
    ]);

    const allSuccess = shodosima.success && ogi.success && uno.success;
    const anySuccess = shodosima.success || ogi.success || uno.success;

    // 新順序：shodoshima, ogi, uno
    const result = {
      shodoshima: {
        ...STATIC_DATA.shodoshima,
        outbound: shodosima.outbound,
        inbound: shodosima.inbound
      },
      ogi: {
        ...STATIC_DATA.ogi,
        outbound: ogi.outbound,
        inbound: ogi.inbound
      },
      uno: {
        ...STATIC_DATA.uno,
        outbound: uno.outbound,
        inbound: uno.inbound
      },
      syncStatus: allSuccess ? 'success' : anySuccess ? 'partial' : 'failed',
      lastUpdated: new Date().toISOString()
    };

    const dataPath = path.resolve(__dirname, '..', 'ferry_data.json');
    fs.writeFileSync(dataPath, JSON.stringify(result, null, 2));
    console.log(`Scrape completed. Status: ${result.syncStatus}`);
    return result;
  } catch (error) {
    console.error('Scrape failed:', error);
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  scrapeFerry();
}

export { scrapeFerry };
