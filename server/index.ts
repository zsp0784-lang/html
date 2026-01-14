import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ferryRouter from './ferry-api.js';
import moneyRouter from './money-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// ============ 環境變量驗證 ============
function validateEnvironment() {
  const required = ['PASSWORD'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('⚠️  Using default password for development only!');
  }

  if (process.env.PASSWORD === 'default-password' || !process.env.PASSWORD) {
    console.warn('⚠️  WARNING: Using default password! Set PASSWORD env var in production');
  }
}

validateEnvironment();

// ============ 請求計數（用於優雅關閉） ============
let activeRequests = 0;

app.use((req, res, next) => {
  activeRequests++;
  res.on('finish', () => {
    activeRequests--;
  });
  res.on('close', () => {
    activeRequests--;
  });
  next();
});

// ============ 中間件 ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ 靜態文件 ============
const staticPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '..', 'public')
  : path.join(__dirname, '..', 'client', 'public');

console.log(`📁 Static files path: ${staticPath}`);
app.use(express.static(staticPath));

// ============ API 路由 ============
app.use('/api/ferry', ferryRouter);
app.use('/api/money', moneyRouter);

// ============ 健康檢查端點 ============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    activeRequests,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============ 部署時間端點 ============
app.get('/api/deployment-time', (req, res) => {
  res.json({ deploymentTime: new Date().toISOString() });
});

// ============ SPA 路由 ============
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// ============ 全局錯誤處理中間件 ============
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// ============ 啟動伺服器 ============
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// ============ 優雅關閉 ============
function gracefulShutdown(signal: string) {
  console.log(`\n📍 ${signal} received, starting graceful shutdown...`);

  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });

  // 等待現有請求完成（最多 30 秒）
  const shutdownTimeout = setTimeout(() => {
    console.error('❌ Forced shutdown after 30s timeout');
    console.error(`⚠️  ${activeRequests} active requests still pending`);
    process.exit(1);
  }, 30000);

  // 如果所有請求完成，提前退出
  const checkInterval = setInterval(() => {
    if (activeRequests === 0) {
      clearInterval(checkInterval);
      clearTimeout(shutdownTimeout);
    }
  }, 100);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============ 未捕獲異常處理 ============
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection:', {
    reason,
    promise,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

export default app;
