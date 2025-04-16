// User and Authentication Types
export interface User {
  id: string
  email: string
  user_name: string
  role: "admin" | "customer" | "team_member"
  profile_image: string | null
  created_at: string
  updated_at: string | null
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  user_name: string
  role?: "admin" | "customer" | "team_member"
}

export interface ResetPasswordData {
  token: string
  password: string
}

export interface ForgotPasswordData {
  email: string
}

// Project Types
export interface Project {
  id: string
  title: string
  description: string
  status: string
  customer_id: string
  customer_name?: string
  pricing_tier: string
  created_at: string
  updated_at: string | null
  progress_percentage?: number
  total_tasks?: number
  completed_tasks?: number
  technical_requirements?: string
  required_skills?: string
  deliverables?: string
  budget?: number
  payment_type?: string
  start_date?: string
  duration_days?: number
  priority?: string
  visibility?: string
  category?: string
  customer?: User
  tasks?: Task[]
  feedbacks?: Feedback[]
  files?: File[]
  teamMembers?: TeamMember[]
  _count?: {
    tasks: number
  }
}

export interface CreateProjectData {
  title: string
  description: string
  status: string
  pricing_tier: string
  technical_requirements?: string
  required_skills?: string
  deliverables?: string
  budget?: number
  payment_type?: string
  start_date?: string
  duration_days?: number
  priority?: string
  visibility?: string
  category?: string
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

export interface ProjectStats {
  totalProjects: number
  projectsByStatus: Record<string, number>
  projectsByPriority: Record<string, number>
  averageProgress: number
  totalTasks: number
  completedTasks: number
}

// Task Types
export interface Task {
  id: string
  project_id: string
  title: string
  description: string
  status: string
  task_group: string
  assigned_to: string | null
  created_at: string
  updated_at: string | null
  due_date?: string | null
  priority?: string
  project?: {
    title: string
    customer?: {
      user_name: string
    }
  }
  assignee?: {
    id: string
    user_name: string
    profile_image: string | null
    email?: string
  }
}

export interface CreateTaskData {
  title: string
  description: string
  status: string
  task_group: string
  project_id: string
  assigned_to?: string | null
  due_date?: string | null
  priority?: string
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

// Team Member Types
export interface TeamMember {
  id: string
  user_name: string
  email?: string
  profile_image: string | null
  role?: string
  team_role?: string
  created_at?: string
  updated_at?: string | null
}

export interface CreateTeamMemberData {
  user_name: string
  email: string
  role?: string
  project_id?: string
}

// Message Types
export interface Message {
  id: string
  project_id: string
  sender_id: string
  receiver_id?: string
  message: string
  created_at: string
  updated_at?: string | null
  isTemp?: boolean
  sendFailed?: boolean
  sender?: {
    id: string
    user_name: string
    profile_image: string | null
    role?: string
  }
  receiver?: {
    id: string
    user_name: string
    profile_image: string | null
  }
}

export interface CreateMessageData {
  project_id: string
  message: string
  receiver_id?: string
}

// File Types
export interface File {
  id: string
  project_id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: string
  uploaded_by: string
  uploaded_at: string
  updated_at?: string | null
  uploader?: {
    id: string
    user_name: string
    profile_image: string | null
  }
}

export interface UploadFileData {
  project_id: string
  file: Blob | File
  file_name?: string
}

// Feedback Types
export interface Feedback {
  id: string
  project_id: string
  user_id: string
  content: string
  status: string
  created_at: string
  updated_at?: string | null
  user?: {
    id: string
    user_name: string
    profile_image: string | null
  }
}

export interface CreateFeedbackData {
  project_id: string
  content: string
  status?: string
}

export interface UpdateFeedbackData {
  content?: string
  status?: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Socket/SSE Types
export interface SocketMessage {
  id: string
  type: string
  project_id: string
  sender_id: string
  message?: string
  timestamp: string
}

// Filter Types
export interface TaskFilters {
  projectId?: string
  status?: string
  taskGroup?: string
  assignedTo?: string
  searchQuery?: string
}

export interface ProjectFilters {
  status?: string
  priority?: string
  customerId?: string
  searchQuery?: string
}

// Store State Types
export interface TasksState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  taskGroups: string[]
  statusSummary: Record<string, number> | null
  projectFilter: string
  statusFilter: string
  groupFilter: string
  assigneeFilter: string
  searchQuery: string
  viewMode: "list" | "board"
}

export interface ProjectsState {
  projects: Project[]
  isLoading: boolean
  error: string | null
  stats: ProjectStats | null
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
