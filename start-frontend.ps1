# PowerShell script to start frontend server
# Run this in the frontend directory

Write-Host "Starting Frontend Server..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host "Starting Vite dev server on port 5173..." -ForegroundColor Cyan
Write-Host "Make sure backend is running on port 3000 first!" -ForegroundColor Yellow
Write-Host ""
npm run dev

