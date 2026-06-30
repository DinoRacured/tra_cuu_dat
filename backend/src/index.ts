import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import landPricesRouter from './routes/landPrices';
import resolveWardRouter from './routes/resolveWard';
import { syncData } from './scripts/syncData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/land-prices', landPricesRouter);
app.use('/api/resolve-ward', resolveWardRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // Tự động tải dữ liệu một lần khi khởi động Server
  await syncData();

  // Đặt lịch tự động tải lại dữ liệu sau mỗi 24 giờ (86400000 ms)
  setInterval(async () => {
    console.log('[Cron] Đang tự động cập nhật dữ liệu định kỳ...');
    await syncData();
  }, 24 * 60 * 60 * 1000);
});
