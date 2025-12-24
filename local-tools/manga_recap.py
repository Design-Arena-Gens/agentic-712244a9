#!/usr/bin/env python3
"""
MangaRecap AI - Complete Pipeline
Convert manga PDFs into video recaps with AI narration.

Usage:
    python manga_recap.py --input manga.pdf --output recap.mp4

Requirements:
    pip install pymupdf opencv-python pytesseract moviepy pillow numpy piper-tts
    
    Also install:
    - FFmpeg (brew install ffmpeg / apt install ffmpeg)
    - Tesseract OCR (brew install tesseract / apt install tesseract-ocr)
"""

import argparse
import os
import sys
import json
import tempfile
import subprocess
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Tuple
from pathlib import Path

# Check dependencies
def check_dependencies():
    """Check if all required dependencies are installed."""
    missing = []
    
    try:
        import fitz
    except ImportError:
        missing.append("pymupdf")
    
    try:
        import cv2
    except ImportError:
        missing.append("opencv-python")
    
    try:
        import pytesseract
    except ImportError:
        missing.append("pytesseract")
    
    try:
        from moviepy.editor import ImageClip
    except ImportError:
        missing.append("moviepy")
    
    try:
        from PIL import Image
    except ImportError:
        missing.append("pillow")
    
    try:
        import numpy
    except ImportError:
        missing.append("numpy")
    
    # Check FFmpeg
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        missing.append("ffmpeg (system install)")
    
    if missing:
        print("Missing dependencies:")
        for dep in missing:
            print(f"  - {dep}")
        print("\nInstall with: pip install pymupdf opencv-python pytesseract moviepy pillow numpy")
        print("Also install FFmpeg: brew install ffmpeg (macOS) or apt install ffmpeg (Linux)")
        sys.exit(1)

# Run dependency check
check_dependencies()

import fitz  # PyMuPDF
import cv2
import numpy as np
from PIL import Image
import pytesseract
from moviepy.editor import (
    ImageClip, AudioFileClip, CompositeVideoClip,
    concatenate_videoclips, TextClip, ColorClip
)

# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class Panel:
    """Represents a single manga panel."""
    x: int
    y: int
    width: int
    height: int
    page_num: int
    panel_num: int
    image_path: Optional[str] = None
    text: str = ""

@dataclass
class Scene:
    """Represents a scene for video generation."""
    image_path: str
    duration: float
    text: str
    effect: str = "ken_burns"
    
# ============================================================================
# PDF EXTRACTION
# ============================================================================

class PDFExtractor:
    """Extract pages from manga PDF files."""
    
    def __init__(self, dpi: int = 150):
        self.dpi = dpi
    
    def extract_pages(self, pdf_path: str, output_dir: str) -> List[str]:
        """
        Extract all pages from PDF as images.
        
        Args:
            pdf_path: Path to the PDF file
            output_dir: Directory to save images
            
        Returns:
            List of paths to extracted images
        """
        os.makedirs(output_dir, exist_ok=True)
        doc = fitz.open(pdf_path)
        extracted = []
        
        print(f"Extracting {len(doc)} pages from PDF...")
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            
            # Calculate zoom for desired DPI
            zoom = self.dpi / 72
            mat = fitz.Matrix(zoom, zoom)
            
            # Render to pixmap
            pix = page.get_pixmap(matrix=mat)
            
            # Save image
            output_path = os.path.join(output_dir, f"page_{page_num:04d}.png")
            pix.save(output_path)
            extracted.append(output_path)
            
            # Progress
            if (page_num + 1) % 10 == 0:
                print(f"  Extracted {page_num + 1}/{len(doc)} pages")
        
        doc.close()
        print(f"✓ Extracted {len(extracted)} pages")
        return extracted

# ============================================================================
# PANEL DETECTION
# ============================================================================

