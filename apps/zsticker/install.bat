@echo off
python --version >nul 2>&1 || (echo Install Python3 first & pause & exit /b 1)
python -m venv venv
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if not exist .env copy .env.example .env
if not exist fonts mkdir fonts
if not exist output mkdir output
if not exist templates mkdir templates
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/google/fonts/raw/main/ofl/kanit/Kanit-Bold.ttf' -OutFile 'fonts\Kanit-Bold.ttf'"
if not exist credentials.json echo {"type":"service_account"} > credentials.json
echo === Done ===
pause
