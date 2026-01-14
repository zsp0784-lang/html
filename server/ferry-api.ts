import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeFerry } from './scrape-ferry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// 從環境變量讀取密碼
const SCRAPE_PASSWORD = process.env.PASSWORD || 'default-password';

// 修復數據路徑 - 指向 dist 目錄中的 ferry_data.json
const getDataPath = () => {
  // 在生產環境中，__dirname 是 /src/dist
  // 所以 ferry_data.json 應該在 /src/dist/ferry_data.json
  const dataPath = path.resolve(__dirname, 'ferry_data.json');
  console.log(`[FERRY] Data path: ${dataPath}`);
  return dataPath;
};

router.get('/schedules', (req, res) => {
  try {
    const dataPath = getDataPath();
    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath, 'utf-8');
      const ferryData = JSON.parse(rawData);
      res.json(ferryData);
    } else {
      console.warn(`[FERRY] Data file not found at ${dataPath}`);
      res.status(404).json({ error: 'Ferry data file not found' });
    }
  } catch (error) {
    console.error('[FERRY] API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 爬蟲端點 - 支持 query 和 body 兩種方式傳密碼
router.post('/scrape', async (req, res) => {
  try {
    // 從 query 參數或 body 中讀取密碼
    const passwordFromQuery = req.query.password as string;
    const passwordFromBody = req.body?.password as string;
    const providedPassword = passwordFromQuery || passwordFromBody;

    console.log(`[SCRAPE] Password check - Expected: ${SCRAPE_PASSWORD}, Provided: ${providedPassword}`);

    // 驗證密碼
    if (!providedPassword || providedPassword !== SCRAPE_PASSWORD) {
      console.warn(`[SECURITY] Unauthorized scrape attempt with password: ${providedPassword}`);
      return res.status(401).json({ error: 'Unauthorized - Invalid password' });
    }

    console.log('[SCRAPE] Authorized scrape request initiated');
    const data = await scrapeFerry();
    res.json({ message: 'Scrape successful', data });
  } catch (error) {
    console.error('[SCRAPE] API Error:', error);
    res.status(500).json({ error: 'Scrape failed' });
  }
});

export default router;
