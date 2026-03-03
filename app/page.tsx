"use client"

import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"

import { CTASection, Footer } from "@/components/landing/cta-footer"
import { SpaceScene } from "@/components/space-scene"

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <SpaceScene variant="hero" />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  )
}
