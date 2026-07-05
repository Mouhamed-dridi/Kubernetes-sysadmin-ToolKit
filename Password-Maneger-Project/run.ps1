Write-Host "=== Password Manager ===" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Delete old database for clean migration
Remove-Item "$root\backend\database.sqlite" -ErrorAction Ignore

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location -LiteralPath $using:root\backend
    node server.js
}

# Start frontend
Write-Host "Starting frontend dev server..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location -LiteralPath $using:root\frontend
    npm run dev
}

Write-Host ""
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to stop both servers..." -ForegroundColor Magenta

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Stop-Job $backendJob
Stop-Job $frontendJob
Remove-Job $backendJob
Remove-Job $frontendJob

Write-Host "Servers stopped." -ForegroundColor Cyan
