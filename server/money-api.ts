import express, { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// 使用固定路徑確保數據持久化
const DATA_DIR = process.env.DATA_DIR || '/data';
const DATA_FILE = path.join(DATA_DIR, 'expenses.json');

// 確保 data 目錄存在
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

// 初始化 JSON 文件
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialData = {
      expenses: [],
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log(`Initialized expenses file at ${DATA_FILE}`);
  }
}

// 讀取數據文件（帶錯誤處理和驗證）
async function readExpensesFile() {
  try {
    await ensureDataDir();
    await initializeDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    // 驗證數據結構
    if (!Array.isArray(parsed.expenses)) {
      console.warn('Invalid expenses data structure, resetting...');
      return { expenses: [], lastUpdated: new Date().toISOString(), version: '1.0' };
    }
    
    return parsed;
  } catch (error) {
    console.error('Error reading expenses file:', error);
    throw error;
  }
}

// 寫入數據文件（帶備份）
async function writeExpensesFile(data: any) {
  try {
    await ensureDataDir();
    
    // 創建備份（可選，用於調試）
    const backupFile = path.join(DATA_DIR, `expenses.backup.${Date.now()}.json`);
    try {
      const existingData = await fs.readFile(DATA_FILE, 'utf-8');
      await fs.writeFile(backupFile, existingData);
      
      // 只保留最近 5 個備份
      const files = await fs.readdir(DATA_DIR);
      const backups = files
        .filter(f => f.startsWith('expenses.backup.'))
        .sort()
        .reverse();
      
      for (let i = 5; i < backups.length; i++) {
        await fs.unlink(path.join(DATA_DIR, backups[i]));
      }
    } catch (backupError) {
      console.warn('Backup creation skipped:', backupError);
    }
    
    // 寫入新數據
    data.lastUpdated = new Date().toISOString();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing expenses file:', error);
    throw error;
  }
}

// 驗證記帳數據 - 修正版本
function validateExpense(expense: any) {
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
  
  return true;
}

// 讀取所有記帳數據
router.get('/expenses', async (_req: Request, res: Response) => {
  try {
    const data = await readExpensesFile();
    res.json(data);
  } catch (error) {
    console.error('Error reading expenses:', error);
    res.status(500).json({ error: 'Failed to read expenses' });
  }
});

// 新增記帳
router.post('/expenses', async (req: Request, res: Response) => {
  try {
    // 驗證請求數據
    validateExpense(req.body);
    
    const newExpense = req.body;
    const data = await readExpensesFile();
    
    // 檢查 ID 是否重複
    if (data.expenses.some((e: any) => e.id === newExpense.id)) {
      return res.status(400).json({ error: 'Expense with this ID already exists' });
    }
    
    data.expenses.push(newExpense);
    await writeExpensesFile(data);
    
    console.log(`Expense added: ${newExpense.id} - ¥${newExpense.amount} by ${newExpense.payer}`);
    res.json({ success: true, expense: newExpense });
  } catch (error: any) {
    console.error('Error adding expense:', error);
    res.status(400).json({ error: error.message || 'Failed to add expense' });
  }
});

// 更新記帳（可選功能）
router.put('/expenses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedExpense = req.body;
    
    validateExpense(updatedExpense);
    
    const data = await readExpensesFile();
    const index = data.expenses.findIndex((e: any) => e.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    data.expenses[index] = { ...data.expenses[index], ...updatedExpense, id };
    await writeExpensesFile(data);
    
    console.log(`Expense updated: ${id}`);
    res.json({ success: true, expense: data.expenses[index] });
  } catch (error: any) {
    console.error('Error updating expense:', error);
    res.status(400).json({ error: error.message || 'Failed to update expense' });
  }
});

// 刪除記帳
router.delete('/expenses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await readExpensesFile();
    
    const initialLength = data.expenses.length;
    data.expenses = data.expenses.filter((e: any) => e.id !== id);
    
    if (data.expenses.length === initialLength) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    await writeExpensesFile(data);
    
    console.log(`Expense deleted: ${id}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// 清空所有記帳
router.delete('/expenses', async (_req: Request, res: Response) => {
  try {
    const jsonData = {
      expenses: [],
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    await writeExpensesFile(jsonData);
    
    console.log('All expenses cleared');
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing expenses:', error);
    res.status(500).json({ error: 'Failed to clear expenses' });
  }
});

// 獲取統計信息
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const data = await readExpensesFile();
    const stats = {
      totalExpenses: data.expenses.length,
      totalAmount: data.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
      lastUpdated: data.lastUpdated,
      byPayer: {} as { [key: string]: { count: number; total: number } }
    };
    
    // 按支付人統計
    data.expenses.forEach((expense: any) => {
      if (!stats.byPayer[expense.payer]) {
        stats.byPayer[expense.payer] = { count: 0, total: 0 };
      }
      stats.byPayer[expense.payer].count++;
      stats.byPayer[expense.payer].total += expense.amount || 0;
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
