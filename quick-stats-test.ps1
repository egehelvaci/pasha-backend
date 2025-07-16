# Basit İstatistik Test
Write-Host "=== İstatistik API Test ===" -ForegroundColor Green

# Login
$loginBody = '{"username": "admin", "password": "123"}'
try {
    $loginResp = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResp.data.token
    Write-Host "Login OK" -ForegroundColor Green
    
    # Headers
    $headers = @{"Authorization" = "Bearer $token"}
    
    # Test toplam istatistikler
    Write-Host "`nToplam İstatistikler Test:" -ForegroundColor Yellow
    $stats = Invoke-RestMethod -Uri "http://localhost:3001/api/admin/statistics/totals?period=1_year" -Headers $headers
    
    Write-Host "Toplam Sipariş: $($stats.data.total_orders)"
    Write-Host "Toplam Ciro (Order): $($stats.data.total_amount) TL"
    Write-Host "Toplam Ciro (Items): $($stats.data.total_amount_from_items) TL"
    Write-Host "Toplam Ürün: $($stats.data.total_product_quantity)"
    Write-Host "Toplam Alan: $($stats.data.total_area_m2) m²"
    Write-Host "Debug - Geçerli Durumlar: $($stats.data.debug.valid_statuses -join ', ')"
    Write-Host "Debug - Tutar Farkı: $($stats.data.debug.amount_difference) TL"
    
} catch {
    Write-Host "Hata: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Bitti ===" -ForegroundColor Green 