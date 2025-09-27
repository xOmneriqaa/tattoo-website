"use client"

import CircularGallery from "@/components/CircularGallery"
import DecryptedText from "@/components/DecryptedText"

const whatsappImages = [
  "WhatsApp Image 2025-09-26 at 22.41.45.jpeg",
  "WhatsApp Image 2025-09-26 at 22.41.45 (1).jpeg",
  "WhatsApp Image 2025-09-26 at 22.41.45 (2).jpeg",
  "WhatsApp Image 2025-09-26 at 22.41.45 (3).jpeg",
  "WhatsApp Image 2025-09-26 at 22.41.46.jpeg",
  "WhatsApp Image 2025-09-26 at 22.41.46 (1).jpeg",
  "WhatsApp Image 2025-09-26 at 22.41.46 (2).jpeg",
  "WhatsApp Image 2025-09-26 at 22.41.47.jpeg",
  "WhatsApp Image 2025-09-26 at 22.41.48.jpeg",
  "WhatsApp Image 2025-09-26 at 22.41.50.jpeg",
  "WhatsApp Image 2025-09-26 at 22.41.50 (1).jpeg",
] as const

const galleryItems = whatsappImages.map((fileName, index) => ({
  image: `/${encodeURI(fileName)}`,
  text: "",
}))

export function Portfolio() {
  return (
    <section id="portfolio" className="py-16" data-id="portfolio-section">
      <div className="px-6">
        <div className="text-center mb-12">
          <div className="mb-4">
            <DecryptedText
              text="WORK:"
              parentClassName="block font-mono text-xs text-muted-foreground/60 tracking-wider"
              className="text-muted-foreground/60"
              encryptedClassName="text-muted-foreground/40"
              animateOn="view"
              sequential
              useOriginalCharsOnly
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-mono font-light mb-4 text-foreground tech-accent">
            <DecryptedText
              text="RECENT_WORK"
              parentClassName="block"
              animateOn="view"
              sequential
              useOriginalCharsOnly
            />
          </h2>
        </div>
      </div>

      <div className="relative w-full h-[420px] sm:h-[480px] md:h-[560px] lg:h-[620px]">
        <CircularGallery
          items={galleryItems}
          bend={2}
          textColor="#fdf9f3"
          borderRadius={0.08}
          font="600 28px 'IBM Plex Mono'"
          scrollSpeed={1}
          scrollEase={0.15}
        />
      </div>

      <div className="px-6">
        <div className="text-center mt-12">
          <a
            href="https://instagram.com/didemrs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 blueprint-btn px-6 py-3 rounded-none text-xs"
          >
            <DecryptedText
              text="MORE_ON_INSTAGRAM"
              parentClassName="inline-block"
              className="text-black"
              encryptedClassName="text-black/60"
              animateOn="view"
              sequential
              useOriginalCharsOnly
            />
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
