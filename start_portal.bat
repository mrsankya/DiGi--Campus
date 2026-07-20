@echo off
echo ===================================================
echo   CampusPulse - College Event Management Portal
echo ===================================================
echo Starting Backend API Server (Port 5000)...
start "CampusPulse Backend" cmd /k "cd backend && npm run dev"

echo Starting Frontend Web Application (Port 3000)...
start "CampusPulse Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application started!
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000/api/health
echo ===================================================
