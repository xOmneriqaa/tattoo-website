import { IBM_Plex_Mono, Inter, Playfair_Display } from "next/font/google"

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
})

export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: true,
})

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"], // Removed 500 to reduce load
  variable: "--font-mono",
  display: "swap",
  preload: true,
  fallback: ['Courier New', 'monospace'],
  adjustFontFallback: true,
})

export const plexMonoFontStack = plexMono.style.fontFamily
