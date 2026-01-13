import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export function useAuth() {
    const { user, token, role, profile, loading, setUser, setToken, setRole, setProfile, setLoading, logout } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get ID token
                    const idToken = await firebaseUser.getIdToken();
                    setToken(idToken);
                    setUser(firebaseUser);

                    // Verify token with backend and get user role
                    const userData = await api.getCurrentUser(idToken);
                    setRole(userData.role);
                    setProfile(userData);
                } catch (error: any) {
                    console.error('Error verifying user:', error);
                    // Only logout if it's an auth error, not if user doesn't exist yet (404)
                    // The LoginPage will handle creation via verifyToken
                    if (error.message && !error.message.includes('User not registered') && !error.message.includes('404')) {
                        logout();
                    }
                }
            } else {
                logout();
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return {
        user,
        token,
        role,
        profile,
        loading,
        setProfile,
        logout: async () => {
            await auth.signOut();
            logout();
        },
    };
}
