import { create } from 'zustand';
import { authService } from '@/services/authService';
import type { AuthCredentials, SignUpPayload, User } from '@/types/user';

type AuthState = {
  user: User | null;
  currentUser: User | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  login: (credentials: AuthCredentials) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

function setSession(user: User | null) {
  return {
    user,
    currentUser: user,
    isLoggedIn: !!user,
    isAuthenticated: !!user,
  };
}

/**
 * Global auth session (Zustand).
 * Backed by AsyncStorage via authService / localAuthDb.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  currentUser: null,
  isLoggedIn: false,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    try {
      const user = await authService.restoreSession();
      set({ ...setSession(user), isHydrated: true });
    } catch {
      set({ ...setSession(null), isHydrated: true });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(credentials);
      set({ ...setSession(user), isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  signUp: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.signUp(payload);
      set({ ...setSession(user), isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sign up failed. Please try again.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      set({ ...setSession(null), isLoading: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));
