'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowRight, Calendar, TrendingUp, LogOut, History, User, Home, CreditCard, Bell, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Skeleton } from '@/components/ui/skeleton';

interface Balance {
    total_earned: number;
    total_withdrawn: number;
    available_to_withdraw: number;
    max_withdrawable: number;
    next_payday: string;
    payday_amount: number;
}

interface Transaction {
    id: string;
    amount: number;
    status: string;
    requested_at: string;
}

export default function WorkerDashboard() {
    const router = useRouter();
    const { user, token, role, profile, loading, logout } = useAuth();
    const [balance, setBalance] = useState<Balance | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingBalance, setLoadingBalance] = useState(true);
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        if (!loading && (!user || role !== 'worker')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    useEffect(() => {
        if (token) {
            fetchBalance();
            fetchTransactions();
        }
    }, [token]);

    const fetchBalance = async () => {
        try {
            const data = await api.worker.getBalance(token!);
            setBalance(data);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        } finally {
            setLoadingBalance(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const data = await api.worker.getWithdrawals(token!);
            setTransactions(data.withdrawals?.slice(0, 3) || []);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (loading || loadingBalance) {
        return (
            <div className="min-h-screen bg-background pb-24">
                {/* Header Skeleton */}
                <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-20 shadow-sm">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <Skeleton className="w-10 h-10 rounded-xl" />
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                    {/* Welcome Skeleton */}
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-32" />
                    </div>

                    {/* Balance Card Skeleton */}
                    <div className="h-64 rounded-xl bg-gray-200 dark:bg-slate-800 animate-pulse" />

                    {/* Stats Grid Skeleton */}
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-32 rounded-xl" />
                        <Skeleton className="h-32 rounded-xl" />
                    </div>

                    {/* Recent Transactions Skeleton */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-8 w-20 rounded-md" />
                        </div>
                        <Skeleton className="h-20 rounded-xl" />
                        <Skeleton className="h-20 rounded-xl" />
                    </div>
                </main>
            </div>
        );
    }
    const daysUntilPayday = balance ? getDaysUntil(balance.next_payday) : 0;
    const withdrawalPercentage = balance ? (balance.total_withdrawn / balance.total_earned) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 pb-24 transition-colors duration-300">
            {/* Top Header */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">EarnedPay</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Your earnings, anytime</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                            >
                                <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Welcome Section */}
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Welcome back! 👋
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {user?.phoneNumber || 'Worker'}
                    </p>
                </div>

                {/* Setup Alert */}
                {!loading && profile && !profile.upiId && (
                    <Link href="/worker/profile">
                        <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 animate-pulse cursor-pointer">
                            <CardContent className="py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center">
                                        <Wallet className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-orange-800 dark:text-orange-200">Complete your setup</p>
                                        <p className="text-sm text-orange-600 dark:text-orange-300">Add UPI ID to enable withdrawals</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-orange-500" />
                            </CardContent>
                        </Card>
                    </Link>
                )}

                {/* Main Balance Card */}
                <Card className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 border-0 text-white shadow-2xl overflow-hidden relative animate-slide-in">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>

                    <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <CardDescription className="text-primary-100 font-medium">
                                Available Balance
                            </CardDescription>
                            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                                {balance && balance.available_to_withdraw > 0 ? 'Ready to withdraw' : 'No balance'}
                            </div>
                        </div>
                        <CardTitle className="text-6xl font-bold tabular-nums mb-4">
                            {balance ? formatCurrency(balance.available_to_withdraw) : '₹0'}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm">
                            <div>
                                <p className="text-primary-100 mb-1">Total Earned</p>
                                <p className="font-semibold text-lg tabular-nums">
                                    {balance ? formatCurrency(balance.total_earned) : '₹0'}
                                </p>
                            </div>
                            <div className="h-8 w-px bg-white/20"></div>
                            <div>
                                <p className="text-primary-100 mb-1">Withdrawn</p>
                                <p className="font-semibold text-lg tabular-nums">
                                    {balance ? formatCurrency(balance.total_withdrawn) : '₹0'}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-3">
                        {/* Progress Bar */}
                        {balance && balance.total_earned > 0 && (
                            <div>
                                <div className="flex justify-between text-xs text-primary-100 mb-2">
                                    <span>Withdrawal limit used</span>
                                    <span>{Math.round(withdrawalPercentage)}%</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(withdrawalPercentage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <Link href="/worker/withdraw">
                            <Button
                                className="w-full bg-white text-primary-700 hover:bg-gray-100 shadow-lg font-semibold h-14 text-base"
                                disabled={!balance || balance.available_to_withdraw <= 0}
                            >
                                <Wallet className="mr-2 w-5 h-5" />
                                Withdraw Money
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    {/* Payday Card */}
                    <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                    {daysUntilPayday} days
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Next Payday</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {balance ? formatDate(balance.next_payday) : '-'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 tabular-nums">
                                Expected: {balance ? formatCurrency(balance.payday_amount) : '₹0'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* This Month Card */}
                    <Card className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 bg-success-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-success-600 dark:text-green-400" />
                                </div>
                                <span className="text-xs text-success-600 dark:text-green-400 bg-success-50 dark:bg-green-900/20 px-2 py-1 rounded-full font-medium">
                                    +100%
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">This Month</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                                {balance ? formatCurrency(balance.total_earned) : '₹0'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Total earnings
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card className="animate-fade-in dark:bg-slate-800 dark:border-slate-700" style={{ animationDelay: '200ms' }}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-gray-400" />
                                <CardTitle className="text-lg dark:text-white">Recent Activity</CardTitle>
                            </div>
                            <Link href="/worker/history">
                                <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400">
                                    View All
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {transactions.length > 0 ? (
                            <div className="space-y-3">
                                {transactions.map((txn) => (
                                    <div
                                        key={txn.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.status === 'completed' ? 'bg-success-100 dark:bg-green-900/20' :
                                                txn.status === 'failed' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
                                                }`}>
                                                {txn.status === 'completed' ? (
                                                    <CheckCircle className="w-5 h-5 text-success-600 dark:text-green-400" />
                                                ) : txn.status === 'failed' ? (
                                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                                ) : (
                                                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">Withdrawal</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(txn.requested_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 dark:text-white tabular-nums">
                                                {formatCurrency(txn.amount)}
                                            </p>
                                            <p className={`text-xs font-medium ${txn.status === 'completed' ? 'text-success-600 dark:text-green-400' :
                                                txn.status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                                                }`}>
                                                {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <History className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 mb-2">No transactions yet</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    Your withdrawal history will appear here
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/50 dark:to-primary-900/50 border-primary-200 dark:border-primary-800 animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <CardContent className="py-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
                                    <span className="text-xl">💡</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-primary-900 dark:text-primary-100 mb-1">How it works</p>
                                <p className="text-sm text-primary-800 dark:text-gray-300 leading-relaxed">
                                    You can withdraw up to 40% of your earned wages instantly via UPI.
                                    The remaining amount will be paid on your regular payday. No fees, no interest.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
            {/* Floating Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 shadow-2xl z-30 transition-all duration-300 pb-safe">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-around py-2">
                        <button
                            onClick={() => setActiveTab('home')}
                            className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${activeTab === 'home'
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            {activeTab === 'home' && (
                                <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-2xl -z-10 animate-fade-in" />
                            )}
                            <Home className={`w-6 h-6 transition-transform duration-300 ${activeTab === 'home' ? 'scale-110' : ''}`} />
                            <span className="text-[10px] font-medium">Home</span>
                        </button>

                        <Link href="/worker/withdraw">
                            <button
                                onClick={() => setActiveTab('withdraw')}
                                className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${activeTab === 'withdraw'
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                            >
                                {activeTab === 'withdraw' && (
                                    <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-2xl -z-10 animate-fade-in" />
                                )}
                                <CreditCard className={`w-6 h-6 transition-transform duration-300 ${activeTab === 'withdraw' ? 'scale-110' : ''}`} />
                                <span className="text-[10px] font-medium">Withdraw</span>
                            </button>
                        </Link>

                        <Link href="/worker/history">
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${activeTab === 'history'
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                            >
                                {activeTab === 'history' && (
                                    <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-2xl -z-10 animate-fade-in" />
                                )}
                                <History className={`w-6 h-6 transition-transform duration-300 ${activeTab === 'history' ? 'scale-110' : ''}`} />
                                <span className="text-[10px] font-medium">History</span>
                            </button>
                        </Link>

                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 ${activeTab === 'profile'
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            {activeTab === 'profile' && (
                                <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-2xl -z-10 animate-fade-in" />
                            )}
                            <User className={`w-6 h-6 transition-transform duration-300 ${activeTab === 'profile' ? 'scale-110' : ''}`} />
                            <span className="text-[10px] font-medium">Profile</span>
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
}
