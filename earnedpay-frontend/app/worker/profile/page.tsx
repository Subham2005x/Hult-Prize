'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageStore } from '@/store/languageStore';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User,
    Phone,
    LogOut,
    Shield,
    Bell,
    HelpCircle,
    ChevronRight,
    Home,
    CreditCard,
    History,
    Building,
    BadgeCheck,
    Key
} from 'lucide-react';
import Link from 'next/link';

import { api } from '@/lib/api';

export default function WorkerProfile() {
    const router = useRouter();
    const { user, token, role, profile, loading, logout, setProfile } = useAuth();
    const { t } = useLanguageStore();
    const [activeTab, setActiveTab] = useState('profile');

    // Password Update State
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);

    // UPI Update State
    const [isEditingUpi, setIsEditingUpi] = useState(false);
    const [newUpi, setNewUpi] = useState('');
    const [isLoadingUpi, setIsLoadingUpi] = useState(false);

    const handleUpiChange = async () => {
        if (!newUpi || !newUpi.includes('@')) {
            alert("Please enter a valid UPI ID");
            return;
        }

        setIsLoadingUpi(true);
        try {
            if (token) {
                await api.worker.updateUPI(token, newUpi);
                setProfile({ ...profile, upiId: newUpi });
                setIsEditingUpi(false);
                alert("UPI ID updated successfully!");
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to update UPI ID");
        } finally {
            setIsLoadingUpi(false);
        }
    };

    const [workerData, setWorkerData] = useState<any>(null);

    useEffect(() => {
        if (!loading && (!user || role !== 'worker')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    useEffect(() => {
        if (token) {
            fetchWorkerProfile();
        }
    }, [token]);

    const fetchWorkerProfile = async () => {
        try {
            const data = await api.worker.getProfile(token!);
            setWorkerData(data);
            // Also update the auth store profile to keep everything in sync
            setProfile((prev: any) => ({ ...prev, ...data }));

            // Set initial form values
            if (data.upiId) setNewUpi(data.upiId);

        } catch (error) {
            console.error("Failed to fetch worker profile", error);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const handlePasswordChange = async () => {
        if (!newPassword || newPassword.length < 4) {
            alert("Password must be at least 4 characters");
            return;
        }

        setIsLoadingPassword(true);
        try {
            if (token) {
                await api.worker.updatePassword(token, newPassword);
                // Update local profile state
                setProfile({ ...profile, password: newPassword });
                setIsEditingPassword(false);
                setNewPassword('');
                alert("Password updated successfully!");
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to update password");
        } finally {
            setIsLoadingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-950 dark:to-slate-900">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24 transition-colors duration-300">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-20 shadow-sm transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">{t('profile')}</h1>
                        <p className="text-xs text-muted-foreground">{t('manageAccount')}</p>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* User Info Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardContent className="pt-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                                {workerData?.fullName?.charAt(0) || user?.phoneNumber?.slice(-2) || 'WK'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{workerData?.fullName || t('workerAccount')}</h2>
                                <p className="text-primary-100 flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> {user?.phoneNumber || user?.email}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings Sections */}
                <div className="space-y-4">

                    {/* Account Credentials */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                {t('accountCredentials')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>{t('workerId')}</Label>
                                    <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border">
                                        <BadgeCheck className="w-4 h-4 text-primary" />
                                        <span className="font-mono font-bold text-sm overflow-hidden text-ellipsis whitespace-nowrap" title={workerData?.customId}>{workerData?.customId || profile?.customId || 'Loading...'}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>UPI ID</Label>
                                    {isEditingUpi ? (
                                        <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border animate-fade-in">
                                            <Input
                                                type="text"
                                                value={newUpi}
                                                onChange={(e) => setNewUpi(e.target.value)}
                                                placeholder={t('upiIdPlaceholder')}
                                                className="bg-background"
                                                autoFocus
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={() => setIsEditingUpi(false)} disabled={isLoadingUpi}>{t('cancel')}</Button>
                                                <Button size="sm" onClick={handleUpiChange} disabled={isLoadingUpi}>
                                                    {isLoadingUpi ? t('saving') : t('save')}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border justify-between">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-mono text-sm">{workerData?.upiId || profile?.upiId || t('notSet')}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => { setNewUpi(workerData?.upiId || profile?.upiId || ''); setIsEditingUpi(true); }}>{t('change')}</Button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label>{t('password')}</Label>
                                    {isEditingPassword ? (
                                        <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border animate-fade-in">
                                            <Input
                                                type="text"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="New password"
                                                className="bg-background"
                                                autoFocus
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={() => setIsEditingPassword(false)} disabled={isLoadingPassword}>{t('cancel')}</Button>
                                                <Button size="sm" onClick={handlePasswordChange} disabled={isLoadingPassword}>
                                                    {isLoadingPassword ? t('saving') : t('save')}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border justify-between">
                                            <div className="flex items-center gap-2">
                                                <Key className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-mono text-sm">{profile?.password || '••••'}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setIsEditingPassword(true)}>{t('change')}</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building className="w-5 h-5 text-primary" />
                                {t('employmentDetails')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label>{t('company')}</Label>
                                <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border">
                                    <Building className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{workerData?.companyName || 'Loading...'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Application Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">{t('general')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="font-medium">{t('notifications')}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </button>

                                <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="font-medium">{t('privacySecurity')}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </button>

                                <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                            <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="font-medium">{t('helpSupport')}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logout Button */}
                    <Button
                        variant="destructive"
                        size="lg"
                        className="w-full mt-6"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('logout')}
                    </Button>
                </div>
            </main>

            {/* Floating Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 shadow-2xl z-30 transition-all duration-300 pb-safe">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-around py-2">
                        <Link href="/worker/dashboard">
                            <button
                                className="relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <Home className="w-6 h-6 transition-transform duration-300" />
                                <span className="text-[10px] font-medium">{t('home')}</span>
                            </button>
                        </Link>

                        <Link href="/worker/withdraw">
                            <button
                                className="relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <CreditCard className="w-6 h-6 transition-transform duration-300" />
                                <span className="text-[10px] font-medium">{t('withdraw')}</span>
                            </button>
                        </Link>

                        <Link href="/worker/history">
                            <button
                                className="relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <History className="w-6 h-6 transition-transform duration-300" />
                                <span className="text-[10px] font-medium">{t('history')}</span>
                            </button>
                        </Link>

                        <button
                            className="relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 text-primary-600 dark:text-primary-400"
                        >
                            <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-2xl -z-10 animate-fade-in" />
                            <User className="w-6 h-6 transition-transform duration-300 scale-110" />
                            <span className="text-[10px] font-medium">{t('profile')}</span>
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
}
