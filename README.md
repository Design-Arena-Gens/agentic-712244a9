# 🎬 MangaRecap AI

> Transform manga PDFs into engaging video recaps with AI-generated narration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Free](https://img.shields.io/badge/Cost-100%25%20Free-green.svg)](https://github.com)

## ✨ Features

- 📄 **PDF Extraction** - Extract high-quality images from manga PDFs
- 🎯 **Panel Detection** - Automatically identify manga panels using AI
- 📝 **Text Extraction** - OCR for dialogue and narration boxes
- 🎙️ **AI Narration** - Natural voiceover using free TTS engines
- 🎬 **Video Creation** - Ken Burns effects, transitions, and more
- 💰 **100% Free** - No API keys or paid services required
- 🔒 **Privacy** - All processing happens locally on your computer

## 🚀 Quick Start

### Web Interface

Visit the deployed web app for documentation and configuration:
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Local Processing (Recommended)

```bash
# 1. Navigate to local tools
cd local-tools

# 2. Run setup script
./setup.sh  # macOS/Linux
setup.bat   # Windows

# 3. Process your manga
python manga_recap.py --input manga.pdf --output recap.mp4
```

## 📋 Requirements

- Python 3.8+
- Node.js 16+ (for web interface)
- FFmpeg
- Tesseract OCR

## 🛠️ Installation

### System Dependencies

```bash
# macOS
brew install ffmpeg tesseract

# Ubuntu/Debian
sudo apt install ffmpeg tesseract-ocr

# Windows
winget install ffmpeg
# Download Tesseract from GitHub
```

### Python Dependencies

```bash
pip install pymupdf opencv-python pytesseract moviepy pillow numpy pyttsx3
```

## 📖 Usage

```bash
# Basic usage
python manga_recap.py --input manga.pdf --output recap.mp4

# With title
python manga_recap.py -i manga.pdf -o recap.mp4 --title "One Piece Ch. 1000"

# Custom settings
python manga_recap.py -i manga.pdf -o recap.mp4 \
  --max-pages 20 \
  --duration 3 \
  --resolution 1080p \
  --tts-engine pyttsx3
```

## 📁 Project Structure

```
manga-recap-generator/
├── app/                      # Next.js web interface
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── local-tools/              # Python processing tools
│   ├── manga_recap.py        # Main processing script
│   ├── requirements.txt
│   ├── setup.sh
│   └── setup.bat
├── TECHNICAL_SPECIFICATION.md
├── package.json
└── README.md
```

## 🔧 Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `--input, -i` | Input PDF file | Required |
| `--output, -o` | Output video file | Required |
| `--title, -t` | Video title | "Manga Recap" |
| `--max-pages, -m` | Max pages to process | 50 |
| `--duration, -d` | Seconds per scene | 5.0 |
| `--resolution` | 720p, 1080p, 4k | 1080p |
| `--tts-engine` | pyttsx3, piper, espeak | pyttsx3 |
| `--ocr-lang` | OCR language codes | eng |

## 📚 Documentation

For complete technical documentation, see [TECHNICAL_SPECIFICATION.md](./TECHNICAL_SPECIFICATION.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [PyMuPDF](https://pymupdf.readthedocs.io/) - PDF processing
- [OpenCV](https://opencv.org/) - Image analysis
- [Tesseract](https://github.com/tesseract-ocr/tesseract) - OCR
- [Piper TTS](https://github.com/rhasspy/piper) - Text-to-speech
- [FFmpeg](https://ffmpeg.org/) - Video encoding
- [MoviePy](https://zulko.github.io/moviepy/) - Video editing