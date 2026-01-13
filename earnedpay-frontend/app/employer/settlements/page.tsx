'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
// import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils'; // Assuming formatCurrency exists

interface Settlement {
    id: string;
    month: string;
    totalWorkers: number;
    totalEarnings: number;
    totalWithdrawals: number;
    netSettlement: number;
    status: 'pending' | 'completed';
    settledAt?: string;
}

export default function SettlementsPage() {
    const router = useRouter();
    const { user, token, role, loading } = useAuth();
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && (!user || role !== 'employer')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    useEffect(() => {
        if (token) {
            fetchSettlements();
        }
    }, [token]);

    const fetchSettlements = async () => {
        try {
            const data = await api.settlements.getHistory(token!);
            setSettlements(data.settlements || []);
        } catch (error) {
            console.error('Failed to fetch settlements:', error);
            // Mock data for demo if API fails or empty
            setSettlements([
                {
                    id: '1',
                    month: '2023-11',
                    totalWorkers: 12,
                    totalEarnings: 150000,
                    totalWithdrawals: 45000,
                    netSettlement: 105000,
                    status: 'completed',
                    settledAt: '2023-12-01T10:00:00Z'
                },
                {
                    id: '2',
                    month: '2023-12',
                    totalWorkers: 14,
                    totalEarnings: 180000,
                    totalWithdrawals: 60000,
                    netSettlement: 120000,
                    status: 'pending'
                }
            ]);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleProcessSettlement = async (month: string) => {
        if (!confirm(`Are you sure you want to process settlement for ${month}?`)) return;
        try {
            await api.settlements.processSettlement(token!, month);
            alert('Settlement processed successfully via mock payout!');
            fetchSettlements();
        } catch (error: any) {
            console.error(error);
            alert('Failed to process settlement');
        }
    };

    if (loading || isLoadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Settlements</h2>
                <p className="text-muted-foreground">Review monthly payrolls and settle outstanding balances.</p>
            </div>

            {/* Pending Settlement Alert */}
            {settlements.some(s => s.status === 'pending') && (
                <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800 shadow-sm">
                    <CardContent className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            <div>
                                <p className="font-semibold text-yellow-900 dark:text-yellow-200">Action Required</p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">Default settlement pending for this month.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {settlements.map((settlement) => (
                    <Card key={settlement.id} className="dark:bg-slate-800 border-l-4 border-l-primary hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl">{settlement.month}</CardTitle>
                                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${settlement.status === 'completed'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                            {settlement.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {settlement.status.toUpperCase()}
                                        </div>
                                    </div>
                                    <CardDescription className="mt-1">{settlement.totalWorkers} Employees processed</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-muted/30 rounded-lg">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Earnings</p>
                                    <p className="text-2xl font-bold mt-1">{formatCurrency(settlement.totalEarnings)}</p>
                                </div>
                                <div className="border-l pl-6 md:border-l-0 md:pl-0 border-t pt-4 md:border-t-0 md:pt-0">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid by EarnedPay</p>
                                    <p className="text-2xl font-bold mt-1 text-orange-600">{formatCurrency(settlement.totalWithdrawals)}</p>
                                </div>
                                <div className="border-l pl-6 md:border-l-0 md:pl-0 border-t pt-4 md:border-t-0 md:pt-0">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Payable</p>
                                    <p className="text-2xl font-bold mt-1 text-green-600">{formatCurrency(settlement.netSettlement)}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                {settlement.status === 'completed' ? (
                                    <Button variant="outline" className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Download Report
                                    </Button>
                                ) : (
                                    <Button onClick={() => handleProcessSettlement(settlement.month)} className="w-full md:w-auto">
                                        Process Settlement
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {settlements.length === 0 && !isLoadingData && (
                    <div className="text-center py-16 bg-muted/10 rounded-xl border border-dashed">
                        <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No settlements found</h3>
                        <p className="text-muted-foreground">Settlement history will appear here after your first month.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
