# İstatistik API'leri Test Script'i
Write-Host "=== Pasha Backend İstatistik API'leri Test ===`n" -ForegroundColor Green

# Admin login
Write-Host "1. Admin Login..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username": "admin", "password": "123"}'
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.data.token
    Write-Host "✓ Login başarılı" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0,50))...`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Login başarısız: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 1: En çok sipariş veren mağazalar
Write-Host "2. En Çok Sipariş Veren Mağazalar (TOP 5)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/admin/statistics/top-stores?period=1_year" -Method GET -Headers @{"Authorization"="Bearer $token"}
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ API çalışıyor" -ForegroundColor Green
    Write-Host "Toplam mağaza sayısı: $($data.data.total_stores)" -ForegroundColor Gray
    $data.data.stores | ForEach-Object { 
        Write-Host "  - $($_.store_name): $($_.order_count) sipariş, $($_.total_amount) TL" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "✗ API hatası: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: En çok sipariş edilen ürünler
Write-Host "3. En Çok Sipariş Edilen Ürünler (TOP 5)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/admin/statistics/top-products?period=1_year" -Method GET -Headers @{"Authorization"="Bearer $token"}
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ API çalışıyor" -ForegroundColor Green
    Write-Host "Toplam ürün sayısı: $($data.data.total_products)" -ForegroundColor Gray
    $data.data.products | ForEach-Object { 
        Write-Host "  - $($_.product_name): $($_.total_quantity) adet, $($_.total_amount) TL" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "✗ API hatası: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Zaman bazlı sipariş grafiği
Write-Host "4. Zaman Bazlı Sipariş Grafiği..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/admin/statistics/orders-over-time?period=1_year`&groupBy=month" -Method GET -Headers @{"Authorization"="Bearer $token"}
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ API çalışıyor" -ForegroundColor Green
    Write-Host "Grafik veri sayısı: $($data.data.chart_data.Count)" -ForegroundColor Gray
    $data.data.chart_data | ForEach-Object { 
        Write-Host "  - $($_.time_period): $($_.order_count) sipariş, $($_.total_area_m2) m²" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "✗ API hatası: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Toplam istatistikler
Write-Host "5. Toplam İstatistikler..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/admin/statistics/totals?period=1_year" -Method GET -Headers @{"Authorization"="Bearer $token"}
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✓ API çalışıyor" -ForegroundColor Green
    Write-Host "Toplam sipariş: $($data.data.total_orders)" -ForegroundColor Gray
    Write-Host "Toplam tutar: $($data.data.total_amount) TL" -ForegroundColor Gray
    Write-Host "Toplam ürün adedi: $($data.data.total_product_quantity)" -ForegroundColor Gray
    Write-Host "Toplam metrekare: $($data.data.total_area_m2) m²" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ API hatası: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== Test Tamamlandı ===`n" -ForegroundColor Green

# API Endpoint'leri özeti
Write-Host "📋 Kullanılabilir API Endpoint'leri:" -ForegroundColor Cyan
Write-Host "GET /api/admin/statistics/top-stores?period=[1_month|3_months|1_year]" -ForegroundColor White
Write-Host "GET /api/admin/statistics/top-products?period=[1_month|3_months|1_year]" -ForegroundColor White
Write-Host "GET /api/admin/statistics/orders-over-time?period=[1_month|3_months|1_year]`&groupBy=[day|week|month]" -ForegroundColor White
Write-Host "GET /api/admin/statistics/totals?period=[1_month|3_months|1_year]" -ForegroundColor White
Write-Host "`nTüm endpoint'ler admin authentication gerektirir: Authorization: Bearer <token>" -ForegroundColor Yellow 