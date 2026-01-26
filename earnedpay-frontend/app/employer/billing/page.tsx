'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    ArrowLeft,
    Users,
    DollarSign,
    TrendingUp,
    CheckCircle,
    Download,
    Calendar,
    CreditCard,
    Info
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface DashboardData {
    total_workers: number;
    active_workers: number;
}

export default function BillingPage() {
    const router = useRouter();
    const { user, token, role, loading } = useAuth();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    // Pricing tiers (per active worker per month)
    const PRICE_PER_WORKER = 10; // ₹10 per active worker per month
    const TRANSACTION_FEE = 0.5; // 0.5% transaction fee on withdrawals (minimal)

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

    const calculateMonthlyFee = () => {
        if (!dashboard) return 0;
        return dashboard.active_workers * PRICE_PER_WORKER;
    };

    const calculateEstimatedTransactionFees = () => {
        // Estimate based on typical withdrawal patterns (40% of earnings)
        if (!dashboard) return 0;
        // This is an estimate - actual fees would be calculated on actual withdrawals
        const estimatedWithdrawals = dashboard.active_workers * 8000 * 0.4; // Assuming ₹8000 avg earnings
        return estimatedWithdrawals * (TRANSACTION_FEE / 100);
    };

    if (loading || loadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    const monthlyFee = calculateMonthlyFee();
    const estimatedTransactionFees = calculateEstimatedTransactionFees();
    const totalEstimated = monthlyFee + estimatedTransactionFees;

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Billing & Subscription</h2>
                    <p className="text-muted-foreground mt-1">Manage your EarnedPay subscription and view fees</p>
                </div>
            </div>

            {/* Current Plan Overview */}
            <Card className="border-2 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50 to-white dark:from-primary-950 dark:to-slate-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Standard Plan</CardTitle>
                            <CardDescription className="text-base mt-1">Pay-as-you-grow pricing</CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                {formatCurrency(monthlyFee)}
                            </div>
                            <p className="text-sm text-muted-foreground">per month</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <span className="text-sm font-medium text-muted-foreground">Active Workers</span>
                            </div>
                            <p className="text-2xl font-bold">{dashboard?.active_workers || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <span className="text-sm font-medium text-muted-foreground">Price per Worker</span>
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(PRICE_PER_WORKER)}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <span className="text-sm font-medium text-muted-foreground">Transaction Fee</span>
                            </div>
                            <p className="text-2xl font-bold">{TRANSACTION_FEE}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fee Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Monthly Subscription Fee
                        </CardTitle>
                        <CardDescription>Based on active workers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-muted-foreground">Active Workers</span>
                            <span className="font-semibold">{dashboard?.active_workers || 0}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-muted-foreground">Rate per Worker</span>
                            <span className="font-semibold">{formatCurrency(PRICE_PER_WORKER)}/month</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-semibold text-lg">Subscription Total</span>
                            <span className="font-bold text-2xl text-primary-600 dark:text-primary-400">
                                {formatCurrency(monthlyFee)}
                            </span>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
                            <div className="flex gap-2">
                                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-900 dark:text-blue-100">
                                    Only active workers are counted. Inactive workers are free.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Transaction Fees
                        </CardTitle>
                        <CardDescription>Charged on instant withdrawals</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-muted-foreground">Fee Rate</span>
                            <span className="font-semibold">{TRANSACTION_FEE}% per withdrawal</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-muted-foreground">Estimated This Month</span>
                            <span className="font-semibold">{formatCurrency(estimatedTransactionFees)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-semibold text-lg">Transaction Total</span>
                            <span className="font-bold text-2xl text-orange-600 dark:text-orange-400">
                                {formatCurrency(estimatedTransactionFees)}
                            </span>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mt-4">
                            <div className="flex gap-2">
                                <Info className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-orange-900 dark:text-orange-100">
                                    This is an estimate. Actual fees are calculated on real withdrawals.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Total Estimated Cost */}
            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white border-0">
                <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Total Estimated Monthly Cost</h3>
                            <p className="text-sm text-slate-300">Subscription + Transaction Fees</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold">{formatCurrency(totalEstimated)}</div>
                            <p className="text-sm text-slate-300 mt-1">per month</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
                <CardHeader>
                    <CardTitle>What's Included in Your Plan</CardTitle>
                    <CardDescription>All features included with Standard Plan</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            'Instant wage access for workers',
                            'Automated attendance tracking',
                            'Real-time settlement calculations',
                            'UPI payment integration',
                            'Worker & employer dashboards',
                            'Email support',
                            'Monthly settlement reports',
                            'Secure data encryption'
                        ].map((feature, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Upgrade CTA */}
            <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Need More Features?</h3>
                            <p className="text-muted-foreground">
                                Upgrade to Enterprise for advanced analytics, multi-location management, and dedicated support
                            </p>
                        </div>
                        <Link href="/employer/enterprise">
                            <Button size="lg" className="gap-2">
                                View Enterprise Plans →
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
