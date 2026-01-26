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
    id?: string;
    month: string;
    totalWorkers?: number;
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
            // Show empty state instead of mock data
            setSettlements([]);
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

    const handleDownloadReport = (settlement: Settlement) => {
        // Dynamically import jsPDF
        import('jspdf').then(({ default: jsPDF }) => {
            const doc = new jsPDF();

            // Set up colors
            const primaryColor = [59, 130, 246]; // Blue
            const textColor = [31, 41, 55]; // Gray-800
            const lightGray = [156, 163, 175]; // Gray-400

            let yPos = 20;

            // Header
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('SETTLEMENT REPORT', 105, 20, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Period: ${settlement.month}`, 105, 30, { align: 'center' });

            yPos = 50;
            doc.setTextColor(...textColor);

            // Status Badge
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const statusText = `Status: ${settlement.status.toUpperCase()}`;
            const statusColor = settlement.status === 'completed' ? [34, 197, 94] : [234, 179, 8];
            doc.setFillColor(...statusColor);
            doc.setTextColor(255, 255, 255);
            doc.roundedRect(15, yPos, 50, 8, 2, 2, 'F');
            doc.text(statusText, 40, yPos + 5.5, { align: 'center' });

            // Date Generated
            doc.setTextColor(...lightGray);
            doc.setFont('helvetica', 'normal');
            const dateGenerated = new Date().toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            doc.text(`Generated: ${dateGenerated}`, 195, yPos + 5.5, { align: 'right' });

            yPos += 20;
            doc.setTextColor(...textColor);

            // Summary Section
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('SUMMARY', 15, yPos);
            yPos += 2;
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(0.5);
            doc.line(15, yPos, 195, yPos);
            yPos += 10;

            // Summary boxes
            const boxWidth = 85;
            const boxHeight = 20;

            // Box 1: Total Earnings
            doc.setFillColor(239, 246, 255);
            doc.roundedRect(15, yPos, boxWidth, boxHeight, 2, 2, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...lightGray);
            doc.text('Total Earnings', 20, yPos + 6);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...textColor);
            doc.text(formatCurrency(settlement.totalEarnings), 20, yPos + 14);

            // Box 2: Instant Withdrawals
            doc.setFillColor(254, 243, 199);
            doc.roundedRect(110, yPos, boxWidth, boxHeight, 2, 2, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...lightGray);
            doc.text('Instant Withdrawals', 115, yPos + 6);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(234, 88, 12); // Orange
            doc.text(formatCurrency(settlement.totalWithdrawals), 115, yPos + 14);

            yPos += boxHeight + 5;

            // Box 3: Net Settlement
            doc.setFillColor(220, 252, 231);
            doc.roundedRect(15, yPos, 180, boxHeight, 2, 2, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...lightGray);
            doc.text('Net Settlement (Payable by You)', 20, yPos + 6);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(22, 163, 74); // Green
            doc.text(formatCurrency(settlement.netSettlement), 20, yPos + 15);

            yPos += boxHeight + 15;

            // Breakdown Section
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...textColor);
            doc.text('BREAKDOWN', 15, yPos);
            yPos += 2;
            doc.setDrawColor(...primaryColor);
            doc.line(15, yPos, 195, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            const breakdownItems = [
                {
                    title: '1. Total Wages Earned',
                    amount: formatCurrency(settlement.totalEarnings),
                    desc: `Total earned during ${settlement.month}`
                },
                {
                    title: '2. Instant Withdrawals',
                    amount: formatCurrency(settlement.totalWithdrawals),
                    desc: `Paid via EarnedPay (${((settlement.totalWithdrawals / settlement.totalEarnings) * 100).toFixed(1)}%)`
                },
                {
                    title: '3. Net Settlement',
                    amount: formatCurrency(settlement.netSettlement),
                    desc: 'Remaining balance to pay'
                }
            ];

            breakdownItems.forEach((item) => {
                doc.setFont('helvetica', 'bold');
                doc.text(item.title, 20, yPos);
                doc.setTextColor(...primaryColor);
                doc.text(item.amount, 195, yPos, { align: 'right' });
                yPos += 5;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...lightGray);
                doc.text(`• ${item.desc}`, 25, yPos);
                yPos += 8;
                doc.setFontSize(10);
                doc.setTextColor(...textColor);
            });

            yPos += 5;

            // Payment Instructions
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('PAYMENT INSTRUCTIONS', 15, yPos);
            yPos += 2;
            doc.setDrawColor(...primaryColor);
            doc.line(15, yPos, 195, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Please pay ${formatCurrency(settlement.netSettlement)} to workers by payday.`, 20, yPos);
            yPos += 10;
            doc.setTextColor(...lightGray);
            doc.setFontSize(9);
            doc.text(`${formatCurrency(settlement.totalWithdrawals)} already paid via EarnedPay.`, 20, yPos);

            // Footer
            doc.setFillColor(249, 250, 251);
            doc.rect(0, 270, 210, 27, 'F');
            doc.setFontSize(8);
            doc.setTextColor(...lightGray);
            doc.text('This report is for record-keeping purposes only.', 105, 278, { align: 'center' });
            doc.text(`Employees: ${settlement.totalWorkers || 0} | Amounts in ₹`, 105, 283, { align: 'center' });

            // Save PDF
            doc.save(`settlement-report-${settlement.month}.pdf`);
        }).catch(() => {
            alert('Failed to generate PDF. Please try again.');
        });
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
                    <Card key={settlement.id || settlement.month} className="dark:bg-slate-800 border-l-4 border-l-primary hover:shadow-md transition-shadow">
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
                                    <CardDescription className="mt-1">{settlement.totalWorkers || 0} Employees processed</CardDescription>
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
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() => handleDownloadReport(settlement)}
                                    >
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
                    <div className="text-center py-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-dashed">
                        <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                            <Clock className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Settlements Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Your settlement history will appear here once you process your first monthly payroll.
                        </p>
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-lg mx-auto text-left mb-6">
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <span className="text-primary">💡</span> How it works:
                            </p>
                            <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                                <li>Submit attendance for your workers throughout the month</li>
                                <li>Workers can withdraw up to their limit instantly</li>
                                <li>On payday, process settlement to pay remaining balances</li>
                                <li>Settlement records will appear here for your records</li>
                            </ol>
                        </div>
                        <Button
                            onClick={() => handleProcessSettlement(new Date().toISOString().slice(0, 7))}
                            size="lg"
                            className="gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Process Current Month Settlement
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
