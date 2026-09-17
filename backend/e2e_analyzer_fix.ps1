$baseUrl = "http://localhost:5000/api"
$allPass = $true

Write-Host "======================================"
Write-Host "ANALYZER DEMO DATASET MATCHING FIX E2E"
Write-Host "======================================"

# ---- Test 1: Search for S25 Ultra and grab the actual productId returned ----
Write-Host "`n--- Test 1: SerpApi returns S25 Ultra 256GB product ---"
try {
    $search = Invoke-RestMethod -Uri "$baseUrl/search?q=Samsung+Galaxy+S25+Ultra+5G+12GB+256GB" -Method Get
    $target = $search.results | Where-Object { $_.title -match '256' } | Select-Object -First 1
    if ($target) {
        Write-Host "PASS: Product found: '$($target.title)'"
        Write-Host "      productId (numeric): $($target.productId)"
        Write-Host "      extractedPrice: $($target.extractedPrice)"
    } else {
        Write-Host "WARNING: No explicit 256GB product in top results, using first result"
        $target = $search.results | Select-Object -First 1
        Write-Host "         Using: '$($target.title)'"
    }
} catch {
    Write-Host "FAIL: Search failed: $_"
    $allPass = $false
    exit
}

# ---- Test 2: Analyze with numeric productId + title (the exact failing scenario) ----
Write-Host "`n--- Test 2: Analyze with numeric productId + title ---"
try {
    $pk = [uri]::EscapeDataString($target.productId)
    $ttl = [uri]::EscapeDataString($target.title)
    $res = Invoke-RestMethod -Uri "$baseUrl/analyze?productKey=$pk&title=$ttl" -Method Get
    if ($res.dataSource -eq "DEMO" -and $res.analysis) {
        Write-Host "PASS: Demo dataset loaded. Source: $($res.dataSource)"
        Write-Host "      Forecast 7d: $($res.analysis.predicted_price_7d)"
        Write-Host "      Trend: $($res.analysis.trend)"
        Write-Host "      Confidence: $($res.analysis.confidence)"
        Write-Host "      Data points: $($res.analysis.data_points)"
        Write-Host "      Chart entries: $($res.analysis.chart_data.Count)"
    } else {
        Write-Host "FAIL: Expected DEMO source. Got: $($res.dataSource), Error: $($res.error)"
        $allPass = $false
    }
} catch {
    Write-Host "FAIL: Analyze failed: $_"
    $allPass = $false
}

# ---- Test 3: Color variant (Titanium Silverblue) must ALSO be DEMO authorized ----
Write-Host "`n--- Test 3: Color variant still authorized (256GB/12GB + Titanium Silverblue) ---"
try {
    $colorTitle = [uri]::EscapeDataString("Samsung Galaxy S25 Ultra 5G (12GB RAM + 256GB Storage) Titanium Silverblue")
    $res = Invoke-RestMethod -Uri "$baseUrl/analyze?productKey=dummy-key&title=$colorTitle" -Method Get
    if ($res.dataSource -eq "DEMO") {
        Write-Host "PASS: Color variant correctly authorized as DEMO."
    } else {
        Write-Host "FAIL: Color variant not authorized. Got source: $($res.dataSource)"
        $allPass = $false
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "FAIL: Unexpected error (status $statusCode): $_"
    $allPass = $false
}

# ---- Test 4: 512GB MUST return 404 (not DEMO) ----
Write-Host "`n--- Test 4: 512GB variant must NOT use DEMO data ---"
try {
    $title512 = [uri]::EscapeDataString("Samsung Galaxy S25 Ultra 5G (12GB RAM + 512GB Storage)")
    $res = Invoke-RestMethod -Uri "$baseUrl/analyze?productKey=dummy-512&title=$title512" -Method Get
    if ($res.dataSource -eq "DEMO") {
        Write-Host "FAIL: 512GB incorrectly used DEMO data!"
        $allPass = $false
    } else {
        Write-Host "PASS: 512GB allowed non-DEMO source: $($res.dataSource)"
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "PASS: 512GB returned 404 (Insufficient History) - NOT demo."
    } else {
        Write-Host "FAIL: Unexpected error: $_"
        $allPass = $false
    }
}

# ---- Test 5: S24 Ultra 256GB MUST return 404 ----
Write-Host "`n--- Test 5: S24 Ultra must NOT use S25 Ultra DEMO data ---"
try {
    $s24title = [uri]::EscapeDataString("Samsung Galaxy S24 Ultra 5G 12GB 256GB")
    $res = Invoke-RestMethod -Uri "$baseUrl/analyze?productKey=dummy-s24&title=$s24title" -Method Get
    if ($res.dataSource -eq "DEMO") {
        Write-Host "FAIL: S24 Ultra incorrectly used S25 Ultra DEMO data!"
        $allPass = $false
    } else {
        Write-Host "PASS: S24 Ultra allowed non-DEMO source: $($res.dataSource)"
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "PASS: S24 Ultra returned 404 (Insufficient History) - NOT demo."
    } else {
        Write-Host "FAIL: Unexpected error: $_"
        $allPass = $false
    }
}

# ---- Test 6: Canonical demo key still works ----
Write-Host "`n--- Test 6: Canonical productKey (slug) still works ---"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/analyze?productKey=samsung-galaxy-s25-ultra-5g-12gb-256gb" -Method Get
    if ($res.dataSource -eq "DEMO") {
        Write-Host "PASS: Canonical slug still loads DEMO data."
    } else {
        Write-Host "FAIL: Canonical slug did not load DEMO. Source: $($res.dataSource)"
        $allPass = $false
    }
} catch {
    Write-Host "FAIL: $_"
    $allPass = $false
}

# ---- Test 7: No-title fallback with numeric productId ----
Write-Host "`n--- Test 7: Numeric productId without title returns 404 (not DEMO) ---"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/analyze?productKey=15721896708756098667" -Method Get
    if ($res.dataSource -eq "DEMO") {
        Write-Host "FAIL: Bare numeric productId incorrectly authorized as DEMO!"
        $allPass = $false
    } else {
        Write-Host "PASS: Numeric productId alone not DEMO authorized. Source: $($res.dataSource)"
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "PASS: Numeric productId returned 404 without title - correct."
    } else {
        Write-Host "FAIL: Unexpected error: $_"
        $allPass = $false
    }
}

# ---- Summary ----
Write-Host "`n======================================"
if ($allPass) {
    Write-Host "ALL TESTS PASSED"
} else {
    Write-Host "SOME TESTS FAILED"
}
Write-Host "======================================"
