#!/bin/bash
# MangaRecap AI - Setup Script
# Run this script to install all dependencies

set -e

echo "============================================"
echo "MangaRecap AI - Setup Script"
echo "============================================"
echo ""

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
fi

echo "Detected OS: $OS"
echo ""

# Install system dependencies
echo "[1/4] Installing system dependencies..."
echo ""

if [ "$OS" == "macos" ]; then
    # macOS - using Homebrew
    if ! command -v brew &> /dev/null; then
        echo "Homebrew not found. Please install it first:"
        echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
        exit 1
    fi
    
    echo "Installing FFmpeg..."
    brew install ffmpeg || true
    
    echo "Installing Tesseract OCR..."
    brew install tesseract || true
    
    echo "Installing espeak..."
    brew install espeak || true
    
elif [ "$OS" == "linux" ]; then
    # Linux - using apt
    echo "Installing FFmpeg, Tesseract, and espeak..."
    sudo apt update
    sudo apt install -y ffmpeg tesseract-ocr espeak libespeak-dev
    
    # Install additional Tesseract languages
    echo "Installing additional OCR languages..."
    sudo apt install -y tesseract-ocr-jpn tesseract-ocr-chi-sim || true
fi

echo ""
echo "[2/4] Setting up Python virtual environment..."
echo ""

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

echo ""
echo "[3/4] Installing Python dependencies..."
echo ""

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

echo ""
echo "[4/4] Verifying installation..."
echo ""

# Verify installations
echo "Checking FFmpeg..."
ffmpeg -version | head -1

echo ""
echo "Checking Tesseract..."
tesseract --version | head -1

echo ""
echo "Checking Python packages..."
python3 -c "import fitz; print(f'PyMuPDF: {fitz.__doc__}')"
python3 -c "import cv2; print(f'OpenCV: {cv2.__version__}')"
python3 -c "import pytesseract; print('pytesseract: OK')"
python3 -c "import moviepy; print('moviepy: OK')"
python3 -c "import pyttsx3; print('pyttsx3: OK')"

echo ""
echo "============================================"
echo "✓ Setup complete!"
echo "============================================"
echo ""
echo "To use MangaRecap AI:"
echo ""
echo "  1. Activate the virtual environment:"
echo "     source venv/bin/activate"
echo ""
echo "  2. Run the script:"
echo "     python manga_recap.py --input your_manga.pdf --output recap.mp4"
echo ""
echo "  3. For help:"
echo "     python manga_recap.py --help"
echo ""
