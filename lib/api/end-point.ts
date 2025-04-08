export const ENDPOINT = {
  AUTH: {
    signUp: "/api/auth/signup",
    teamMemberCreate: "/api/auth/team-member/create",
    allTeamMember: "/api/auth/team-member/all",
    signIn: "/api/auth/signin",
    signOut: "/api/auth/signout",
    forgoPassword: "/api/auth/forgot-password",
    updatePassword: "/api/auth/update-password",
    getUser: "/api/auth/profile",
  },
  PROJECT: {
    create: "/api/project/create",
    getProjects: "/api/project",
    fetchProjects: "/api/project/",
  },
  TASK: {
    base: "/api/tasks",
    byId: (id: string) => `/api/tasks/${id}`,
    byProject: (projectId: string) => `/api/tasks/project/${projectId}`,
    byUser: (userId: string) => `/api/tasks/user/${userId}`,
    groups: "/api/tasks/groups",
    statusSummary: "/api/tasks/status/summary",
    batchAssign: (userId: string) => `/api/tasks/user/${userId}`,
  },
}
