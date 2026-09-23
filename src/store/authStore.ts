import { create } from 'zustand';
import { signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { User as AppUser } from '../types';

interface AuthState {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: AppUser | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ user: null, firebaseUser: null, isLoading: false, error: null }),
  logout: async () => {
    await signOut(auth);
    set({ user: null, firebaseUser: null, isLoading: false, error: null });
  },
}));
