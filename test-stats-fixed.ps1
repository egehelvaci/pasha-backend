# İstatistik API Test Scripti
Write-Host "=== Admin İstatistik API Test - DÜZELTILMIŞ ===`n" -ForegroundColor Green

# Sunucu kontrolü
Write-Host "1. Sunucu bağlantısı kontrol ediliyor..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method GET -TimeoutSec 10
    Write-Host "✓ Sunucu çalışıyor" -ForegroundColor Green
} catch {
    Write-Host "✗ Sunucu erişilemiyor. Sunucuyu başlatın: npm start" -ForegroundColor Red
    exit 1
}

# Admin login
Write-Host "`n2. Admin girişi yapılıyor..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin"
        password = "123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✓ Giriş başarılı" -ForegroundColor Green
} catch {
    Write-Host "✗ Giriş başarısız: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 1: Toplam İstatistikler (DÜZELTILMIŞ)
Write-Host "`n3. Toplam İstatistikler (DÜZELTILMIŞ VERSİYON)..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/statistics/totals?period=1_year" -Method GET -Headers $headers
    
    Write-Host "✓ API çalışıyor" -ForegroundColor Green
    Write-Host "📊 TOPLAM İSTATİSTİKLER:" -ForegroundColor Cyan
    Write-Host "  - Toplam Sipariş: $($statsResponse.data.total_orders)" -ForegroundColor White
    Write-Host "  - Toplam Ciro (Order): $($statsResponse.data.total_amount) TL" -ForegroundColor White
    Write-Host "  - Toplam Ciro (Items): $($statsResponse.data.total_amount_from_items) TL" -ForegroundColor White
    Write-Host "  - Toplam Ürün Adedi: $($statsResponse.data.total_product_quantity)" -ForegroundColor White
    Write-Host "  - Toplam Metrekare: $($statsResponse.data.total_area_m2) m²" -ForegroundColor White
    Write-Host "  - Geçerli Durumlar: $($statsResponse.data.debug.valid_statuses -join ', ')" -ForegroundColor Gray
    Write-Host "  - Alan Hesaplanan Items: $($statsResponse.data.debug.area_calculated_items)" -ForegroundColor Gray
    Write-Host "  - Tutar Farkı: $($statsResponse.data.debug.amount_difference) TL" -ForegroundColor Gray
} catch {
    Write-Host "✗ API hatası: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: En Çok Sipariş Veren Mağazalar
Write-Host "`n4. En Çok Sipariş Veren Mağazalar..." -ForegroundColor Yellow
try {
    $storesResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/statistics/top-stores?period=1_year" -Method GET -Headers $headers
    
    Write-Host "✓ API çalışıyor" -ForegroundColor Green
    Write-Host "🏪 TOP MAĞAZALAR:" -ForegroundColor Cyan
    foreach ($store in $storesResponse.data.stores) {
        Write-Host "  - $($store.store_name): $($store.order_count) sipariş, $($store.total_amount) TL" -ForegroundColor White
    }
} catch {
    Write-Host "✗ API hatası: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: En Çok Sipariş Edilen Ürünler
Write-Host "`n5. En Çok Sipariş Edilen Ürünler..." -ForegroundColor Yellow
try {
    $productsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/statistics/top-products?period=1_year" -Method GET -Headers $headers
    
    Write-Host "✓ API çalışıyor" -ForegroundColor Green
    Write-Host "📦 TOP ÜRÜNLER:" -ForegroundColor Cyan
    foreach ($product in $productsResponse.data.products) {
        Write-Host "  - $($product.product_name): $($product.total_quantity) adet, $($product.total_amount) TL" -ForegroundColor White
    }
} catch {
    Write-Host "✗ API hatası: $($_.Exception.Message)" -ForegroundColor Red
}
}

Write-Host "`n=== Test Tamamlandı ===`n" -ForegroundColor Green

Write-Host "🔧 YAPILAN DÜZELTMELER:" -ForegroundColor Yellow
Write-Host "1. Sadece geçerli sipariş durumları dahil edildi (PENDING, CONFIRMED, SHIPPED, DELIVERED)" -ForegroundColor White
Write-Host "2. Metrekare hesaplama OrderItem tablosundan yapılıyor" -ForegroundColor White
Write-Host "3. Toplam ciro Order ve OrderItem'lardan karşılaştırmalı olarak hesaplanıyor" -ForegroundColor White
Write-Host "4. Debug bilgileri eklendi" -ForegroundColor White 