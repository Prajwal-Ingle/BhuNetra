# BhuNetra Platform - Start Backend API Server
$env:PYTHONPATH = ".;backend"
Write-Host "Starting BhuNetra FastAPI Backend on http://127.0.0.1:8000..."
& .\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
