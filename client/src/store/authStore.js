import { create } from "zustand"
import axios from "../lib/axios"


export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: JSON.parse(localStorage.getItem("user"))?.isVerified || false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,
  refreshError: null,

  signup: async (values) => {
    const { name, email, password } = values
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post("/auth/signup", { name, email, password })
      set({ user: response.data.user, isAuthenticated: true, isLoading: false })
      localStorage.setItem("user", JSON.stringify(response.data.user))
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
      localStorage.setItem("user", JSON.stringify(response.data.user))
    } catch (error) {
      console.log(error);
      
      set({ error: error.response?.data?.message || "Error logging in", isLoading: false })
      throw error
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null })
    try {
      await axios.post("/auth/logout")
      set({ user: null, isAuthenticated: false, error: null, isLoading: false })
      localStorage.removeItem("user")
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
      set({ error: error.response.data.message || "Error verifying email", isLoading: false })
      throw error
    }
  },

  resendVerificationCode: async () => {
    try {
      const user = get().user
      const response = await axios.post("/auth/resend-verification-code", { email: user?.email })
      return response.data
    } catch (error) {
      console.log(error);
      throw error
      
      
    }
  },

  refreshToken: async () => {
    try {
      set({ isCheckingAuth: true });
      const response = await axios.post("/auth/refresh-token");
      set({ isCheckingAuth: false, refreshError: null });
      return response.data; // Return the new tokens if needed
    } catch (error) {
      console.log("Refresh token error", error);
      set({ 
        user: null, 
        isCheckingAuth: false,
        refreshError: error.response?.data?.error || "Session expired"
      });
      localStorage.removeItem("user");
      throw error; // Important to re-throw so interceptor can handle it
    }
  },
  
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null })
    try {
      const response = await axios.get("/auth/check-auth")
      set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false })
    } catch (error) {
      set({ isCheckingAuth: false, error: null })
      if (error.response?.status !== 401) {
        // Only set user to null for non-401 errors
        set({ user: null, isAuthenticated: false });
      }
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




// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Only handle 401 errors and not retried requests
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Skip refresh attempt if this was already a refresh token request
      if (originalRequest.url === "/auth/refresh-token") {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        // If a refresh is already in progress, wait for it
        refreshPromise = refreshPromise || useAuthStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;
        
        // Retry the original request with new token
        return axios(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        // If refresh fails, logout and reject
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    // For non-401 errors or already retried requests
    return Promise.reject(error);
  }
);