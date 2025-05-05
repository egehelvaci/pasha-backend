import express from 'express'
import authRoutes from './auth/auth-routes'
import collectionRoutes from './routes/collectionRoutes'

// Express uygulaması oluştur
const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

// Ortam değişkenlerini logla
console.log("Çevre Değişkenleri:")
console.log(`PORT: ${process.env.PORT}`)
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Mevcut' : 'Tanımlı değil'}`)
console.log(`PUBLIC_URL: ${process.env.PUBLIC_URL || 'Tanımlı değil'}`)
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Tanımlı değil'}`)

// Middleware'ler
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS ayarları
const corsMiddleware = (req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
    return res.status(200).json({})
  }
  
  next()
}

app.use(corsMiddleware)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/collections', collectionRoutes)

// Base route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Pasha Backend API v1.0',
    status: 'Çalışıyor'
  })
})

// Railway için Api Healthcheck
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Pasha Backend API Sağlık Kontrolü',
    status: 'OK',
    timestamp: new Date().toISOString()
  })
})

// Tanımsız route'ları yakala
const notFoundHandler = (req: any, res: any) => {
  res.status(404).json({
    success: false,
    message: 'İstenen sayfa bulunamadı'
  })
}

app.use(notFoundHandler)

// Hata yakalama middleware'i
app.use((err: Error, req: any, res: any, next: any) => {
  console.error('Sunucu hatası:', err);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Sunucuyu başlat
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sunucu ${process.env.PUBLIC_URL || `http://0.0.0.0:${PORT}`} adresinde çalışıyor (port: ${PORT})`)
  })
  
  // İşlem sonlandırma sinyallerini yakala
  process.on('SIGTERM', () => {
    console.log('SIGTERM sinyali alındı, sunucu kapatılıyor...')
    server.close(() => {
      console.log('Sunucu kapatıldı')
      process.exit(0)
    })
  })
  
  process.on('SIGINT', () => {
    console.log('SIGINT sinyali alındı, sunucu kapatılıyor...')
    server.close(() => {
      console.log('Sunucu kapatıldı')
      process.exit(0)
    })
  })
} catch (error) {
  console.error('Sunucu başlatılamadı:', error)
}

export default app 