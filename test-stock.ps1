$body = '{"width": 80, "height": 300, "quantity": 1000}'
$uri = "http://localhost:3001/api/products/eea687b8-7663-426f-823a-ad2131dcbe48/stock"

Write-Host "Testing stock update with 80x300..."
try {
    $response = Invoke-WebRequest -Uri $uri -Method PATCH -ContentType "application/json" -Body $body
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error Response: $responseBody"
    }
}

Write-Host "`n---`n"

$body2 = '{"width": 80, "height": 200, "quantity": 500}'
Write-Host "Testing stock update with 80x200..."
try {
    $response2 = Invoke-WebRequest -Uri $uri -Method PATCH -ContentType "application/json" -Body $body2
    Write-Host "Status Code: $($response2.StatusCode)"
    Write-Host "Response: $($response2.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error Response: $responseBody"
    }
} 