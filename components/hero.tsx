"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

import DecryptedText from "@/components/DecryptedText"

const ASCIIText = dynamic(() => import("@/components/ASCIIText"), {
  ssr: false,
})

export function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRenderAscii, setShouldRenderAscii] = useState(false)
  const [asciiMode, setAsciiMode] = useState<"full" | "lite">("full")

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches

    setAsciiMode(isSmallScreen ? "lite" : "full")

    if (prefersReducedMotion) {
      return
    }

    let cancelled = false

    const enable = () => {
      if (!cancelled) {
        setShouldRenderAscii(true)
        cancelled = true
      }
    }

    ;(ASCIIText as typeof ASCIIText & { preload?: () => void }).preload?.()

    type RequestIdleCallback = (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
    type CancelIdleCallback = (handle: number) => void

    const { requestIdleCallback, cancelIdleCallback } = window as typeof window & {
      requestIdleCallback?: RequestIdleCallback
      cancelIdleCallback?: CancelIdleCallback
    }

    let idleHandle: number | null = null
    const timeoutDelay = isSmallScreen ? 1200 : 800
    let timeoutHandle: number | null = window.setTimeout(enable, timeoutDelay)

    if (requestIdleCallback) {
      idleHandle = requestIdleCallback(() => {
        enable()
        if (timeoutHandle !== null) {
          window.clearTimeout(timeoutHandle)
          timeoutHandle = null
        }
      }, { timeout: isSmallScreen ? 1600 : 1200 })
    }

    return () => {
      cancelled = true
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle)
      }
      if (idleHandle !== null && cancelIdleCallback) {
        cancelIdleCallback(idleHandle)
      }
    }
  }, [])

  const asciiConfig = asciiMode === "lite"
    ? { asciiFontSize: 4, textFontSize: 300, planeBaseHeight: 6.2, enableWaves: true as const }
    : { asciiFontSize: 3.8, textFontSize: 250, planeBaseHeight: 6, enableWaves: true as const }

  return (
    <section className="min-h-screen flex items-center px-6 relative overflow-hidden">

      <div className="max-w-7xl w-full mx-auto">
        <div className="grid lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-2 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div
              className={`transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="mb-4">
                <DecryptedText
                  text="ARTIST:"
                  parentClassName="block font-mono text-xs text-muted-foreground/60 tracking-wider"
                  className="text-muted-foreground/60"
                  encryptedClassName="text-muted-foreground/40"
                  animateOn="view"
                  sequential
                  useOriginalCharsOnly
                />
              </div>
              <div className="relative h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px] mb-6">
                {shouldRenderAscii ? (
                  <ASCIIText
                    text="DIDEM_KARACA"
                    asciiFontSize={asciiConfig.asciiFontSize}
                    textFontSize={asciiConfig.textFontSize}
                    textColor="#fdf9f3"
                    planeBaseHeight={asciiConfig.planeBaseHeight}
                    enableWaves={asciiConfig.enableWaves}
                    containerStyle={{
                      width: "min(100vw, 68rem)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      top: 0,
                      height: "100%",
                    }}
                  />
                ) : null}
                <h1 className="sr-only">DIDEM_KARACA</h1>
              </div>
              <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
                <div className="h-px w-16 bg-primary"></div>
                <span className="mono-highlight">
                  <DecryptedText
                    text="TATTOO_ARTIST"
                    parentClassName="inline-block"
                    className="text-foreground"
                    encryptedClassName="text-foreground/60"
                    animateOn="view"
                    sequential
                    useOriginalCharsOnly
                  />
                </span>
              </div>
              <DecryptedText
                text="Conceptual designs. Microrealism. Fine line work."
                parentClassName="block text-sm font-mono text-muted-foreground max-w-lg leading-relaxed mb-8 text-center lg:text-left mx-auto lg:mx-0"
                encryptedClassName="text-muted-foreground/40"
                animateOn="view"
                sequential
                useOriginalCharsOnly
              />

              <div className="mb-12">
                <a
                  href="https://instagram.com/didemrs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blueprint-btn px-8 py-4 rounded-none inline-flex items-center gap-3 mx-auto lg:mx-0"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.689-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z" />
                  </svg>
                  <DecryptedText
                    text="CONNECT_VIA_INSTAGRAM"
                    parentClassName="inline-block text-xs uppercase tracking-wide text-center"
                    className="text-[#f5f7ff]"
                    encryptedClassName="text-[#f5f7ff]/70"
                    animateOn="view"
                    sequential
                    useOriginalCharsOnly
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end justify-center h-full">
            <div className="flex flex-col items-center space-y-6 rotate-90 origin-center">
              <DecryptedText
                text="EXPLORE_WORK"
                parentClassName="font-mono text-xs text-muted-foreground/60 whitespace-nowrap"
                className="text-muted-foreground/60"
                encryptedClassName="text-muted-foreground/40"
                animateOn="view"
                sequential
                useOriginalCharsOnly
              />
              <div className="w-px h-16 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 lg:hidden">
        <div className="flex flex-col items-center space-y-3">
          <DecryptedText
            text="SCROLL"
            parentClassName="font-mono text-xs text-muted-foreground/60"
            className="text-muted-foreground/60"
            encryptedClassName="text-muted-foreground/40"
            animateOn="view"
            sequential
            useOriginalCharsOnly
          />
          <div className="w-px h-12 bg-gradient-to-b from-primary via-primary/50 to-transparent animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
