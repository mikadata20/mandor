@echo off
title MAVI MES - YOLO Python Server (Port 8000)
cd /d "%~dp0"
echo ====================================================================
echo   MEMULAI YOLO PYTHON SERVER (PORT 8000)
echo ====================================================================
echo.
if exist ".\.venv\Scripts\python.exe" (
    echo [*] Menjalankan server menggunakan .venv...
    .\.venv\Scripts\python.exe yolo_server.py
) else (
    echo [*] Menjalankan server menggunakan Python sistem...
    python yolo_server.py
)
pause
