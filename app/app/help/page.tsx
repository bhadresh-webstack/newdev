"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, HelpCircle, FileText, MessageSquare, Book, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react"
import { Canvas } from "@react-three/fiber"
import { PresentationControls, Environment, Float } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { demoProjects, demoTasks } from "@/lib/data-utils"
// Import the useRouter hook at the top of the file with the other imports
import { useRouter } from "next/navigation"

// 3D Icon Component
function Icon3D({ icon, color = "#4f46e5" }) {
  return (
    <Canvas dpr={[1, 2]} shadows camera={{ position: [0, 0, 4], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <PresentationControls
        global
        config={{ mass: 2, tension: 500 }}
        snap={{ mass: 4, tension: 1500 }}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <Float rotationIntensity={0.2} floatIntensity={2}>
          <mesh castShadow receiveShadow scale={1.5}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} />
            {icon === "help" && (
              <mesh position={[0, 0, 0.51]} scale={0.7}>
                <torusGeometry args={[0.3, 0.1, 16, 32]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            )}
            {icon === "docs" && (
              <group position={[0, 0, 0.51]} scale={0.6}>
                <mesh position={[0, 0.1, 0]}>
                  <planeGeometry args={[0.8, 0.8]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0, 0, 0.01]}>
                  <planeGeometry args={[0.6, 0.1]} />
                  <meshStandardMaterial color={color} />
                </mesh>
                <mesh position={[0, -0.15, 0.01]}>
                  <planeGeometry args={[0.6, 0.1]} />
                  <meshStandardMaterial color={color} />
                </mesh>
              </group>
            )}
            {icon === "chat" && (
              <group position={[0, 0, 0.51]} scale={0.6}>
                <mesh>
                  <planeGeometry args={[0.8, 0.6]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[-0.15, 0, 0.01]}>
                  <circleGeometry args={[0.1, 32]} />
                  <meshStandardMaterial color={color} />
                </mesh>
                <mesh position={[0.15, 0, 0.01]}>
                  <circleGeometry args={[0.1, 32]} />
                  <meshStandardMaterial color={color} />
                </mesh>
              </group>
            )}
          </mesh>
        </Float>
        <Environment preset="city" />
      </PresentationControls>
    </Canvas>
  )
}

// FAQ Item Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border py-4">
      <button
        className="flex w-full items-center justify-between text-left font-medium"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 text-muted-foreground"
        >
          {answer}
        </motion.div>
      )}
    </div>
  )
}

