'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Clock, Calendar } from 'lucide-react';
// import Link from 'next/link'; // Unused

interface Worker {
    id: string;
    fullName: string;
}

export default function AttendancePage() {
    const router = useRouter();
    const { user, token, role, loading } = useAuth();
    const [workers, setWorkers] = useState<Worker[]>([]);

    // Form State
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [hoursWorked, setHoursWorked] = useState('8');
    const [wagePerHour, setWagePerHour] = useState('100');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && (!user || role !== 'employer')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    useEffect(() => {
        if (token) {
            fetchWorkers();
        }
    }, [token]);

    const fetchWorkers = async () => {
        try {
            const data = await api.employer.getWorkers(token!);
            setWorkers(data.workers);
            if (data.workers.length > 0) {
                setSelectedWorkerId(data.workers[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch workers:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const entry = {
                worker_id: selectedWorkerId,
                date: date,
                hours_worked: parseFloat(hoursWorked),
                wage_per_hour: parseFloat(wagePerHour),
                status: 'present'
            };

            await api.employer.submitAttendance(token!, {
                entries: [entry]
            });

            alert('Attendance submitted successfully! Wages updated.');
            // Reset slightly or keep values for rapid entry
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to submit attendance');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    const calculatedTotal = (parseFloat(hoursWorked) || 0) * (parseFloat(wagePerHour) || 0);

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Time & Attendance</h2>
                <p className="text-muted-foreground">Log daily hours to automatically update worker wallets.</p>
            </div>

            <Card className="border-0 shadow-lg dark:bg-slate-800">
                <CardHeader className="bg-muted/50 dark:bg-slate-800/50 border-b">
                    <CardTitle>New Entry</CardTitle>
                    <CardDescription>Select a worker and input today's shift details.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <Label>Select Worker</Label>
                            <select
                                className="w-full p-3 rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedWorkerId}
                                onChange={(e) => setSelectedWorkerId(e.target.value)}
                                required
                            >
                                <option value="" disabled>Choose a worker...</option>
                                {workers.map(w => (
                                    <option key={w.id} value={w.id}>{w.fullName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Date</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    required
                                    className="pl-10"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Hours Worked</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        required
                                        className="pl-10"
                                        value={hoursWorked}
                                        onChange={(e) => setHoursWorked(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Hourly Wage (₹)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        min="1"
                                        required
                                        className="pl-10"
                                        value={wagePerHour}
                                        onChange={(e) => setWagePerHour(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Live Calculation */}
                        <div className="bg-primary/10 p-4 rounded-xl flex items-center justify-between border border-primary/20">
                            <span className="text-sm font-medium text-primary">Total Earned for Shift</span>
                            <span className="text-3xl font-bold text-primary tabular-nums">₹{calculatedTotal.toFixed(0)}</span>
                        </div>

                        <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting || !selectedWorkerId}>
                            {isSubmitting ? 'Submitting...' : 'Confirm & Credit Wallet'}
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
