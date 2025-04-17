"use client"

import type React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PricingProps {
  pricingRef: React.RefObject<HTMLElement | null>
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

const Pricing = ({ pricingRef }: PricingProps) => {
  return (
    <section ref={pricingRef} id="pricing" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="flex flex-col items-center text-center mb-12"
        >
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Transparent Pricing
          </h2>
          <p className="mt-4 max-w-[700px] text-muted-foreground md:text-xl font-light">
            Choose the plan that fits your business needs
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {[
            {
              title: "Starter",
              price: "$499",
              description: "One-time payment",
              features: [
                "5-page responsive website",
                "2 rounds of revisions",
                "Basic SEO setup",
                "Contact form integration",
                "3 months of hosting included",
              ],
              popular: false,
              gradient: "from-blue-500 to-cyan-400",
            },
            {
              title: "Business",
              price: "$999",
              description: "One-time payment",
              features: [
                "10-page responsive website",
                "4 rounds of revisions",
                "Advanced SEO optimization",
                "Blog/News section",
                "Social media integration",
                "6 months of hosting included",
              ],
              popular: true,
              gradient: "from-purple-500 to-pink-500",
            },
            {
              title: "Enterprise",
              price: "$1,999",
              description: "One-time payment",
              features: [
                "20+ page responsive website",
                "Unlimited revisions",
                "E-commerce functionality",
                "Custom integrations",
                "Priority support",
                "12 months of hosting included",
              ],
              popular: false,
              gradient: "from-amber-500 to-orange-500",
            },
          ].map((plan, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex flex-col h-full"
            >
              <Card
                className={`border-0 ${plan.popular ? "shadow-xl shadow-primary/20" : "shadow-md hover:shadow-xl"} transition-all duration-300 relative flex flex-col h-full overflow-hidden group`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 rounded-bl-lg rounded-tr-lg bg-gradient-to-r from-primary to-purple-600 px-3 py-1 text-xs font-normal text-white">
                    Popular
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader>
                  <CardTitle className="font-medium">{plan.title}</CardTitle>
                  <div className="mt-4 text-4xl font-medium bg-clip-text text-transparent bg-gradient-to-r">
                    {plan.price}
                  </div>
                  <CardDescription className="mt-2 font-light">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {plan.features.map((feature, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: j * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="font-light">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.title === "Starter" ? (
                    <Link href="/signup?plan=starter" className="w-full">
                      <Button
                        className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-purple-600 hover:opacity-90" : "bg-primary hover:bg-primary/90"} transition-all font-normal`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  ) : plan.title === "Business" ? (
                    <Link href="/signup?plan=business" className="w-full">
                      <Button
                        className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-purple-600 hover:opacity-90" : "bg-primary hover:bg-primary/90"} transition-all font-normal`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/signup?plan=enterprise" className="w-full">
                      <Button
                        className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-purple-600 hover:opacity-90" : "bg-primary hover:bg-primary/90"} transition-all font-normal`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground font-light">
              Need a custom solution?{" "}
              <Link href="#" className="text-primary font-normal hover:underline">
                Contact us
              </Link>{" "}
              for a personalized quote.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Pricing
