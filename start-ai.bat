@echo off
echo Starting Live Analysis AI Module...
cd live-analysis
.\venv\Scripts\uvicorn.exe api.index:app --host 0.0.0.0 --port 8000 --reload
