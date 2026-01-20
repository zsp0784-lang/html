import express, { Router, Request, Response } from 'express';  
import Database from 'better-sqlite3';  
import path from 'path';  
import { fileURLToPath } from 'url';  
const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);  
const router = Router();  
// ============ SQLite 數據庫 ============  
const dbPath = process.env.DB_PATH || '/app/data/expenses.db';  
const db = new Database(dbPath);  
db.pragma('journal_mode = WAL');  
// ============ 初始化數據庫表 ============  
function initializeDatabase(): void {  
  try {  
    db.exec(`  
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
      );  
    `);  
    console.log('[MONEY] Database table initialized');  
  } catch (error) {  
    console.error('[MONEY] Failed to initialize database:', error);  
    throw error;  
  }  
}  
// 初始化數據庫  
initializeDatabase();  
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
router.get('/expenses', (_req: Request, res: Response) => {  
  try {  
    const stmt = db.prepare('SELECT * FROM expenses ORDER BY date DESC');  
    const rows = stmt.all();  
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
router.post('/expenses', (req: Request, res: Response) => {  
  try {  
    validateExpense(req.body);  
    const { id, amount, payer, paymentType, date, description, splitWith } = req.body;  
      
    // 檢查是否已存在  
    const checkStmt = db.prepare('SELECT id FROM expenses WHERE id = ?');  
    const existing = checkStmt.get(id);  
    if (existing) {  
      return res.status(400).json({  
        error: 'Failed to add expense',  
        message: 'Expense with this ID already exists',  
        timestamp: new Date().toISOString()  
      });  
    }  
      
    // 插入新記錄  
    const insertStmt = db.prepare(  
      `INSERT INTO expenses (id, amount, payer, payment_type, date, description, split_with)  
       VALUES (?, ?, ?, ?, ?, ?, ?)`  
    );  
    insertStmt.run(id, amount, payer, paymentType, date, description, JSON.stringify(splitWith || []));  
      
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
router.put('/expenses/:id', (req: Request, res: Response) => {  
  try {  
    const { id } = req.params;  
    const { amount, payer, paymentType, date, description, splitWith } = req.body;  
    validateExpense({ id, amount, payer, paymentType, date, splitWith });  
      
    // 檢查是否存在  
    const checkStmt = db.prepare('SELECT * FROM expenses WHERE id = ?');  
    const existing = checkStmt.get(id);  
    if (!existing) {  
      return res.status(404).json({  
        error: 'Failed to update expense',  
        message: 'Expense not found',  
        timestamp: new Date().toISOString()  
      });  
    }  
      
    // 更新記錄  
    const updateStmt = db.prepare(  
      `UPDATE expenses  
       SET amount = ?, payer = ?, payment_type = ?, date = ?, description = ?, split_with = ?, updated_at = CURRENT_TIMESTAMP  
       WHERE id = ?`  
    );  
    updateStmt.run(amount, payer, paymentType, date, description, JSON.stringify(splitWith || []), id);  
      
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
router.delete('/expenses/:id', (req: Request, res: Response) => {  
  try {  
    const { id } = req.params;  
    const deleteStmt = db.prepare('DELETE FROM expenses WHERE id = ?');  
    const result = deleteStmt.run(id);  
      
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
// ============ 清空所有記帳 ============  
router.delete('/expenses', (_req: Request, res: Response) => {  
  try {  
    const deleteStmt = db.prepare('DELETE FROM expenses');  
    deleteStmt.run();  
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
router.get('/stats', (_req: Request, res: Response) => {  
  try {  
    const totalStmt = db.prepare(  
      'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM expenses'  
    );  
    const totalResult = totalStmt.get() as any;  
      
    const payerStmt = db.prepare(  
      `SELECT payer, COUNT(*) as count, SUM(amount) as total  
       FROM expenses  
       GROUP BY payer`  
    );  
    const payerResults = payerStmt.all() as any[];  
      
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
router.get('/health', (_req: Request, res: Response) => {  
  try {  
    const stmt = db.prepare('SELECT CURRENT_TIMESTAMP as now');  
    const result = stmt.get() as any;  
      
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
