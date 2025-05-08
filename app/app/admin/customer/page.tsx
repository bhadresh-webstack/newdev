"use client"

import { useState } from "react"
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  FileText,
  ExternalLink,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Mock data for customers
const customers = [
  {
    id: "c001",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    company: "TechNova Solutions",
    status: "active",
    projects: 3,
    totalSpent: "$12,450",
    lastActive: "2 hours ago",
    avatar: "/placeholder.svg",
    address: "123 Tech Avenue, San Francisco, CA 94107",
    joinDate: "January 15, 2023",
    notes: "Enterprise client with multiple ongoing projects. Prefers communication via email.",
    paymentMethod: "Credit Card",
    projectNames: ["Website Redesign", "Mobile App", "SEO Optimization"],
  },
  {
    id: "c002",
    name: "Samantha Lee",
    email: "samantha.lee@example.com",
    phone: "+1 (555) 987-6543",
    company: "Quantum Dynamics",
    status: "active",
    projects: 2,
    totalSpent: "$8,275",
    lastActive: "1 day ago",
    avatar: "/placeholder.svg",
    address: "456 Innovation Drive, Boston, MA 02110",
    joinDate: "March 3, 2023",
    notes: "Startup client focused on rapid development. Weekly progress meetings required.",
    paymentMethod: "Bank Transfer",
    projectNames: ["E-commerce Platform", "Brand Identity"],
  },
  {
    id: "c003",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    phone: "+1 (555) 456-7890",
    company: "Stellar Innovations",
    status: "inactive",
    projects: 1,
    totalSpent: "$3,600",
    lastActive: "2 weeks ago",
    avatar: "/placeholder.svg",
    address: "789 Galaxy Road, Austin, TX 78701",
    joinDate: "November 10, 2022",
    notes: "Project currently on hold due to budget constraints. Follow up in Q3.",
    paymentMethod: "PayPal",
    projectNames: ["Data Analytics Dashboard"],
  },
  {
    id: "c004",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    phone: "+1 (555) 234-5678",
    company: "Horizon Enterprises",
    status: "active",
    projects: 4,
    totalSpent: "$21,300",
    lastActive: "3 hours ago",
    avatar: "/placeholder.svg",
    address: "101 Skyline Blvd, Seattle, WA 98101",
    joinDate: "February 22, 2023",
    notes: "VIP client with high priority support. Direct line to project manager.",
    paymentMethod: "Credit Card",
    projectNames: ["CRM Integration", "Cloud Migration", "Mobile App", "AI Chatbot"],
  },
  {
    id: "c005",
    name: "David Kim",
    email: "david.kim@example.com",
    phone: "+1 (555) 876-5432",
    company: "Apex Solutions",
    status: "pending",
    projects: 0,
    totalSpent: "$0",
    lastActive: "Just joined",
    avatar: "/placeholder.svg",
    address: "222 Summit Avenue, Denver, CO 80202",
    joinDate: "April 5, 2023",
    notes: "New client, initial consultation scheduled for next week.",
    paymentMethod: "Pending",
    projectNames: [],
  },
]

// Mock data for customer activities
const customerActivities = [
  {
    id: "a001",
    customerId: "c001",
    type: "project_created",
    projectName: "Website Redesign",
    date: "2023-03-15",
    description: "Created a new project for website redesign",
  },
  {
    id: "a002",
    customerId: "c001",
    type: "payment",
    amount: "$4,500",
    date: "2023-03-20",
    description: "Made payment for initial project phase",
  },
  {
    id: "a003",
    customerId: "c002",
    type: "project_created",
    projectName: "Mobile App Development",
    date: "2023-02-28",
    description: "Started mobile app development project",
  },
  {
    id: "a004",
    customerId: "c004",
    type: "feedback",
    date: "2023-03-18",
    description: "Provided feedback on project deliverables",
  },
  {
    id: "a005",
    customerId: "c001",
    type: "milestone",
    projectName: "Website Redesign",
    date: "2023-04-02",
    description: "Completed first milestone of website redesign",
  },
]

