'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    ArrowLeft,
    CheckCircle,
    Zap,
    Shield,
    BarChart3,
    Users,
    FileText,
    Globe,
    Smartphone,
    HeadphonesIcon,
    Lock,
    TrendingUp,
    Clock,
    DollarSign,
    Building2,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function EnterprisePage() {
    const router = useRouter();
    const { user, role, loading } = useAuth();

    useEffect(() => {
        if (!loading && (!user || role !== 'employer')) {
            router.push('/login');
        }
    }, [user, role, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    const enterpriseFeatures = [
        {
            icon: BarChart3,
            title: 'Advanced Analytics & Reporting',
            description: 'Real-time dashboards, custom reports, and predictive insights into workforce cash flow patterns.',
            benefits: ['Custom KPI dashboards', 'Export to Excel/PDF', 'Trend analysis', 'Forecasting tools']
        },
        {
            icon: Users,
            title: 'Multi-Location Management',
            description: 'Manage multiple branches, departments, and locations from a single unified platform.',
            benefits: ['Centralized control', 'Location-specific settings', 'Cross-location reporting', 'Hierarchical access']
        },
        {
            icon: Shield,
            title: 'Enhanced Security & Compliance',
            description: 'Enterprise-grade security with SOC 2 compliance, audit logs, and role-based access control.',
            benefits: ['2FA authentication', 'Audit trails', 'Data encryption', 'Compliance reports']
        },
        {
            icon: FileText,
            title: 'Automated Payroll Integration',
            description: 'Seamlessly integrate with your existing payroll systems (SAP, Oracle, Zoho, etc.).',
            benefits: ['API integration', 'Auto-sync attendance', 'Reconciliation tools', 'Error detection']
        },
        {
            icon: DollarSign,
            title: 'Flexible Withdrawal Limits',
            description: 'Set custom withdrawal limits per employee, department, or role with dynamic adjustments.',
            benefits: ['Role-based limits', 'Performance-based access', 'Seasonal adjustments', 'Emergency overrides']
        },
        {
            icon: Globe,
            title: 'Multi-Currency Support',
            description: 'Support for international workers with automatic currency conversion and compliance.',
            benefits: ['50+ currencies', 'Real-time exchange rates', 'Tax compliance', 'Cross-border payments']
        },
        {
            icon: Smartphone,
            title: 'White-Label Mobile App',
            description: 'Custom-branded mobile app for your workers with your company logo and colors.',
            benefits: ['iOS & Android apps', 'Custom branding', 'Push notifications', 'Offline mode']
        },
        {
            icon: HeadphonesIcon,
            title: 'Dedicated Account Manager',
            description: '24/7 priority support with a dedicated account manager and implementation specialist.',
            benefits: ['Priority support', 'Onboarding assistance', 'Training sessions', 'Quarterly reviews']
        },
        {
            icon: TrendingUp,
            title: 'Financial Wellness Programs',
            description: 'Built-in financial literacy tools, savings goals, and budgeting assistance for workers.',
            benefits: ['Savings challenges', 'Budget tracking', 'Financial education', 'Goal setting']
        },
        {
            icon: Lock,
            title: 'Advanced Fraud Detection',
            description: 'AI-powered fraud detection and prevention with real-time alerts and automatic blocks.',
            benefits: ['ML-based detection', 'Real-time alerts', 'Automatic blocking', 'Risk scoring']
        },
        {
            icon: Clock,
            title: 'Biometric Attendance Integration',
            description: 'Integrate with biometric systems for accurate attendance tracking and wage calculation.',
            benefits: ['Fingerprint/Face ID', 'GPS tracking', 'Shift management', 'Overtime automation']
        },
        {
            icon: Building2,
            title: 'Custom Workflows & Approvals',
            description: 'Design custom approval workflows for withdrawals, settlements, and employee onboarding.',
            benefits: ['Multi-level approvals', 'Custom rules', 'Automated notifications', 'Workflow builder']
        }
    ];

    const pricingTiers = [
        {
            name: 'Standard',
            price: 'Current Plan',
            description: 'Perfect for small to medium businesses',
            features: [
                'Up to 100 employees',
                'Basic analytics',
                'Email support',
                'Standard withdrawal limits',
                'Monthly settlements'
            ],
            current: true
        },
        {
            name: 'Enterprise',
            price: 'Custom Pricing',
            description: 'For large organizations with complex needs',
            features: [
                'Unlimited employees',
                'All enterprise features',
                'Dedicated account manager',
                'Custom integrations',
                'SLA guarantee',
                'White-label options'
            ],
            recommended: true
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/employer/dashboard">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-12 space-y-16">
                {/* Hero Section */}
                <div className="text-center space-y-6 animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-semibold">
                        <Sparkles className="w-4 h-4" />
                        Enterprise Solutions
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                        Scale Your Business with
                        <br />
                        Enterprise Features
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Unlock powerful tools designed for large organizations. Advanced analytics,
                        multi-location management, and dedicated support to help you grow.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button size="lg" className="gap-2">
                            <Zap className="w-5 h-5" />
                            Request Demo
                        </Button>
                        <Button size="lg" variant="outline" className="gap-2">
                            Contact Sales
                        </Button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-2">Enterprise Features</h2>
                        <p className="text-gray-600 dark:text-gray-400">Everything you need to manage a large workforce efficiently</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enterpriseFeatures.map((feature, index) => (
                            <Card
                                key={index}
                                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 dark:bg-slate-800/50"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <CardHeader>
                                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                                        <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {feature.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Pricing Comparison */}
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
                        <p className="text-gray-600 dark:text-gray-400">Upgrade to Enterprise for unlimited possibilities</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {pricingTiers.map((tier, index) => (
                            <Card
                                key={index}
                                className={`relative ${tier.recommended ? 'border-primary-500 border-2 shadow-2xl scale-105' : ''} dark:bg-slate-800/50`}
                            >
                                {tier.recommended && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        Recommended
                                    </div>
                                )}
                                <CardHeader className="text-center pb-8">
                                    <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                                    <div className="text-4xl font-bold mb-2">{tier.price}</div>
                                    <CardDescription>{tier.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ul className="space-y-3">
                                        {tier.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        className="w-full mt-6"
                                        variant={tier.current ? 'outline' : 'default'}
                                        size="lg"
                                        disabled={tier.current}
                                    >
                                        {tier.current ? 'Current Plan' : 'Upgrade Now'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <Card className="bg-gradient-to-r from-primary-600 to-purple-600 text-white border-0">
                    <CardContent className="py-12 text-center space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold">Ready to Scale Your Business?</h2>
                        <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                            Join hundreds of enterprises already using EarnedPay to empower their workforce
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button size="lg" variant="secondary" className="gap-2">
                                <Zap className="w-5 h-5" />
                                Schedule a Demo
                            </Button>
                            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white gap-2">
                                Talk to Sales
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
