'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Building2, User, Wallet, Shield, Clock, Zap, TrendingUp, Users, HeartHandshake, AlertTriangle } from 'lucide-react';
import DarkVeil from '@/components/ui/dark-veil';

export default function HomePage() {
    const router = useRouter();

    const handleRoleSelect = (role: 'worker' | 'employer') => {
        router.push(`/login?role=${role}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
            {/* Floating Header */}
            <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl rounded-full border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md shadow-lg shadow-slate-900/5 transition-all duration-300">
                <div className="px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary-600 rounded-lg p-1.5">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 dark:text-white">EarnedPay</span>
                    </div>
                    <nav className="hidden md:flex gap-8">
                        <a href="#problem" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">The Problem</a>
                        <a href="#solution" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">Our Solution</a>
                        <a href="#impact" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors">Impact</a>
                    </nav>
                    <div className="flex gap-4">
                        <Button variant="ghost" size="sm" className="rounded-full" onClick={() => router.push('/login')}>Sign In</Button>
                        <Button size="sm" className="rounded-full" onClick={() => router.push('/login')}>Get Started</Button>
                    </div>
                </div>
            </header>

            {/* Hero Section - Investor Focused */}
            <section className="relative pt-40 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <DarkVeil
                        hueShift={0}
                        noiseIntensity={0.2}
                        scanlineIntensity={0.2}
                        speed={0.3}
                        className="opacity-40"
                    />
                </div>
                {/* Fallback gradient if DarkVeil doesn't load or for extra tint */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white dark:from-slate-950/50 dark:via-slate-900/80 dark:to-slate-900 z-0 pointer-events-none" />

                <div className="container relative mx-auto px-4 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-sm font-semibold mb-8 animate-fade-in tracking-wide">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Revolutionizing Financial Wellness
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-tight">
                        Democratizing Access to <br className="hidden md:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">Earned Capital</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                        We are solving the liquidity gap for the modern workforce. EarnedPay provides ethical, on-demand access to waged income, eliminating potential predatory debt cycles.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all" onClick={() => handleRoleSelect('worker')}>
                            For Worker
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2" onClick={() => handleRoleSelect('employer')}>
                            For Employer
                        </Button>
                    </div>
                </div>
            </section>

            {/* The Problem Section */}
            <section id="problem" className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row gap-16 items-center">
                        <div className="md:w-1/2">
                            <div className="flex items-center gap-3 mb-6 text-red-400 font-bold tracking-wider uppercase text-sm">
                                <AlertTriangle className="w-5 h-5" /> The Market Gap
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">The Payday Cycle is <span className="text-red-400">Broken</span></h2>
                            <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                                78% of the workforce lives paycheck to paycheck. When emergencies strike between pay cycles, millions are forced into predatory payday loans with interest rates exceeding 400%.
                            </p>
                            <p className="text-lg text-slate-300 leading-relaxed">
                                This financial stress costs employers billions annually in lost productivity and turnover.
                            </p>
                        </div>
                        <div className="md:w-1/2 grid grid-cols-2 gap-6">
                            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                                <h3 className="text-5xl font-bold text-red-400 mb-2">78%</h3>
                                <p className="text-slate-300">Workers living paycheck to paycheck</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                                <h3 className="text-5xl font-bold text-red-400 mb-2">$30B+</h3>
                                <p className="text-slate-300">Paid in overdraft & late fees annually</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 col-span-2">
                                <h3 className="text-5xl font-bold text-red-400 mb-2">400%</h3>
                                <p className="text-slate-300">Average APR of payday loans</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Solution / How it Works */}
            <section id="solution" className="py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-semibold mb-6">
                        <HeartHandshake className="w-4 h-4" /> The Solution
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Ethical, On-Demand Pay</h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-16">
                        A seamless ecosystem connecting employers and employees for real-time flexibility.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-200 via-primary-200 to-slate-200 dark:from-slate-800 dark:via-primary-900 dark:to-slate-800 -z-10" />

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative">
                            <div className="w-16 h-16 mx-auto bg-primary-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-primary-600 border border-primary-100 dark:border-primary-900/50">
                                <Clock className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">1. Work & Earn</h3>
                            <p className="text-slate-600 dark:text-slate-400">Employee works their shift. Earnings are accrued in real-time on our platform.</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative">
                            <div className="w-16 h-16 mx-auto bg-primary-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-primary-600 border border-primary-100 dark:border-primary-900/50">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">2. Request Instantly</h3>
                            <p className="text-slate-600 dark:text-slate-400">Employee requests up to 50% of earned wages via the mobile app. Instant approval.</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative">
                            <div className="w-16 h-16 mx-auto bg-primary-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-primary-600 border border-primary-100 dark:border-primary-900/50">
                                <Wallet className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">3. Funds Received</h3>
                            <p className="text-slate-600 dark:text-slate-400">Money lands in the bank account instantly via UPI/IMPS. Zero waiting.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Stats / ROI */}
            <section id="impact" className="py-24 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-semibold mb-6">
                                <TrendingUp className="w-4 h-4" /> Market Impact
                            </div>
                            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">A Win-Win for Everyone</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                        <Users className="w-6 h-6 text-green-600 dark:text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">For Employers</h4>
                                        <p className="text-slate-600 dark:text-slate-400">Reduce turnover by 50% and fill shifts 2x faster. Zero cost implementation and cash flow neutral.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">For Employees</h4>
                                        <p className="text-slate-600 dark:text-slate-400">Financial freedom and stress reduction. No interest, no predatory fees, just fair access to pay.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Ecosystem / Metric Card */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-semibold text-slate-500 mb-6 uppercase tracking-wider">Projected Impact (Y1)</h3>
                            <div className="grid grid-cols-2 gap-8 text-center">
                                <div>
                                    <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-1">50k+</div>
                                    <div className="text-sm text-slate-500">Active Users</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-1">$15M</div>
                                    <div className="text-sm text-slate-500">Volume Processed</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-1">98%</div>
                                    <div className="text-sm text-slate-500">Retention Rate</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-1">0%</div>
                                    <div className="text-sm text-slate-500">Default Risk</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white dark:bg-slate-950 text-center">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Ready to transform your payroll?</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
                        Join the next generation of financial wellness platforms.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="h-12 px-8" onClick={() => handleRoleSelect('worker')}>
                            Join as Worker <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8" onClick={() => handleRoleSelect('employer')}>
                            Partner as Employer
                        </Button>
                    </div>
                </div>
            </section>

            <footer className="py-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <div>© 2024 EarnedPay Inc. All rights reserved.</div>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300">Terms of Service</a>
                        <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300">Investor Relations</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function CheckCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
        </svg>
    )
}
