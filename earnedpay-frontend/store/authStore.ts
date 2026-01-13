import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    role: 'worker' | 'employer' | null;
    profile: any | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setRole: (role: 'worker' | 'employer' | null) => void;
    setProfile: (profile: any | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    role: null,
    profile: null,
    loading: true,
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    setRole: (role) => set({ role }),
    setProfile: (profile) => set({ profile }),
    setLoading: (loading) => set({ loading }),
    logout: () => set({ user: null, token: null, role: null, profile: null }),
}));
