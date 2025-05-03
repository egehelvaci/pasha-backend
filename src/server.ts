import express from 'express'
import authRoutes from './auth/auth-routes'

// Express uygulaması oluştur
const app = express()
const PORT = process.env.PORT || 3001

// Middleware'ler
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS ayarları
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
    return res.status(200).json({})
  }
  
  next()
})

// Routes
app.use('/api/auth', authRoutes)

// Base route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Pasha Backend API v1.0',
    status: 'Çalışıyor'
  })
})

// Tanımsız route'ları yakala
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'İstenen sayfa bulunamadı'
  })
})

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`)
})

export default app 