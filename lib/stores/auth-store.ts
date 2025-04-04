
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { apiRequest } from "../useApi";
import { ENDPOINT } from "../api/end-point";
import { useToast } from "@/components/ui/use-toast";

type AuthState = {
  user: any | null;
  session: any | null;
  profile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ data:any | "" , error: any | null }>;
  signUp: (email: string) => Promise<{ data:any | "" , error: any | null }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: any | null }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ error: any | null }>;
  loadProfile: () => Promise<any | null>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      initialize: async () => {
        try {
          set({ isLoading: true, error: null });
          // Call an API to check session or token validity (Optional)
          set({
            isLoading: false,
            isAuthenticated: false, // Set to true if session exists
            user: null,
            session: null,
          });
        } catch (error: any) {
          console.error("Error initializing auth:", error);
          set({
            error: error.message || "Failed to initialize authentication",
            isLoading: false,
            isAuthenticated: false,
          });
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });

        const response = await apiRequest("POST", ENDPOINT.AUTH.signIn, { email, password });

        set({
          user: response?.data?.user,
          session: response?.data?.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { data: response?.data || "", error: response.error || null };
      },


      signUp: async (email) => {
          set({ isLoading: true, error: null });
          const response = await apiRequest("POST",ENDPOINT.AUTH.signUp,{ user_name:email.split("@")[0], email, password:"123456789" });
          set({ isLoading: false,error: response.error });
          return { data:response?.data || "" ,error: response.error || null }
      },

      signOut: async () => {
          set({ isLoading: true });
          // Call logout API if required
          const response = await apiRequest("POST",ENDPOINT.AUTH.signOut)
          if (!response.error) {
            set({
              user: null,
              session: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false,
            });
            window.location.href = "/login";
            return
          }
      },

      forgotPassword: async (email) => {
          set({ isLoading: true, error: null });
          const response = await apiRequest("POST",ENDPOINT.AUTH.forgoPassword,{email});
          set({ isLoading: false,error: response.error });
          return { data:response?.data || "" ,error: response.error || null }
      },

      resetPassword: async (token, newPassword) => {
          set({ isLoading: true, error: null });
          const response = await apiRequest("POST",ENDPOINT.AUTH.updatePassword,{ token, newPassword });
          set({ isLoading: false,error: response.error });
          return { data:response?.data || "" ,error: response.error || null }
      },

      loadProfile: async () => {
        try {
          const response = await axios.get("/api/auth/profile");

          set({ profile: response.data.profile });

          return response.data.profile;
        } catch (error) {
          console.error("Error loading profile:", error);
          return null;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
