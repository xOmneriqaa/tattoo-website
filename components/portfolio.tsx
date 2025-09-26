"use client"

import { useEffect, useState, useRef, useCallback } from "react"

export function Portfolio() {
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

  const portfolioItems = whatsappImages.map((fileName, index) => ({
    id: index + 1,
    title: `Recent Work ${String(index + 1).padStart(2, "0")}`,
    image: `/${encodeURI(fileName)}`,
  }))

  const itemsPerView = 3
  const totalItems = portfolioItems.length
  const shouldLoop = totalItems > itemsPerView
  const extendedItems = shouldLoop
    ? [
        ...portfolioItems.slice(-itemsPerView),
        ...portfolioItems,
        ...portfolioItems.slice(0, itemsPerView),
      ]
    : portfolioItems
  const initialIndex = shouldLoop ? itemsPerView : 0
  const totalPositions = shouldLoop ? totalItems : Math.max(1, totalItems - itemsPerView + 1)
  const transitionDuration = 500

  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setIsTransitioning(true)
  }, [initialIndex])

  const slidePercentage = extendedItems.length > 0 ? 100 / extendedItems.length : 100
  const trackWidthPercentage =
    extendedItems.length > 0 ? (extendedItems.length / itemsPerView) * 100 : 100

  const normalizedIndex =
    totalItems === 0
      ? 0
      : shouldLoop
        ? ((currentIndex - itemsPerView + totalItems) % totalItems + totalItems) % totalItems
        : Math.min(currentIndex, totalPositions - 1)

  const nextSlide = useCallback(() => {
    if (totalPositions <= 1) return
    setIsTransitioning(true)
    if (shouldLoop) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setCurrentIndex((prev) => (prev >= totalPositions - 1 ? 0 : prev + 1))
    }
  }, [shouldLoop, totalPositions])

  useEffect(() => {
    if (totalPositions <= 1) return
    const interval = setInterval(nextSlide, 4000)
    return () => clearInterval(interval)
  }, [nextSlide, totalPositions])

  useEffect(() => {
    if (!shouldLoop) return

    let timeout: ReturnType<typeof setTimeout> | undefined
    let animationFrame: number | undefined

    if (currentIndex >= totalItems + itemsPerView) {
      timeout = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(itemsPerView)
        animationFrame = requestAnimationFrame(() => setIsTransitioning(true))
      }, transitionDuration)
    } else if (currentIndex <= itemsPerView - 1) {
      timeout = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(totalItems + itemsPerView - 1)
        animationFrame = requestAnimationFrame(() => setIsTransitioning(true))
      }, transitionDuration)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [currentIndex, itemsPerView, shouldLoop, totalItems, transitionDuration])

  const handleIndicatorClick = (index: number) => {
    setIsTransitioning(true)
    if (shouldLoop) {
      setCurrentIndex(itemsPerView + index)
    } else {
      setCurrentIndex(index)
    }
  }

  return (
    <section id="portfolio" className="py-16 px-6" data-id="portfolio-section">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-4">
            <span className="font-mono text-xs text-muted-foreground/60 tracking-wider">WORK:</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-mono font-light mb-4 text-foreground tech-accent">
            RECENT<span className="text-primary">_</span>WORK
          </h2>
        </div>

        <div className="relative">
          {/* Carousel wrapper */}
          <div className="overflow-hidden" ref={carouselRef}>
            <div
              className="flex"
              style={{
                transform: `translateX(-${currentIndex * slidePercentage}%)`,
                width: `${trackWidthPercentage}%`,
                transition: isTransitioning ? `transform ${transitionDuration}ms ease-out` : "none",
              }}
            >
              {extendedItems.map((item, index) => {
                const isClone = shouldLoop && (index < itemsPerView || index >= totalItems + itemsPerView)

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex-shrink-0 px-2"
                    style={{
                      width: extendedItems.length > 0 ? `${100 / extendedItems.length}%` : "100%",
                    }}
                    aria-hidden={isClone}
                    tabIndex={isClone ? -1 : undefined}
                    data-clone={isClone ? "true" : undefined}
                  >
                    <div className="group cursor-pointer">
                      <div className="aspect-square blueprint-card rounded-none overflow-hidden mb-3">
                        <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={`${item.title} tattoo by Didem Karaca`}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {totalPositions > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPositions }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleIndicatorClick(index)}
                  className={`w-2 h-2 rounded-none transition-all duration-300 ${
                    index === normalizedIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://instagram.com/didemrs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 blueprint-btn px-6 py-3 rounded-none text-xs"
          >
            <span>MORE_ON_INSTAGRAM</span>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
