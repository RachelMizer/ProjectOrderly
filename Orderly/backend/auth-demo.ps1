# =========================
# Orderly Auth Demo Script
# =========================

$base = "http://127.0.0.1:8000/api/v1/auth"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Unique email each run
$email = "demo_$(Get-Date -Format 'yyyyMMdd_HHmmss')@example.com"
$password = "StrongPass123!"

# Test tracking
$results = @{}

Write-Host "`n=== REGISTER ===" -ForegroundColor Cyan
try {
    $registerBody = @{
        email     = $email
        password  = $password
        firstName = "Demo"
        lastName  = "User"
    } | ConvertTo-Json -Compress

    $register = Invoke-RestMethod -Method Post -Uri "$base/register" -ContentType "application/json" -Body $registerBody -WebSession $session
    $register | ConvertTo-Json -Depth 6
    $results["Register"] = "PASS"
}
catch {
    $results["Register"] = "FAIL"
}

Write-Host "`n=== LOGIN ===" -ForegroundColor Cyan
try {
    $loginBody = @{
        email    = $email
        password = $password
    } | ConvertTo-Json -Compress

    $login = Invoke-RestMethod -Method Post -Uri "$base/login/" -ContentType "application/json" -Body $loginBody -WebSession $session
    $login | ConvertTo-Json -Depth 6
    $access = $login.accessToken
    $results["Login"] = "PASS"
}
catch {
    $results["Login"] = "FAIL"
}

Write-Host "`n=== REFRESH ===" -ForegroundColor Cyan
try {
    $refresh = Invoke-RestMethod -Method Post -Uri "$base/refresh" -ContentType "application/json" -Body "{}" -WebSession $session
    $refresh | ConvertTo-Json -Depth 6
    $results["Refresh"] = "PASS"
}
catch {
    $results["Refresh"] = "FAIL"
}

Write-Host "`n=== ME ===" -ForegroundColor Cyan
try {
    $me = Invoke-RestMethod -Method Get -Uri "$base/me/" -Headers @{ Authorization = "Bearer $access" }
    $me | ConvertTo-Json -Depth 6
    $results["Me"] = "PASS"
}
catch {
    $results["Me"] = "FAIL"
}

Write-Host "`n=== LOGOUT ===" -ForegroundColor Cyan
try {
    $logout = Invoke-RestMethod -Method Post -Uri "$base/logout" -ContentType "application/json" -Body "{}" -WebSession $session
    $logout | ConvertTo-Json
    $results["Logout"] = "PASS"
}
catch {
    $results["Logout"] = "FAIL"
}

Write-Host "`n=== REFRESH AFTER LOGOUT (Should Fail) ===" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Method Post -Uri "$base/refresh" -ContentType "application/json" -Body "{}" -WebSession $session | Out-Null
    $results["RefreshAfterLogout"] = "FAIL"
}
catch {
    $results["RefreshAfterLogout"] = "PASS"
}

# =========================
# TEST SUMMARY
# =========================

Write-Host "`n=========================" -ForegroundColor Yellow
Write-Host "      TEST SUMMARY       " -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

foreach ($key in $results.Keys) {
    if ($results[$key] -eq "PASS") {
        Write-Host "$key : PASS" -ForegroundColor Green
    }
    else {
        Write-Host "$key : FAIL" -ForegroundColor Red
    }
}

Write-Host "=========================`n"