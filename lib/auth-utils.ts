// Simple function to check if user is logged in
export async function isLoggedIn(): Promise<boolean> {
  // Always return true to bypass auth checks
  return true
}

// Simple function to redirect if already authenticated
export async function checkAuthRedirect(): Promise<void> {
  // Do nothing - no redirects
  return
}

