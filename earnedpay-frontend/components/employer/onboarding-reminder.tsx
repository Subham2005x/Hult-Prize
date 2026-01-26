'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function OnboardingReminder() {
    const { token } = useAuth();
    const [showBanner, setShowBanner] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if already dismissed in this session
        const dismissed = sessionStorage.getItem('onboarding_reminder_dismissed');
        if (dismissed) {
            setIsDismissed(true);
            return;
        }

        if (token) {
            checkOnboardingStatus();
        }
    }, [token]);

    const checkOnboardingStatus = async () => {
        try {
            const profile = await api.employer.getProfile(token!);

            // Check if KYC data exists
            const hasKycData = profile.kycData && Object.keys(profile.kycData).length > 0;
            const hasCompanyName = profile.companyName && profile.companyName !== profile.email;

            // Show banner if no KYC data or no company name
            if (!hasKycData || !hasCompanyName) {
                setShowBanner(true);
            }
        } catch (error) {
            console.error('Failed to check onboarding status:', error);
        }
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        setShowBanner(false);
        sessionStorage.setItem('onboarding_reminder_dismissed', 'true');
    };

    if (!showBanner || isDismissed) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-sm">Complete Your Profile for Better Access</p>
                            <p className="text-xs text-orange-100 mt-0.5">
                                Add your business details, bank account, and KYC information to unlock full platform features and enable settlements.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/employer/onboarding">
                            <Button
                                size="sm"
                                variant="secondary"
                                className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
                            >
                                Complete Now
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDismiss}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
