# Excel Export API Test Scripti
# Bu script admin Excel export API'lerini test eder

Write-Host "=== EXCEL EXPORT API TESTLERİ ===" -ForegroundColor Green

# Admin token (test için - gerçek token ile değiştirin)
$adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Gerçek admin token buraya

if ($adminToken -eq "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...") {
    Write-Host "⚠️  UYARI: Gerçek admin token'ı scripte ekleyin!" -ForegroundColor Yellow
    Write-Host "Admin token almak için:" -ForegroundColor Yellow
    Write-Host "POST http://localhost:3001/api/admin/auth/login" -ForegroundColor Yellow
    Write-Host "{ username: 'admin', password: 'admin123' }" -ForegroundColor Yellow
    Write-Host ""
    
    # Test için devam et
    Write-Host "Test amaçlı devam ediliyor..." -ForegroundColor Yellow
}

$baseUrl = "http://localhost:3001"
$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

# Test klasörü oluştur
$testDir = "excel_test_files"
if (!(Test-Path $testDir)) {
    New-Item -ItemType Directory -Path $testDir
    Write-Host "📁 Test klasörü oluşturuldu: $testDir" -ForegroundColor Green
}

Write-Host "`n1. Sipariş Excel Export Testleri" -ForegroundColor Cyan

# Test 1: Aylık sipariş özeti
Write-Host "`n📊 Test 1: Aylık sipariş özeti..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/export/orders?period=monthly&format=summary" -Method GET -Headers $headers -OutFile "$testDir/monthly_orders_summary.xlsx"
    Write-Host "✅ Aylık sipariş özeti başarıyla indirildi" -ForegroundColor Green
} catch {
    Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Detaylı sipariş listesi (son 7 gün)
Write-Host "`n📋 Test 2: Haftalık detaylı sipariş listesi..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/export/orders?period=weekly&format=detailed" -Method GET -Headers $headers -OutFile "$testDir/weekly_orders_detailed.xlsx"
    Write-Host "✅ Haftalık detaylı sipariş listesi başarıyla indirildi" -ForegroundColor Green
} catch {
    Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Özel tarih aralığı
Write-Host "`n📅 Test 3: Özel tarih aralığı (2024-01-01 - 2024-12-31)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/export/orders?period=custom&start_date=2024-01-01&end_date=2024-12-31&format=summary" -Method GET -Headers $headers -OutFile "$testDir/custom_range_orders.xlsx"
    Write-Host "✅ Özel tarih aralığı siparişleri başarıyla indirildi" -ForegroundColor Green
} catch {
    Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Sadece onaylanmış siparişler
Write-Host "`n✅ Test 4: Sadece onaylanmış siparişler..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/export/orders?period=yearly&status=CONFIRMED&format=summary" -Method GET -Headers $headers -OutFile "$testDir/confirmed_orders.xlsx"
    Write-Host "✅ Onaylanmış siparişler başarıyla indirildi" -ForegroundColor Green
} catch {
    Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Muhasebe Hareketleri Excel Export Testleri" -ForegroundColor Cyan

# Test 5: Aylık muhasebe hareketleri
Write-Host "`n💰 Test 5: Aylık muhasebe hareketleri..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/export/accounting-transactions?period=monthly" -Method GET -Headers $headers -OutFile "$testDir/monthly_accounting.xlsx"
    Write-Host "✅ Aylık muhasebe hareketleri başarıyla indirildi" -ForegroundColor Green
} catch {
    Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Yıllık gelir kayıtları
Write-Host "`n📈 Test 6: Yıllık gelir kayıtları..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/export/accounting-transactions?period=yearly&is_expense=false" -Method GET -Headers $headers -OutFile "$testDir/yearly_income.xlsx"
    Write-Host "✅ Yıllık gelir kayıtları başarıyla indirildi" -ForegroundColor Green
} catch {
    Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Octet ödemeleri
Write-Host "`n🏦 Test 7: Octet ödemeleri..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/export/accounting-transactions?period=yearly&transaction_type=OCTET_PAYMENT" -Method GET -Headers $headers -OutFile "$testDir/octet_payments.xlsx"
    Write-Host "✅ Octet ödemeleri başarıyla indirildi" -ForegroundColor Green
} catch {
    Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Özel tarih aralığı muhasebe
Write-Host "`n📊 Test 8: Özel tarih aralığı muhasebe (2024-01-01 - 2024-06-30)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/admin/export/accounting-transactions?period=custom&start_date=2024-01-01&end_date=2024-06-30" -Method GET -Headers $headers -OutFile "$testDir/custom_accounting.xlsx"
    Write-Host "✅ Özel tarih aralığı muhasebe hareketleri başarıyla indirildi" -ForegroundColor Green
} catch {
    Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. İndirilen Dosyaları Kontrol Et" -ForegroundColor Cyan

# İndirilen dosyaları listele
$files = Get-ChildItem -Path $testDir -Name "*.xlsx"
if ($files.Count -gt 0) {
    Write-Host "`n📂 İndirilen Excel dosyaları:" -ForegroundColor Green
    foreach ($file in $files) {
        $filePath = Join-Path $testDir $file
        $fileSize = (Get-Item $filePath).Length
        $fileSizeKB = [math]::Round($fileSize / 1024, 2)
        Write-Host "   📄 $file ($fileSizeKB KB)" -ForegroundColor White
    }
    
    Write-Host "`n✅ Toplam $($files.Count) Excel dosyası başarıyla oluşturuldu!" -ForegroundColor Green
    Write-Host "📁 Dosyalar şu klasörde: $((Get-Item $testDir).FullName)" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Hiçbir Excel dosyası oluşturulamadı!" -ForegroundColor Red
}

Write-Host "`n4. API Test Örnekleri" -ForegroundColor Cyan

Write-Host "`n🔧 CURL Örnekleri:" -ForegroundColor Yellow
Write-Host "# Özet sipariş raporu (bu ay)" -ForegroundColor Gray
Write-Host "curl -X GET `"$baseUrl/api/admin/export/orders?period=monthly&format=summary`" -H `"Authorization: Bearer YOUR_TOKEN`" --output siparisler_ozet.xlsx" -ForegroundColor White

Write-Host "`n# Detaylı muhasebe raporu (özel tarih)" -ForegroundColor Gray  
Write-Host "curl -X GET `"$baseUrl/api/admin/export/accounting-transactions?period=custom&start_date=2024-01-01&end_date=2024-12-31`" -H `"Authorization: Bearer YOUR_TOKEN`" --output muhasebe_detay.xlsx" -ForegroundColor White

Write-Host "`n🌐 Postman/İnsomnia İçin:" -ForegroundColor Yellow
Write-Host "GET $baseUrl/api/admin/export/orders?period=monthly&format=summary" -ForegroundColor White
Write-Host "Headers: Authorization: Bearer YOUR_ADMIN_TOKEN" -ForegroundColor Gray

Write-Host "`n🎯 JavaScript Fetch Örneği:" -ForegroundColor Yellow
Write-Host @"
const response = await fetch('/api/admin/export/orders?period=monthly', {
  headers: { 'Authorization': 'Bearer ' + adminToken }
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'siparisler.xlsx';
a.click();
"@ -ForegroundColor White

Write-Host "`n=== TEST TAMAMLANDI ===" -ForegroundColor Green
Write-Host "💡 Excel dosyalarını açarak içeriklerini kontrol edebilirsiniz" -ForegroundColor Yellow
Write-Host "💡 Gerçek admin token ile testleri tekrar çalıştırın" -ForegroundColor Yellow 