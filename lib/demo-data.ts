export type DemoTask = {
  id: string
  project_id: string
  title: string
  description: string
  status: string
  task_group: string
  priority: string
  created_at: string
  updated_at: string
  project: {
    id: string
    title: string
  }
  assigned_to_profile: {
    id?: string
    first_name: string
    last_name: string
    profile_image: string | null
  } | null
}

export type DemoProject = {
  project_id: string
  project_title: string
  description: string
  status: string
  progress_percentage: number
  total_tasks: number
  completed_tasks: number
  created_at: string
  updated_at: string
  team_members: any[]
}

const tasks: DemoTask[] = [
  {
    id: "task-1",
    project_id: "project-1",
    title: "Design Homepage",
    description: "Create wireframes and mockups for the homepage",
    status: "Completed",
    task_group: "Done",
    priority: "High",
    created_at: "2023-03-01T10:00:00Z",
    updated_at: "2023-03-05T14:30:00Z",
    project: {
      id: "project-1",
      title: "E-commerce Website",
    },
    assigned_to_profile: {
      id: "user-1",
      first_name: "John",
      last_name: "Doe",
      profile_image: null,
    },
  },
  {
    id: "task-2",
    title: "Implement Product Listing",
    description: "Develop the product listing page with filtering and sorting",
    status: "In Progress",
    priority: "Medium",
    task_group: "In Progress",
    project: {
      id: "project-1",
      title: "E-commerce Website",
    },
    assigned_to_profile: {
      id: "user-2",
      first_name: "Jane",
      last_name: "Smith",
      profile_image: null,
    },
    created_at: "2023-03-02T09:00:00Z",
    updated_at: "2023-03-06T11:45:00Z",
  },
]

const projects: DemoProject[] = [
  {
    project_id: "project-1",
    project_title: "E-commerce Website",
    description: "A full-featured e-commerce platform with product catalog, shopping cart, and payment processing",
    status: "In Progress",
    progress_percentage: 42,
    total_tasks: 12,
    completed_tasks: 5,
    created_at: "2023-02-15T09:00:00Z",
    updated_at: "2023-03-06T16:30:00Z",
    team_members: [],
  },
  {
    project_id: "project-2",
    project_title: "Mobile App",
    description: "Cross-platform mobile application with offline capabilities and push notifications",
    status: "In Progress",
    progress_percentage: 38,
    total_tasks: 8,
    completed_tasks: 3,
    created_at: "2023-02-28T10:15:00Z",
    updated_at: "2023-03-06T14:45:00Z",
    team_members: [],
  },
  {
    project_id: "project-3",
    project_title: "Marketing Campaign",
    total_tasks: 6,
    completed_tasks: 6,
    progress_percentage: 100,
    description: "",
    status: "",
    created_at: "",
    updated_at: "",
    team_members: [],
  },
]

export { tasks as demoTasks, projects as demoProjects }

