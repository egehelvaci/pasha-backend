# Admin Sepet API Test Script
param(
    [string]$BaseUrl = "http://localhost:3001",
    [string]$AdminToken = "test-token",
    [string]$TargetUserId = "test-user-id",
    [string]$StoreId = "test-store-id"
)

Write-Host "🧪 Admin Sepet API Test Başlatılıyor..." -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Admin sepetinden sipariş oluşturma
Write-Host "📦 Test 1: Admin sepetinden sipariş oluşturma" -ForegroundColor Cyan

$orderData = @{
    targetUserId = $TargetUserId
    storeId = $StoreId
    notes = "API test siparişi"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $AdminToken"
}

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/admin/cart/create-order-from-admin-cart" `
                                  -Method POST `
                                  -Headers $headers `
                                  -Body $orderData `
                                  -UseBasicParsing

    Write-Host "✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📄 Response:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Hata oluştu:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🏁 Test tamamlandı" -ForegroundColor Green