@echo off
REM MangaRecap AI - Windows Setup Script
REM Run this script to install all dependencies

echo ============================================
echo MangaRecap AI - Windows Setup Script
echo ============================================
echo.

echo [1/4] Checking prerequisites...
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Python not found. Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo Python found.
echo.

echo [2/4] Setting up Python virtual environment...
echo.

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

echo.
echo [3/4] Installing Python dependencies...
echo.

REM Upgrade pip
python -m pip install --upgrade pip

REM Install requirements
pip install -r requirements.txt

echo.
echo [4/4] Additional setup required...
echo.

echo ============================================
echo IMPORTANT: Manual Installation Required
echo ============================================
echo.
echo Please install these tools manually:
echo.
echo 1. FFmpeg:
echo    - Download from: https://ffmpeg.org/download.html
echo    - Or use: winget install ffmpeg
echo    - Add to PATH environment variable
echo.
echo 2. Tesseract OCR:
echo    - Download from: https://github.com/UB-Mannheim/tesseract/wiki
echo    - Install to C:\Program Files\Tesseract-OCR
echo    - Add to PATH environment variable
echo.
echo ============================================
echo.
echo After installing FFmpeg and Tesseract:
echo.
echo   1. Open a new command prompt
echo   2. Navigate to this folder
echo   3. Run: venv\Scripts\activate.bat
echo   4. Run: python manga_recap.py --input your_manga.pdf --output recap.mp4
echo.
pause
