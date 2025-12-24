import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MangaRecap AI - Convert Manga to Video Recaps',
  description: 'Upload your manga PDF and create AI-narrated video recaps for your channel. Free, easy to use, runs locally.',
  keywords: ['manga', 'recap', 'AI', 'video', 'narration', 'free'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-manga-dark text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
