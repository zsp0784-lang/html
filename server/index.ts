import express from 'express';  
import path from 'path';  
import { fileURLToPath } from 'url';  
import ferryRouter from './ferry-api.js';  
import moneyRouter from './money-api.js';  
const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);  
const app = express();  
const PORT = process.env.PORT || 8080;  
// 中間件  
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
// 靜態文件 - 使用絕對路徑確保在生產環境中正確  
const staticPath = process.env.NODE_ENV === 'production'   
  ? '/src/dist/public'   
  : path.join(__dirname, '..', 'client', 'public');  
app.use(express.static(staticPath));  
// API 路由  
app.use('/api/ferry', ferryRouter);  
app.use('/api/money', moneyRouter);  
// 部署時間端點  
app.get('/api/deployment-time', (req, res) => {  
  res.json({ deploymentTime: new Date().toISOString() });  
});  
// SPA 路由 - 所有其他請求返回 index.html  
app.get('*', (req, res) => {  
  res.sendFile(path.join(staticPath, 'index.html'));  
});  
// 全局錯誤處理中間件  
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {  
  console.error('[ERROR]', err);  
  res.status(500).json({ error: 'Internal Server Error' });  
});  
// 啟動伺服器  
const server = app.listen(PORT, () => {  
  console.log(`✅ Server running on port ${PORT}`);  
  console.log(`📁 Static files: ${staticPath}`);  
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);  
});  
// 優雅關閉  
process.on('SIGTERM', () => {  
  console.log('📍 SIGTERM received, shutting down gracefully...');  
  server.close(() => {  
    console.log('✅ Server closed');  
    process.exit(0);  
  });  
});  
// 未捕獲異常處理  
process.on('uncaughtException', (error) => {  
  console.error('[FATAL] Uncaught Exception:', error);  
  process.exit(1);  
});  
process.on('unhandledRejection', (reason, promise) => {  
  console.error('[FATAL] Unhandled Rejection:', reason);  
  process.exit(1);  
});  
export default app;  
