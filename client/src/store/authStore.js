import { create } from "zustand"
import axios from "../lib/axios"


export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  signup: async (values) => {
    const { name, email, password } = values
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post("/auth/signup", { name, email, password })
      set({ user: response.data.user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ error: error.response.data.error || "Error signing up", isLoading: false })
      throw error
    }
  },

  login: async (values) => {
    const { email, password } = values
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post("/auth/login", { email, password })
      set({
        isAuthenticated: true,
        user: response.data.user,
        error: null,
        isLoading: false
      })
    } catch (error) {
      set({ error: error.response.data?.error || "Error logging in", isLoading: false })
      throw error
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null })
    try {
      await axios.post("/auth/logout")
      set({ user: null, isAuthenticated: false, error: null, isLoading: false })
    } catch (error) {
      set({ error: "Error logging out", isLoading: false })
      throw error
    }
  },
  verifyEmail: async (code) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post("/auth/verify-email", { code })
      set({ user: response.data.user, isAuthenticated: true, isLoading: false })
      return response.data
    } catch (error) {
      set({ error: error.response.data.error || "Error verifying email", isLoading: false })
      throw error
    }
  },
  
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null })
    try {
      const response = await axios.get("/auth/check-auth")
      set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false })
    } catch (error) {
      set({ isCheckingAuth: false, error: null, isAuthenticated: false })
    }
  },
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post("/auth/forgot-password", { email });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response.data.error || "Error sending reset password email",
      });
      throw error;
    }
  },

  resetPassword: async(token, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`/auth/reset-password/${token}`, { password })
      set({ message: response.data.message, isLoading: false })
    } catch (error) {
      set({ 
       isLoading: false,
       error: error.response.data.error || "Error resetting password"
      })
      throw error
    }
  }
}))
