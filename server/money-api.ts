import express, { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// ============ 配置 ============
const DATA_DIR = process.env.DATA_DIR || '/data';
const DATA_FILE = path.join(DATA_DIR, 'expenses.json');
const MAX_BACKUPS = 3;

// ============ 初始化標誌 ============
let dataDirInitialized = false;

// ============ 文件鎖機制（防止並發問題） ============
class FileLock {
  private locks = new Map<string, Promise<void>>();

  async acquire(key: string, fn: () => Promise<void>): Promise<void> {
    const existingLock = this.locks.get(key);
    const newLock = (existingLock || Promise.resolve()).then(fn);
    this.locks.set(key, newLock);

    try {
      await newLock;
    } finally {
      if (this.locks.get(key) === newLock) {
        this.locks.delete(key);
      }
    }
  }
}

const fileLock = new FileLock();

// ============ 初始化數據目錄（只執行一次） ============
async function ensureDataDir(): Promise<void> {
  if (dataDirInitialized) return;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    dataDirInitialized = true;
    console.log(`[MONEY] Data directory ready: ${DATA_DIR}`);
  } catch (error) {
    console.error('[MONEY] Failed to create data directory:', error);
    throw error;
  }
}

// ============ 初始化數據文件 ============
async function initializeDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialData = {
      expenses: [],
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log(`[MONEY] Initialized expenses file`);
  }
}

// ============ 讀取數據文件 ============
async function readExpensesFile(): Promise<any> {
  try {
    await ensureDataDir();
    await initializeDataFile();

    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);

    // 驗證數據結構
    if (!Array.isArray(parsed.expenses)) {
      console.warn('[MONEY] Invalid expenses data structure, resetting...');
      return {
        expenses: [],
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
    }

    return parsed;
  } catch (error) {
    console.error('[MONEY] Error reading expenses file:', error);
    throw error;
  }
}

// ============ 寫入數據文件（帶備份） ============
async function writeExpensesFile(data: any): Promise<void> {
  try {
    await ensureDataDir();

    // 創建備份
    try {
      const existingData = await fs.readFile(DATA_FILE, 'utf-8');
      const backupFile = path.join(DATA_DIR, `expenses.backup.${Date.now()}.json`);
      await fs.writeFile(backupFile, existingData);

      // 清理舊備份（只保留最近 N 個）
      const files = await fs.readdir(DATA_DIR);
      const backups = files
        .filter(f => f.startsWith('expenses.backup.'))
        .sort()
        .reverse();

      for (let i = MAX_BACKUPS; i < backups.length; i++) {
        try {
          await fs.unlink(path.join(DATA_DIR, backups[i]));
        } catch (err) {
          console.warn(`[MONEY] Failed to delete backup ${backups[i]}`);
        }
      }
    } catch (backupError) {
      console.warn('[MONEY] Backup creation skipped');
    }

    // 寫入新數據
    data.lastUpdated = new Date().toISOString();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[MONEY] Error writing expenses file:', error);
    throw error;
  }
}

// ============ 驗證記帳數據 ============
function validateExpense(expense: any): void {
  const required = ['id', 'amount', 'payer', 'paymentType', 'date'];

  for (const field of required) {
    if (!(field in expense)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (typeof expense.amount !== 'number' || expense.amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  if (!Array.isArray(expense.splitWith)) {
    throw new Error('splitWith must be an array');
  }

  if (typeof expense.id !== 'string' || expense.id.trim() === '') {
    throw new Error('ID must be a non-empty string');
  }
}

// ============ 讀取所有記帳 ============
router.get('/expenses', async (_req: Request, res: Response) => {
  try {
    const data = await readExpensesFile();
    res.json(data);
  } catch (error) {
    console.error('[MONEY] Error reading expenses:', error);
    res.status(500).json({
      error: 'Failed to read expenses',
      message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 新增記帳 ============
router.post('/expenses', async (req: Request, res: Response) => {
  try {
    validateExpense(req.body);
    const newExpense = req.body;

    await fileLock.acquire('expenses', async () => {
      const data = await readExpensesFile();

      if (data.expenses.some((e: any) => e.id === newExpense.id)) {
        throw new Error('Expense with this ID already exists');
      }

      data.expenses.push(newExpense);
      await writeExpensesFile(data);
    });

    console.log(`[MONEY] Expense added: ${newExpense.id}`);
    res.json({
      success: true,
      expense: newExpense,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[MONEY] Error adding expense:', error);
    res.status(400).json({
      error: 'Failed to add expense',
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 更新記帳 ============
router.put('/expenses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedExpense = req.body;

    validateExpense(updatedExpense);

    let result: any = null;

    await fileLock.acquire('expenses', async () => {
      const data = await readExpensesFile();
      const index = data.expenses.findIndex((e: any) => e.id === id);

      if (index === -1) {
        throw new Error('Expense not found');
      }

      data.expenses[index] = { ...data.expenses[index], ...updatedExpense, id };
      await writeExpensesFile(data);
      result = data.expenses[index];
    });

    console.log(`[MONEY] Expense updated: ${id}`);
    res.json({
      success: true,
      expense: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[MONEY] Error updating expense:', error);
    res.status(error.message === 'Expense not found' ? 404 : 400).json({
      error: 'Failed to update expense',
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 刪除記帳 ============
router.delete('/expenses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await fileLock.acquire('expenses', async () => {
      const data = await readExpensesFile();
      const initialLength = data.expenses.length;

      data.expenses = data.expenses.filter((e: any) => e.id !== id);

      if (data.expenses.length === initialLength) {
        throw new Error('Expense not found');
      }

      await writeExpensesFile(data);
    });

    console.log(`[MONEY] Expense deleted: ${id}`);
    res.json({
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[MONEY] Error deleting expense:', error);
    res.status(error.message === 'Expense not found' ? 404 : 500).json({
      error: 'Failed to delete expense',
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 清空所有記帳 ============
router.delete('/expenses', async (_req: Request, res: Response) => {
  try {
    await fileLock.acquire('expenses', async () => {
      const jsonData = {
        expenses: [],
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
      await writeExpensesFile(jsonData);
    });

    console.log('[MONEY] All expenses cleared');
    res.json({
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MONEY] Error clearing expenses:', error);
    res.status(500).json({
      error: 'Failed to clear expenses',
      message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 獲取統計信息 ============
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const data = await readExpensesFile();

    const stats = {
      totalExpenses: data.expenses.length,
      totalAmount: data.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
      lastUpdated: data.lastUpdated,
      byPayer: {} as { [key: string]: { count: number; total: number } }
    };

    data.expenses.forEach((expense: any) => {
      if (!stats.byPayer[expense.payer]) {
        stats.byPayer[expense.payer] = { count: 0, total: 0 };
      }
      stats.byPayer[expense.payer].count++;
      stats.byPayer[expense.payer].total += expense.amount || 0;
    });

    res.json(stats);
  } catch (error) {
    console.error('[MONEY] Error getting stats:', error);
    res.status(500).json({
      error: 'Failed to get stats',
      message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 健康檢查 ============
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const dataPath = DATA_FILE;
    let fileExists = false;
    let lastUpdated = null;

    try {
      const stats = await fs.stat(dataPath);
      fileExists = true;
      lastUpdated = stats.mtime.toISOString();
    } catch {
      fileExists = false;
    }

    res.json({
      status: 'ok',
      dataFileExists: fileExists,
      lastUpdated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MONEY] Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
