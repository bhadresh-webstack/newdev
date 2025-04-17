"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TestimonialsProps {
  testimonialsRef: React.RefObject<HTMLElement | null>
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

const Testimonials = ({ testimonialsRef }: TestimonialsProps) => {
  return (
    <section ref={testimonialsRef} id="testimonials" className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="flex flex-col items-center text-center mb-12"
        >
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            What Our Clients Say
          </h2>
          <p className="mt-4 max-w-[700px] text-muted-foreground md:text-xl font-light">
            Don't just take our word for it - hear from some of our satisfied customers
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
              initials: "JD",
              name: "John Doe",
              company: "CEO, TechStart",
              testimonial:
                "Webstack transformed our online presence. The team was professional, responsive, and delivered a website that exceeded our expectations. The project management platform made it easy to track progress and provide feedback.",
              gradient: "from-blue-500 to-cyan-400",
            },
            {
              initials: "SJ",
              name: "Sarah Johnson",
              company: "Marketing Director, GrowFast",
              testimonial:
                "The iterative process was seamless. We could see our website evolve with each revision, and the team was quick to implement our feedback. The final product has significantly increased our conversion rates.",
              gradient: "from-purple-500 to-pink-500",
            },
            {
              initials: "MP",
              name: "Michael Patel",
              company: "Owner, Artisan Crafts",
              testimonial:
                "As a small business owner, I needed a professional website without the hassle. Webstack delivered exactly what I needed, on time and within budget. The ongoing support has been exceptional.",
              gradient: "from-amber-500 to-orange-500",
            },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-full bg-gradient-to-br ${testimonial.gradient} w-12 h-12 flex items-center justify-center shadow-md relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-gradient-slow"></div>
                      <span className="text-white font-medium">{testimonial.initials}</span>
                    </div>
                    <div>
                      <CardTitle className="text-base font-medium">{testimonial.name}</CardTitle>
                      <CardDescription className="font-light">{testimonial.company}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-light">"{testimonial.testimonial}"</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
