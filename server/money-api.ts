import express from 'express';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// ============ SQLite 數據庫 (sql.js - 純 JavaScript) ============
const dbPath = process.env.DB_PATH || '/data/expenses.db';
const dbDir = path.dirname(dbPath);

let SQL;
let db;

// 初始化 sql.js
async function initializeDb() {
  try {
    SQL = await initSqlJs();
    
    // 確保目錄存在
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // 讀取或創建數據庫
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log('[MONEY] Database loaded from file');
    } else {
      db = new SQL.Database();
      console.log('[MONEY] New database created');
    }
    
    initializeDatabase();
    console.log('[MONEY] Database initialized');
  } catch (err) {
    console.error('[MONEY] Database initialization error:', err);
    process.exit(1);
  }
}

// 保存數據庫到文件
function saveDatabase() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('[MONEY] Error saving database:', err);
  }
}

// 定期保存數據庫
setInterval(saveDatabase, 5000);

// ============ 初始化數據庫表 ============
function initializeDatabase() {
  try {
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
    `);
    console.log('[MONEY] Database table initialized');
  } catch (err) {
    console.error('[MONEY] Failed to initialize database:', err);
  }
}

// ============ 驗證記帳數據 ============
function validateExpense(expense) {
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
router.get('/expenses', (_req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM expenses ORDER BY date DESC');
    const rows = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      rows.push(row);
    }
    stmt.free();
    
    const expenses = rows.map((row) => ({
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
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 新增記帳 ============
router.post('/expenses', (req, res) => {
  try {
    validateExpense(req.body);
    const { id, amount, payer, paymentType, date, description, splitWith } = req.body;
    
    // 檢查是否已存在
    const checkStmt = db.prepare('SELECT id FROM expenses WHERE id = ?');
    checkStmt.bind([id]);
    const existing = checkStmt.step();
    checkStmt.free();
    
    if (existing) {
      return res.status(400).json({
        error: 'Failed to add expense',
        message: 'Expense with this ID already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    // 插入新記錄
    const insertStmt = db.prepare(`
      INSERT INTO expenses (id, amount, payer, payment_type, date, description, split_with)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.bind([id, amount, payer, paymentType, date, description || null, JSON.stringify(splitWith || [])]);
    insertStmt.step();
    insertStmt.free();
    
    saveDatabase();
    
    console.log(`[MONEY] Expense added: ${id}`);
    res.json({
      success: true,
      expense: req.body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MONEY] Error adding expense:', error);
    res.status(400).json({
      error: 'Failed to add expense',
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 更新記帳 ============
router.put('/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payer, paymentType, date, description, splitWith } = req.body;
    validateExpense({ id, amount, payer, paymentType, date, splitWith });
    
    // 檢查是否存在
    const checkStmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
    checkStmt.bind([id]);
    const existing = checkStmt.step();
    checkStmt.free();
    
    if (!existing) {
      return res.status(404).json({
        error: 'Failed to update expense',
        message: 'Expense not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // 更新記錄
    const updateStmt = db.prepare(`
      UPDATE expenses
      SET amount = ?, payer = ?, payment_type = ?, date = ?, description = ?, split_with = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateStmt.bind([amount, payer, paymentType, date, description || null, JSON.stringify(splitWith || []), id]);
    updateStmt.step();
    updateStmt.free();
    
    saveDatabase();
    
    console.log(`[MONEY] Expense updated: ${id}`);
    res.json({
      success: true,
      expense: { id, amount, payer, paymentType, date, description, splitWith },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MONEY] Error updating expense:', error);
    res.status(error.message === 'Expense not found' ? 404 : 400).json({
      error: 'Failed to update expense',
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 刪除記帳 ============
router.delete('/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 先檢查是否存在
    const checkStmt = db.prepare('SELECT id FROM expenses WHERE id = ?');
    checkStmt.bind([id]);
    const exists = checkStmt.step();
    checkStmt.free();
    
    if (!exists) {
      return res.status(404).json({
        error: 'Failed to delete expense',
        message: 'Expense not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // 刪除記錄
    const deleteStmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    deleteStmt.bind([id]);
    deleteStmt.step();
    deleteStmt.free();
    
    saveDatabase();
    
    console.log(`[MONEY] Expense deleted: ${id}`);
    res.json({
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MONEY] Error deleting expense:', error);
    res.status(500).json({
      error: 'Failed to delete expense',
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 獲取統計信息 ============
router.get('/stats', (_req, res) => {
  try {
    const totalStmt = db.prepare(
      'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM expenses'
    );
    totalStmt.step();
    const totalResult = totalStmt.getAsObject();
    totalStmt.free();
    
    const payerStmt = db.prepare(`
      SELECT payer, COUNT(*) as count, SUM(amount) as total
      FROM expenses
      GROUP BY payer
    `);
    
    const payerResults = [];
    while (payerStmt.step()) {
      payerResults.push(payerStmt.getAsObject());
    }
    payerStmt.free();
    
    const stats = {
      totalExpenses: totalResult.count,
      totalAmount: totalResult.total,
      lastUpdated: new Date().toISOString(),
      byPayer: {}
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
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 健康檢查 ============
router.get('/health', (_req, res) => {
  try {
    const stmt = db.prepare('SELECT CURRENT_TIMESTAMP as now');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    
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
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ 導出初始化函數 ============
export { initializeDb };
export default router;
