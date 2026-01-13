'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Wallet, Calendar, UserPlus } from 'lucide-react';
// Keeping UserPlus as it is used in the Quick Actions card. ThemeToggle and LogOut are in Header/Sidebar now.
import Link from 'next/link';

interface DashboardData {
    total_workers: number;
    active_workers: number;
    total_earnings_this_month: number;
    total_withdrawals_this_month: number;
    pending_settlement: number;
    next_payday: string;
}

export default function EmployerDashboard() {
    const router = useRouter();
    const { user, token, role, loading, logout } = useAuth();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && (!user || role !== 'employer')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    useEffect(() => {
        if (token) {
            fetchDashboard();
        }
    }, [token]);

    const fetchDashboard = async () => {
        try {
            const data = await api.employer.getDashboard(token!);
            setDashboard(data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (loading || loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => router.push('/employer/attendance')}>
                        Submit Attendance
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Workers</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboard?.total_workers || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Link href="/employer/employees">
                    <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700 h-full cursor-pointer">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-success-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-success-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Workers</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {dashboard?.active_workers || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                                    {dashboard ? formatCurrency(dashboard.total_earnings_this_month) : '₹0'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-warning-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-warning-500 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Withdrawals</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                                    {dashboard ? formatCurrency(dashboard.total_withdrawals_this_month) : '₹0'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Settlement Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-primary-600 to-primary-700 border-0 text-white shadow-xl dark:from-primary-900 dark:to-primary-800">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <CardTitle>Next Settlement</CardTitle>
                        </div>
                        <CardDescription className="text-primary-100">
                            {dashboard ? formatDate(dashboard.next_payday) : '-'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-primary-100">Pending Settlement</span>
                                <span className="font-semibold tabular-nums text-lg">
                                    {dashboard ? formatCurrency(dashboard.pending_settlement) : '₹0'}
                                </span>
                            </div>
                            <Button className="w-full bg-white text-primary-700 hover:bg-gray-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 font-semibold shadow-md border-0" onClick={() => router.push('/employer/settlements')}>
                                View Settlement Details
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions / Info */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/employer/employees">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700 group h-full">
                                <CardContent className="py-6 flex flex-col items-center text-center gap-3">
                                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <UserPlus className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Add Worker</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Invite employees</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/employer/attendance">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700 group h-full">
                                <CardContent className="py-6 flex flex-col items-center text-center gap-3">
                                    <div className="w-12 h-12 bg-success-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Calendar className="w-6 h-6 text-success-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Timesheet</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Log hours</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800/50">
                        <CardContent className="py-4">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                💡 <strong>Insight:</strong> 85% of your workers verified their UPI IDs this week.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
