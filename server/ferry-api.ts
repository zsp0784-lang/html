import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeFerry } from './scrape-ferry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// ============ 配置 ============
const SCRAPE_PASSWORD = process.env.PASSWORD || 'default-password';

// ============ 路徑管理 ============
function getDataPath(): string {
  return path.join(__dirname, 'ferry_data.json');
}

// ============ 數據驗證 ============
function validateFerryData(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const required = ['shodoshima', 'ogi', 'uno'];
  for (const route of required) {
    if (!data[route] || !Array.isArray(data[route].outbound) || !Array.isArray(data[route].inbound)) {
      return false;
    }
  }

  return true;
}

// ============ 讀取船班數據 ============
router.get('/schedules', (req, res) => {
  try {
    const dataPath = getDataPath();

    if (!fs.existsSync(dataPath)) {
      console.warn(`[FERRY] Data file not found`);
      return res.status(404).json({
        error: 'Ferry data file not found',
        timestamp: new Date().toISOString()
      });
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const ferryData = JSON.parse(rawData);

    // 驗證數據結構
    if (!validateFerryData(ferryData)) {
      console.error('[FERRY] Invalid data structure');
      return res.status(500).json({
        error: 'Invalid ferry data structure',
        timestamp: new Date().toISOString()
      });
    }

    res.json(ferryData);
  } catch (error) {
    console.error('[FERRY] API Error:', error);
    res.status(500).json({
      error: 'Failed to read ferry schedules',
      message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 爬蟲端點 ============
router.post('/scrape', async (req, res) => {
  try {
    const passwordFromQuery = req.query.password as string;
    const passwordFromBody = req.body?.password as string;
    const providedPassword = passwordFromQuery || passwordFromBody;

    // 驗證密碼
    if (!providedPassword || providedPassword !== SCRAPE_PASSWORD) {
      console.warn(`[FERRY] Unauthorized scrape attempt`);
      return res.status(401).json({
        error: 'Unauthorized - Invalid password',
        timestamp: new Date().toISOString()
      });
    }

    console.log('[FERRY] Starting scrape...');

    // 執行爬蟲
    const data = await scrapeFerry();

    console.log(`[FERRY] Scrape completed - Status: ${data.syncStatus}`);
    res.json({
      success: true,
      message: 'Scrape completed successfully',
      syncStatus: data.syncStatus,
      lastUpdated: data.lastUpdated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[FERRY] Scrape Error:', error);
    res.status(500).json({
      error: 'Scrape failed',
      message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 健康檢查 ============
router.get('/health', (req, res) => {
  try {
    const dataPath = getDataPath();
    const fileExists = fs.existsSync(dataPath);

    let lastUpdated = null;
    if (fileExists) {
      const stats = fs.statSync(dataPath);
      lastUpdated = stats.mtime.toISOString();
    }

    res.json({
      status: 'ok',
      dataFileExists: fileExists,
      lastUpdated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[FERRY] Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
