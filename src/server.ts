import express from 'express'
import authRoutes from './auth/auth-routes'
import collectionRoutes from './routes/collectionRoutes'

// Express uygulaması oluştur
const app = express()
const PORT = process.env.PORT || 3001

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

// Tanımsız route'ları yakala
const notFoundHandler = (req: any, res: any) => {
  res.status(404).json({
    success: false,
    message: 'İstenen sayfa bulunamadı'
  })
}

app.use(notFoundHandler)

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu ${process.env.PUBLIC_URL || `http://localhost:${PORT}`} adresinde çalışıyor`)
})

export default app 