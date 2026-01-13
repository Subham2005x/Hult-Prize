'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, CheckCircle2, Wallet, Home, CreditCard, History, User } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface Balance {
    total_earned: number;
    total_withdrawn: number;
    available_to_withdraw: number;
    max_withdrawable: number;
    next_payday: string;
    payday_amount: number;
}

export default function WithdrawPage() {
    const router = useRouter();
    const { user, token, role, loading } = useAuth();
    const [balance, setBalance] = useState<Balance | null>(null);
    const [amount, setAmount] = useState(0);
    const [upiId, setUpiId] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && (!user || role !== 'worker')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    useEffect(() => {
        if (token) {
            fetchBalance();
        }
    }, [token]);

    const fetchBalance = async () => {
        try {
            const data = await api.worker.getBalance(token!);
            setBalance(data);
            setAmount(Math.min(1000, data.available_to_withdraw));
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setProcessing(true);

        try {
            await api.worker.requestWithdrawal(token!, {
                amount,
                upi_id: upiId,
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/worker/dashboard');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Withdrawal failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading || !balance) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-success-50 to-success-100 dark:from-green-900/50 dark:to-green-950 flex items-center justify-center p-4 transition-colors duration-300">
                <Card className="max-w-md w-full text-center shadow-xl border-0 dark:bg-slate-800">
                    <CardContent className="pt-12 pb-8">
                        <div className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
                            <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Withdrawal Successful!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {formatCurrency(amount)} has been sent to your UPI ID
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{upiId}</p>
                        <Button onClick={() => router.push('/worker/dashboard')} size="lg" className="w-full">
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/worker/dashboard">
                            <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-white">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Withdraw Money</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Instant UPI transfer</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Available Balance */}
                <Card className="bg-gradient-to-br from-primary-600 to-primary-700 border-0 text-white shadow-lg">
                    <CardContent className="py-6">
                        <p className="text-sm text-primary-100 mb-1">Available to Withdraw</p>
                        <p className="text-4xl font-bold tabular-nums">
                            {formatCurrency(balance.available_to_withdraw)}
                        </p>
                    </CardContent>
                </Card>

                {/* Withdrawal Form */}
                <form onSubmit={handleWithdraw} className="space-y-6">
                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle>Select Amount</CardTitle>
                            <CardDescription>
                                Choose how much you want to withdraw
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Amount Display */}
                            <div className="text-center py-6 bg-gray-50 dark:bg-slate-950 rounded-xl">
                                <p className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums">
                                    {formatCurrency(amount)}
                                </p>
                            </div>

                            {/* Slider */}
                            <div className="space-y-4">
                                <Slider
                                    value={[amount]}
                                    onValueChange={(values: number[]) => setAmount(values[0])}
                                    max={balance.available_to_withdraw}
                                    min={100}
                                    step={50}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>₹100</span>
                                    <span>{formatCurrency(balance.available_to_withdraw)}</span>
                                </div>
                            </div>

                            {/* Quick Amount Buttons */}
                            <div className="grid grid-cols-3 gap-2">
                                {[500, 1000, 2000].map((quickAmount) => (
                                    <Button
                                        key={quickAmount}
                                        type="button"
                                        variant="outline"
                                        className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700"
                                        onClick={() => setAmount(Math.min(quickAmount, balance.available_to_withdraw))}
                                        disabled={quickAmount > balance.available_to_withdraw}
                                    >
                                        ₹{quickAmount}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle>UPI Details</CardTitle>
                            <CardDescription>
                                Enter your UPI ID to receive money
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="upi">UPI ID</Label>
                                <Input
                                    id="upi"
                                    type="text"
                                    placeholder="yourname@paytm"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    required
                                    pattern="[\w.-]+@[\w.-]+"
                                    className="dark:bg-slate-950 dark:border-slate-600"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Example: 9876543210@paytm, yourname@phonepe
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={processing || !upiId || amount < 100}
                    >
                        {processing ? (
                            'Processing...'
                        ) : (
                            <>
                                Withdraw {formatCurrency(amount)} <Wallet className="ml-2 w-5 h-5" />
                            </>
                        )}
                    </Button>

                    <Card className="bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800/50">
                        <CardContent className="py-4">
                            <p className="text-sm text-primary-900 dark:text-primary-100">
                                ⚡ <strong>Instant Transfer:</strong> Money will be credited to your UPI ID
                                within seconds. No fees charged.
                            </p>
                        </CardContent>
                    </Card>
                </form>
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

                        <button
                            className="relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 text-primary-600 dark:text-primary-400"
                        >
                            <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-2xl -z-10 animate-fade-in" />
                            <CreditCard className="w-6 h-6 transition-transform duration-300 scale-110" />
                            <span className="text-[10px] font-medium">Withdraw</span>
                        </button>

                        <Link href="/worker/history">
                            <button
                                className="relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <History className="w-6 h-6 transition-transform duration-300" />
                                <span className="text-[10px] font-medium">History</span>
                            </button>
                        </Link>

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
