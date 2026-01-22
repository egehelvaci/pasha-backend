# Simple Payment Test Script
$BASE_URL = "http://localhost:3001"
$STORE_ID = "bd0810ce-79db-421e-a21d-77a0b539bd5c"

Write-Host "=== OCTET PAYMENT API TEST ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Login..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin44"
    password = "123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.success) {
        Write-Host "SUCCESS: Login basarili!" -ForegroundColor Green
        Write-Host "User: $($loginResponse.user.name) $($loginResponse.user.surname)" -ForegroundColor Gray
        $token = $loginResponse.token
    } else {
        Write-Host "ERROR: Login basarisiz" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: Login hatasi - $_" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# Step 2: Payment Test
Write-Host ""
Write-Host "Step 2: 100 TL Odeme Testi..." -ForegroundColor Yellow
Write-Host "Store ID: $STORE_ID" -ForegroundColor Gray

$paymentBody = @{
    storeId = $STORE_ID
    amount = 100
    aciklama = "Test Odemesi - 100 TL"
    currencyCode = "TRY"
} | ConvertTo-Json

Write-Host "Octet API'ye istek gonderiliyor..." -ForegroundColor Gray
Write-Host "Lutfen bekleyin (30 saniye surebilir)..." -ForegroundColor Gray

$startTime = Get-Date

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $paymentResponse = Invoke-RestMethod -Uri "$BASE_URL/api/payments/process" -Method Post -Body $paymentBody -Headers $headers -TimeoutSec 60
    
    $duration = ((Get-Date) - $startTime).TotalSeconds
    Write-Host ""
    Write-Host "Istek suresi: $([math]::Round($duration, 2)) saniye" -ForegroundColor Gray
    
    if ($paymentResponse.success) {
        Write-Host ""
        Write-Host "SUCCESS: ODEME ISTEGI BASARILI!" -ForegroundColor Green
        Write-Host "===========================================" -ForegroundColor Green
        
        if ($paymentResponse.data.paymentUrl) {
            Write-Host "Payment URL:" -ForegroundColor Cyan
            Write-Host $paymentResponse.data.paymentUrl -ForegroundColor White
        }
        
        if ($paymentResponse.data.sellerReference) {
            Write-Host "Seller Reference: $($paymentResponse.data.sellerReference)" -ForegroundColor Gray
        }
        
        if ($paymentResponse.data.apiReferenceNumber) {
            Write-Host "API Reference: $($paymentResponse.data.apiReferenceNumber)" -ForegroundColor Gray
        }
        
        if ($paymentResponse.data.amount) {
            Write-Host "Tutar: $($paymentResponse.data.amount) $($paymentResponse.data.currencyCode)" -ForegroundColor Gray
        }
        
        Write-Host "===========================================" -ForegroundColor Green
        
        if ($paymentResponse.data.paymentUrl) {
            Write-Host ""
            Write-Host "Odemeyi tamamlamak icin URL'yi tarayicida acin" -ForegroundColor Yellow
            
            # URL'yi panoya kopyala
            try {
                Set-Clipboard -Value $paymentResponse.data.paymentUrl
                Write-Host "URL panoya kopyalandi!" -ForegroundColor Green
            } catch {
                # Clipboard hatasi onemli degil
            }
        }
        
    } else {
        Write-Host ""
        Write-Host "ERROR: ODEME ISTEGI BASARISIZ!" -ForegroundColor Red
        Write-Host "Hata Mesaji: $($paymentResponse.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host ""
    Write-Host "ERROR: PAYMENT TESTI BASARISIZ!" -ForegroundColor Red
    Write-Host "Hata: $_" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP Status: $statusCode" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Olasi sebepler:" -ForegroundColor Yellow
    Write-Host "- Octet API'ye baglanilmiyor (ag hatasi)" -ForegroundColor Gray
    Write-Host "- Octet login bilgileri hatali veya eksik" -ForegroundColor Gray
    Write-Host "- Database'de dbye_odeme_login tablosunda kayit yok" -ForegroundColor Gray
    Write-Host "- Timeout asildi" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "=== TEST TAMAMLANDI ===" -ForegroundColor Cyan





