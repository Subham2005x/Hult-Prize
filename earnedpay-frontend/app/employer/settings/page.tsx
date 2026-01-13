'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Save, Shield, CreditCard, Hotel } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
    const router = useRouter();
    const { user, token, role, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        phoneNumber: '',
        gstNumber: '',
        paydayDate: 1,
        maxPercentage: 40
    });

    useEffect(() => {
        if (!loading && (!user || role !== 'employer')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const data = await api.employer.getProfile(token!);
            setFormData({
                companyName: data.companyName || '',
                phoneNumber: data.phoneNumber || '',
                gstNumber: data.gstNumber || '',
                paydayDate: data.withdrawalConfig?.paydayDate || 1,
                maxPercentage: data.withdrawalConfig?.maxPercentage || 40
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.employer.updateProfile(token!, {
                company_name: formData.companyName,
                phone_number: formData.phoneNumber,
                gst_number: formData.gstNumber,
                withdrawal_config: {
                    paydayDate: parseInt(formData.paydayDate.toString()),
                    maxPercentage: parseInt(formData.maxPercentage.toString())
                }
            });
            alert('Settings saved successfully!');
        } catch (error: any) {
            console.error(error);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your organization details and payroll configuration.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card className="dark:bg-slate-800">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <CardTitle>Organization Details</CardTitle>
                        </div>
                        <CardDescription>Your company information visible on invoices and reports.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Support Phone</Label>
                                <Input
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="+91..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>GST Number (Optional)</Label>
                                <Input
                                    value={formData.gstNumber}
                                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                    placeholder="22AAAAA0000A1Z5"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-800 border-l-4 border-l-purple-500">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-purple-500" />
                            <CardTitle>Payroll Configuration</CardTitle>
                        </div>
                        <CardDescription>Control how your employees can access their earned wages.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Monthly Payday (Date)</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={formData.paydayDate}
                                        onChange={(e) => setFormData({ ...formData, paydayDate: parseInt(e.target.value) })}
                                        className="w-24"
                                    />
                                    <span className="text-sm text-muted-foreground">of every month</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Settlements will be generated on this date.</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Max Withdrawal Limit (%)</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        min="10"
                                        max="100"
                                        value={formData.maxPercentage}
                                        onChange={(e) => setFormData({ ...formData, maxPercentage: parseInt(e.target.value) })}
                                        className="w-24"
                                    />
                                    <span className="text-sm text-muted-foreground">% of earned wages</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Workers can withdraw up to this percentage instantly.</p>
                            </div>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg text-xs text-purple-900 dark:text-purple-200 mt-2">
                            Note: Changes to the Payday Date will apply to the next payroll cycle. Withdrawal limits apply immediately.
                        </div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-800 opacity-80">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-600" />
                            <CardTitle>Data Security</CardTitle>
                        </div>
                        <CardDescription>Manage password and access control.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" disabled>Change Password (Coming Soon)</Button>
                    </CardContent>
                </Card>

                <div className="flex justify-end pb-8">
                    <Button type="submit" size="lg" disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving Changes...' : 'Save Configuration'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