export default function CustomerManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    status: "active",
    notes: "",
    paymentMethod: "Credit Card",
  })
  const [customersList, setCustomersList] = useState(customers)

  // Filter customers based on search term and status
  const filteredCustomers = customersList.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Handle view details click
  interface Customer {
    id: string
    name: string
    email: string
    phone: string
    company: string
    status: string
    projects: number
    totalSpent: string
    lastActive: string
    avatar: string
    address: string
    joinDate: string
    notes: string
    paymentMethod: string
    projectNames: string[]
  }

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailsOpen(true)
  }

  // Handle input change for new customer form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle select change for new customer form
  const handleSelectChange = (name: keyof typeof newCustomer, value: string): void => {
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle add customer form submission
  interface NewCustomer {
    name: string
    email: string
    phone: string
    company: string
    address: string
    status: string
    notes: string
    paymentMethod: string
  }

  interface CustomerObj extends NewCustomer {
    id: string
    projects: number
    totalSpent: string
    lastActive: string
    avatar: string
    joinDate: string
    projectNames: string[]
  }

  const handleAddCustomer = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    // Create new customer object
    const newCustomerObj: CustomerObj = {
      id: `c${customersList.length + 1}`.padStart(4, "0"),
      ...newCustomer,
      projects: 0,
      totalSpent: "$0",
      lastActive: "Just joined",
      avatar: "/placeholder.svg",
      joinDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      projectNames: [],
    }

    // Add new customer to the list
    setCustomersList((prev) => [...prev, newCustomerObj])

    // Reset form and close dialog
    setNewCustomer({
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      status: "active",
      notes: "",
      paymentMethod: "Credit Card",
    })
    setIsAddCustomerOpen(false)
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
        <p className="text-muted-foreground">Manage your customers and view their project activities</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersList.length}</div>
            <p className="text-xs text-muted-foreground">+2 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Across {customersList.filter((c) => c.status === "active").length} active customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,625</div>
            <p className="text-xs text-muted-foreground">+$12,300 from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button className="flex items-center gap-1" onClick={() => setIsAddCustomerOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Add Customer
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={customer.avatar} alt={customer.name} />
                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.name}</span>
                            <span className="text-sm text-muted-foreground">{customer.company}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.status === "active"
                              ? "default"
                              : customer.status === "inactive"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.projects}</TableCell>
                      <TableCell>{customer.totalSpent}</TableCell>
                      <TableCell>{customer.lastActive}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="mr-2 h-4 w-4" />
                              Call Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete Customer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Customer Activities</CardTitle>
              <CardDescription>Track the latest activities from your customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {customerActivities.map((activity) => {
                  const customer = customersList.find((c) => c.id === activity.customerId)
                  return (
                    <div key={activity.id} className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={customer?.avatar} alt={customer?.name} />
                        <AvatarFallback>{customer?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {customer?.name}
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            {activity.type === "project_created" && "created a new project"}
                            {activity.type === "payment" && "made a payment"}
                            {activity.type === "feedback" && "provided feedback"}
                            {activity.type === "milestone" && "completed a milestone"}
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Details Dialog - Redesigned for professional, stylish look */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedCustomer && (
            <>
              <DialogHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={selectedCustomer.avatar} alt={selectedCustomer.name} />
                      <AvatarFallback>{selectedCustomer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl">{selectedCustomer.name}</DialogTitle>
                      <DialogDescription className="text-sm">{selectedCustomer.company}</DialogDescription>
                    </div>
                  </div>
                  <Badge
                    variant={
                      selectedCustomer.status === "active"
                        ? "default"
                        : selectedCustomer.status === "inactive"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Joined {selectedCustomer.joinDate}</span>
                  </div>
                  <div className="font-medium">{selectedCustomer.totalSpent} total spent</div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedCustomer.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedCustomer.phone}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground">Payment Method</h4>
                      <p className="text-sm flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedCustomer.paymentMethod}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground">Last Active</h4>
                      <p className="text-sm">{selectedCustomer.lastActive}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Address</h4>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.notes}</p>
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="pt-4">
                  {selectedCustomer.projectNames.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCustomer.projectNames.map((project, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/40 rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-medium">{project}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>View</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No projects yet</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="pt-4">
                  <div className="space-y-4">
                    {customerActivities
                      .filter((activity) => activity.customerId === selectedCustomer.id)
                      .map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                          <div>
                            <p className="text-sm font-medium">
                              {activity.type === "project_created" && `Created project: ${activity.projectName}`}
                              {activity.type === "payment" && `Made payment: ${activity.amount}`}
                              {activity.type === "feedback" && "Provided feedback"}
                              {activity.type === "milestone" && `Completed milestone: ${activity.projectName}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    {customerActivities.filter((activity) => activity.customerId === selectedCustomer.id).length ===
                      0 && (
                      <div className="py-8 text-center text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No recent activities</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="flex justify-between sm:justify-between gap-2">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                </div>
                <Button size="sm">Edit Customer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Enter the customer details below to create a new customer record.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddCustomer}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={newCustomer.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Acme Inc."
                    value={newCustomer.company}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={newCustomer.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={newCustomer.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St, City, State, Zip"
                  value={newCustomer.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newCustomer.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={newCustomer.paymentMethod}
                    onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional information about the customer..."
                  value={newCustomer.notes}
                  onChange={handleInputChange}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
