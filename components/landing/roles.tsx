"use client"

import type React from "react"
import { motion } from "framer-motion"
import { CheckCircle, Code, Settings, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RolesProps {
  rolesRef: React.RefObject<HTMLElement | null>
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

const Roles = ({ rolesRef }: RolesProps) => {
  return (
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
  )
}

export default Roles
