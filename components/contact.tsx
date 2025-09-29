"use client"

import DecryptedText from "@/components/DecryptedText"

export function Contact() {
  return (
    <section id="contact" className="py-16 px-6 relative">
      <div className="pointer-events-none absolute -top-12 right-6 hidden md:block h-32 w-32 border border-primary/20 rotate-6" />
      <div className="pointer-events-none absolute bottom-0 left-6 hidden md:block h-20 w-20 border border-primary/10 -rotate-12 translate-y-1/2" />

      <div className="relative max-w-5xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-5 items-center">
          <div className="lg:col-span-3 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div>
              <DecryptedText
                text="BOOKING:"
                parentClassName="font-mono text-xs tracking-[0.4em] text-muted-foreground/60"
                className="text-muted-foreground/60"
                encryptedClassName="text-muted-foreground/40"
                animateOn="view"
                sequential
                useOriginalCharsOnly
              />
            </div>
            <div className="w-full">
              <h2 className="text-3xl md:text-5xl font-mono font-light text-foreground tracking-tight text-center lg:text-left">
                <DecryptedText
                  text="LET'S_TALK_INK"
                  parentClassName="block"
                  animateOn="view"
                  sequential
                  useOriginalCharsOnly
                />
              </h2>
              <DecryptedText
                text="Share your concept, placement, and ideal timing. You'll hear back within 24 hours with next steps and available dates."
                parentClassName="block mt-5 text-sm md:text-base font-mono text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
                encryptedClassName="text-muted-foreground/40"
                animateOn="view"
                sequential
                useOriginalCharsOnly
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="mt-1 hidden sm:block h-16 w-px bg-gradient-to-b from-primary via-primary/20 to-transparent" />
              <ul className="space-y-3 font-mono text-xs uppercase tracking-wider text-muted-foreground/80 text-center sm:text-left">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-primary" aria-hidden="true" />
                  <DecryptedText
                    text="Concept sketches included"
                    parentClassName="inline-block"
                    encryptedClassName="text-muted-foreground/40"
                    animateOn="view"
                    sequential
                    useOriginalCharsOnly
                  />
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-primary" aria-hidden="true" />
                  <DecryptedText
                    text="Fine line & microrealism focus"
                    parentClassName="inline-block"
                    encryptedClassName="text-muted-foreground/40"
                    animateOn="view"
                    sequential
                    useOriginalCharsOnly
                  />
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-primary" aria-hidden="true" />
                  <DecryptedText
                    text="Bespoke bookings only"
                    parentClassName="inline-block"
                    encryptedClassName="text-muted-foreground/40"
                    animateOn="view"
                    sequential
                    useOriginalCharsOnly
                  />
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a
                href="https://instagram.com/didemrs"
                target="_blank"
                rel="noopener noreferrer"
                className="blueprint-btn px-8 py-3 rounded-none inline-flex items-center gap-3 text-xs uppercase tracking-wide mx-auto lg:mx-0"
              >
                <DecryptedText
                  text="DM @didemrs"
                  parentClassName="inline-block"
                  className="text-[#f5f7ff]"
                  encryptedClassName="text-[#f5f7ff]/70"
                  animateOn="view"
                  sequential
                  useOriginalCharsOnly
                />
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0-4 4m4-4H3" />
                </svg>
              </a>
              <DecryptedText
                text={"Response time < 24h"}
                parentClassName="font-mono text-xs text-muted-foreground/70 uppercase tracking-widest text-center lg:text-left"
                className="text-muted-foreground/70"
                encryptedClassName="text-muted-foreground/40"
                animateOn="view"
                sequential
                useOriginalCharsOnly
              />
            </div>
          </div>

          <div className="lg:col-span-2 relative flex flex-col items-center">
            <div className="hidden lg:block absolute -top-6 -left-8 h-16 w-16 border border-primary/10" aria-hidden="true" />
            <div className="space-y-6 w-full max-w-sm">
              <div className="blueprint-card rounded-none p-6 shadow-lg shadow-primary/10 text-center lg:text-left">
                <div className="font-mono text-xs text-muted-foreground/60 tracking-widest mb-3">
                  <DecryptedText
                    text="STUDIO"
                    parentClassName=""
                    className="text-muted-foreground/60"
                    encryptedClassName="text-muted-foreground/40"
                    animateOn="view"
                    sequential
                    useOriginalCharsOnly
                  />
                </div>
                <DecryptedText
                  text={"Istanbul Tattoo Loft\nBeyoğlu, Istanbul, Türkiye"}
                  parentClassName="block text-sm font-mono text-muted-foreground/90 leading-relaxed whitespace-pre-line"
                  encryptedClassName="text-muted-foreground/40"
                  animateOn="view"
                  sequential
                  useOriginalCharsOnly
                />
                <DecryptedText
                  text="By appointment only"
                  parentClassName="block mt-4 text-[11px] font-mono uppercase tracking-[0.4em] text-primary/80"
                  encryptedClassName="text-primary/40"
                  animateOn="view"
                  sequential
                  useOriginalCharsOnly
                />
              </div>

              <div className="blueprint-card rounded-none p-6 lg:translate-x-6 text-center lg:text-left">
                <div className="font-mono text-xs text-muted-foreground/60 tracking-widest mb-3">
                  <DecryptedText
                    text="SCHEDULE"
                    parentClassName=""
                    className="text-muted-foreground/60"
                    encryptedClassName="text-muted-foreground/40"
                    animateOn="view"
                    sequential
                    useOriginalCharsOnly
                  />
                </div>
                <DecryptedText
                  text={"Tuesday – Saturday\n10:00 – 19:00 (GMT+3)"}
                  parentClassName="block text-sm font-mono text-muted-foreground/90 leading-relaxed whitespace-pre-line"
                  encryptedClassName="text-muted-foreground/40"
                  animateOn="view"
                  sequential
                  useOriginalCharsOnly
                />
                <div className="mt-4 flex items-center gap-3 text-xs font-mono text-muted-foreground/70 uppercase tracking-widest justify-center lg:justify-start">
                  <span className="h-1.5 w-1.5 bg-primary" aria-hidden="true" />
                  <DecryptedText
                    text="Free consultations via DM"
                    parentClassName="inline-block"
                    encryptedClassName="text-muted-foreground/40"
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
