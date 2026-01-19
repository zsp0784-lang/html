import express, { Router, Request, Response } from 'express';  
import { Pool } from 'pg';  
const router = Router();  
// ============ PostgreSQL 連接池 ============  
const pool = new Pool({  
  host: process.env.POSTGRESQL_HOST || 'localhost',  
  port: parseInt(process.env.POSTGRESQL_PORT || '5432'),  
  user: process.env.POSTGRESQL_USER || 'root',  
  password: process.env.POSTGRESQL_PASSWORD || '',  
  database: process.env.POSTGRESQL_DB || 'zeabur',  
  max: 20,  
  idleTimeoutMillis: 30000,  
  connectionTimeoutMillis: 2000,  
});  
// ============ 初始化數據庫表 ============  
async function initializeDatabase(): Promise<void> {  
  try {  
    await pool.query(`  
      CREATE TABLE IF NOT EXISTS expenses (  
        id VARCHAR(255) PRIMARY KEY,  
        amount NUMERIC NOT NULL,  
        payer VARCHAR(255) NOT NULL,  
        payment_type VARCHAR(50) NOT NULL,  
        date TIMESTAMP NOT NULL,  
        description TEXT,  
        split_with JSONB DEFAULT '[]',  
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
      );  
    `);  
    console.log('[MONEY] Database table initialized');  
  } catch (error) {  
    console.error('[MONEY] Failed to initialize database:', error);  
    throw error;  
  }  
}  
// 啟動時初始化數據庫  
initializeDatabase().catch(err => {  
  console.error('[MONEY] Database initialization failed:', err);  
  process.exit(1);  
});  
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
    const result = await pool.query(  
      'SELECT * FROM expenses ORDER BY date DESC'  
    );  
    const expenses = result.rows.map(row => ({  
      id: row.id,  
      amount: parseFloat(row.amount),  
      payer: row.payer,  
      paymentType: row.payment_type,  
      date: row.date,  
      description: row.description,  
      splitWith: row.split_with,  
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
    const existing = await pool.query(  
      'SELECT id FROM expenses WHERE id = $1',  
      [id]  
    );  
    if (existing.rows.length > 0) {  
      return res.status(400).json({  
        error: 'Failed to add expense',  
        message: 'Expense with this ID already exists',  
        timestamp: new Date().toISOString()  
      });  
    }  
    // 插入新記錄  
    await pool.query(  
      `INSERT INTO expenses (id, amount, payer, payment_type, date, description, split_with)  
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,  
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
    const existing = await pool.query(  
      'SELECT * FROM expenses WHERE id = $1',  
      [id]  
    );  
    if (existing.rows.length === 0) {  
      return res.status(404).json({  
        error: 'Failed to update expense',  
        message: 'Expense not found',  
        timestamp: new Date().toISOString()  
      });  
    }  
    // 更新記錄  
    await pool.query(  
      `UPDATE expenses   
       SET amount = $1, payer = $2, payment_type = $3, date = $4, description = $5, split_with = $6, updated_at = CURRENT_TIMESTAMP  
       WHERE id = $7`,  
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
    const result = await pool.query(  
      'DELETE FROM expenses WHERE id = $1',  
      [id]  
    );  
    if (result.rowCount === 0) {  
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
router.delete('/expenses', async (_req: Request, res: Response) => {  
  try {  
    await pool.query('DELETE FROM expenses');  
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
    const totalResult = await pool.query(  
      'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM expenses'  
    );  
    const payerResult = await pool.query(  
      `SELECT payer, COUNT(*) as count, SUM(amount) as total   
       FROM expenses   
       GROUP BY payer`  
    );  
    const stats = {  
      totalExpenses: parseInt(totalResult.rows[0].count),  
      totalAmount: parseFloat(totalResult.rows[0].total),  
      lastUpdated: new Date().toISOString(),  
      byPayer: {} as { [key: string]: { count: number; total: number } }  
    };  
    payerResult.rows.forEach(row => {  
      stats.byPayer[row.payer] = {  
        count: parseInt(row.count),  
        total: parseFloat(row.total)  
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
    const result = await pool.query('SELECT NOW()');  
      
    res.json({  
      status: 'ok',  
      database: 'connected',  
      timestamp: result.rows[0].now,  
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
