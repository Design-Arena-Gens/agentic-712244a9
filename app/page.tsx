'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Video, 
  Mic, 
  Download, 
  CheckCircle, 
  Play,
  Settings,
  Book,
  Wand2,
  ChevronDown,
  ChevronUp,
  Github,
  Copy,
  Check,
  AlertCircle,
  Zap,
  Layers,
  Volume2,
  Film,
  Terminal
} from 'lucide-react';

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'docs' | 'local'>('upload');
  const [expandedSection, setExpandedSection] = useState<string | null>('architecture');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: 'extract', name: 'Extract Pages', description: 'Converting PDF pages to images', status: 'pending' },
    { id: 'analyze', name: 'Analyze Scenes', description: 'Identifying panels and characters', status: 'pending' },
    { id: 'script', name: 'Generate Script', description: 'Creating narration script with AI', status: 'pending' },
    { id: 'voice', name: 'AI Voiceover', description: 'Generating natural voice narration', status: 'pending' },
    { id: 'video', name: 'Create Video', description: 'Compiling scenes with audio', status: 'pending' },
  ]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-manga-primary/20 via-transparent to-manga-secondary/20" />
        <div className="container mx-auto px-6 py-12 relative z-10">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-manga-primary to-manga-secondary flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">MangaRecap<span className="text-manga-primary">AI</span></span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'upload' ? 'bg-manga-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Upload
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'docs' ? 'bg-manga-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Documentation
              </button>
              <button
                onClick={() => setActiveTab('local')}
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'local' ? 'bg-manga-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Local Setup
              </button>
            </div>
          </nav>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Transform <span className="text-manga-primary glow-text">Manga</span> into
              <br />
              <span className="text-manga-secondary">Video Recaps</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Upload your manga PDF and let AI create engaging video recaps with natural voiceover narration. 
              Perfect for manga recap YouTube channels. 100% Free.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="px-4 py-2 bg-manga-dark/80 rounded-full text-sm border border-manga-primary/30">
                <CheckCircle className="w-4 h-4 inline mr-2 text-manga-secondary" />
                Free & Open Source
              </span>
              <span className="px-4 py-2 bg-manga-dark/80 rounded-full text-sm border border-manga-primary/30">
                <CheckCircle className="w-4 h-4 inline mr-2 text-manga-secondary" />
                Runs Locally
              </span>
              <span className="px-4 py-2 bg-manga-dark/80 rounded-full text-sm border border-manga-primary/30">
                <CheckCircle className="w-4 h-4 inline mr-2 text-manga-secondary" />
                AI Narration
              </span>
              <span className="px-4 py-2 bg-manga-dark/80 rounded-full text-sm border border-manga-primary/30">
                <CheckCircle className="w-4 h-4 inline mr-2 text-manga-secondary" />
                No API Keys Needed
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-20">
        {activeTab === 'upload' && (
          <div className="max-w-4xl mx-auto">
            {/* Upload Section */}
            <div className="bg-manga-dark/50 rounded-2xl p-8 border border-manga-primary/20 glow-box mb-8">
              <div
                {...getRootProps()}
                className={`dropzone rounded-xl p-12 text-center cursor-pointer ${isDragActive ? 'active' : ''}`}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-16 h-16 text-manga-secondary mb-4" />
                    <p className="text-xl font-semibold mb-2">{uploadedFile.name}</p>
                    <p className="text-gray-400">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button className="mt-4 text-manga-primary hover:underline">
                      Click to replace
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-16 h-16 text-manga-primary mb-4 animate-bounce-slow" />
                    <p className="text-xl font-semibold mb-2">
                      {isDragActive ? 'Drop your manga PDF here!' : 'Drag & drop your manga PDF'}
                    </p>
                    <p className="text-gray-400">or click to browse files</p>
                  </div>
                )}
              </div>
            </div>

            {/* Processing Pipeline Visual */}
            {uploadedFile && (
              <div className="bg-manga-dark/50 rounded-2xl p-8 border border-manga-primary/20 mb-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Wand2 className="w-6 h-6 text-manga-primary" />
                  Processing Pipeline
                </h3>
                <div className="space-y-4">
                  {processingSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-4 p-4 bg-manga-dark/50 rounded-xl border border-gray-800">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.status === 'complete' ? 'bg-manga-secondary' :
                        step.status === 'processing' ? 'bg-manga-primary animate-pulse' :
                        step.status === 'error' ? 'bg-red-500' :
                        'bg-gray-700'
                      }`}>
                        {step.status === 'complete' ? <CheckCircle className="w-5 h-5" /> :
                         step.status === 'error' ? <AlertCircle className="w-5 h-5" /> :
                         <span className="font-bold">{index + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{step.name}</p>
                        <p className="text-sm text-gray-400">{step.description}</p>
                      </div>
                      {step.status === 'processing' && (
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full progress-bar w-1/2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                  <p className="text-yellow-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>
                      <strong>Note:</strong> Full video processing requires the local Python tools. 
                      See the &quot;Local Setup&quot; tab for installation instructions.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="feature-card rounded-xl p-6 card-hover">
                <Layers className="w-10 h-10 text-manga-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">Scene Extraction</h3>
                <p className="text-gray-400 text-sm">
                  Automatically extracts individual panels and pages from your manga PDF for video sequences.
                </p>
              </div>
              <div className="feature-card rounded-xl p-6 card-hover">
                <Volume2 className="w-10 h-10 text-manga-secondary mb-4" />
                <h3 className="text-lg font-bold mb-2">AI Narration</h3>
                <p className="text-gray-400 text-sm">
                  Generates natural-sounding voiceover using free, local text-to-speech engines.
                </p>
              </div>
              <div className="feature-card rounded-xl p-6 card-hover">
                <Film className="w-10 h-10 text-manga-accent mb-4" />
                <h3 className="text-lg font-bold mb-2">Video Output</h3>
                <p className="text-gray-400 text-sm">
                  Creates polished video with Ken Burns effect, transitions, and synchronized narration.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Technical Documentation</h2>
            
            {/* Architecture Section */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('architecture')}
                className="w-full flex items-center justify-between p-6 bg-manga-dark/50 rounded-xl border border-manga-primary/20 hover:border-manga-primary/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-manga-primary/20 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-manga-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">System Architecture</h3>
                    <p className="text-gray-400">Overview of components and data flow</p>
                  </div>
                </div>
                {expandedSection === 'architecture' ? <ChevronUp /> : <ChevronDown />}
              </button>
              
              {expandedSection === 'architecture' && (
                <div className="mt-4 p-6 bg-manga-dark/30 rounded-xl border border-gray-800">
                  <div className="prose prose-invert max-w-none">
                    <h4 className="text-lg font-bold text-manga-primary mb-4">Architecture Overview</h4>
                    <div className="code-block p-4 mb-6 overflow-x-auto">
                      <pre className="text-sm text-gray-300">
{`┌─────────────────────────────────────────────────────────────────┐
│                    MangaRecap AI Architecture                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Web UI     │───▶│  PDF Upload  │───▶│  Local API   │       │
│  │  (Next.js)   │    │   Handler    │    │   Server     │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                 │                │
│                                                 ▼                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Processing Pipeline (Python)                │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐           │    │
│  │  │  PDF      │  │  Scene    │  │  Text     │           │    │
│  │  │  Extract  │─▶│  Analyzer │─▶│  Extract  │           │    │
│  │  │ (PyMuPDF) │  │  (OpenCV) │  │ (Tesseract)│          │    │
│  │  └───────────┘  └───────────┘  └───────────┘           │    │
│  │        │              │              │                   │    │
│  │        ▼              ▼              ▼                   │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐           │    │
│  │  │  Images   │  │  Panels   │  │  Script   │           │    │
│  │  │  Output   │  │  Metadata │  │  JSON     │           │    │
│  │  └───────────┘  └───────────┘  └───────────┘           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                │                                 │
│                                ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Video Generation Pipeline                   │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐           │    │
│  │  │  TTS      │  │  Audio    │  │  Video    │           │    │
│  │  │ (Piper)   │─▶│  Sync     │─▶│  Compose  │           │    │
│  │  └───────────┘  └───────────┘  │  (FFmpeg) │           │    │
│  │                               └───────────┘           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                │                                 │
│                                ▼                                 │
│                      ┌──────────────┐                           │
│                      │  MP4 Output  │                           │
│                      │  with Audio  │                           │
│                      └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘`}
                      </pre>
                    </div>
                    
                    <h4 className="text-lg font-bold text-manga-secondary mb-4">Key Components</h4>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-manga-primary mt-1 flex-shrink-0" />
                        <span><strong>Web Interface:</strong> Next.js app for PDF upload and configuration. Provides visual feedback and downloads.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-manga-primary mt-1 flex-shrink-0" />
                        <span><strong>PDF Processor:</strong> PyMuPDF extracts high-quality images from each page.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-manga-primary mt-1 flex-shrink-0" />
                        <span><strong>Scene Analyzer:</strong> OpenCV detects panel boundaries and extracts individual scenes.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-manga-primary mt-1 flex-shrink-0" />
                        <span><strong>Text Extractor:</strong> Tesseract OCR reads dialogue and narration boxes.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-manga-primary mt-1 flex-shrink-0" />
                        <span><strong>TTS Engine:</strong> Piper (offline) generates natural voice narration.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-manga-primary mt-1 flex-shrink-0" />
                        <span><strong>Video Composer:</strong> FFmpeg combines images with audio and effects.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* API Reference Section */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('api')}
                className="w-full flex items-center justify-between p-6 bg-manga-dark/50 rounded-xl border border-manga-primary/20 hover:border-manga-primary/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-manga-secondary/20 flex items-center justify-center">
                    <Terminal className="w-6 h-6 text-manga-secondary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">Code Examples</h3>
                    <p className="text-gray-400">Python scripts for each processing stage</p>
                  </div>
                </div>
                {expandedSection === 'api' ? <ChevronUp /> : <ChevronDown />}
              </button>
              
              {expandedSection === 'api' && (
                <div className="mt-4 p-6 bg-manga-dark/30 rounded-xl border border-gray-800 space-y-6">
                  {/* PDF Extraction Code */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-manga-primary">1. PDF Page Extraction</h4>
                      <button
                        onClick={() => copyToClipboard(pdfExtractCode, 'pdf')}
                        className="flex items-center gap-2 px-3 py-1 bg-manga-dark rounded-lg text-sm hover:bg-gray-800 transition-all"
                      >
                        {copiedCode === 'pdf' ? <Check className="w-4 h-4 text-manga-secondary" /> : <Copy className="w-4 h-4" />}
                        {copiedCode === 'pdf' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="code-block p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-300">{pdfExtractCode}</pre>
                    </div>
                  </div>

                  {/* Panel Detection Code */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-manga-secondary">2. Panel Detection</h4>
                      <button
                        onClick={() => copyToClipboard(panelDetectCode, 'panel')}
                        className="flex items-center gap-2 px-3 py-1 bg-manga-dark rounded-lg text-sm hover:bg-gray-800 transition-all"
                      >
                        {copiedCode === 'panel' ? <Check className="w-4 h-4 text-manga-secondary" /> : <Copy className="w-4 h-4" />}
                        {copiedCode === 'panel' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="code-block p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-300">{panelDetectCode}</pre>
                    </div>
                  </div>

                  {/* TTS Code */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-manga-accent">3. AI Voice Generation</h4>
                      <button
                        onClick={() => copyToClipboard(ttsCode, 'tts')}
                        className="flex items-center gap-2 px-3 py-1 bg-manga-dark rounded-lg text-sm hover:bg-gray-800 transition-all"
                      >
                        {copiedCode === 'tts' ? <Check className="w-4 h-4 text-manga-secondary" /> : <Copy className="w-4 h-4" />}
                        {copiedCode === 'tts' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="code-block p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-300">{ttsCode}</pre>
                    </div>
                  </div>

                  {/* Video Generation Code */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-manga-primary">4. Video Generation</h4>
                      <button
                        onClick={() => copyToClipboard(videoGenCode, 'video')}
                        className="flex items-center gap-2 px-3 py-1 bg-manga-dark rounded-lg text-sm hover:bg-gray-800 transition-all"
                      >
                        {copiedCode === 'video' ? <Check className="w-4 h-4 text-manga-secondary" /> : <Copy className="w-4 h-4" />}
                        {copiedCode === 'video' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="code-block p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-300">{videoGenCode}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Free Tools Section */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('tools')}
                className="w-full flex items-center justify-between p-6 bg-manga-dark/50 rounded-xl border border-manga-primary/20 hover:border-manga-primary/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-manga-accent/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-manga-accent" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">Free Tools & APIs</h3>
                    <p className="text-gray-400">100% free, no API keys required</p>
                  </div>
                </div>
                {expandedSection === 'tools' ? <ChevronUp /> : <ChevronDown />}
              </button>
              
              {expandedSection === 'tools' && (
                <div className="mt-4 p-6 bg-manga-dark/30 rounded-xl border border-gray-800">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-manga-dark/50 rounded-xl">
                      <h4 className="font-bold text-manga-primary mb-3">PDF Processing</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>• <strong>PyMuPDF (fitz)</strong> - Extract images from PDF</li>
                        <li>• <strong>pdf2image</strong> - Alternative PDF converter</li>
                        <li>• <strong>Pillow</strong> - Image manipulation</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-manga-dark/50 rounded-xl">
                      <h4 className="font-bold text-manga-secondary mb-3">Image Analysis</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>• <strong>OpenCV</strong> - Panel detection & segmentation</li>
                        <li>• <strong>Tesseract OCR</strong> - Text extraction</li>
                        <li>• <strong>NumPy</strong> - Image array processing</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-manga-dark/50 rounded-xl">
                      <h4 className="font-bold text-manga-accent mb-3">Text-to-Speech</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>• <strong>Piper TTS</strong> - High-quality offline voices</li>
                        <li>• <strong>Coqui TTS</strong> - Neural voice synthesis</li>
                        <li>• <strong>pyttsx3</strong> - System TTS fallback</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-manga-dark/50 rounded-xl">
                      <h4 className="font-bold text-manga-primary mb-3">Video Creation</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li>• <strong>FFmpeg</strong> - Video encoding & effects</li>
                        <li>• <strong>MoviePy</strong> - Python video editing</li>
                        <li>• <strong>pydub</strong> - Audio processing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'local' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Local Setup Guide</h2>
            
            <div className="bg-manga-dark/50 rounded-2xl p-8 border border-manga-primary/20 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-manga-primary to-manga-secondary flex items-center justify-center">
                  <Terminal className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Quick Start</h3>
                  <p className="text-gray-400">Get up and running in 5 minutes</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="p-4 bg-manga-dark/50 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-manga-primary flex items-center justify-center font-bold">1</span>
                    <h4 className="font-bold">Install Python Dependencies</h4>
                  </div>
                  <div className="code-block p-4">
                    <code className="text-sm text-gray-300">
                      pip install pymupdf opencv-python pytesseract piper-tts moviepy pillow numpy
                    </code>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-manga-dark/50 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-manga-primary flex items-center justify-center font-bold">2</span>
                    <h4 className="font-bold">Install FFmpeg</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Choose your operating system:</p>
                    <div className="code-block p-4 space-y-2">
                      <div><span className="text-manga-secondary"># macOS</span><br />brew install ffmpeg</div>
                      <div><span className="text-manga-secondary"># Ubuntu/Debian</span><br />sudo apt install ffmpeg</div>
                      <div><span className="text-manga-secondary"># Windows</span><br />winget install ffmpeg</div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-manga-dark/50 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-manga-primary flex items-center justify-center font-bold">3</span>
                    <h4 className="font-bold">Install Tesseract OCR</h4>
                  </div>
                  <div className="code-block p-4 space-y-2">
                    <div><span className="text-manga-secondary"># macOS</span><br />brew install tesseract</div>
                    <div><span className="text-manga-secondary"># Ubuntu/Debian</span><br />sudo apt install tesseract-ocr</div>
                    <div><span className="text-manga-secondary"># Windows</span><br />Download from: https://github.com/UB-Mannheim/tesseract/wiki</div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 bg-manga-dark/50 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-manga-primary flex items-center justify-center font-bold">4</span>
                    <h4 className="font-bold">Download Piper Voice Model</h4>
                  </div>
                  <div className="code-block p-4">
                    <code className="text-sm text-gray-300">
                      # Download a voice model (example: en_US-lessac-medium)<br />
                      wget https://github.com/rhasspy/piper/releases/download/v1.2.0/voice-en_US-lessac-medium.tar.gz<br />
                      tar -xzf voice-en_US-lessac-medium.tar.gz
                    </code>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="p-4 bg-manga-dark/50 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-manga-secondary flex items-center justify-center font-bold">5</span>
                    <h4 className="font-bold">Run the Processing Script</h4>
                  </div>
                  <div className="code-block p-4">
                    <code className="text-sm text-gray-300">
                      python manga_recap.py --input your_manga.pdf --output recap_video.mp4
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Section */}
            <div className="bg-gradient-to-br from-manga-primary/20 to-manga-secondary/20 rounded-2xl p-8 border border-manga-primary/30">
              <h3 className="text-2xl font-bold mb-4">Download Complete Package</h3>
              <p className="text-gray-300 mb-6">
                Get all Python scripts, configuration files, and voice models in a single download.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-manga-primary rounded-xl font-bold hover:bg-opacity-90 transition-all">
                  <Download className="w-5 h-5" />
                  Download Scripts (.zip)
                </button>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-xl font-bold hover:bg-gray-700 transition-all"
                >
                  <Github className="w-5 h-5" />
                  View on GitHub
                </a>
              </div>
            </div>

            {/* System Requirements */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-manga-dark/50 rounded-xl p-6 border border-gray-800">
                <h4 className="font-bold text-manga-primary mb-4">Minimum Requirements</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• CPU: 4 cores / 2.5GHz+</li>
                  <li>• RAM: 8GB</li>
                  <li>• Storage: 5GB free space</li>
                  <li>• Python 3.8+</li>
                  <li>• OS: Windows 10, macOS 10.15+, Ubuntu 20.04+</li>
                </ul>
              </div>
              <div className="bg-manga-dark/50 rounded-xl p-6 border border-gray-800">
                <h4 className="font-bold text-manga-secondary mb-4">Recommended</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• CPU: 8 cores / 3.5GHz+</li>
                  <li>• RAM: 16GB+</li>
                  <li>• GPU: NVIDIA with CUDA (optional)</li>
                  <li>• SSD Storage: 20GB+ free</li>
                  <li>• Python 3.10+</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>MangaRecap AI - Free & Open Source Manga Video Generator</p>
          <p className="text-sm mt-2">Built with Next.js, Python, FFmpeg, and Piper TTS</p>
        </div>
      </footer>
    </main>
  );
}

// Code snippets
const pdfExtractCode = `import fitz  # PyMuPDF
import os
from PIL import Image
import io

def extract_pages_from_pdf(pdf_path: str, output_dir: str, dpi: int = 150):
    """
    Extract all pages from a manga PDF as high-quality images.
    
    Args:
        pdf_path: Path to the manga PDF file
        output_dir: Directory to save extracted images
        dpi: Resolution for extracted images (default: 150)
    
    Returns:
        List of paths to extracted images
    """
    os.makedirs(output_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    extracted_images = []
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        
        # Calculate zoom factor for desired DPI
        zoom = dpi / 72
        mat = fitz.Matrix(zoom, zoom)
        
        # Render page to pixmap
        pix = page.get_pixmap(matrix=mat)
        
        # Save as PNG
        output_path = os.path.join(output_dir, f"page_{page_num:04d}.png")
        pix.save(output_path)
        extracted_images.append(output_path)
        
        print(f"Extracted page {page_num + 1}/{len(doc)}")
    
    doc.close()
    return extracted_images

# Usage
if __name__ == "__main__":
    images = extract_pages_from_pdf(
        "manga_chapter.pdf",
        "output/pages"
    )
    print(f"Extracted {len(images)} pages")`;

const panelDetectCode = `import cv2
import numpy as np
from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class Panel:
    x: int
    y: int
    width: int
    height: int
    image: np.ndarray

def detect_panels(image_path: str, min_area: int = 10000) -> List[Panel]:
    """
    Detect individual panels in a manga page using contour detection.
    
    Args:
        image_path: Path to the manga page image
        min_area: Minimum panel area to detect (filters noise)
    
    Returns:
        List of Panel objects with coordinates and cropped images
    """
    # Load image
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply threshold to get binary image
    _, binary = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    
    # Find contours
    contours, _ = cv2.findContours(
        binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    
    panels = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < min_area:
            continue
            
        # Get bounding rectangle
        x, y, w, h = cv2.boundingRect(contour)
        
        # Extract panel image
        panel_img = img[y:y+h, x:x+w]
        
        panels.append(Panel(x=x, y=y, width=w, height=h, image=panel_img))
    
    # Sort panels by position (top-to-bottom, right-to-left for manga)
    panels.sort(key=lambda p: (p.y // 100, -p.x))
    
    return panels

def extract_text_from_panel(panel: Panel) -> str:
    """Extract text from a panel using Tesseract OCR."""
    import pytesseract
    
    # Convert to grayscale for better OCR
    gray = cv2.cvtColor(panel.image, cv2.COLOR_BGR2GRAY)
    
    # Apply adaptive thresholding
    processed = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2
    )
    
    # Run OCR
    text = pytesseract.image_to_string(
        processed,
        config='--psm 6 -l eng+jpn'
    )
    
    return text.strip()

# Usage
if __name__ == "__main__":
    panels = detect_panels("output/pages/page_0001.png")
    for i, panel in enumerate(panels):
        text = extract_text_from_panel(panel)
        print(f"Panel {i+1}: {text[:50]}...")`;

const ttsCode = `import subprocess
import os
from typing import Optional
import json

class MangaNarrator:
    """Generate AI voiceover for manga recaps using Piper TTS."""
    
    def __init__(
        self,
        model_path: str = "en_US-lessac-medium.onnx",
        config_path: str = "en_US-lessac-medium.onnx.json"
    ):
        self.model_path = model_path
        self.config_path = config_path
        
    def generate_narration(
        self,
        text: str,
        output_path: str,
        speed: float = 1.0
    ) -> str:
        """
        Generate narration audio from text using Piper TTS.
        
        Args:
            text: The narration script text
            output_path: Path to save the audio file (.wav)
            speed: Speech speed multiplier (0.5-2.0)
        
        Returns:
            Path to the generated audio file
        """
        # Create output directory if needed
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Build Piper command
        cmd = [
            "piper",
            "--model", self.model_path,
            "--config", self.config_path,
            "--output_file", output_path,
            "--length_scale", str(1.0 / speed)
        ]
        
        # Run Piper with text input
        process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        stdout, stderr = process.communicate(input=text.encode('utf-8'))
        
        if process.returncode != 0:
            raise RuntimeError(f"Piper TTS failed: {stderr.decode()}")
        
        return output_path
    
    def create_recap_script(self, panels_data: list) -> str:
        """
        Create a narration script from extracted panel data.
        
        Args:
            panels_data: List of dicts with 'text' and 'description' keys
        
        Returns:
            Formatted narration script
        """
        script_parts = []
        
        for i, panel in enumerate(panels_data):
            text = panel.get('text', '')
            desc = panel.get('description', '')
            
            if text:
                # Format dialogue
                script_parts.append(f"{text}")
            elif desc:
                # Format scene description
                script_parts.append(f"[Scene: {desc}]")
        
        return " ... ".join(script_parts)

# Alternative: Using Coqui TTS (also free)
def generate_with_coqui(text: str, output_path: str):
    """Generate speech using Coqui TTS (neural voices)."""
    from TTS.api import TTS
    
    # Initialize with a free model
    tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")
    
    # Generate audio
    tts.tts_to_file(text=text, file_path=output_path)
    
    return output_path

# Fallback: System TTS
def generate_with_pyttsx3(text: str, output_path: str):
    """Generate speech using system TTS (always available)."""
    import pyttsx3
    
    engine = pyttsx3.init()
    engine.setProperty('rate', 150)  # Speed
    engine.setProperty('volume', 0.9)
    
    engine.save_to_file(text, output_path)
    engine.runAndWait()
    
    return output_path

# Usage
if __name__ == "__main__":
    narrator = MangaNarrator()
    
    # Sample narration
    script = """
    In the shadow of the ancient temple, 
    our hero discovers a mysterious artifact.
    'What power does this hold?' he wonders aloud.
    Little did he know, this moment would change everything.
    """
    
    narrator.generate_narration(
        script,
        "output/audio/narration.wav"
    )`;

const videoGenCode = `from moviepy.editor import (
    ImageClip, AudioFileClip, CompositeVideoClip,
    concatenate_videoclips, TextClip
)
import os
from typing import List, Dict, Tuple
import numpy as np

class MangaVideoGenerator:
    """Create manga recap videos with Ken Burns effect and narration."""
    
    def __init__(
        self,
        resolution: Tuple[int, int] = (1920, 1080),
        fps: int = 30
    ):
        self.resolution = resolution
        self.fps = fps
        
    def create_ken_burns_clip(
        self,
        image_path: str,
        duration: float,
        zoom_start: float = 1.0,
        zoom_end: float = 1.2,
        pan_direction: str = "right"
    ) -> ImageClip:
        """
        Create a clip with Ken Burns (pan and zoom) effect.
        
        Args:
            image_path: Path to the image
            duration: Clip duration in seconds
            zoom_start: Initial zoom level
            zoom_end: Final zoom level
            pan_direction: Pan direction ('left', 'right', 'up', 'down')
        """
        clip = ImageClip(image_path).set_duration(duration)
        
        # Resize to fit resolution with room for zoom
        clip = clip.resize(height=int(self.resolution[1] * zoom_end))
        
        def zoom_and_pan(get_frame, t):
            """Apply zoom and pan transformation."""
            progress = t / duration
            current_zoom = zoom_start + (zoom_end - zoom_start) * progress
            
            # Calculate crop position
            frame = get_frame(t)
            h, w = frame.shape[:2]
            
            crop_h = int(self.resolution[1] / current_zoom)
            crop_w = int(self.resolution[0] / current_zoom)
            
            # Pan offset
            if pan_direction == "right":
                x_offset = int((w - crop_w) * progress)
                y_offset = (h - crop_h) // 2
            elif pan_direction == "left":
                x_offset = int((w - crop_w) * (1 - progress))
                y_offset = (h - crop_h) // 2
            else:
                x_offset = (w - crop_w) // 2
                y_offset = (h - crop_h) // 2
            
            # Crop and resize
            cropped = frame[
                y_offset:y_offset+crop_h,
                x_offset:x_offset+crop_w
            ]
            
            from PIL import Image
            import cv2
            resized = cv2.resize(
                cropped, 
                self.resolution,
                interpolation=cv2.INTER_LINEAR
            )
            
            return resized
        
        return clip.fl(zoom_and_pan)
    
    def create_manga_recap(
        self,
        scenes: List[Dict],
        audio_path: str,
        output_path: str,
        title: str = "Manga Recap"
    ):
        """
        Create a complete manga recap video.
        
        Args:
            scenes: List of dicts with 'image', 'duration', 'effect' keys
            audio_path: Path to narration audio
            output_path: Path to save the video
            title: Video title for intro
        """
        clips = []
        
        # Create title card
        title_clip = TextClip(
            title,
            fontsize=70,
            color='white',
            font='Arial-Bold',
            size=self.resolution
        ).set_duration(3).set_position('center')
        
        title_bg = ImageClip(
            np.zeros((*self.resolution[::-1], 3), dtype=np.uint8)
        ).set_duration(3)
        
        clips.append(CompositeVideoClip([title_bg, title_clip]))
        
        # Add scene clips
        pan_directions = ['right', 'left', 'up', 'down']
        for i, scene in enumerate(scenes):
            clip = self.create_ken_burns_clip(
                scene['image'],
                scene.get('duration', 5),
                pan_direction=pan_directions[i % len(pan_directions)]
            )
            clips.append(clip)
        
        # Concatenate all clips
        video = concatenate_videoclips(clips, method='compose')
        
        # Add audio narration
        if os.path.exists(audio_path):
            audio = AudioFileClip(audio_path)
            # Adjust video duration to match audio
            if audio.duration > video.duration:
                video = video.set_duration(audio.duration)
            video = video.set_audio(audio)
        
        # Write output
        video.write_videofile(
            output_path,
            fps=self.fps,
            codec='libx264',
            audio_codec='aac',
            threads=4,
            preset='medium'
        )
        
        print(f"Video saved to: {output_path}")
        return output_path

# Complete pipeline function
def create_manga_recap_video(
    pdf_path: str,
    output_path: str,
    title: str = "Manga Recap"
):
    """
    Complete pipeline: PDF -> Video with AI narration.
    """
    import tempfile
    
    # 1. Extract pages
    print("Extracting pages from PDF...")
    from pdf_extractor import extract_pages_from_pdf
    
    with tempfile.TemporaryDirectory() as temp_dir:
        pages_dir = os.path.join(temp_dir, "pages")
        audio_dir = os.path.join(temp_dir, "audio")
        
        images = extract_pages_from_pdf(pdf_path, pages_dir)
        
        # 2. Extract text for narration
        print("Extracting text for narration...")
        from panel_detector import detect_panels, extract_text_from_panel
        
        all_text = []
        for img_path in images[:20]:  # Limit for demo
            panels = detect_panels(img_path)
            for panel in panels:
                text = extract_text_from_panel(panel)
                if text:
                    all_text.append(text)
        
        script = " ... ".join(all_text)
        
        # 3. Generate narration
        print("Generating AI narration...")
        from tts_generator import MangaNarrator
        
        narrator = MangaNarrator()
        os.makedirs(audio_dir, exist_ok=True)
        audio_path = os.path.join(audio_dir, "narration.wav")
        narrator.generate_narration(script, audio_path)
        
        # 4. Create video
        print("Creating video...")
        scenes = [
            {'image': img, 'duration': 5}
            for img in images[:20]
        ]
        
        generator = MangaVideoGenerator()
        generator.create_manga_recap(
            scenes,
            audio_path,
            output_path,
            title
        )
    
    print(f"\\nRecap video created: {output_path}")
    return output_path

# Usage
if __name__ == "__main__":
    create_manga_recap_video(
        "manga_chapter.pdf",
        "manga_recap.mp4",
        "One Piece Chapter 1000 Recap"
    )`;
