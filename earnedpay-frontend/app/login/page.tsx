'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        confirmationResult: ConfirmationResult;
    }
}

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role');

    const [role, setRole] = useState<'worker' | 'employer'>(roleParam === 'employer' ? 'employer' : 'worker');
    const [phoneNumber, setPhoneNumber] = useState('+91');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (roleParam === 'employer' || roleParam === 'worker') {
            setRole(roleParam);
        }
    }, [roleParam]);

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    // reCAPTCHA solved
                },
            });
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            window.confirmationResult = confirmationResult;
            setStep('otp');
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };



    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            // Register/Verify user with selected role
            const response = await api.verifyToken(idToken, role);

            // Get the actual role from the backend response
            const actualRole = response.user.role;
            const userProfile = response.user;

            // Pre-populate the auth store
            if (useAuthStore.getState) {
                useAuthStore.getState().setRole(actualRole as 'worker' | 'employer');
                if (userProfile) useAuthStore.getState().setProfile(userProfile);
                useAuthStore.getState().setToken(idToken);
                useAuthStore.getState().setUser(result.user);
                useAuthStore.getState().setLoading(false);
            }

            // Force hard navigation
            if (actualRole === 'worker') {
                window.location.href = '/worker/dashboard';
            } else if (actualRole === 'employer') {
                window.location.href = '/employer/dashboard';
            } else {
                setError('Unknown user role. Please contact support.');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('Google login error:', err);
            setError(err.message || 'Failed to sign in with Google');
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await window.confirmationResult.confirm(otp);
            const idToken = await result.user.getIdToken();

            // Register/Verify user with selected role
            const response = await api.verifyToken(idToken, role);

            // Get the actual role from the backend response
            const actualRole = response.user.role;
            const userProfile = response.user;

            // Pre-populate the auth store
            if (useAuthStore.getState) {
                useAuthStore.getState().setRole(actualRole as 'worker' | 'employer');
                if (userProfile) useAuthStore.getState().setProfile(userProfile);
                useAuthStore.getState().setToken(idToken);
                useAuthStore.getState().setUser(result.user);
                useAuthStore.getState().setLoading(false);
            }

            // Force hard navigation
            if (actualRole === 'worker') {
                window.location.href = '/worker/dashboard';
            } else if (actualRole === 'employer') {
                window.location.href = '/employer/dashboard';
            } else {
                setError('Unknown user role. Please contact support.');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Invalid OTP or Login Failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
            {/* Theme Toggle Absolute Position */}
            <div className="absolute top-4 right-4 animate-fade-in">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">EarnedPay</h1>
                    <p className="text-gray-600 dark:text-gray-400">Access your earned wages instantly</p>
                </div>

                {/* Login Card */}
                <Card className="shadow-xl border-0 animate-slide-in">
                    <CardHeader>
                        <CardTitle>
                            {step === 'phone' ? `Login as ${role === 'employer' ? 'Employer' : 'Worker'}` : 'Enter OTP'}
                        </CardTitle>
                        <CardDescription>
                            {step === 'phone'
                                ? `Enter your mobile number to access your ${role === 'employer' ? 'employer dashboard' : 'earnings'}`
                                : `We've sent a 6-digit code to ${phoneNumber}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {step === 'phone' && (
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-6">
                                <button
                                    onClick={() => { setRole('worker'); router.replace('/login?role=worker'); }}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${role === 'worker' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                >
                                    Worker
                                </button>
                                <button
                                    onClick={() => { setRole('employer'); router.replace('/login?role=employer'); }}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${role === 'employer' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                >
                                    Employer
                                </button>
                            </div>
                        )}

                        {step === 'phone' ? (
                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Mobile Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        className="text-lg"
                                    />
                                </div>

                                {error && (
                                    <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={loading || phoneNumber.length < 13}
                                >
                                    {loading ? (
                                        'Sending OTP...'
                                    ) : (
                                        <>
                                            Send OTP <ArrowRight className="ml-2 w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp">6-Digit OTP</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        className="text-lg text-center tracking-widest"
                                        maxLength={6}
                                    />
                                </div>

                                {error && (
                                    <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={loading || otp.length !== 6}
                                >
                                    {loading ? (
                                        'Verifying...'
                                    ) : (
                                        <>
                                            Verify & Login <CheckCircle2 className="ml-2 w-4 h-4" />
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full hover:bg-gray-100 dark:hover:bg-slate-800"
                                    onClick={() => {
                                        setStep('phone');
                                        setOtp('');
                                        setError('');
                                    }}
                                >
                                    Change Number
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-900 px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-4 h-12 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Sign in with Google
                    </Button>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <div className="text-2xl mb-1">⚡</div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Instant Access</p>
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <div className="text-2xl mb-1">🔒</div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">100% Secure</p>
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <div className="text-2xl mb-1">💰</div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">No Hidden Fees</p>
                    </div>
                </div>
            </div>

            {/* Recaptcha Container */}
            <div id="recaptcha-container"></div>
        </div>
    );
}
