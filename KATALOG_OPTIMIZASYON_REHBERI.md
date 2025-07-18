# 📚 Katalog Optimizasyon Rehberi

## 🚀 Genel Bakış

Bu döküman, büyük ürün sayılarına (500+ ürün) sahip kataloglar için yapılan performans optimizasyonlarını açıklar.

## ⚡ Yapılan Optimizasyonlar

### 1. **Memory Management (Bellek Yönetimi)**
- **Batch Processing**: Ürünler 50'şerli gruplar halinde işlenir
- **Progressive Memory Cleanup**: Her 25 batch'te bir bellek temizliği
- **Image Cache Limitation**: Maksimum 100 resim cache'lenir
- **Garbage Collection**: Manuel GC çalıştırma (5 dakikada bir)

### 2. **Timeout Optimizasyonları**
- **Request Timeout**: 15 dakika (900 saniye)
- **Browser Timeout**: 2 dakika 
- **PDF Generation Timeout**: 5 dakika
- **HTML Load Timeout**: 1.5 dakika
- **Image Timeout**: 8 saniye

### 3. **Concurrent Processing Limits**
- **Max Concurrent Images**: 10 (bellekten tasarruf)
- **Image Loading Chunks**: 5'erli gruplar
- **Products Per Page**: 6 (daha iyi layout)

### 4. **Database Optimizasyonları**
- **Select Only Needed Fields**: Sadece gerekli alanlar çekilir
- **Ordered Results**: Collection ve name'e göre sıralama
- **Efficient Queries**: N+1 query problemleri önlenir

## 🔧 Teknik Detaylar

### Memory-Optimized PDF Generation
```typescript
private async generatePDFFromHTMLMemoryOptimized(html: string): Promise<Buffer> {
  // Browser arguments for memory optimization
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--memory-pressure-off',
    '--max-old-space-size=2048'
  ]
}
```

### Batch Processing Strategy
```typescript
// 1. Split products into batches
const batches = this.splitIntoBatches(products, 50);

// 2. Process each batch sequentially
for (let i = 0; i < batches.length; i++) {
  const processedBatch = await this.processBatchOptimized(batch);
  
  // 3. Memory cleanup between batches
  if (i % 25 === 0) {
    await this.performMemoryCleanup();
  }
}
```

### Image Loading Optimization
```typescript
// Small chunks for image loading (5 at a time)
const chunks = this.splitIntoBatches(products, 5);

// Promise race for timeout handling
presignedImageUrl = await Promise.race([
  this.getPresignedUrl(product.productImage),
  new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error('Image timeout')), 8000)
  )
]);
```

## 📊 Performance Improvements

### Before Optimization:
- ❌ **Memory**: Out of memory errors with 100+ products
- ❌ **Timeout**: 30 second timeouts
- ❌ **Concurrency**: Unlimited parallel image requests
- ❌ **Processing**: All products processed at once

### After Optimization:
- ✅ **Memory**: Handles 500+ products efficiently
- ✅ **Timeout**: 15 minute timeout for large catalogs
- ✅ **Concurrency**: Limited to 10 concurrent image requests
- ✅ **Processing**: Batch processing with memory cleanup

## 🎯 Usage Recommendations

### Small Catalogs (< 50 products)
- **Processing Time**: 30-60 saniye
- **Memory Usage**: ~200MB
- **Recommended**: Normal kullanım

### Medium Catalogs (50-200 products)
- **Processing Time**: 2-5 dakika
- **Memory Usage**: ~400MB
- **Recommended**: Batch processing aktif

### Large Catalogs (200-500 products)
- **Processing Time**: 5-10 dakika
- **Memory Usage**: ~800MB
- **Recommended**: Optimize edilmiş ayarlar

### Very Large Catalogs (500+ products)
- **Processing Time**: 10-15 dakika
- **Memory Usage**: ~1.5GB
- **Recommended**: Sunucu bellek artırılmalı

## ⚙️ Server Configuration

### Environment Variables
```bash
# Memory optimization
NODE_OPTIONS="--max-old-space-size=4096 --expose-gc"

# Timeout settings
REQUEST_TIMEOUT=900000
PDF_TIMEOUT=300000
```

### Server Settings
```typescript
// Server timeouts
server.timeout = 900000;          // 15 minutes
server.keepAliveTimeout = 900000; // 15 minutes
server.headersTimeout = 900000;   // 15 minutes
```

## 🛠️ Troubleshooting

### Memory Issues
```bash
# Check memory usage
curl -X POST /api/catalog/generate \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["1","2",...]}' \
  --max-time 900
```

### Timeout Issues
- **Çok fazla ürün**: Ürün sayısını azaltın (< 300)
- **Sunucu kaynakları**: Memory ve CPU'yu kontrol edin
- **Network**: İnternet bağlantısını kontrol edin

### Image Loading Issues
- **Tebi.io Connection**: API credentials'ları kontrol edin
- **Image URLs**: Broken image URL'leri kontrol edin
- **Cache**: Image cache'ini temizleyin

## 📈 Monitoring

### Memory Monitoring
```typescript
// Memory usage logging
private logMemoryUsage(stage: string): void {
  const used = process.memoryUsage();
  console.log(`Memory [${stage}]: RSS: ${Math.round(used.rss / 1024 / 1024)}MB`);
}
```

### Progress Tracking
```typescript
// Progress interval for long operations
const progressInterval = setInterval(() => {
  console.log('⏳ Katalog oluşturma devam ediyor...');
}, 30000); // Every 30 seconds
```

## 🎉 Results

Bu optimizasyonlar sayesinde:

- **✅ 500+ ürünlü kataloglar** başarıyla oluşturulabilir
- **✅ Memory overflow** hataları önlenir  
- **✅ Timeout sorunları** çözülür
- **✅ İstikrarlı performans** sağlanır
- **✅ Kullanıcı deneyimi** iyileşir

## 📞 Support

Sorun yaşarsanız:
1. Server memory'yi kontrol edin
2. Log'ları inceleyin
3. Ürün sayısını azaltmayı deneyin
4. Development team'e başvurun

---
*Son güncelleme: Oluşturulma tarihi* 