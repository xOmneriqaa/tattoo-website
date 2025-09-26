import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Portfolio } from "@/components/portfolio"
import { Contact } from "@/components/contact"
import Script from "next/script"

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://didemkaraca.com"
  const sanitizedSiteUrl = siteUrl.replace(/\/$/, "")

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: "Didem Karaca Tattoo Studio",
    url: `${sanitizedSiteUrl}/`,
    description:
      "Custom fine line, microrealism, and conceptual tattoo artistry handcrafted by Istanbul-based artist Didem Karaca.",
    image: `${sanitizedSiteUrl}/didem-karaca-tattoo-artist-portrait.jpg`,
    sameAs: ["https://instagram.com/didemrs"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Istanbul Tattoo Loft, Beyoğlu",
      addressLocality: "Istanbul",
      addressCountry: "TR",
    },
    areaServed: {
      "@type": "City",
      name: "Istanbul",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    priceRange: "$$",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["English", "Turkish"],
      url: "https://instagram.com/didemrs",
    },
  }

  return (
    <main className="relative min-h-screen">
      <Script id="tattoo-artist-structured-data" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(structuredData)}
      </Script>
      <Hero />
      <Portfolio />
      <About />
      <Contact />
    </main>
  )
}
