'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Check input/label exist or just use basic HTML
import { Plus, Search, Phone, Wallet, User } from 'lucide-react';

interface Worker {
    id: string;
    fullName: string;
    phoneNumber: string;
    upiId: string;
    isActive: boolean;
    joinedAt: string;
    currentMonthEarnings: number;
}

export default function EmployeesPage() {
    const router = useRouter();
    const { user, token, role, loading, logout } = useAuth();
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [newWorker, setNewWorker] = useState({
        full_name: '',
        phone_number: '+91',
        upi_id: '',
        employer_id: '' // Will be set from backend logic usually, but let's see api
    });
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
        } catch (error) {
            console.error('Failed to fetch workers:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleAddWorker = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.employer.addWorker(token!, {
                ...newWorker,
                employer_id: user!.uid
            });
            setShowAddForm(false);
            setNewWorker({ full_name: '', phone_number: '+91', upi_id: '', employer_id: '' });
            fetchWorkers(); // Refresh list
            alert('Worker added successfully!');
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to add worker');
        } finally {
            setIsSubmitting(false);
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
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
                    <p className="text-muted-foreground">Manage your workforce and view their earnings.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Search employees..." className="pl-9 bg-white dark:bg-slate-900" />
                    </div>
                    <Button onClick={() => setShowAddForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Worker
                    </Button>
                </div>
            </div>

            {/* Add Worker Form */}
            {showAddForm && (
                <Card className="mb-6 animate-fade-in border-dashed border-2 shadow-none">
                    <CardHeader>
                        <CardTitle>Add New Worker</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddWorker} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        required
                                        value={newWorker.full_name}
                                        onChange={(e) => setNewWorker({ ...newWorker, full_name: e.target.value })}
                                        placeholder="e.g. Rahul Kumar"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        required
                                        value={newWorker.phone_number}
                                        onChange={(e) => setNewWorker({ ...newWorker, phone_number: e.target.value })}
                                        placeholder="+91 99999 99999"
                                    />
                                    <p className="text-xs text-muted-foreground">Must start with +91</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>UPI ID</Label>
                                    <Input
                                        required
                                        value={newWorker.upi_id}
                                        onChange={(e) => setNewWorker({ ...newWorker, upi_id: e.target.value })}
                                        placeholder="rahul@upi"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Adding...' : 'Add Worker'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Workers List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workers.map((worker) => (
                    <Card key={worker.id} className="hover:shadow-md transition-shadow dark:bg-slate-800">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center font-bold text-primary-700 dark:text-primary-300 text-lg">
                                        {worker.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{worker.fullName}</h3>
                                        <p className="text-sm text-gray-500">{worker.phoneNumber}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between pt-4 border-t">
                                <div className="text-sm">
                                    <p className="text-muted-foreground">Earnings</p>
                                    <p className="font-semibold text-lg">₹{worker.currentMonthEarnings}</p>
                                </div>
                                <div className="text-right text-sm">
                                    <p className="text-muted-foreground">UPI ID</p>
                                    <p className="font-mono">{worker.upiId || 'Not set'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {workers.length === 0 && !isLoadingData && (
                    <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-xl">
                        <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-lg font-medium">No employees found</p>
                        <p className="text-sm text-gray-400 mb-4">Add your first worker to get started</p>
                        <Button variant="outline" onClick={() => setShowAddForm(true)}>Add Worker</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
