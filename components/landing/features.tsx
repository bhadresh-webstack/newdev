"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Code, CreditCard, Globe, LayoutDashboard, MessageSquare, Settings } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FeaturesProps {
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const Features = ({ featuresRef }: FeaturesProps) => {
  return (
    <section ref={featuresRef} id="features" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="flex flex-col items-center text-center mb-12"
        >
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Powerful Features
          </h2>
          <p className="mt-4 max-w-[700px] text-muted-foreground md:text-xl font-light">
            Everything you need to manage website development projects from start to finish
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {[
            {
              icon: LayoutDashboard,
              title: "Intuitive Dashboard",
              description: "Track project status, provide feedback, and manage your website development in real-time",
              gradient: "from-blue-500 to-cyan-400",
            },
            {
              icon: MessageSquare,
              title: "Seamless Communication",
              description: "Direct feedback and communication between customers and development team",
              gradient: "from-purple-500 to-pink-500",
            },
            {
              icon: Code,
              title: "Professional Development",
              description: "Expert team of developers and designers to build your website to specification",
              gradient: "from-amber-500 to-orange-500",
            },
            {
              icon: Globe,
              title: "Reliable Hosting",
              description: "Your website hosted on our high-performance infrastructure with 99.9% uptime",
              gradient: "from-emerald-500 to-green-500",
            },
            {
              icon: Settings,
              title: "Ongoing Maintenance",
              description: "Continuous updates, fixes, and optimizations to keep your website running smoothly",
              gradient: "from-rose-500 to-red-500",
            },
            {
              icon: CreditCard,
              title: "Flexible Pricing",
              description: "Choose the plan that fits your needs and budget with transparent pricing",
              gradient: "from-indigo-500 to-violet-500",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <CardHeader>
                  <div
                    className={`rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-br ${feature.gradient} mb-4 shadow-md relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-gradient-slow"></div>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="font-medium">{feature.title}</CardTitle>
                  <CardDescription className="font-light">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Features
