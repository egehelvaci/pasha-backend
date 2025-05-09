import express from 'express';
import collectionRoutes from './routes/collectionRoutes';
import productRoutes from './routes/productRoutes';
import priceListRoutes from './routes/priceListRoutes';

// Express uygulaması oluştur
const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS ayarları
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // OPTIONS isteklerini hemen yanıtla
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Routes
app.use('/api/collections', collectionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/price-lists', priceListRoutes);

// Kök rota
app.get('/', (req, res) => {
  return res.status(200).send({
    message: 'Pasha Backend API',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  return res.status(404).send({
    success: false,
    message: 'İstenen sayfa bulunamadı',
    path: req.originalUrl
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Sunucu hatası:', err);
  return res.status(500).send({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`API sunucusu http://localhost:${PORT} adresinde çalışıyor`);
});

export default app; 