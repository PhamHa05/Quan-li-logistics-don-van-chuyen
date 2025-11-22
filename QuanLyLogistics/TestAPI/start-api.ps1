# Script to start the API
Write-Host "Starting Logistics API..." -ForegroundColor Green
Write-Host "API will run on: http://localhost:5257" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the API" -ForegroundColor Yellow
Write-Host ""

dotnet run
