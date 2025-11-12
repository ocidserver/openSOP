# Test API Endpoints
Write-Host "=== Testing openSOP Backend API ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Test 1: Login
Write-Host "1. Testing Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email    = "admin@bps.go.id"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType 'application/json'
    $token = $loginResponse.data.token
    Write-Host "   ✓ Login successful!" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.data.user.fullName)" -ForegroundColor Gray
    Write-Host "   Role: $($loginResponse.data.user.role)" -ForegroundColor Gray
}
catch {
    Write-Host "   ✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Setup headers with token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# Test 2: Get Actors
Write-Host "2. Testing GET /api/actors..." -ForegroundColor Yellow
try {
    $actorsResponse = Invoke-RestMethod -Uri "$baseUrl/actors" -Method GET -Headers $headers
    Write-Host "   ✓ Success!" -ForegroundColor Green
    Write-Host "   Total actors: $($actorsResponse.data.pagination.total)" -ForegroundColor Gray
}
catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get Actor Statistics
Write-Host "3. Testing GET /api/actors/statistics..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/actors/statistics" -Method GET -Headers $headers
    Write-Host "   ✓ Success!" -ForegroundColor Green
    Write-Host "   Total: $($statsResponse.data.total)" -ForegroundColor Gray
    Write-Host "   Active: $($statsResponse.data.active)" -ForegroundColor Gray
}
catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get Evaluations
Write-Host "4. Testing GET /api/evaluations..." -ForegroundColor Yellow
try {
    $evaluationsResponse = Invoke-RestMethod -Uri "$baseUrl/evaluations" -Method GET -Headers $headers
    Write-Host "   ✓ Success!" -ForegroundColor Green
    Write-Host "   Total evaluations: $($evaluationsResponse.data.pagination.total)" -ForegroundColor Gray
}
catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 5: Get Monitoring Dashboard
Write-Host "5. Testing GET /api/monitoring/dashboard..." -ForegroundColor Yellow
try {
    $dashboardResponse = Invoke-RestMethod -Uri "$baseUrl/monitoring/dashboard" -Method GET -Headers $headers
    Write-Host "   ✓ Success!" -ForegroundColor Green
    Write-Host "   Total SOPs: $($dashboardResponse.data.kpis.totalSOPs)" -ForegroundColor Gray
    Write-Host "   Compliance Rate: $($dashboardResponse.data.kpis.complianceRate)%" -ForegroundColor Gray
}
catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 6: Get Profile
Write-Host "6. Testing GET /api/profile..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/profile" -Method GET -Headers $headers
    Write-Host "   ✓ Success!" -ForegroundColor Green
    Write-Host "   Name: $($profileResponse.data.fullName)" -ForegroundColor Gray
    Write-Host "   Email: $($profileResponse.data.email)" -ForegroundColor Gray
    Write-Host "   Department: $($profileResponse.data.department.name)" -ForegroundColor Gray
}
catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 7: Get Departments
Write-Host "7. Testing GET /api/departments..." -ForegroundColor Yellow
try {
    $departmentsResponse = Invoke-RestMethod -Uri "$baseUrl/departments" -Method GET -Headers $headers
    Write-Host "   ✓ Success!" -ForegroundColor Green
    Write-Host "   Total departments: $($departmentsResponse.data.length)" -ForegroundColor Gray
}
catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 8: Get Categories
Write-Host "8. Testing GET /api/categories..." -ForegroundColor Yellow
try {
    $categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method GET -Headers $headers
    Write-Host "   ✓ Success!" -ForegroundColor Green
    Write-Host "   Total categories: $($categoriesResponse.data.length)" -ForegroundColor Gray
}
catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 9: Get SOPs
Write-Host "9. Testing GET /api/sop..." -ForegroundColor Yellow
try {
    $sopsResponse = Invoke-RestMethod -Uri "$baseUrl/sop" -Method GET -Headers $headers
    Write-Host "   ✓ Success!" -ForegroundColor Green
    Write-Host "   Total SOPs: $($sopsResponse.data.pagination.total)" -ForegroundColor Gray
}
catch {
    Write-Host "   ✗ Failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
