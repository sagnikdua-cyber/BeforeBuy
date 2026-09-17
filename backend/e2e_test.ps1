$baseUrl = "http://localhost:5000/api"

Write-Host "Starting E2E API Verification..."

Write-Host "`n--- Testing /search ---"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/search?q=samsung+galaxy+s25+ultra+5g" -Method Get
    if ($res.products -and $res.products.Length -gt 0) {
        Write-Host "PASS: Search returned $($res.products.Length) products."
        Write-Host "Lowest Price Extracted: $($res.lowestPrice.extractedPrice)"
    } else {
        Write-Host "FAIL: No products returned"
    }
} catch {
    Write-Host "FAIL: $_"
}

Write-Host "`n--- Testing /analyze (Demo Data) ---"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/analyze?productKey=samsung-galaxy-s25-ultra-5g-12gb-256gb" -Method Get
    if ($res.history -and $res.history.Length -gt 0) {
        Write-Host "PASS: Analyze returned $($res.history.Length) historical points."
        Write-Host "Source: $($res.source)"
        Write-Host "Forecast 7-day: $($res.mlAnalysis.predicted_price_7d)"
        Write-Host "Trend: $($res.mlAnalysis.trend)"
        Write-Host "Confidence: $($res.mlAnalysis.confidence)"
    } else {
        Write-Host "FAIL: No history returned"
    }
} catch {
    Write-Host "FAIL: $_"
}

Write-Host "`n--- Testing /analyze (Variant Protection) ---"
try {
    # Using try/catch instead of SkipHttpErrorCheck
    $res = Invoke-RestMethod -Uri "$baseUrl/analyze?productKey=samsung-galaxy-s25-ultra-5g-12gb-512gb" -Method Get
    if ($res.source -eq "DEMO") {
        Write-Host "FAIL: 512GB variant incorrectly used DEMO data."
    } else {
        Write-Host "PASS: Variant protected. Source used: $($res.source)"
    }
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "PASS: Variant protected. Returned 404 (Insufficient history)."
    } else {
        Write-Host "FAIL: $_"
    }
}

Write-Host "`n--- Testing /track/check ---"
try {
    $title = [uri]::EscapeDataString("Samsung Galaxy S25 Ultra 5G")
    $res = Invoke-RestMethod -Uri "$baseUrl/track/check?title=$title" -Method Get
    if ($res.currentPrice) {
        Write-Host "PASS: Track check returned current price: $($res.currentPrice)"
    } else {
        Write-Host "FAIL: Track check did not return currentPrice"
    }
} catch {
    Write-Host "FAIL: $_"
}
Write-Host "`nVerification Complete."
