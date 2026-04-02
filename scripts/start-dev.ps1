# Clean .next, free common dev ports, start Next on http://localhost:3000
$ErrorActionPreference = "SilentlyContinue"
Set-Location $PSScriptRoot\..

Write-Host "Stopping processes on ports 3000-3005..."
foreach ($port in 3000..3005) {
    Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

if (Test-Path .next) {
    Write-Host "Removing .next cache..."
    Remove-Item -Recurse -Force .next
}

Write-Host "Starting Next.js on http://localhost:3000"
npm run dev -- -p 3000
