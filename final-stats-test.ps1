# Admin İstatistik Test - SADECE ONAYLANMIŞ SİPARİŞLER
Write-Host "=== İstatistik API Test - ONAYLANMIŞ SİPARİŞLER ===" -ForegroundColor Green

$loginBody = '{"username": "admin", "password": "123"}'
try {
    Write-Host "`n1. Admin girişi..." -ForegroundColor Yellow
    $loginResp = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResp.data.token
    Write-Host "✓ Giriş başarılı" -ForegroundColor Green
    
    $headers = @{"Authorization" = "Bearer $token"}
    
    Write-Host "`n2. Toplam İstatistikler (Sadece Onaylanmış)..." -ForegroundColor Yellow
    $stats = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/statistics/totals?period=1_year" -Headers $headers
    
    Write-Host "📊 SONUÇLAR:" -ForegroundColor Cyan
    Write-Host "  • Toplam Sipariş: $($stats.data.total_orders)" -ForegroundColor White
    Write-Host "  • Toplam Ciro: $($stats.data.total_amount) TL" -ForegroundColor White
    Write-Host "  • Toplam Ürün: $($stats.data.total_product_quantity) adet" -ForegroundColor White
    Write-Host "  • Toplam Alan: $($stats.data.total_area_m2) m²" -ForegroundColor White
    Write-Host "  • Dahil Edilen Durumlar: $($stats.data.included_statuses -join ', ')" -ForegroundColor Green
    
    if ($stats.data.debug.amount_difference -gt 0) {
        Write-Host "  ⚠️ Order ve OrderItem tutarları arasında fark: $($stats.data.debug.amount_difference) TL" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ Order ve OrderItem tutarları eşleşiyor" -ForegroundColor Green
    }
    
    Write-Host "`n3. En Çok Sipariş Veren Mağazalar..." -ForegroundColor Yellow
    $stores = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/statistics/top-stores?period=1_year" -Headers $headers
    
    Write-Host "🏪 TOP MAĞAZALAR:" -ForegroundColor Cyan
    foreach ($store in $stores.data.stores) {
        Write-Host "  • $($store.store_name): $($store.order_count) sipariş, $($store.total_amount) TL" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Server çalışıyor mu? 'npm start' ile başlatın." -ForegroundColor Yellow
}

Write-Host "`n✅ DÜZELTMELER:" -ForegroundColor Green
Write-Host "• PENDING siparişler artık istatistiklere dahil edilmiyor" -ForegroundColor White
Write-Host "• Sadece CONFIRMED, SHIPPED, DELIVERED siparişler sayılıyor" -ForegroundColor White
Write-Host "• Metrekare hesaplama OrderItem tablosundan yapılıyor" -ForegroundColor White
Write-Host "• Debug bilgileri eklendi" -ForegroundColor White

Write-Host "`n=== Test Tamamlandı ===" -ForegroundColor Green 