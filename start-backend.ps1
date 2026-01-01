# PowerShell script to start backend server
# Run this in the backend directory

Write-Host "Starting Backend Server..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Make sure to create .env file with database connection and other configs" -ForegroundColor Yellow
}

# Start the server
Write-Host "Starting server on port 3000..." -ForegroundColor Cyan
npm run dev

