import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '../generated/prisma'
import productRoutes from './routes/productRoutes'
import collectionRoutes from './routes/collectionRoutes'
import priceListRoutes from './routes/priceListRoutes'
import catalogRoutes from './routes/catalogRoutes'
import cartRoutes from './routes/cartRoutes'
import adminRoutes from './admin/admin-routes'
import authRoutes from './auth/auth-routes'
import storeRoutes from './admin/store-routes'
import path from 'path'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

dotenv.config()

// Express uygulaması oluştur
const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

// Ortam değişkenlerini logla
console.log("Çevre Değişkenleri:")
console.log(`PORT: ${process.env.PORT}`)
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Mevcut' : 'Tanımlı değil'}`)
console.log(`PUBLIC_URL: ${process.env.PUBLIC_URL || 'Tanımlı değil'}`)
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Tanımlı değil'}`)
console.log(`TEBI_ACCESS_KEY: ${process.env.TEBI_ACCESS_KEY ? 'Mevcut' : 'Tanımlı değil'}`)
console.log(`TEBI_SECRET_KEY: ${process.env.TEBI_SECRET_KEY ? 'Mevcut' : 'Tanımlı değil'}`)
console.log(`TEBI_BUCKET_NAME: ${process.env.TEBI_BUCKET_NAME || 'pashahome'}`)

// Middleware'ler
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Statik dosyalar için klasör tanımı
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Multer ayarları - dosya yükleme için
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + extension)
  }
})

const upload = multer({ storage: storage })

// Routes
app.use('/api/products', productRoutes)
app.use('/api/collections', collectionRoutes)
app.use('/api/price-lists', priceListRoutes)
app.use('/api/catalog', catalogRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/stores', storeRoutes)

// Kök rota - Railway proxy için basit yanıt
app.get('/', (req, res) => {
  console.log('Kök dizin isteği alındı:', new Date().toISOString())
  return res.status(200).send({
    message: 'Pasha Backend API v1.0',
    status: 'OK',
    timestamp: new Date().toISOString()
  })
})

// Railway healthcheck için ek endpoint
app.get('/healthz', (req, res) => {
  console.log('Health check isteği alındı:', new Date().toISOString())
  return res.status(200).send('OK')
})

// API rota kontrolü
app.get('/api', (req, res) => {
  console.log('API isteği alındı:', new Date().toISOString())
  return res.status(200).send({
    message: 'Pasha Backend API Gateway',
    status: 'OK',
    timestamp: new Date().toISOString()
  })
})

// 404 handler - en sonda
app.use((req, res) => {
  console.log('404 - İstenen sayfa bulunamadı:', req.originalUrl)
  return res.status(404).send({
    success: false,
    message: 'İstenen sayfa bulunamadı',
    path: req.originalUrl
  })
})

// Error handler - tüm hataları yakala
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Sunucu hatası:', err)
  return res.status(500).send({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'production' ? {} : err
  })
})

// Sunucuyu başlat - PORT'a dikkat et
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