@echo off
title Mufti Auto Store - Production ERP Server
echo ========================================================
echo     MUFTI AUTO STORE - PRODUCTION & MANUFACTURING ERP
echo ========================================================
echo.
echo Starting FastAPI + SQLite Server on http://127.0.0.1:8000 ...
echo.

start "" "http://127.0.0.1:8000"
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

pause
