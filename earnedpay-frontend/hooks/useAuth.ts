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

                    // First, verify token with backend to ensure user exists in MongoDB
                    // This will create the user if they don't exist
                    try {
                        // Try to get current user first
                        const userData = await api.getCurrentUser(idToken);
                        setRole(userData.role);
                        setProfile(userData);
                    } catch (error: any) {
                        // If user doesn't exist (404), they need to use the login page
                        // which will call verify-token with the role
                        console.log('User not found in database, needs to complete login flow');
                        // Don't logout, let them complete the login process
                    }
                } catch (error: any) {
                    console.error('Error verifying user:', error);
                    // Only logout on actual auth errors
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
