"use client"

import type React from "react"
import { motion } from "framer-motion"
import { ArrowRight, LayoutDashboard, Code, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroProps {
  pricingRef: React.RefObject<HTMLElement | null>
  backgroundOpacity: any
  featuresRef: React.RefObject<HTMLElement | null>
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const Hero = ({ pricingRef, backgroundOpacity, featuresRef }: HeroProps) => {
  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background dark:from-primary/30 dark:via-purple-500/20 dark:to-background/80 animate-gradient-slow"
        style={{ opacity: backgroundOpacity }}
      />
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 dark:opacity-20"></div>
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex flex-col items-start text-left"
          >
            <h1 className="text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl">
              Streamlined Website
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                {" "}
                Development
              </span>
            </h1>
            <p className="mt-6 text-muted-foreground md:text-xl font-light">
              Webstack provides a fully managed website development service, allowing customers to submit projects and
              track progress while enabling team members to efficiently build, iterate, and manage these projects.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 font-normal"
                  onClick={() => scrollToSection(pricingRef)}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 border-primary/20 hover:bg-primary/5 transition-colors font-normal"
                  onClick={() => scrollToSection(featuresRef)}
                >
                  Learn More
                </Button>
              </motion.div>
            </div>
          </motion.div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
            <div className="relative grid grid-cols-2 gap-8">
              <motion.div
                className="col-span-2 flex justify-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="rounded-2xl w-28 h-28 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg relative overflow-hidden"
                  animate={{
                    y: [0, -10, 0],
                    transition: {
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      duration: 3,
                      ease: "easeInOut",
                    },
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-gradient-slow"></div>
                  <LayoutDashboard className="h-14 w-14 text-white" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="rounded-2xl w-28 h-28 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg relative overflow-hidden"
                  animate={{
                    y: [0, -10, 0],
                    transition: {
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      duration: 3.5,
                      delay: 0.5,
                      ease: "easeInOut",
                    },
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-gradient-slow"></div>
                  <Code className="h-14 w-14 text-white" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div
                  className="rounded-2xl w-28 h-28 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg relative overflow-hidden ml-auto"
                  animate={{
                    y: [0, -10, 0],
                    transition: {
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      duration: 4,
                      delay: 1,
                      ease: "easeInOut",
                    },
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-gradient-slow"></div>
                  <Globe className="h-14 w-14 text-white" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