class PanelDetector:
    """Detect and extract individual panels from manga pages."""
    
    def __init__(self, min_panel_area: int = 10000):
        self.min_panel_area = min_panel_area
    
    def detect_panels(self, image_path: str, page_num: int = 0) -> List[Panel]:
        """
        Detect panels in a manga page.
        
        Args:
            image_path: Path to the page image
            page_num: Page number for tracking
            
        Returns:
            List of Panel objects
        """
        img = cv2.imread(image_path)
        if img is None:
            return []
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Binary threshold
        _, binary = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        
        # Morphological operations to clean up
        kernel = np.ones((5, 5), np.uint8)
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(
            binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        
        panels = []
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if area < self.min_panel_area:
                continue
            
            x, y, w, h = cv2.boundingRect(contour)
            
            panels.append(Panel(
                x=x, y=y, width=w, height=h,
                page_num=page_num, panel_num=i
            ))
        
        # Sort: top-to-bottom, right-to-left (manga reading order)
        panels.sort(key=lambda p: (p.y // 100, -p.x))
        
        return panels
    
    def extract_panel_images(
        self,
        image_path: str,
        panels: List[Panel],
        output_dir: str
    ) -> List[Panel]:
        """Extract and save individual panel images."""
        os.makedirs(output_dir, exist_ok=True)
        img = cv2.imread(image_path)
        
        for panel in panels:
            panel_img = img[
                panel.y:panel.y + panel.height,
                panel.x:panel.x + panel.width
            ]
            
            output_path = os.path.join(
                output_dir,
                f"panel_p{panel.page_num:04d}_n{panel.panel_num:02d}.png"
            )
            cv2.imwrite(output_path, panel_img)
            panel.image_path = output_path
        
        return panels

# ============================================================================
# TEXT EXTRACTION (OCR)
# ============================================================================

class TextExtractor:
    """Extract text from manga panels using OCR."""
    
    def __init__(self, languages: str = "eng"):
        """
        Initialize text extractor.
        
        Args:
            languages: Tesseract language codes (e.g., 'eng', 'jpn', 'eng+jpn')
        """
        self.languages = languages
    
    def extract_text(self, image_path: str) -> str:
        """Extract text from an image using OCR."""
        img = cv2.imread(image_path)
        if img is None:
            return ""
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Adaptive thresholding for better OCR
        processed = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            11, 2
        )
        
        # OCR
        try:
            text = pytesseract.image_to_string(
                processed,
                lang=self.languages,
                config='--psm 6'
            )
            return text.strip()
        except Exception as e:
            print(f"OCR error: {e}")
            return ""
    
    def extract_from_panels(self, panels: List[Panel]) -> List[Panel]:
        """Extract text from all panels."""
        for panel in panels:
            if panel.image_path:
                panel.text = self.extract_text(panel.image_path)
        return panels

# ============================================================================
# NARRATION SCRIPT GENERATOR
# ============================================================================

class ScriptGenerator:
    """Generate narration scripts from extracted manga content."""
    
    def __init__(self):
        self.templates = {
            "intro": "Welcome to today's manga recap. Let's dive into the story.",
            "transition": "Meanwhile...",
            "action": "In a dramatic turn of events...",
            "dialogue": "{text}",
            "outro": "And that concludes this chapter. Don't forget to like and subscribe!"
        }
    
    def generate_script(
        self,
        panels: List[Panel],
        title: str = "Manga Chapter"
    ) -> str:
        """
        Generate a narration script from panel data.
        
        Args:
            panels: List of panels with extracted text
            title: Chapter/manga title
            
        Returns:
            Full narration script
        """
        script_parts = [
            f"Welcome to the recap of {title}. Let's see what happens in this chapter."
        ]
        
        current_page = -1
        for panel in panels:
            # Page transition
            if panel.page_num != current_page:
                current_page = panel.page_num
                if panel.page_num > 0:
                    script_parts.append("Moving on to the next page...")
            
            # Add panel text
            if panel.text:
                # Clean up text
                text = self.clean_text(panel.text)
                if text:
                    script_parts.append(text)
        
        script_parts.append(
            "And that's the end of this chapter. "
            "Thanks for watching, and don't forget to subscribe for more manga recaps!"
        )
        
        return " ... ".join(script_parts)
    
    def clean_text(self, text: str) -> str:
        """Clean OCR text for narration."""
        # Remove excessive whitespace
        text = " ".join(text.split())
        
        # Remove common OCR artifacts
        replacements = {
            "|": "I",
            "0": "O",  # Context-dependent, simplified
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        return text

# ============================================================================
# TEXT-TO-SPEECH
# ============================================================================

class VoiceGenerator:
    """Generate voiceover narration using various TTS engines."""
    
    def __init__(self, engine: str = "pyttsx3"):
        """
        Initialize voice generator.
        
        Args:
            engine: TTS engine to use ('pyttsx3', 'piper', 'espeak')
        """
        self.engine = engine
    
    def generate(self, text: str, output_path: str) -> str:
        """
        Generate audio narration from text.
        
        Args:
            text: Narration text
            output_path: Path to save audio file
            
        Returns:
            Path to generated audio
        """
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        if self.engine == "piper":
            return self._generate_piper(text, output_path)
        elif self.engine == "espeak":
            return self._generate_espeak(text, output_path)
        else:
            return self._generate_pyttsx3(text, output_path)
    
    def _generate_pyttsx3(self, text: str, output_path: str) -> str:
        """Generate using pyttsx3 (system TTS)."""
        try:
            import pyttsx3
            
            engine = pyttsx3.init()
            engine.setProperty('rate', 150)
            engine.setProperty('volume', 0.9)
            
            # Get available voices and select a good one
            voices = engine.getProperty('voices')
            if voices:
                # Try to find an English voice
                for voice in voices:
                    if 'english' in voice.name.lower():
                        engine.setProperty('voice', voice.id)
                        break
            
            engine.save_to_file(text, output_path)
            engine.runAndWait()
            
            print(f"✓ Generated audio with pyttsx3: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"pyttsx3 error: {e}")
            # Fallback to espeak
            return self._generate_espeak(text, output_path)
    
    def _generate_piper(self, text: str, output_path: str) -> str:
        """Generate using Piper TTS (high quality, offline)."""
        try:
            # Check if piper is available
            result = subprocess.run(
                ["piper", "--help"],
                capture_output=True
            )
            
            # Find model file
            model_paths = [
                "en_US-lessac-medium.onnx",
                "~/.local/share/piper/voices/en_US-lessac-medium.onnx",
                "/usr/share/piper-voices/en_US-lessac-medium.onnx"
            ]
            
            model_path = None
            for path in model_paths:
                expanded = os.path.expanduser(path)
                if os.path.exists(expanded):
                    model_path = expanded
                    break
            
            if not model_path:
                print("Piper model not found, falling back to system TTS")
                return self._generate_pyttsx3(text, output_path)
            
            # Generate with Piper
            process = subprocess.Popen(
                [
                    "piper",
                    "--model", model_path,
                    "--output_file", output_path
                ],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            stdout, stderr = process.communicate(input=text.encode('utf-8'))
            
            if process.returncode == 0:
                print(f"✓ Generated audio with Piper: {output_path}")
                return output_path
            else:
                raise Exception(stderr.decode())
                
        except Exception as e:
            print(f"Piper error: {e}, falling back to system TTS")
            return self._generate_pyttsx3(text, output_path)
    
    def _generate_espeak(self, text: str, output_path: str) -> str:
        """Generate using espeak (basic, widely available)."""
        try:
            # Ensure .wav extension for espeak
            if not output_path.endswith('.wav'):
                output_path = output_path.rsplit('.', 1)[0] + '.wav'
            
            subprocess.run([
                "espeak",
                "-v", "en",
                "-s", "150",
                "-w", output_path,
                text
            ], check=True)
            
            print(f"✓ Generated audio with espeak: {output_path}")
            return output_path
            
        except FileNotFoundError:
            print("espeak not found. Install with: apt install espeak")
            # Create silent audio as last resort
            return self._create_silent_audio(output_path, len(text) * 0.05)
        except Exception as e:
            print(f"espeak error: {e}")
            return self._create_silent_audio(output_path, len(text) * 0.05)
    
    def _create_silent_audio(self, output_path: str, duration: float) -> str:
        """Create silent audio file as fallback."""
        try:
            subprocess.run([
                "ffmpeg", "-y",
                "-f", "lavfi",
                "-i", f"anullsrc=r=44100:cl=mono",
                "-t", str(duration),
                "-acodec", "pcm_s16le",
                output_path
            ], check=True, capture_output=True)
            print(f"Created silent audio placeholder: {output_path}")
        except:
            pass
        return output_path

# ============================================================================
# VIDEO GENERATOR
# ============================================================================

class VideoGenerator:
    """Generate manga recap videos with effects and narration."""
    
    def __init__(
        self,
        resolution: Tuple[int, int] = (1920, 1080),
        fps: int = 30
    ):
        self.resolution = resolution
        self.fps = fps
    
    def create_video(
        self,
        scenes: List[Scene],
        audio_path: Optional[str],
        output_path: str,
        title: str = "Manga Recap"
    ) -> str:
        """
        Create manga recap video.
        
        Args:
            scenes: List of Scene objects
            audio_path: Path to narration audio
            output_path: Path to save video
            title: Video title
            
        Returns:
            Path to output video
        """
        print(f"Creating video with {len(scenes)} scenes...")
        
        clips = []
        
        # Title card
        title_clip = self._create_title_card(title, duration=3)
        clips.append(title_clip)
        
        # Scene clips with effects
        pan_directions = ['right', 'left']
        for i, scene in enumerate(scenes):
            try:
                clip = self._create_scene_clip(
                    scene.image_path,
                    scene.duration,
                    pan_directions[i % 2]
                )
                clips.append(clip)
                
                if (i + 1) % 10 == 0:
                    print(f"  Processed {i + 1}/{len(scenes)} scenes")
            except Exception as e:
                print(f"Error processing scene {i}: {e}")
                continue
        
        # Outro card
        outro_clip = self._create_title_card(
            "Thanks for watching!\nSubscribe for more",
            duration=3,
            bg_color=(30, 30, 50)
        )
        clips.append(outro_clip)
        
        # Concatenate clips
        print("Concatenating clips...")
        final = concatenate_videoclips(clips, method='compose')
        
        # Add audio if available
        if audio_path and os.path.exists(audio_path):
            print("Adding audio narration...")
            try:
                audio = AudioFileClip(audio_path)
                
                # Adjust durations to match
                if audio.duration > final.duration:
                    final = final.set_duration(audio.duration)
                
                final = final.set_audio(audio)
            except Exception as e:
                print(f"Audio error: {e}")
        
        # Write output
        print(f"Rendering video to {output_path}...")
        final.write_videofile(
            output_path,
            fps=self.fps,
            codec='libx264',
            audio_codec='aac',
            threads=4,
            preset='medium',
            verbose=False,
            logger=None
        )
        
        # Cleanup
        final.close()
        for clip in clips:
            clip.close()
        
        print(f"✓ Video saved to: {output_path}")
        return output_path
    
    def _create_title_card(
        self,
        text: str,
        duration: float = 3,
        bg_color: Tuple[int, int, int] = (26, 26, 46)
    ) -> CompositeVideoClip:
        """Create a title card clip."""
        # Background
        bg = ColorClip(
            size=self.resolution,
            color=bg_color
        ).set_duration(duration)
        
        # Text (using simple approach without TextClip for compatibility)
        # Create text image with PIL
        from PIL import Image, ImageDraw, ImageFont
        
        img = Image.new('RGB', self.resolution, bg_color)
        draw = ImageDraw.Draw(img)
        
        # Try to use a nice font, fall back to default
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        except:
            try:
                font = ImageFont.truetype("Arial Bold", 60)
            except:
                font = ImageFont.load_default()
        
        # Calculate text position (center)
        lines = text.split('\n')
        total_height = len(lines) * 70
        y_start = (self.resolution[1] - total_height) // 2
        
        for i, line in enumerate(lines):
            # Get text bounding box for centering
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            x = (self.resolution[0] - text_width) // 2
            y = y_start + i * 70
            draw.text((x, y), line, fill=(255, 107, 107), font=font)
        
        # Save temp image and create clip
        temp_path = tempfile.mktemp(suffix='.png')
        img.save(temp_path)
        
        clip = ImageClip(temp_path).set_duration(duration)
        os.unlink(temp_path)
        
        return clip
    
    def _create_scene_clip(
        self,
        image_path: str,
        duration: float,
        pan_direction: str = 'right'
    ) -> ImageClip:
        """Create a scene clip with Ken Burns effect."""
        # Load and resize image
        img = Image.open(image_path)
        
        # Calculate aspect ratios
        img_ratio = img.width / img.height
        target_ratio = self.resolution[0] / self.resolution[1]
        
        # Resize to cover the frame with some extra for pan/zoom
        scale = 1.3
        if img_ratio > target_ratio:
            new_height = int(self.resolution[1] * scale)
            new_width = int(new_height * img_ratio)
        else:
            new_width = int(self.resolution[0] * scale)
            new_height = int(new_width / img_ratio)
        
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(img)
        
        # Create clip with zoom/pan effect
        def make_frame(t):
            progress = t / duration
            
            # Zoom from 1.0 to 1.1
            zoom = 1.0 + 0.1 * progress
            
            # Calculate crop size
            crop_w = int(self.resolution[0] / zoom)
            crop_h = int(self.resolution[1] / zoom)
            
            # Pan position
            max_x = new_width - crop_w
            max_y = new_height - crop_h
            
            if pan_direction == 'right':
                x = int(max_x * progress) if max_x > 0 else 0
            else:
                x = int(max_x * (1 - progress)) if max_x > 0 else 0
            
            y = max_y // 2 if max_y > 0 else 0
            
            # Crop
            cropped = img_array[y:y+crop_h, x:x+crop_w]
            
            # Resize to target resolution
            resized = cv2.resize(
                cropped,
                self.resolution,
                interpolation=cv2.INTER_LINEAR
            )
            
            return resized
        
        clip = ImageClip(make_frame, duration=duration)
        return clip

# ============================================================================
# MAIN PIPELINE
# ============================================================================

class MangaRecapPipeline:
    """Complete manga to video recap pipeline."""
    
    def __init__(
        self,
        resolution: Tuple[int, int] = (1920, 1080),
        tts_engine: str = "pyttsx3",
        ocr_languages: str = "eng"
    ):
        self.pdf_extractor = PDFExtractor()
        self.panel_detector = PanelDetector()
        self.text_extractor = TextExtractor(languages=ocr_languages)
        self.script_generator = ScriptGenerator()
        self.voice_generator = VoiceGenerator(engine=tts_engine)
        self.video_generator = VideoGenerator(resolution=resolution)
    
    def process(
        self,
        pdf_path: str,
        output_path: str,
        title: str = "Manga Recap",
        max_pages: int = 50,
        scene_duration: float = 5.0
    ) -> str:
        """
        Run complete manga to video pipeline.
        
        Args:
            pdf_path: Path to input PDF
            output_path: Path for output video
            title: Video title
            max_pages: Maximum pages to process
            scene_duration: Duration per scene in seconds
            
        Returns:
            Path to output video
        """
        print("=" * 60)
        print(f"MangaRecap AI - Processing: {os.path.basename(pdf_path)}")
        print("=" * 60)
        
        # Create temp directory for intermediate files
        with tempfile.TemporaryDirectory() as temp_dir:
            pages_dir = os.path.join(temp_dir, "pages")
            panels_dir = os.path.join(temp_dir, "panels")
            audio_dir = os.path.join(temp_dir, "audio")
            
            # Step 1: Extract pages
            print("\n[1/5] Extracting pages from PDF...")
            page_images = self.pdf_extractor.extract_pages(pdf_path, pages_dir)
            page_images = page_images[:max_pages]  # Limit pages
            
            # Step 2: Detect panels and extract text
            print("\n[2/5] Analyzing panels and extracting text...")
            all_panels = []
            for i, page_path in enumerate(page_images):
                panels = self.panel_detector.detect_panels(page_path, page_num=i)
                if panels:
                    panels = self.panel_detector.extract_panel_images(
                        page_path, panels, panels_dir
                    )
                    panels = self.text_extractor.extract_from_panels(panels)
                    all_panels.extend(panels)
                
                if (i + 1) % 10 == 0:
                    print(f"  Processed {i + 1}/{len(page_images)} pages")
            
            print(f"✓ Found {len(all_panels)} panels")
            
            # Step 3: Generate narration script
            print("\n[3/5] Generating narration script...")
            script = self.script_generator.generate_script(all_panels, title)
            print(f"✓ Generated script ({len(script)} characters)")
            
            # Step 4: Generate voiceover
            print("\n[4/5] Generating AI voiceover...")
            audio_path = os.path.join(audio_dir, "narration.wav")
            try:
                self.voice_generator.generate(script, audio_path)
            except Exception as e:
                print(f"Warning: Audio generation failed: {e}")
                audio_path = None
            
            # Step 5: Create video
            print("\n[5/5] Creating video...")
            
            # Use page images as scenes (simpler, more reliable)
            scenes = [
                Scene(
                    image_path=img,
                    duration=scene_duration,
                    text="",
                    effect="ken_burns"
                )
                for img in page_images
            ]
            
            output = self.video_generator.create_video(
                scenes,
                audio_path,
                output_path,
                title
            )
        
        print("\n" + "=" * 60)
        print("✓ DONE! Video created successfully")
        print(f"  Output: {output_path}")
        print("=" * 60)
        
        return output

# ============================================================================
# CLI
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="MangaRecap AI - Convert manga PDFs into video recaps with AI narration",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python manga_recap.py --input manga.pdf --output recap.mp4
  python manga_recap.py --input manga.pdf --output recap.mp4 --title "One Piece Ch. 1000"
  python manga_recap.py --input manga.pdf --output recap.mp4 --max-pages 20 --duration 3
        """
    )
    
    parser.add_argument(
        "--input", "-i",
        required=True,
        help="Path to input manga PDF file"
    )
    
    parser.add_argument(
        "--output", "-o",
        required=True,
        help="Path for output video file (mp4)"
    )
    
    parser.add_argument(
        "--title", "-t",
        default="Manga Recap",
        help="Video title (default: 'Manga Recap')"
    )
    
    parser.add_argument(
        "--max-pages", "-m",
        type=int,
        default=50,
        help="Maximum pages to process (default: 50)"
    )
    
    parser.add_argument(
        "--duration", "-d",
        type=float,
        default=5.0,
        help="Duration per scene in seconds (default: 5.0)"
    )
    
    parser.add_argument(
        "--resolution",
        choices=["720p", "1080p", "4k"],
        default="1080p",
        help="Output resolution (default: 1080p)"
    )
    
    parser.add_argument(
        "--tts-engine",
        choices=["pyttsx3", "piper", "espeak"],
        default="pyttsx3",
        help="Text-to-speech engine (default: pyttsx3)"
    )
    
    parser.add_argument(
        "--ocr-lang",
        default="eng",
        help="OCR language codes (default: 'eng', use 'eng+jpn' for Japanese)"
    )
    
    args = parser.parse_args()
    
    # Validate input
    if not os.path.exists(args.input):
        print(f"Error: Input file not found: {args.input}")
        sys.exit(1)
    
    # Parse resolution
    resolutions = {
        "720p": (1280, 720),
        "1080p": (1920, 1080),
        "4k": (3840, 2160)
    }
    resolution = resolutions[args.resolution]
    
    # Run pipeline
    pipeline = MangaRecapPipeline(
        resolution=resolution,
        tts_engine=args.tts_engine,
        ocr_languages=args.ocr_lang
    )
    
    pipeline.process(
        pdf_path=args.input,
        output_path=args.output,
        title=args.title,
        max_pages=args.max_pages,
        scene_duration=args.duration
    )

if __name__ == "__main__":
    main()
