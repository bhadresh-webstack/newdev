"use client"

import type React from "react"

import Link from "next/link"
import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  ArrowRight,
  CheckCircle,
  Code,
  CreditCard,
  Globe,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"

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

const iconAnimation = {
  hidden: { scale: 0.8, opacity: 0, y: 20 },
  visible: (i) => ({
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      delay: i * 0.1,
    },
  }),
}

export default function LandingPage() {
  const featuresRef = useRef<HTMLElement>(null)
  const rolesRef = useRef<HTMLElement>(null)
  const pricingRef = useRef<HTMLElement>(null)
  const testimonialsRef = useRef<HTMLElement>(null)

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const { scrollYProgress } = useScroll()
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  return (
    <div className="flex min-h-screen flex-col font-poppins">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Webstack
            </span>
          </motion.div>
          <nav className="hidden md:flex gap-6">
            {[
              { name: "Features", ref: featuresRef },
              { name: "Roles", ref: rolesRef },
              { name: "Pricing", ref: pricingRef },
              { name: "Testimonials", ref: testimonialsRef },
            ].map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <button
                  onClick={() => scrollToSection(item.ref)}
                  className="text-sm font-normal hover:text-primary transition-colors"
                >
                  {item.name}
                </button>
              </motion.div>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ThemeToggle />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 hover:text-primary transition-all font-normal"
                onClick={() => scrollToSection(pricingRef)}
              >
                Sign Up
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-primary/10 hover:text-primary transition-all font-normal"
                >
                  Login
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </header>
      <main className="flex-1">
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
                  Webstack provides a fully managed website development service, allowing customers to submit projects
                  and track progress while enabling team members to efficiently build, iterate, and manage these
                  projects.
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
                  description:
                    "Track project status, provide feedback, and manage your website development in real-time",
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

        <section ref={rolesRef} id="roles" className="py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center text-center mb-12"
            >
              <h2 className="text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Role-Based Features
              </h2>
              <p className="mt-4 max-w-[700px] text-muted-foreground md:text-xl font-light">
                Tailored experiences for customers, team members, and administrators
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
                  title: "Customers",
                  icon: Users,
                  gradient: "from-blue-500 to-cyan-400",
                  items: [
                    "Submit detailed project requirements",
                    "Track project status in real-time",
                    "Provide feedback on iterations",
                    "Approve final website versions",
                    "Manage subscriptions and payments",
                    "Request ongoing maintenance",
                  ],
                },
                {
                  title: "Team Members",
                  icon: Code,
                  gradient: "from-purple-500 to-pink-500",
                  items: [
                    "View assigned projects and tasks",
                    "Track development progress",
                    "Implement customer feedback",
                    "Collaborate with other team members",
                    "Deploy approved websites",
                    "Provide ongoing support",
                  ],
                },
                {
                  title: "Administrators",
                  icon: Settings,
                  gradient: "from-amber-500 to-orange-500",
                  items: [
                    "Monitor all ongoing projects",
                    "Assign projects to team members",
                    "Handle customer escalations",
                    "Manage subscriptions and billing",
                    "Generate performance reports",
                    "Oversee team coordination",
                  ],
                },
              ].map((role, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                    <CardHeader className={`bg-gradient-to-br ${role.gradient} rounded-t-lg`}>
                      <CardTitle className="flex items-center gap-2 text-white font-medium">
                        <role.icon className="h-5 w-5" />
                        {role.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ul className="space-y-2">
                        {role.items.map((item, j) => (
                          <motion.li
                            key={j}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="font-light">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

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
            </motion.div>
            <div className="mt-12 text-center">
              <p className="text-muted-foreground font-light">
                Need a custom solution?{" "}
                <Link href="#" className="text-primary font-normal hover:underline">
                  Contact us
                </Link>{" "}
                for a personalized quote.
              </p>
            </div>
          </div>
        </section>

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

        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center text-center mb-12"
            >
              <h2 className="text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Trusted by Leading Businesses
              </h2>
              <p className="mt-4 max-w-[700px] text-muted-foreground md:text-xl font-light">
                Join hundreds of satisfied clients who trust Webstack for their website development needs
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  variants={iconAnimation}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-center justify-center p-4"
                >
                  <div className="h-16 w-32 bg-gradient-to-br from-muted/80 to-muted/30 rounded-md flex items-center justify-center text-muted-foreground font-normal shadow-md hover:shadow-lg transition-shadow">
                    Partner {i}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-r from-primary to-purple-600 text-white">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
              <p className="mt-4 max-w-[700px] text-white/80 md:text-xl font-light">
                Join hundreds of businesses who trust Webstack for their website development needs
              </p>
              <Link href="/signup?plan=business">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="secondary" className="mt-8 h-12 px-8 font-normal shadow-lg">
                    Start Your Project
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/50">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="h-6 w-6 text-primary" />
                <span className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                  Webstack
                </span>
              </div>
              <p className="text-muted-foreground font-light">
                Streamlined website development workflow for businesses of all sizes.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "Testimonials", "Blog"].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => {
                        if (item === "Features") scrollToSection(featuresRef)
                        else if (item === "Pricing") scrollToSection(pricingRef)
                        else if (item === "Testimonials") scrollToSection(testimonialsRef)
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors font-light"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                {["About Us", "Careers", "Contact", "Privacy Policy"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors font-light">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="text-muted-foreground font-light">123 Web Street, Digital City</li>
                <li className="text-muted-foreground font-light">contact@webstack.com</li>
                <li className="text-muted-foreground font-light">+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-6 text-center text-muted-foreground font-light">
            <p>© {new Date().getFullYear()} Webstack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true)
    }
  }, [])

  if (!mounted) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
