import express, { Router, Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// ============ SQLite 數據庫 ============
const dbPath = process.env.DB_PATH || '/data/expenses.db';

// 使用 Promise 包裝 sqlite3
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[MONEY] Database connection error:', err);
  } else {
    console.log('[MONEY] Database connected');
    initializeDatabase();
  }
});

// 將 db.run 和 db.all 轉換為 Promise
const dbRun = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const dbAll = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// ============ 初始化數據庫表 ============
function initializeDatabase(): void {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        payer TEXT NOT NULL,
        payment_type TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        split_with TEXT DEFAULT '[]',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('[MONEY] Failed to initialize database:', err);
      } else {
        console.log('[MONEY] Database table initialized');
      }
    });
  });
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
    const rows = await dbAll('SELECT * FROM expenses ORDER BY date DESC');
    const expenses = rows.map((row: any) => ({
      id: row.id,
      amount: row.amount,
      payer: row.payer,
      paymentType: row.payment_type,
      date: row.date,
      description: row.description,
      splitWith: JSON.parse(row.split_with || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    res.json({
      expenses,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    });
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
    const { id, amount, payer, paymentType, date, description, splitWith } = req.body;
    
    // 檢查是否已存在
    const existing = await dbGet('SELECT id FROM expenses WHERE id = ?', [id]);
    if (existing) {
      return res.status(400).json({
        error: 'Failed to add expense',
        message: 'Expense with this ID already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    // 插入新記錄
    await dbRun(
      `INSERT INTO expenses (id, amount, payer, payment_type, date, description, split_with)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, amount, payer, paymentType, date, description, JSON.stringify(splitWith || [])]
    );
    
    console.log(`[MONEY] Expense added: ${id}`);
    res.json({
      success: true,
      expense: req.body,
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
    const { amount, payer, paymentType, date, description, splitWith } = req.body;
    validateExpense({ id, amount, payer, paymentType, date, splitWith });
    
    // 檢查是否存在
    const existing = await dbGet('SELECT * FROM expenses WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        error: 'Failed to update expense',
        message: 'Expense not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // 更新記錄
    await dbRun(
      `UPDATE expenses
       SET amount = ?, payer = ?, payment_type = ?, date = ?, description = ?, split_with = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [amount, payer, paymentType, date, description, JSON.stringify(splitWith || []), id]
    );
    
    console.log(`[MONEY] Expense updated: ${id}`);
    res.json({
      success: true,
      expense: { id, amount, payer, paymentType, date, description, splitWith },
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
    const result = await dbRun('DELETE FROM expenses WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({
        error: 'Failed to delete expense',
        message: 'Expense not found',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`[MONEY] Expense deleted: ${id}`);
    res.json({
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[MONEY] Error deleting expense:', error);
    res.status(500).json({
      error: 'Failed to delete expense',
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 獲取統計信息 ============
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const totalResult = await dbGet(
      'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM expenses'
    );
    
    const payerResults = await dbAll(
      `SELECT payer, COUNT(*) as count, SUM(amount) as total
       FROM expenses
       GROUP BY payer`
    );
    
    const stats = {
      totalExpenses: totalResult.count,
      totalAmount: totalResult.total,
      lastUpdated: new Date().toISOString(),
      byPayer: {} as { [key: string]: { count: number; total: number } }
    };
    
    payerResults.forEach(row => {
      stats.byPayer[row.payer] = {
        count: row.count,
        total: row.total
      };
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
    const result = await dbGet('SELECT CURRENT_TIMESTAMP as now');
    
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: result.now,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('[MONEY] Health check error:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
