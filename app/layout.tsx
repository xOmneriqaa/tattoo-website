import type React from "react"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import dynamic from "next/dynamic"

import { inter, playfair, plexMono } from "@/lib/fonts"

import "./globals.css"

const Analytics = dynamic(() => import("@vercel/analytics/next").then(mod => ({ default: mod.Analytics })), {
  ssr: false,
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://didemkaraca.com"
const metadataBase = new URL(siteUrl)
const primaryOgImage = "/didem-karaca-tattoo-artist-portrait.jpg"

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Didem Karaca Tattoo Studio | Fine Line & Microrealism",
    template: "%s | Didem Karaca Tattoo Studio",
  },
  description: "Fine line, microrealism, and conceptual tattoo artistry handcrafted by Didem Karaca in Istanbul.",
  applicationName: "Didem Karaca Tattoo Studio",
  generator: "v0.app",
  keywords: [
    "fine line tattoo artist",
    "microrealism tattoos",
    "conceptual tattoo design",
    "Istanbul tattoo studio",
    "Didem Karaca",
  ],
  authors: [{ name: "Didem Karaca" }],
  creator: "Didem Karaca",
  publisher: "Didem Karaca",
  category: "Tattoo Studio",
  referrer: "no-referrer-when-downgrade",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: metadataBase,
    title: "Didem Karaca Tattoo Studio | Fine Line & Microrealism",
    description:
      "Custom fine line, microrealism, and conceptual tattoos created by Istanbul-based artist Didem Karaca.",
    siteName: "Didem Karaca Tattoo Studio",
    images: [
      {
        url: primaryOgImage,
        width: 1200,
        height: 630,
        alt: "Didem Karaca fine line tattoo artist in her Istanbul studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Didem Karaca Tattoo Studio | Fine Line & Microrealism",
    description:
      "Book bespoke fine line, conceptual, and microrealism tattoos with Istanbul artist Didem Karaca.",
    images: [primaryOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/placeholder-logo.svg",
    shortcut: "/placeholder-logo.svg",
    apple: "/placeholder-logo.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#f5f3f0",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`relative min-h-screen blueprint-grid silky-texture font-sans ${inter.variable} ${playfair.variable} ${plexMono.variable} antialiased`}
      >
        <Suspense>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
