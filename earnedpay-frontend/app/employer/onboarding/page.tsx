'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Shield,
    Building2,
    CreditCard,
    FileText,
    CheckCircle,
    AlertCircle,
    User,
    Phone,
    MapPin,
    Briefcase
} from 'lucide-react';
import { api } from '@/lib/api';

export default function EmployerOnboardingPage() {
    const router = useRouter();
    const { user, token, role, loading } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        // Personal/Business Info
        fullName: '',
        businessName: '',
        businessType: 'individual', // individual, proprietorship, company
        phoneNumber: '',
        email: '',

        // Address
        address: '',
        city: '',
        state: '',
        pincode: '',

        // KYC Documents
        aadhaarNumber: '',
        panNumber: '',
        gstNumber: '', // Optional for individuals

        // Bank Details
        bankAccountNumber: '',
        bankAccountNumberConfirm: '',
        ifscCode: '',
        bankName: '',
        accountHolderName: '',

        // Agreement
        termsAccepted: false,
        kycConsent: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!loading && (!user || role !== 'employer')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    const validateAadhaar = (aadhaar: string) => {
        // Aadhaar: 12 digits
        const aadhaarRegex = /^\d{12}$/;
        return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
    };

    const validatePAN = (pan: string) => {
        // PAN: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan.toUpperCase());
    };

    const validateIFSC = (ifsc: string) => {
        // IFSC: 4 letters, 0, 6 alphanumeric (e.g., SBIN0001234)
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        return ifscRegex.test(ifsc.toUpperCase());
    };

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
            if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
            else if (!/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Invalid phone number';
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
        }

        if (step === 2) {
            if (!formData.address.trim()) newErrors.address = 'Address is required';
            if (!formData.city.trim()) newErrors.city = 'City is required';
            if (!formData.state.trim()) newErrors.state = 'State is required';
            if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
            else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';
        }

        if (step === 3) {
            if (!formData.aadhaarNumber.trim()) newErrors.aadhaarNumber = 'Aadhaar number is required';
            else if (!validateAadhaar(formData.aadhaarNumber)) newErrors.aadhaarNumber = 'Invalid Aadhaar number (12 digits)';

            if (!formData.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
            else if (!validatePAN(formData.panNumber)) newErrors.panNumber = 'Invalid PAN format';
        }

        if (step === 4) {
            if (!formData.bankAccountNumber.trim()) newErrors.bankAccountNumber = 'Account number is required';
            if (!formData.bankAccountNumberConfirm.trim()) newErrors.bankAccountNumberConfirm = 'Confirm account number';
            else if (formData.bankAccountNumber !== formData.bankAccountNumberConfirm) {
                newErrors.bankAccountNumberConfirm = 'Account numbers do not match';
            }
            if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
            else if (!validateIFSC(formData.ifscCode)) newErrors.ifscCode = 'Invalid IFSC code';
            if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
            if (!formData.accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';
        }

        if (step === 5) {
            if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';
            if (!formData.kycConsent) newErrors.kycConsent = 'KYC consent is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(5)) return;

        setIsSubmitting(true);
        try {
            // Submit employer verification data to backend
            await api.employer.updateProfile(token!, {
                company_name: formData.businessName || formData.fullName,
                phone_number: formData.phoneNumber,
                gst_number: formData.gstNumber || null,
                // Additional fields would be sent to a verification endpoint
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

            // Redirect to dashboard after successful submission
            router.push('/employer/dashboard');
        } catch (error) {
            console.error('Failed to submit verification:', error);
            alert('Failed to submit verification. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        if (confirm('Are you sure you want to skip verification? You can complete it later from Settings.')) {
            router.push('/employer/dashboard');
        }
    };

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    const steps = [
        { number: 1, title: 'Basic Info', icon: User },
        { number: 2, title: 'Address', icon: MapPin },
        { number: 3, title: 'KYC Documents', icon: FileText },
        { number: 4, title: 'Bank Details', icon: CreditCard },
        { number: 5, title: 'Review', icon: CheckCircle }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-end mb-4">
                        <Button
                            variant="ghost"
                            onClick={handleSkip}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                            Skip for Now →
                        </Button>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        <Shield className="w-4 h-4" />
                        Secure Verification
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Complete Your Employer Profile</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        We need to verify your identity to ensure platform security and compliance
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep >= step.number
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-500'
                                        }`}>
                                        {currentStep > step.number ? (
                                            <CheckCircle className="w-6 h-6" />
                                        ) : (
                                            <step.icon className="w-6 h-6" />
                                        )}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${currentStep >= step.number ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`h-1 flex-1 mx-2 rounded transition-all ${currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-700'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <Card className="shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            {currentStep === 1 && 'Basic Information'}
                            {currentStep === 2 && 'Business Address'}
                            {currentStep === 3 && 'KYC Documents'}
                            {currentStep === 4 && 'Bank Account Details'}
                            {currentStep === 5 && 'Review & Submit'}
                        </CardTitle>
                        <CardDescription>
                            {currentStep === 1 && 'Tell us about yourself and your business'}
                            {currentStep === 2 && 'Where is your business located?'}
                            {currentStep === 3 && 'Verify your identity with government documents'}
                            {currentStep === 4 && 'Add your bank account for settlements'}
                            {currentStep === 5 && 'Review your information and submit'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="fullName">Full Name *</Label>
                                        <Input
                                            id="fullName"
                                            value={formData.fullName}
                                            onChange={(e) => updateFormData('fullName', e.target.value)}
                                            placeholder="Your full name"
                                            className={errors.fullName ? 'border-red-500' : ''}
                                        />
                                        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="businessName">Business Name (Optional)</Label>
                                        <Input
                                            id="businessName"
                                            value={formData.businessName}
                                            onChange={(e) => updateFormData('businessName', e.target.value)}
                                            placeholder="Leave blank if individual"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="businessType">Business Type *</Label>
                                    <select
                                        id="businessType"
                                        value={formData.businessType}
                                        onChange={(e) => updateFormData('businessType', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-slate-800"
                                    >
                                        <option value="individual">Individual Employer</option>
                                        <option value="proprietorship">Sole Proprietorship</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="company">Private Limited Company</option>
                                    </select>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                                        <Input
                                            id="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                                            placeholder="10-digit mobile number"
                                            maxLength={10}
                                            className={errors.phoneNumber ? 'border-red-500' : ''}
                                        />
                                        {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateFormData('email', e.target.value)}
                                            placeholder="your@email.com"
                                            className={errors.email ? 'border-red-500' : ''}
                                        />
                                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Address */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="address">Street Address *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => updateFormData('address', e.target.value)}
                                        placeholder="House/Building number, Street name"
                                        className={errors.address ? 'border-red-500' : ''}
                                    />
                                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) => updateFormData('city', e.target.value)}
                                            placeholder="City"
                                            className={errors.city ? 'border-red-500' : ''}
                                        />
                                        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="state">State *</Label>
                                        <Input
                                            id="state"
                                            value={formData.state}
                                            onChange={(e) => updateFormData('state', e.target.value)}
                                            placeholder="State"
                                            className={errors.state ? 'border-red-500' : ''}
                                        />
                                        {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="pincode">Pincode *</Label>
                                        <Input
                                            id="pincode"
                                            value={formData.pincode}
                                            onChange={(e) => updateFormData('pincode', e.target.value)}
                                            placeholder="6-digit pincode"
                                            maxLength={6}
                                            className={errors.pincode ? 'border-red-500' : ''}
                                        />
                                        {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: KYC Documents */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                    <div className="flex gap-2">
                                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                Why we need this
                                            </p>
                                            <p className="text-xs text-blue-800 dark:text-blue-200">
                                                KYC verification is mandatory for financial compliance and to protect both employers and workers on our platform.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                                    <Input
                                        id="aadhaarNumber"
                                        value={formData.aadhaarNumber}
                                        onChange={(e) => updateFormData('aadhaarNumber', e.target.value.replace(/\s/g, ''))}
                                        placeholder="12-digit Aadhaar number"
                                        maxLength={12}
                                        className={errors.aadhaarNumber ? 'border-red-500' : ''}
                                    />
                                    {errors.aadhaarNumber && <p className="text-xs text-red-500 mt-1">{errors.aadhaarNumber}</p>}
                                    <p className="text-xs text-gray-500 mt-1">Your Aadhaar is encrypted and stored securely</p>
                                </div>

                                <div>
                                    <Label htmlFor="panNumber">PAN Number *</Label>
                                    <Input
                                        id="panNumber"
                                        value={formData.panNumber}
                                        onChange={(e) => updateFormData('panNumber', e.target.value.toUpperCase())}
                                        placeholder="e.g., ABCDE1234F"
                                        maxLength={10}
                                        className={errors.panNumber ? 'border-red-500' : ''}
                                    />
                                    {errors.panNumber && <p className="text-xs text-red-500 mt-1">{errors.panNumber}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                                    <Input
                                        id="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={(e) => updateFormData('gstNumber', e.target.value.toUpperCase())}
                                        placeholder="Required only for registered businesses"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave blank if you're an individual employer</p>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Bank Details */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                                    <div className="flex gap-2">
                                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-1">
                                                Settlement Account
                                            </p>
                                            <p className="text-xs text-orange-800 dark:text-orange-200">
                                                This account will be used for monthly settlements. Ensure details are accurate.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                                    <Input
                                        id="accountHolderName"
                                        value={formData.accountHolderName}
                                        onChange={(e) => updateFormData('accountHolderName', e.target.value)}
                                        placeholder="As per bank records"
                                        className={errors.accountHolderName ? 'border-red-500' : ''}
                                    />
                                    {errors.accountHolderName && <p className="text-xs text-red-500 mt-1">{errors.accountHolderName}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="bankAccountNumber">Bank Account Number *</Label>
                                    <Input
                                        id="bankAccountNumber"
                                        value={formData.bankAccountNumber}
                                        onChange={(e) => updateFormData('bankAccountNumber', e.target.value)}
                                        placeholder="Enter account number"
                                        type="password"
                                        className={errors.bankAccountNumber ? 'border-red-500' : ''}
                                    />
                                    {errors.bankAccountNumber && <p className="text-xs text-red-500 mt-1">{errors.bankAccountNumber}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="bankAccountNumberConfirm">Confirm Account Number *</Label>
                                    <Input
                                        id="bankAccountNumberConfirm"
                                        value={formData.bankAccountNumberConfirm}
                                        onChange={(e) => updateFormData('bankAccountNumberConfirm', e.target.value)}
                                        placeholder="Re-enter account number"
                                        className={errors.bankAccountNumberConfirm ? 'border-red-500' : ''}
                                    />
                                    {errors.bankAccountNumberConfirm && <p className="text-xs text-red-500 mt-1">{errors.bankAccountNumberConfirm}</p>}
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="ifscCode">IFSC Code *</Label>
                                        <Input
                                            id="ifscCode"
                                            value={formData.ifscCode}
                                            onChange={(e) => updateFormData('ifscCode', e.target.value.toUpperCase())}
                                            placeholder="e.g., SBIN0001234"
                                            maxLength={11}
                                            className={errors.ifscCode ? 'border-red-500' : ''}
                                        />
                                        {errors.ifscCode && <p className="text-xs text-red-500 mt-1">{errors.ifscCode}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="bankName">Bank Name *</Label>
                                        <Input
                                            id="bankName"
                                            value={formData.bankName}
                                            onChange={(e) => updateFormData('bankName', e.target.value)}
                                            placeholder="e.g., State Bank of India"
                                            className={errors.bankName ? 'border-red-500' : ''}
                                        />
                                        {errors.bankName && <p className="text-xs text-red-500 mt-1">{errors.bankName}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Review */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <div className="flex gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                                                Almost Done!
                                            </p>
                                            <p className="text-xs text-green-800 dark:text-green-200">
                                                Review your information below and accept the terms to complete verification.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="space-y-4">
                                    <div className="border rounded-lg p-4 dark:bg-slate-800">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Personal Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-gray-600 dark:text-gray-400">Name:</div>
                                            <div className="font-medium">{formData.fullName}</div>
                                            <div className="text-gray-600 dark:text-gray-400">Business:</div>
                                            <div className="font-medium">{formData.businessName || 'Individual'}</div>
                                            <div className="text-gray-600 dark:text-gray-400">Phone:</div>
                                            <div className="font-medium">{formData.phoneNumber}</div>
                                            <div className="text-gray-600 dark:text-gray-400">Email:</div>
                                            <div className="font-medium">{formData.email}</div>
                                        </div>
                                    </div>

                                    <div className="border rounded-lg p-4 dark:bg-slate-800">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            KYC Documents
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-gray-600 dark:text-gray-400">Aadhaar:</div>
                                            <div className="font-medium">XXXX XXXX {formData.aadhaarNumber.slice(-4)}</div>
                                            <div className="text-gray-600 dark:text-gray-400">PAN:</div>
                                            <div className="font-medium">{formData.panNumber}</div>
                                        </div>
                                    </div>

                                    <div className="border rounded-lg p-4 dark:bg-slate-800">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            Bank Account
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="text-gray-600 dark:text-gray-400">Bank:</div>
                                            <div className="font-medium">{formData.bankName}</div>
                                            <div className="text-gray-600 dark:text-gray-400">Account:</div>
                                            <div className="font-medium">XXXX{formData.bankAccountNumber.slice(-4)}</div>
                                            <div className="text-gray-600 dark:text-gray-400">IFSC:</div>
                                            <div className="font-medium">{formData.ifscCode}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Agreements */}
                                <div className="space-y-3 border-t pt-4">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="termsAccepted"
                                            checked={formData.termsAccepted}
                                            onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <label htmlFor="termsAccepted" className="text-sm">
                                            I accept the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                                        </label>
                                    </div>
                                    {errors.termsAccepted && <p className="text-xs text-red-500 ml-6">{errors.termsAccepted}</p>}

                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="kycConsent"
                                            checked={formData.kycConsent}
                                            onChange={(e) => updateFormData('kycConsent', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <label htmlFor="kycConsent" className="text-sm">
                                            I consent to KYC verification and authorize EarnedPay to verify my documents with government databases
                                        </label>
                                    </div>
                                    {errors.kycConsent && <p className="text-xs text-red-500 ml-6">{errors.kycConsent}</p>}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                            >
                                Back
                            </Button>

                            {currentStep < 5 ? (
                                <Button onClick={handleNext}>
                                    Next Step
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Complete Verification
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Security Notice */}
                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="w-4 h-4 inline mr-1" />
                    All information is encrypted and stored securely. We comply with RBI and data protection regulations.
                </div>
            </div>
        </div>
    );
}