// Inside the HelpPage component, add the router
export default function HelpPage() {
  const router = useRouter()
  // Generate some knowledge base articles from demo data
  const knowledgeBaseArticles = [
    {
      id: "kb-1",
      title: "Getting Started with Projects",
      description: "Learn how to create and manage your first project",
      category: "Projects",
      views: 1245,
    },
    {
      id: "kb-2",
      title: "Managing Tasks and Assignments",
      description: "How to create, assign and track tasks effectively",
      category: "Tasks",
      views: 987,
    },
    {
      id: "kb-3",
      title: "Team Collaboration Best Practices",
      description: "Tips for effective team collaboration on the platform",
      category: "Team",
      views: 756,
    },
    {
      id: "kb-4",
      title: "Billing and Subscription Management",
      description: "Understanding your billing cycle and subscription options",
      category: "Billing",
      views: 543,
    },
    {
      id: "kb-5",
      title: "Security and Privacy Settings",
      description: "How to configure security settings for your account",
      category: "Security",
      views: 821,
    },
  ]

  // FAQ data
  const faqItems = [
    {
      question: "How do I create a new project?",
      answer:
        "Navigate to the Projects section and click on the '+ New Project' button. Fill in the required details in the project creation form and click 'Create Project'.",
    },
    {
      question: "How can I invite team members?",
      answer:
        "Go to the Team section, click 'Invite Member', enter their email address and select their role. They will receive an invitation email to join your workspace.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual plans.",
    },
    {
      question: "How do I upgrade my subscription?",
      answer:
        "Visit the Settings > Billing section and click on 'Upgrade Plan'. You can compare different plans and select the one that best fits your needs.",
    },
    {
      question: "Can I export my project data?",
      answer:
        "Yes, you can export your project data in various formats (CSV, JSON, PDF) by going to the project settings and clicking on the 'Export' option.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Help & Support Center</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Find answers to common questions or reach out to our support team for assistance
        </p>
        <div className="mx-auto mt-6 flex max-w-md items-center space-x-2">
          <Input type="search" placeholder="Search for help articles..." className="h-10" />
          <Button type="submit" size="icon" className="h-10 w-10">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Support Categories with 3D Icons */}
      <div className="mb-16 grid gap-8 md:grid-cols-3">
        <Card className="overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Icon3D icon="help" color="#4f46e5" />
          </div>
          <CardHeader>
            <CardTitle>FAQs & Guides</CardTitle>
            <CardDescription>Browse our frequently asked questions and comprehensive guides</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <HelpCircle className="mr-2 h-4 w-4" />
              View FAQs
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            <Icon3D icon="docs" color="#10b981" />
          </div>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Detailed documentation for all features and functionalities</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Read Docs
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-orange-500/20 to-red-500/20">
            <Icon3D icon="chat" color="#f97316" />
          </div>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Get in touch with our support team for personalized assistance</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Us
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="faq" className="mb-16">
        <TabsList className="mb-8 grid w-full grid-cols-3">
          <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions about using Webstack</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {faqItems.map((item, index) => (
                  <FAQItem key={index} question={item.question} answer={item.answer} />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All FAQs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Browse our collection of detailed guides and tutorials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {knowledgeBaseArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Badge variant="outline">{article.category}</Badge>
                        <span className="text-xs text-muted-foreground">{article.views} views</span>
                      </div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">{article.description}</p>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button variant="ghost" size="sm" className="w-full">
                        <Book className="mr-2 h-4 w-4" />
                        Read Article
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Browse All Articles
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Reach out to our support team through these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Mail className="mr-3 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@webstack.com</p>
                    <p className="text-xs text-muted-foreground">Response time: 24-48 hours</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+1 (800) 123-4567</p>
                    <p className="text-xs text-muted-foreground">Mon-Fri, 9am-5pm EST</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="mr-3 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available for Premium plans</p>
                    <p className="text-xs text-muted-foreground">24/7 support</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
                <CardDescription>Fill out this form and we'll get back to you as soon as possible</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="Your email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input id="subject" placeholder="Ticket subject" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category
                    </label>
                    <select
                      id="category"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select a category</option>
                      <option value="account">Account Issues</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="technical">Technical Support</option>
                      <option value="feature">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea id="message" placeholder="Describe your issue in detail" rows={5} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="attachments" className="text-sm font-medium">
                      Attachments (optional)
                    </label>
                    <Input id="attachments" type="file" multiple />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Submit Ticket</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Project-Specific Help */}
      <Card className="mb-16">
        <CardHeader>
          <CardTitle>Project-Specific Help</CardTitle>
          <CardDescription>Get help with your current projects</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            <div className="grid gap-4 md:grid-cols-2">
              {demoProjects.map((project) => (
                <Card key={project.project_id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{project.project_title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${project.progress_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{project.progress_percentage}%</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Tasks:</span>
                        <span>{project.total_tasks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completed:</span>
                        <span>{project.completed_tasks}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Project Help
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Tasks Help */}
      <Card>
        <CardHeader>
          <CardTitle>Task-Specific Help</CardTitle>
          <CardDescription>Get help with your current tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            <div className="space-y-4">
              {demoTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{task.title}</CardTitle>
                      <Badge
                        variant={
                          task.status === "Completed"
                            ? "default"
                            : task.status === "In Progress"
                              ? "secondary"
                              : task.status === "Blocked"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Project: {task.project.title}</span>
                      {task.assigned_to_profile && (
                        <span className="text-xs text-muted-foreground">
                          Assigned to: {task.assigned_to_profile.first_name} {task.assigned_to_profile.last_name}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="ghost" size="sm" className="w-full">
                      Get Help With This Task
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push("/app/tasks")}>
            View All Tasks
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

