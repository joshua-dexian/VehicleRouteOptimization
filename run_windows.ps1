# PowerShell script to run the Logistics application
# This script starts both the backend and frontend servers

Write-Host "Starting Logistics Application..." -ForegroundColor Cyan

# Start backend server in a new PowerShell window
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PWD; cd backend; python run.py"

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start frontend server in a new PowerShell window
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PWD; cd frontend; npm run dev"

# Wait for frontend to start
Write-Host "Waiting for frontend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Open browser
Write-Host "Opening application in browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`nServers are running!" -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:8000" -ForegroundColor White
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "- API Documentation: http://localhost:8000/docs" -ForegroundColor White
Write-Host "`nClose the PowerShell windows to stop the servers." -ForegroundColor Yellow

# Keep the script running
Write-Host "`nPress Ctrl+C to exit this window (servers will continue running in their own windows)" -ForegroundColor Magenta
while ($true) {
    Start-Sleep -Seconds 1
} 