'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, XCircle, Clock, Download, Home, CreditCard, History as HistoryIcon, User } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
    id: string;
    amount: number;
    upi_id: string;
    status: string;
    requested_at: string;
    completed_at?: string;
    transaction_id?: string;
    failure_reason?: string;
}

export default function TransactionHistory() {
    const router = useRouter();
    const { user, token, role, loading } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);

    useEffect(() => {
        if (!loading && (!user || role !== 'worker')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    useEffect(() => {
        if (token) {
            fetchTransactions();
        }
    }, [token]);

    const fetchTransactions = async () => {
        try {
            const data = await api.worker.getWithdrawals(token!);
            setTransactions(data.withdrawals || []);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    if (loading || loadingTransactions) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transactions...</p>
                </div>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-success-600 dark:text-green-400" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
            default:
                return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-success-600 bg-success-50 dark:text-green-400 dark:bg-green-900/20';
            case 'failed':
                return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
            default:
                return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-950 dark:to-slate-900 pb-24 transition-colors duration-300">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-sm transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href="/worker/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold">Transaction History</h1>
                        <p className="text-xs text-muted-foreground">All your withdrawals</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6">
                {transactions.length > 0 ? (
                    <div className="space-y-3">
                        {transactions.map((txn) => (
                            <Card key={txn.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${txn.status === 'completed' ? 'bg-success-100 dark:bg-green-900/20' :
                                                txn.status === 'failed' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
                                                }`}>
                                                {getStatusIcon(txn.status)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white mb-1">Withdrawal</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                    {formatDateTime(txn.requested_at)}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    To: {txn.upi_id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums mb-1">
                                                {formatCurrency(txn.amount)}
                                            </p>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(txn.status)}`}>
                                                {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Transaction Details */}
                                    {txn.status === 'completed' && txn.transaction_id && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
                                                <span className="font-mono text-gray-900 dark:text-white">{txn.transaction_id}</span>
                                            </div>
                                            {txn.completed_at && (
                                                <div className="flex items-center justify-between text-sm mt-2">
                                                    <span className="text-gray-500 dark:text-gray-400">Completed at</span>
                                                    <span className="text-gray-900 dark:text-white">{formatDateTime(txn.completed_at)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {txn.status === 'failed' && txn.failure_reason && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                <span className="font-medium">Reason:</span> {txn.failure_reason}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardContent className="py-16 text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Download className="w-10 h-10 text-gray-400 dark:text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No transactions yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Your withdrawal history will appear here
                            </p>
                            <Link href="/worker/withdraw">
                                <Button>
                                    Make Your First Withdrawal
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
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
                                <span className="text-[10px] font-medium">Home</span>
                            </button>
                        </Link>

                        <Link href="/worker/withdraw">
                            <button
                                className="relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <CreditCard className="w-6 h-6 transition-transform duration-300" />
                                <span className="text-[10px] font-medium">Withdraw</span>
                            </button>
                        </Link>

                        <button
                            className="relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 text-primary-600 dark:text-primary-400"
                        >
                            <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-2xl -z-10 animate-fade-in" />
                            <HistoryIcon className="w-6 h-6 transition-transform duration-300 scale-110" />
                            <span className="text-[10px] font-medium">History</span>
                        </button>

                        <Link href="/worker/profile">
                            <button
                                className="relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <User className="w-6 h-6 transition-transform duration-300" />
                                <span className="text-[10px] font-medium">Profile</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    );
}
