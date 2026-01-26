'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Save, Shield, CreditCard, MapPin, FileText, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const router = useRouter();
    const { user, token, role, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);

    const [formData, setFormData] = useState({
        companyName: '',
        phoneNumber: '',
        gstNumber: '',
        paydayDate: 1,
        maxPercentage: 40,
        // KYC fields
        fullName: '',
        businessType: 'individual',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        aadhaarNumber: '',
        panNumber: '',
        bankAccountNumber: '',
        ifscCode: '',
        bankName: '',
        accountHolderName: ''
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
            setProfileData(data);

            const kycData = data.kycData || {};
            setFormData({
                companyName: data.companyName || '',
                phoneNumber: data.phoneNumber || '',
                gstNumber: data.gstNumber || '',
                paydayDate: data.withdrawalConfig?.paydayDate || 1,
                maxPercentage: data.withdrawalConfig?.maxPercentage || 40,
                // KYC fields
                fullName: kycData.full_name || '',
                businessType: kycData.business_type || 'individual',
                email: kycData.email || data.email || '',
                address: kycData.address?.street || '',
                city: kycData.address?.city || '',
                state: kycData.address?.state || '',
                pincode: kycData.address?.pincode || '',
                aadhaarNumber: kycData.aadhaar_number || '',
                panNumber: kycData.pan_number || '',
                bankAccountNumber: kycData.bank_details?.account_number || '',
                ifscCode: kycData.bank_details?.ifsc_code || '',
                bankName: kycData.bank_details?.bank_name || '',
                accountHolderName: kycData.bank_details?.account_holder_name || ''
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
                },
                kyc_data: {
                    full_name: formData.fullName,
                    business_type: formData.businessType,
                    email: formData.email,
                    address: {
                        street: formData.address,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode
                    },
                    aadhaar_number: formData.aadhaarNumber,
                    pan_number: formData.panNumber,
                    bank_details: {
                        account_number: formData.bankAccountNumber,
                        ifsc_code: formData.ifscCode,
                        bank_name: formData.bankName,
                        account_holder_name: formData.accountHolderName
                    }
                }
            });
            alert('Settings saved successfully!');
            fetchProfile(); // Refresh data
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

    const hasKycData = profileData?.kycData && Object.keys(profileData.kycData).length > 0;

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your business profile, KYC details, and payroll configuration.</p>
            </div>

            {/* KYC Status Banner */}
            <Card className={`border-2 ${hasKycData ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800' : 'border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800'}`}>
                <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                        {hasKycData ? (
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                            <XCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        )}
                        <div>
                            <p className={`font-semibold ${hasKycData ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'}`}>
                                {hasKycData ? 'Profile Complete' : 'Profile Incomplete'}
                            </p>
                            <p className={`text-sm ${hasKycData ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
                                {hasKycData
                                    ? 'Your business information and KYC details are on file. You can edit them below.'
                                    : 'Fill in all sections below to complete your profile and enable settlements.'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Organization Details */}
                <Card className="dark:bg-slate-800">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <CardTitle>Business Information</CardTitle>
                        </div>
                        <CardDescription>Your company details visible on invoices and reports.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Your full name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Company/Business Name</Label>
                                <Input
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    placeholder="Leave blank if individual"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Business Type *</Label>
                                <select
                                    value={formData.businessType}
                                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-800"
                                >
                                    <option value="individual">Individual Employer</option>
                                    <option value="proprietorship">Sole Proprietorship</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="company">Private Limited Company</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number *</Label>
                                <Input
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    placeholder="+91 9999999999"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@email.com"
                                    required
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

                {/* Address */}
                <Card className="dark:bg-slate-800">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <CardTitle>Business Address</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Street Address *</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="House/Building number, Street name"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>City *</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="City"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>State *</Label>
                                <Input
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    placeholder="State"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Pincode *</Label>
                                <Input
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                    placeholder="6-digit pincode"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* KYC Documents */}
                <Card className="dark:bg-slate-800">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <CardTitle>KYC Documents</CardTitle>
                        </div>
                        <CardDescription>Required for compliance and settlements</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Aadhaar Number *</Label>
                                <Input
                                    value={formData.aadhaarNumber}
                                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                                    placeholder="12-digit Aadhaar"
                                    maxLength={12}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Encrypted and stored securely</p>
                            </div>
                            <div className="space-y-2">
                                <Label>PAN Number *</Label>
                                <Input
                                    value={formData.panNumber}
                                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                                    placeholder="ABCDE1234F"
                                    maxLength={10}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Details */}
                <Card className="dark:bg-slate-800">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <CardTitle>Bank Account Details</CardTitle>
                        </div>
                        <CardDescription>For settlement transfers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Account Holder Name *</Label>
                                <Input
                                    value={formData.accountHolderName}
                                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                    placeholder="As per bank records"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bank Name *</Label>
                                <Input
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    placeholder="e.g., State Bank of India"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Account Number *</Label>
                                <Input
                                    value={formData.bankAccountNumber}
                                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                                    placeholder="Enter account number"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>IFSC Code *</Label>
                                <Input
                                    value={formData.ifscCode}
                                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                                    placeholder="SBIN0001234"
                                    maxLength={11}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payroll Configuration */}
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
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3 pb-8">
                    <Link href="/employer/onboarding">
                        <Button type="button" variant="outline">
                            View Full Onboarding Form
                        </Button>
                    </Link>
                    <Button type="submit" size="lg" disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving Changes...' : 'Save All Settings'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
