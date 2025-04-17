"use client"

import { useRef } from "react"
import { useScroll, useTransform } from "framer-motion"

import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import Roles from "@/components/landing/roles"
import Pricing from "@/components/landing/pricing"
import Testimonials from "@/components/landing/testimonials"
import Footer from "@/components/landing/footer"

export default function LandingPage() {
  const featuresRef = useRef<HTMLElement>(null)
  const rolesRef = useRef<HTMLElement>(null)
  const pricingRef = useRef<HTMLElement>(null)
  const testimonialsRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll()
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  return (
    <div className="flex min-h-screen flex-col font-poppins">
      <Header
        featuresRef={featuresRef}
        rolesRef={rolesRef}
        pricingRef={pricingRef}
        testimonialsRef={testimonialsRef}
        backgroundOpacity={backgroundOpacity}
      />
      <main className="flex-1">
        <Hero pricingRef={pricingRef} backgroundOpacity={backgroundOpacity} featuresRef={featuresRef} />
        <Features featuresRef={featuresRef} />
        <Roles rolesRef={rolesRef} />
        <Pricing pricingRef={pricingRef} />
        <Testimonials testimonialsRef={testimonialsRef} />
        <Footer />
      </main>
    </div>
  )
}
