"use client"

export function Contact() {
  return (
    <section id="contact" className="py-16 px-6 relative">
      <div className="pointer-events-none absolute -top-12 right-6 hidden md:block h-32 w-32 border border-primary/20 rotate-6" />
      <div className="pointer-events-none absolute bottom-0 left-6 hidden md:block h-20 w-20 border border-primary/10 -rotate-12 translate-y-1/2" />

      <div className="relative max-w-5xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-5 items-center">
          <div className="lg:col-span-3 space-y-8">
            <div>
              <span className="font-mono text-xs tracking-[0.4em] text-muted-foreground/60">BOOKING:</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-mono font-light text-foreground tracking-tight">
                LET'S<span className="text-primary">_</span>TALK_INK
              </h2>
              <p className="mt-5 text-sm md:text-base font-mono text-muted-foreground leading-relaxed max-w-xl">
                Share your concept, placement, and ideal timing. You'll hear back within 24 hours with next
                steps and available dates.
              </p>
            </div>

            <div className="flex items-start gap-6">
              <div className="mt-1 hidden sm:block h-16 w-px bg-gradient-to-b from-primary via-primary/20 to-transparent" />
              <ul className="space-y-3 font-mono text-xs uppercase tracking-wider text-muted-foreground/80">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-primary" aria-hidden="true" />Concept sketches included
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-primary" aria-hidden="true" />Fine line & microrealism focus
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-primary" aria-hidden="true" />Bespoke bookings only
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://instagram.com/didemrs"
                target="_blank"
                rel="noopener noreferrer"
                className="blueprint-btn px-8 py-3 rounded-none inline-flex items-center gap-3 text-xs uppercase tracking-wide"
              >
                <span>DM @didemrs</span>
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0-4 4m4-4H3" />
                </svg>
              </a>
              <span className="font-mono text-xs text-muted-foreground/70 uppercase tracking-widest">
                Response time &lt; 24h
              </span>
            </div>
          </div>

          <div className="lg:col-span-2 relative">
            <div className="hidden lg:block absolute -top-6 -left-8 h-16 w-16 border border-primary/10" aria-hidden="true" />
            <div className="space-y-6">
              <div className="blueprint-card rounded-none p-6 shadow-lg shadow-primary/10">
                <div className="font-mono text-xs text-muted-foreground/60 tracking-widest mb-3">STUDIO</div>
                <p className="text-sm font-mono text-muted-foreground/90 leading-relaxed">
                  Istanbul Tattoo Loft<br />
                  Beyoğlu, Istanbul, Türkiye
                </p>
                <p className="mt-4 text-[11px] font-mono uppercase tracking-[0.4em] text-primary/80">
                  By appointment only
                </p>
              </div>

              <div className="blueprint-card rounded-none p-6 translate-x-6">
                <div className="font-mono text-xs text-muted-foreground/60 tracking-widest mb-3">SCHEDULE</div>
                <p className="text-sm font-mono text-muted-foreground/90 leading-relaxed">
                  Tuesday – Saturday<br />10:00 – 19:00 (GMT+3)
                </p>
                <div className="mt-4 flex items-center gap-3 text-xs font-mono text-muted-foreground/70 uppercase tracking-widest">
                  <span className="h-1.5 w-1.5 bg-primary" aria-hidden="true" />
                  Free consultations via DM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
