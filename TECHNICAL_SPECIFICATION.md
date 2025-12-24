# MangaRecap AI - Technical Specification Document

## Complete Solution for Manga-to-Video Recap Generation

**Version:** 1.0  
**Date:** December 2024  
**License:** MIT (Free and Open Source)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Component Specifications](#3-component-specifications)
4. [Free Tools and APIs](#4-free-tools-and-apis)
5. [Installation Guide](#5-installation-guide)
6. [Usage Instructions](#6-usage-instructions)
7. [Code Reference](#7-code-reference)
8. [Performance Optimization](#8-performance-optimization)
9. [Troubleshooting](#9-troubleshooting)
10. [Deployment Options](#10-deployment-options)

---

## 1. Executive Summary

### Overview

MangaRecap AI is a complete, free, and open-source solution for converting manga PDF files into engaging video recaps with AI-generated voiceover narration. The system is designed to run entirely locally on a user's computer without requiring any paid services or API keys.

### Key Features

- ✅ **100% Free** - No paid APIs or subscriptions required
- ✅ **Runs Locally** - All processing happens on your computer
- ✅ **AI Narration** - Natural-sounding voiceover using free TTS engines
- ✅ **Scene Detection** - Automatically identifies manga panels
- ✅ **Text Extraction** - OCR for dialogue and narration
- ✅ **Video Effects** - Ken Burns pan/zoom for cinematic feel
- ✅ **Easy to Use** - Simple command-line interface

### Target Users

- Manga recap YouTube channel creators
- Content creators who want to create manga summaries
- Anyone who wants to convert static manga into video format

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MangaRecap AI System                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐                                                   │
│   │   INPUT     │                                                   │
│   │  Manga PDF  │                                                   │
│   └──────┬──────┘                                                   │
│          │                                                          │
│          ▼                                                          │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │              PROCESSING PIPELINE                          │     │
│   │                                                           │     │
│   │  ┌────────────┐    ┌────────────┐    ┌────────────┐     │     │
│   │  │    PDF     │    │   Panel    │    │    Text    │     │     │
│   │  │ Extraction │───▶│ Detection  │───▶│ Extraction │     │     │
│   │  │ (PyMuPDF)  │    │  (OpenCV)  │    │(Tesseract) │     │     │
│   │  └────────────┘    └────────────┘    └────────────┘     │     │
│   │                                              │            │     │
│   │                                              ▼            │     │
│   │  ┌────────────┐    ┌────────────┐    ┌────────────┐     │     │
│   │  │   Video    │    │    TTS     │    │   Script   │     │     │
│   │  │ Generator  │◀───│ Generation │◀───│ Generator  │     │     │
│   │  │  (FFmpeg)  │    │  (Piper)   │    │            │     │     │
│   │  └────────────┘    └────────────┘    └────────────┘     │     │
│   │                                                           │     │
│   └──────────────────────────────────────────────────────────┘     │
│          │                                                          │
│          ▼                                                          │
│   ┌─────────────┐                                                   │
│   │   OUTPUT    │                                                   │
│   │  MP4 Video  │                                                   │
│   └─────────────┘                                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Input**: User provides manga PDF file
2. **PDF Extraction**: Each page converted to high-resolution PNG images
3. **Panel Detection**: OpenCV identifies individual manga panels
4. **Text Extraction**: Tesseract OCR reads dialogue and text
5. **Script Generation**: Text formatted into narration script
6. **TTS Generation**: Script converted to audio narration
7. **Video Creation**: Images combined with audio, effects added
8. **Output**: Final MP4 video file

---

## 3. Component Specifications

### 3.1 PDF Extractor

**Purpose**: Extract high-quality images from manga PDF files

**Technology**: PyMuPDF (fitz)

**Specifications**:
- Input: PDF file (any size)
- Output: PNG images at configurable DPI (default: 150)
- Memory usage: ~50MB per page at 150 DPI

**Key Features**:
- Handles multi-page PDFs
- Preserves image quality
- Progress reporting

```python
# Core extraction logic
def extract_pages(pdf_path, output_dir, dpi=150):
    doc = fitz.open(pdf_path)
    zoom = dpi / 72
    mat = fitz.Matrix(zoom, zoom)
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(matrix=mat)
        pix.save(f"{output_dir}/page_{page_num:04d}.png")
```

### 3.2 Panel Detector

**Purpose**: Identify and extract individual manga panels

**Technology**: OpenCV

**Algorithm**:
1. Convert to grayscale
2. Apply binary threshold (white backgrounds)
3. Morphological operations to clean noise
4. Find contours
5. Filter by minimum area
6. Sort by reading order (top-to-bottom, right-to-left)

**Specifications**:
- Minimum panel area: 10,000 pixels (configurable)
- Supports various panel layouts
- Handles gutters and margins

### 3.3 Text Extractor (OCR)

**Purpose**: Extract dialogue and narration text from panels

**Technology**: Tesseract OCR

**Features**:
- Multiple language support (English, Japanese, Chinese)
- Adaptive thresholding for better accuracy
- Configurable PSM (Page Segmentation Mode)

**Languages**:
- `eng` - English (default)
- `jpn` - Japanese
- `chi_sim` - Simplified Chinese
- Combine: `eng+jpn` for multi-language

### 3.4 Script Generator

**Purpose**: Create natural narration script from extracted text

**Features**:
- Automatic intro/outro generation
- Page transition markers
- Text cleanup and formatting
- Dialogue formatting

### 3.5 Voice Generator (TTS)

**Purpose**: Generate natural AI voiceover

**Supported Engines**:

| Engine | Quality | Speed | Offline | Install Difficulty |
|--------|---------|-------|---------|-------------------|
| pyttsx3 | Basic | Fast | Yes | Easy |
| Piper | High | Medium | Yes | Medium |
| Coqui TTS | Very High | Slow | Yes | Medium |
| espeak | Basic | Very Fast | Yes | Easy |

**Default**: pyttsx3 (most compatible, works on all systems)

**Recommended**: Piper TTS (best quality for narration)

### 3.6 Video Generator

**Purpose**: Create final video with effects and audio

**Technology**: MoviePy + FFmpeg

**Features**:
- Ken Burns effect (pan and zoom)
- Title cards and outros
- Audio synchronization
- Multiple resolution support (720p, 1080p, 4K)

**Video Specifications**:
- Codec: H.264 (libx264)
- Audio: AAC
- FPS: 30 (configurable)
- Preset: medium (balance of speed/quality)

---

## 4. Free Tools and APIs

### All tools are 100% free and open source

| Tool | Purpose | License | Size |
|------|---------|---------|------|
| PyMuPDF | PDF processing | AGPL | ~15MB |
| OpenCV | Image analysis | Apache 2.0 | ~50MB |
| Tesseract | OCR | Apache 2.0 | ~40MB |
| Piper TTS | Voice synthesis | MIT | ~50MB |
| FFmpeg | Video encoding | LGPL | ~100MB |
| MoviePy | Video editing | MIT | ~5MB |
| pyttsx3 | System TTS | MIT | ~1MB |

### Total Dependencies: ~260MB

### No API Keys Required

All processing happens locally. No internet connection needed after installation.

---

## 5. Installation Guide

### System Requirements

**Minimum**:
- CPU: 4 cores, 2.5 GHz
- RAM: 8 GB
- Storage: 5 GB free
- OS: Windows 10, macOS 10.15, Ubuntu 20.04

**Recommended**:
- CPU: 8 cores, 3.5 GHz
- RAM: 16 GB
- Storage: 20 GB free
- GPU: NVIDIA with CUDA (optional, for faster processing)

### Installation Steps

#### macOS

```bash
# 1. Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install system dependencies
brew install ffmpeg tesseract espeak

# 3. Install Python dependencies
pip install pymupdf opencv-python pytesseract moviepy pillow numpy pyttsx3

# 4. (Optional) Install Piper for better voices
pip install piper-tts
```

#### Ubuntu/Debian Linux

```bash
# 1. Install system dependencies
sudo apt update
sudo apt install -y ffmpeg tesseract-ocr espeak libespeak-dev

# 2. Install Python dependencies
pip install pymupdf opencv-python pytesseract moviepy pillow numpy pyttsx3

# 3. (Optional) Install Japanese OCR
sudo apt install tesseract-ocr-jpn
```

#### Windows

1. **Install Python 3.8+** from https://python.org
2. **Install FFmpeg**:
   - Download from https://ffmpeg.org/download.html
   - Or run: `winget install ffmpeg`
   - Add to PATH
3. **Install Tesseract**:
   - Download from https://github.com/UB-Mannheim/tesseract/wiki
   - Install to `C:\Program Files\Tesseract-OCR`
   - Add to PATH
4. **Install Python packages**:
   ```cmd
   pip install pymupdf opencv-python pytesseract moviepy pillow numpy pyttsx3
   ```

### Quick Setup (Using Script)

```bash
# Clone or download the project
cd local-tools

# macOS/Linux
chmod +x setup.sh
./setup.sh

# Windows
setup.bat
```

---

## 6. Usage Instructions

### Basic Usage

```bash
# Simple conversion
python manga_recap.py --input manga.pdf --output recap.mp4

# With custom title
python manga_recap.py --input manga.pdf --output recap.mp4 --title "One Piece Chapter 1000"

# Limit pages (for testing)
python manga_recap.py --input manga.pdf --output recap.mp4 --max-pages 10

# Custom scene duration
python manga_recap.py --input manga.pdf --output recap.mp4 --duration 3
```

### All Options

```
usage: manga_recap.py [-h] --input INPUT --output OUTPUT [--title TITLE]
                      [--max-pages MAX_PAGES] [--duration DURATION]
                      [--resolution {720p,1080p,4k}]
                      [--tts-engine {pyttsx3,piper,espeak}]
                      [--ocr-lang OCR_LANG]

options:
  -h, --help            Show help message
  --input, -i           Input manga PDF file (required)
  --output, -o          Output video file (required)
  --title, -t           Video title (default: 'Manga Recap')
  --max-pages, -m       Maximum pages to process (default: 50)
  --duration, -d        Duration per scene in seconds (default: 5.0)
  --resolution          Output resolution: 720p, 1080p, 4k (default: 1080p)
  --tts-engine          TTS engine: pyttsx3, piper, espeak (default: pyttsx3)
  --ocr-lang            OCR language codes (default: 'eng')
```

### Examples

```bash
# Japanese manga with Japanese+English OCR
python manga_recap.py -i naruto.pdf -o naruto_recap.mp4 --ocr-lang eng+jpn

# Quick test with 5 pages
python manga_recap.py -i manga.pdf -o test.mp4 --max-pages 5 --duration 2

# 4K output for high quality
python manga_recap.py -i manga.pdf -o hq_recap.mp4 --resolution 4k

# Using Piper for better voice quality
python manga_recap.py -i manga.pdf -o recap.mp4 --tts-engine piper
```

---

## 7. Code Reference

### Project Structure

```
manga-recap-generator/
├── app/                      # Next.js web interface
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page with UI
│   └── globals.css          # Styles
├── local-tools/             # Python processing tools
│   ├── manga_recap.py       # Main processing script
│   ├── requirements.txt     # Python dependencies
│   ├── setup.sh             # macOS/Linux setup
│   └── setup.bat            # Windows setup
├── TECHNICAL_SPECIFICATION.md  # This document
├── package.json             # Node.js dependencies
└── README.md                # Quick start guide
```

### Key Classes

#### PDFExtractor
```python
class PDFExtractor:
    def __init__(self, dpi: int = 150)
    def extract_pages(self, pdf_path: str, output_dir: str) -> List[str]
```

#### PanelDetector
```python
class PanelDetector:
    def __init__(self, min_panel_area: int = 10000)
    def detect_panels(self, image_path: str, page_num: int) -> List[Panel]
    def extract_panel_images(self, image_path: str, panels: List[Panel], output_dir: str) -> List[Panel]
```

#### TextExtractor
```python
class TextExtractor:
    def __init__(self, languages: str = "eng")
    def extract_text(self, image_path: str) -> str
    def extract_from_panels(self, panels: List[Panel]) -> List[Panel]
```

#### VoiceGenerator
```python
class VoiceGenerator:
    def __init__(self, engine: str = "pyttsx3")
    def generate(self, text: str, output_path: str) -> str
```

#### VideoGenerator
```python
class VideoGenerator:
    def __init__(self, resolution: Tuple[int, int], fps: int = 30)
    def create_video(self, scenes: List[Scene], audio_path: str, output_path: str, title: str) -> str
```

#### MangaRecapPipeline
```python
class MangaRecapPipeline:
    def __init__(self, resolution, tts_engine, ocr_languages)
    def process(self, pdf_path: str, output_path: str, title: str, max_pages: int, scene_duration: float) -> str
```

---

## 8. Performance Optimization

### Processing Times (Estimates)

| PDF Size | Pages | Processing Time | Output Size |
|----------|-------|-----------------|-------------|
| 10 pages | 10 | ~2 minutes | ~50MB |
| 50 pages | 50 | ~10 minutes | ~200MB |
| 100 pages | 100 | ~20 minutes | ~400MB |
| 200 pages | 200 | ~45 minutes | ~800MB |

*Times based on recommended hardware specifications*

### Optimization Tips

1. **Reduce DPI** for faster extraction:
   ```python
   PDFExtractor(dpi=100)  # Lower quality, faster
   ```

2. **Limit pages** for testing:
   ```bash
   python manga_recap.py -i manga.pdf -o test.mp4 --max-pages 10
   ```

3. **Use 720p** for faster encoding:
   ```bash
   python manga_recap.py -i manga.pdf -o recap.mp4 --resolution 720p
   ```

4. **Use faster TTS**:
   ```bash
   python manga_recap.py -i manga.pdf -o recap.mp4 --tts-engine espeak
   ```

5. **GPU acceleration** (if available):
   - Install CUDA toolkit
   - FFmpeg will automatically use GPU encoding

### Memory Management

The pipeline uses temporary directories that are automatically cleaned up. For very large PDFs (500+ pages), consider:

1. Processing in batches
2. Increasing system swap/virtual memory
3. Reducing DPI

---

## 9. Troubleshooting

### Common Issues

#### "FFmpeg not found"

**Solution**: Install FFmpeg and add to PATH

```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt install ffmpeg

# Windows
winget install ffmpeg
# Then restart terminal
```

#### "Tesseract not found"

**Solution**: Install Tesseract OCR

```bash
# macOS
brew install tesseract

# Ubuntu
sudo apt install tesseract-ocr

# Windows
# Download installer from GitHub
```

#### "No module named 'fitz'"

**Solution**: Install PyMuPDF

```bash
pip install pymupdf
```

#### Poor OCR accuracy

**Solutions**:
1. Increase DPI: `PDFExtractor(dpi=200)`
2. Use correct language: `--ocr-lang eng+jpn`
3. Clean source PDF (higher quality scans)

#### Video has no audio

**Causes**:
- TTS engine not installed
- Audio generation failed

**Solutions**:
1. Install espeak as fallback: `apt install espeak`
2. Check error messages in output
3. Try different TTS engine: `--tts-engine espeak`

#### Out of memory

**Solutions**:
1. Reduce max pages: `--max-pages 20`
2. Lower resolution: `--resolution 720p`
3. Lower DPI in code
4. Increase system swap

### Debug Mode

For detailed error information, modify the script:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## 10. Deployment Options

### Option 1: Local Installation (Recommended)

Best for: Regular users who want full control

- ✅ Complete privacy - all processing local
- ✅ No usage limits
- ✅ No internet required after setup
- ⚠️ Requires ~5GB disk space

### Option 2: Web Interface + Local Processing

Best for: Users who prefer a GUI

The project includes a Next.js web interface that can be:
1. Run locally (`npm run dev`)
2. Deployed to Vercel (UI only, shows documentation)
3. Self-hosted on any Node.js server

### Option 3: Docker Container

For consistent environments across systems:

```dockerfile
# Dockerfile example
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    ffmpeg tesseract-ocr espeak libespeak-dev

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY manga_recap.py .

ENTRYPOINT ["python", "manga_recap.py"]
```

```bash
docker build -t manga-recap .
docker run -v $(pwd):/data manga-recap -i /data/manga.pdf -o /data/recap.mp4
```

### Web Deployment (UI Only)

The web interface can be deployed to Vercel:

```bash
vercel deploy --prod
```

Note: The web interface provides documentation and configuration UI. Actual video processing requires the local Python tools due to resource requirements.

---

## Appendix A: License Information

This project is licensed under the MIT License.

All dependencies use permissive open-source licenses:
- PyMuPDF: AGPL (free for personal use)
- OpenCV: Apache 2.0
- Tesseract: Apache 2.0
- FFmpeg: LGPL
- MoviePy: MIT
- Piper: MIT

---

## Appendix B: Contributing

Contributions are welcome! Areas for improvement:

1. **Better panel detection** - Machine learning models
2. **Character recognition** - Identify recurring characters
3. **Emotion detection** - Adjust narration tone
4. **Multi-language support** - More TTS voices
5. **GUI application** - Desktop app with Electron

---

## Appendix C: Changelog

### Version 1.0 (December 2024)
- Initial release
- PDF extraction with PyMuPDF
- Panel detection with OpenCV
- OCR with Tesseract
- TTS with pyttsx3/Piper/espeak
- Video generation with MoviePy/FFmpeg
- Web interface with Next.js

---

*Document generated by MangaRecap AI Technical Team*
*For support, please open an issue on GitHub*
