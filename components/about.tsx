"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

import DecryptedText from "@/components/DecryptedText"

export function About() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    const element = document.getElementById("about")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3">
            <div
              className={`transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              } text-center lg:text-left flex flex-col items-center lg:items-start`}
            >
              <div className="mb-6">
                <DecryptedText
                  text="PROFILE:"
                  parentClassName="block font-mono text-xs text-muted-foreground/60 tracking-wider"
                  className="text-muted-foreground/60"
                  encryptedClassName="text-muted-foreground/40"
                  animateOn="view"
                  sequential
                  useOriginalCharsOnly
                />
              </div>
              <h2 className="text-4xl md:text-5xl font-mono font-light mb-8 text-foreground tech-accent text-center lg:text-left">
                <DecryptedText
                  text="ABOUT_DIDEM"
                  parentClassName="block"
                  animateOn="view"
                  sequential
                  useOriginalCharsOnly
                />
              </h2>

              <div className="space-y-6 text-muted-foreground leading-relaxed w-full">
                <div className="space-y-4 text-left">
                  <p className="font-mono text-base text-left">
                    <span className="mono-highlight text-primary">
                      <DecryptedText
                        text="Professional"
                        parentClassName="inline-block"
                        className="text-primary"
                        encryptedClassName="text-primary/60"
                        animateOn="view"
                        sequential
                        useOriginalCharsOnly
                      />
                    </span>{" "}
                    <DecryptedText
                      text="tattoo artist."
                      parentClassName="inline-block"
                      animateOn="view"
                      sequential
                      useOriginalCharsOnly
                    />
                  </p>
                  <p className="font-mono text-base text-left">
                    <DecryptedText
                      text="Specializing in"
                      parentClassName="inline-block"
                      animateOn="view"
                      sequential
                      useOriginalCharsOnly
                    />{" "}
                    <span className="mono-highlight text-primary">
                      <DecryptedText
                        text="conceptual"
                        parentClassName="inline-block"
                        className="text-primary"
                        encryptedClassName="text-primary/60"
                        animateOn="view"
                        sequential
                        useOriginalCharsOnly
                      />
                    </span>,{" "}
                    <span className="mono-highlight text-primary">
                      <DecryptedText
                        text="microrealism"
                        parentClassName="inline-block"
                        className="text-primary"
                        encryptedClassName="text-primary/60"
                        animateOn="view"
                        sequential
                        useOriginalCharsOnly
                      />
                    </span>{" "}&{" "}
                    <span className="mono-highlight text-primary">
                      <DecryptedText
                        text="fine line"
                        parentClassName="inline-block"
                        className="text-primary"
                        encryptedClassName="text-primary/60"
                        animateOn="view"
                        sequential
                        useOriginalCharsOnly
                      />
                    </span>{" "}
                    <DecryptedText
                      text="work."
                      parentClassName="inline-block"
                      animateOn="view"
                      sequential
                      useOriginalCharsOnly
                    />
                  </p>
                  <p className="font-mono text-sm text-muted-foreground/80 text-left">
                    <DecryptedText
                      text="Each piece is designed with precision and care, creating timeless art that speaks to your story."
                      parentClassName="inline-block"
                      encryptedClassName="text-muted-foreground/40"
                      animateOn="view"
                      sequential
                      useOriginalCharsOnly
                    />
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-primary/20">
                <div className="font-mono text-xs text-muted-foreground/60 mb-4 tracking-wider text-center lg:text-left">
                  <DecryptedText
                    text="CONNECT:"
                    parentClassName=""
                    className="text-muted-foreground/60"
                    encryptedClassName="text-muted-foreground/40"
                    animateOn="view"
                    sequential
                    useOriginalCharsOnly
                  />
                </div>
                <a
                  href="https://instagram.com/didemrs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 font-mono text-base text-primary hover:text-primary/80 transition-all duration-300 tech-accent group mx-auto lg:mx-0"
                >
                  <svg
                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z" />
                  </svg>
                  <DecryptedText
                    text="@didemrs"
                    parentClassName="inline-block"
                    animateOn="view"
                    sequential
                    useOriginalCharsOnly
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 lg:flex lg:justify-end">
            <div
              className={`relative w-full transition-all duration-700 delay-400 ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              }`}
            >
              <div className="blueprint-card rounded-none p-3 sm:p-4 w-full max-w-[92vw] sm:max-w-[80vw] md:max-w-[70vw] lg:w-[26rem] lg:max-w-none mx-auto lg:ml-8">
                <div className="aspect-[4/5] overflow-hidden relative">
                  <Image
                    src="/didem-karaca-tattoo-artist-portrait.jpg"
                    alt="Didem Karaca - Tattoo Artist"
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    sizes="(min-width: 1024px) 26rem, (min-width: 768px) 42rem, min(96vw, 36rem)"
                    loading="lazy"
                    quality={90}
                  />
                </div>
                <div className="mt-4 font-mono text-xs text-muted-foreground/60">
                  <DecryptedText
                    text="artist_portrait.jpg"
                    parentClassName="block"
                    encryptedClassName="text-muted-foreground/40"
                    animateOn="view"
                    sequential
                    useOriginalCharsOnly
                  />
                  <DecryptedText
                    text="// didemrs"
                    parentClassName="block text-primary/60"
                    encryptedClassName="text-primary/40"
                    animateOn="view"
                    sequential
                    useOriginalCharsOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
